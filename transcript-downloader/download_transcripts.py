#!/usr/bin/env python3
"""
NRI YouTube Transcript Downloader — Parallel Edition
=====================================================
Reads vidIQ CSV exports, filters NRI-related videos,
downloads YouTube transcripts using parallel threads,
and saves as structured JSON + CSV dataset.

Each thread uses its own YouTubeTranscriptApi session.
Resume-friendly: restart anytime, picks up where it left off.

Usage:
    python3 -u download_transcripts.py
"""

import csv
import json
import os
import random
import re
import sys
import threading
import time
import traceback
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Force unbuffered output
try:
    sys.stdout = os.fdopen(sys.stdout.fileno(), "w", buffering=1)
except Exception:
    pass

warnings.filterwarnings("ignore")

from youtube_transcript_api import YouTubeTranscriptApi

# ─── Config ───────────────────────────────────────────────────────────────────

CSV_DIR = os.path.expanduser("~/Downloads")
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(OUTPUT_DIR, "progress.json")
DATASET_JSON = os.path.join(OUTPUT_DIR, "transcripts_dataset.json")
DATASET_CSV = os.path.join(OUTPUT_DIR, "transcripts_dataset.csv")
ERRORS_LOG = os.path.join(OUTPUT_DIR, "errors.log")

# Parallelism — each thread has its own session
NUM_WORKERS = 4         # parallel threads
PER_THREAD_DELAY = 2.0  # seconds between requests per thread
JITTER = 1.5            # random extra delay (0 to JITTER seconds)
CHECKPOINT_INTERVAL = 50  # save every N completions
COOLDOWN_BASE = 120     # seconds on first IP block
COOLDOWN_MAX = 600      # max cooldown per block
MAX_RETRIES = 3         # retries per video

# Thread-local storage for API instances
thread_local = threading.local()

# Shared state with locks
progress_lock = threading.Lock()
dataset_lock = threading.Lock()
print_lock = threading.Lock()
stats_lock = threading.Lock()
error_lock = threading.Lock()

# NRI keyword filter
NRI_KEYWORDS = [
    r"nri", r"non.resident", r"nro", r"nre", r"fcnr",
    r"dtaa", r"fema", r"repatriat", r"remittance",
    r"tds", r"nri.*tax", r"nri.*invest", r"nri.*propert",
    r"nri.*india", r"india.*abroad", r"overseas.*indian",
    r"oci", r"pio", r"foreign.*asset", r"section\s*195",
    r"section\s*54", r"capital\s*gain", r"ltcg", r"stcg",
    r"itr", r"form\s*15c[ab]", r"gift\s*city",
    r"pan\s*card", r"ais", r"26as", r"residency.*status",
    r"double\s*tax", r"foreign\s*tax\s*credit",
    r"indian\s*tax", r"income\s*tax\s*india",
    r"tcs", r"lrs", r"rbi", r"property.*india",
    r"invest.*india", r"mutual\s*fund", r"real\s*estate.*india",
    r"budget.*nri", r"nri.*budget", r"gold.*nri", r"nri.*gold",
    r"nri.*bank", r"bank.*nri", r"rupee", r"forex",
    r"wealth.*india", r"india.*wealth", r"sip.*india",
    r"demat.*nri", r"nri.*demat", r"pis", r"customs.*india",
    r"baggage.*rule", r"advance\s*tax", r"surcharge",
    r"indexation", r"cii", r"rental\s*income",
    r"house\s*property", r"salary.*india", r"pension.*india",
]
NRI_PATTERN = re.compile("|".join(NRI_KEYWORDS), re.IGNORECASE)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_ytt():
    """Get thread-local YouTubeTranscriptApi instance."""
    if not hasattr(thread_local, "ytt"):
        thread_local.ytt = YouTubeTranscriptApi()
    return thread_local.ytt


def find_csv_files():
    return sorted([
        os.path.join(CSV_DIR, f)
        for f in os.listdir(CSV_DIR)
        if f.startswith("vidIQ CSV export for") and f.endswith(".csv")
    ])


def extract_channel_name(filepath):
    return os.path.basename(filepath).replace("vidIQ CSV export for ", "").split(" 2026")[0].strip()


def is_nri_related(row):
    text = " ".join([row.get("TITLE") or "", row.get("DESCRIPTION") or "", row.get("KEYWORDS") or ""])
    return bool(NRI_PATTERN.search(text))


def load_json(path, default=None):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else {}


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_csv_file(dataset):
    if not dataset:
        return
    fields = [
        "video_id", "channel", "title", "date_published", "duration",
        "views", "likes", "comments", "vidiq_score", "engagement_rate",
        "keywords", "transcript_language", "transcript_type",
        "transcript_length", "transcript", "description",
    ]
    with open(DATASET_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in dataset:
            writer.writerow(row)


def safe_int(val):
    try:
        return int(float(val)) if val else 0
    except (ValueError, TypeError):
        return 0


def safe_float(val):
    try:
        return float(val) if val else 0.0
    except (ValueError, TypeError):
        return 0.0


def fetch_transcript(video_id):
    """Fetch transcript — English > Hindi-translated > Hindi > other."""
    ytt = get_ytt()
    transcript_list = ytt.list(video_id)
    transcripts = list(transcript_list)

    if not transcripts:
        raise Exception("No transcripts available")

    en_manual = en_auto = hi_t = other_t = None
    for t in transcripts:
        if t.language_code in ("en", "en-IN", "en-US"):
            if not t.is_generated:
                en_manual = t
            else:
                en_auto = t
        elif t.language_code == "hi":
            hi_t = t
        elif other_t is None:
            other_t = t

    for cand, label in [(en_manual, "manual"), (en_auto, "auto")]:
        if cand:
            snippets = cand.fetch()
            return " ".join(s.text for s in snippets), cand.language_code, label

    if hi_t and hi_t.is_translatable:
        try:
            snippets = hi_t.translate("en").fetch()
            return " ".join(s.text for s in snippets), "hi→en", "translated"
        except Exception:
            pass

    if hi_t:
        snippets = hi_t.fetch()
        return " ".join(s.text for s in snippets), "hi", "auto" if hi_t.is_generated else "manual"

    if other_t:
        if other_t.is_translatable:
            try:
                snippets = other_t.translate("en").fetch()
                return " ".join(s.text for s in snippets), f"{other_t.language_code}→en", "translated"
            except Exception:
                pass
        snippets = other_t.fetch()
        return " ".join(s.text for s in snippets), other_t.language_code, "auto" if other_t.is_generated else "manual"

    raise Exception("No usable transcript found")


def log_error(video_id, channel, error):
    with error_lock:
        with open(ERRORS_LOG, "a") as f:
            f.write(f"{datetime.now().isoformat()} | {channel} | {video_id} | {error}\n")


# ─── Worker ───────────────────────────────────────────────────────────────────

def process_video(video, progress, dataset, existing_ids, stats, remaining, t0):
    """Download transcript for one video. Called from thread pool."""
    vid = video["ID"]
    ch = video["_channel"]
    title = (video.get("TITLE") or "")[:42]

    for attempt in range(MAX_RETRIES):
        try:
            # Random delay before request (stagger threads)
            time.sleep(PER_THREAD_DELAY + random.uniform(0, JITTER))

            text, lang, ttype = fetch_transcript(vid)

            rec = {
                "video_id": vid,
                "channel": ch,
                "title": video.get("TITLE") or "",
                "description": video.get("DESCRIPTION") or "",
                "date_published": video.get("DATE PUBLISHED") or "",
                "duration": video.get("DURATION") or "",
                "views": safe_int(video.get("VIEWS")),
                "likes": safe_int(video.get("YT LIKES")),
                "comments": safe_int(video.get("YT COMMENTS")),
                "vidiq_score": safe_float(video.get("VIDIQ SCORE")),
                "engagement_rate": safe_float(video.get("ENGAGEMENT RATE")),
                "keywords": video.get("KEYWORDS") or "",
                "transcript": text,
                "transcript_language": lang,
                "transcript_type": ttype,
                "transcript_length": len(text),
            }

            with dataset_lock:
                if vid not in existing_ids:
                    dataset.append(rec)
                    existing_ids.add(vid)

            with progress_lock:
                progress["completed"][vid] = True

            with stats_lock:
                stats["ok"] += 1
                n = stats["ok"] + stats["no_tx"] + stats["fail"]

            elapsed = time.time() - t0
            rate = n / elapsed if elapsed > 0 else 1
            eta = (remaining - n) / rate / 60 if rate > 0 else 0
            lang_s = f"{lang} {ttype[:5]}" if len(lang) <= 5 else lang

            with print_lock:
                print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | {lang_s:10s} | {len(text):>6,} ch | ETA {eta:.0f}m")

            return "ok"

        except Exception as e:
            err = str(e).lower()

            if any(kw in err for kw in ["no transcript", "disabled", "no usable", "unavailable"]):
                with progress_lock:
                    progress["completed"][vid] = True
                    progress.setdefault("no_transcript", [])
                    if vid not in progress["no_transcript"]:
                        progress["no_transcript"].append(vid)

                with stats_lock:
                    stats["no_tx"] += 1
                    n = stats["ok"] + stats["no_tx"] + stats["fail"]

                with print_lock:
                    print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | NO TRANSCRIPT")
                return "no_tx"

            if "blocked" in err or "too many" in err:
                with stats_lock:
                    stats["blocks"] += 1

                cooldown = min(COOLDOWN_BASE * (2 ** attempt), COOLDOWN_MAX)
                with print_lock:
                    print(f"  !!! BLOCKED ({ch[:15]}/{vid}) attempt {attempt+1}/{MAX_RETRIES} — wait {cooldown}s")

                # Reset thread-local session
                thread_local.ytt = YouTubeTranscriptApi()
                time.sleep(cooldown)
                continue

            # Other error
            with stats_lock:
                stats["fail"] += 1
                n = stats["ok"] + stats["no_tx"] + stats["fail"]

            with progress_lock:
                progress.setdefault("failed", {})[vid] = str(e)[:200]

            log_error(vid, ch, traceback.format_exc())

            with print_lock:
                print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | ERR: {str(e)[:50]}")
            return "fail"

    # All retries exhausted
    with stats_lock:
        stats["fail"] += 1
        n = stats["ok"] + stats["no_tx"] + stats["fail"]

    with progress_lock:
        progress.setdefault("failed", {})[vid] = "blocked_max_retries"

    with print_lock:
        print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | BLOCKED (skipped)")
    return "blocked"


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print(f"  NRI YouTube Transcript Downloader — {NUM_WORKERS} threads")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # Parse CSVs
    csv_files = find_csv_files()
    if not csv_files:
        print("ERROR: No vidIQ CSV files found in ~/Downloads")
        sys.exit(1)

    print(f"\n{len(csv_files)} channels:")
    all_videos = []
    for fp in csv_files:
        ch = extract_channel_name(fp)
        with open(fp, "r", encoding="utf-8-sig") as f:
            vids = [dict(row, _channel=ch) for row in csv.DictReader(f) if is_nri_related(row)]
            all_videos.extend(vids)
            print(f"  {ch}: {len(vids)}")

    print(f"\nTotal NRI videos: {len(all_videos)}")

    # Load state
    progress = load_json(PROGRESS_FILE, {"completed": {}, "failed": {}, "no_transcript": []})
    dataset = load_json(DATASET_JSON, [])
    existing_ids = {d["video_id"] for d in dataset}

    # Clear old failures
    progress["failed"] = {}

    todo = [v for v in all_videos if v["ID"] not in progress["completed"]]
    remaining = len(todo)

    print(f"Already done: {len(all_videos) - remaining} | Remaining: {remaining}")

    if remaining == 0:
        print("\nAll done!")
        save_csv_file(dataset)
        return

    # Shuffle to distribute channel requests (avoids hammering same endpoint)
    random.shuffle(todo)

    est = remaining * (PER_THREAD_DELAY + JITTER / 2) / NUM_WORKERS / 3600
    print(f"Estimated: {est:.1f} hours with {NUM_WORKERS} threads")
    print("-" * 70)

    stats = {"ok": 0, "no_tx": 0, "fail": 0, "blocks": 0}
    t0 = time.time()
    last_checkpoint = 0

    # Process in thread pool
    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
        futures = {}
        for video in todo:
            f = executor.submit(process_video, video, progress, dataset, existing_ids, stats, remaining, t0)
            futures[f] = video["ID"]

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                vid = futures[future]
                with print_lock:
                    print(f"  UNEXPECTED ERROR for {vid}: {e}")

            # Periodic checkpoint
            with stats_lock:
                total_done = stats["ok"] + stats["no_tx"] + stats["fail"]

            if total_done - last_checkpoint >= CHECKPOINT_INTERVAL:
                last_checkpoint = total_done
                with progress_lock:
                    save_json(PROGRESS_FILE, progress)
                with dataset_lock:
                    save_json(DATASET_JSON, dataset)
                with print_lock:
                    print(f"\n  >>> CHECKPOINT ({total_done}/{remaining}): {stats['ok']} ok | {stats['no_tx']} no tx | {stats['fail']} fail | {stats['blocks']} blocks | {len(dataset)} total\n")

    # Final save
    save_json(PROGRESS_FILE, progress)
    save_json(DATASET_JSON, dataset)
    save_csv_file(dataset)

    elapsed = time.time() - t0
    print("\n" + "=" * 70)
    print(f"  COMPLETE — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print(f"  Downloaded:      {stats['ok']}")
    print(f"  No transcript:   {stats['no_tx']}")
    print(f"  Failed:          {stats['fail']}")
    print(f"  IP blocks:       {stats['blocks']}")
    print(f"  Dataset:         {len(dataset)} videos")
    print(f"  Time:            {elapsed/60:.1f} min ({elapsed/3600:.1f} hrs)")
    print(f"\n  {DATASET_JSON}")
    print(f"  {DATASET_CSV}")

    ch_counts = {}
    for d in dataset:
        ch_counts[d["channel"]] = ch_counts.get(d["channel"], 0) + 1
    print("\n  By channel:")
    for ch, n in sorted(ch_counts.items()):
        print(f"    {ch}: {n}")

    lang_counts = {}
    for d in dataset:
        lang_counts[d.get("transcript_language", "?")] = lang_counts.get(d.get("transcript_language", "?"), 0) + 1
    print("\n  By language:")
    for l, n in sorted(lang_counts.items(), key=lambda x: -x[1]):
        print(f"    {l}: {n}")


if __name__ == "__main__":
    main()
