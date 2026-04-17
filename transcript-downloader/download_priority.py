#!/usr/bin/env python3
"""
Priority Transcript Downloader — Latest 2025-26 + >5K views only
=================================================================
Fetches transcripts for the 893 highest-value NRI videos first.
"""

import csv, json, os, random, re, sys, time, threading, traceback, warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

try:
    sys.stdout = os.fdopen(sys.stdout.fileno(), "w", buffering=1)
except: pass
warnings.filterwarnings("ignore")

from youtube_transcript_api import YouTubeTranscriptApi

# Config
CSV_DIR = os.path.expanduser("~/Downloads")
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(OUTPUT_DIR, "progress.json")
DATASET_JSON = os.path.join(OUTPUT_DIR, "transcripts_dataset.json")
DATASET_CSV = os.path.join(OUTPUT_DIR, "transcripts_dataset.csv")

NUM_WORKERS = 4
PER_THREAD_DELAY = 2.0
JITTER = 1.5
CHECKPOINT_INTERVAL = 30
COOLDOWN_BASE = 120
COOLDOWN_MAX = 600
MAX_RETRIES = 3
MIN_VIEWS = 5000

thread_local = threading.local()
progress_lock = threading.Lock()
dataset_lock = threading.Lock()
print_lock = threading.Lock()
stats_lock = threading.Lock()

NRI_PAT = re.compile(r'nri|non.resident|nro|nre|fcnr|dtaa|fema|repatriat|remittance|tds|capital.gain|ltcg|stcg|itr|gift.city|invest.*india|mutual.fund|property.*india|budget.*nri|rupee|forex|section.195|section.54|residency|ais|26as|advance.tax|home.loan|insurance|esop|rsu|crypto|pension|retirement|surcharge|indexation|rental|house.property', re.I)

def get_ytt():
    if not hasattr(thread_local, "ytt"):
        thread_local.ytt = YouTubeTranscriptApi()
    return thread_local.ytt

def fetch_transcript(video_id):
    ytt = get_ytt()
    tlist = ytt.list(video_id)
    transcripts = list(tlist)
    if not transcripts:
        raise Exception("No transcripts available")
    en_manual = en_auto = hi_t = other_t = None
    for t in transcripts:
        if t.language_code in ("en", "en-IN", "en-US"):
            if not t.is_generated: en_manual = t
            else: en_auto = t
        elif t.language_code == "hi": hi_t = t
        elif other_t is None: other_t = t
    for cand, label in [(en_manual, "manual"), (en_auto, "auto")]:
        if cand:
            snippets = cand.fetch()
            return " ".join(s.text for s in snippets), cand.language_code, label
    if hi_t and hi_t.is_translatable:
        try:
            snippets = hi_t.translate("en").fetch()
            return " ".join(s.text for s in snippets), "hi→en", "translated"
        except: pass
    if hi_t:
        snippets = hi_t.fetch()
        return " ".join(s.text for s in snippets), "hi", "auto" if hi_t.is_generated else "manual"
    if other_t:
        if other_t.is_translatable:
            try:
                snippets = other_t.translate("en").fetch()
                return " ".join(s.text for s in snippets), f"{other_t.language_code}→en", "translated"
            except: pass
        snippets = other_t.fetch()
        return " ".join(s.text for s in snippets), other_t.language_code, "auto" if other_t.is_generated else "manual"
    raise Exception("No usable transcript found")

def safe_int(v):
    try: return int(float(v)) if v else 0
    except: return 0

def safe_float(v):
    try: return float(v) if v else 0.0
    except: return 0.0

def process_video(video, progress, dataset, existing_ids, stats, remaining, t0):
    vid = video['id']
    ch = video['channel']
    title = video['title'][:42]
    for attempt in range(MAX_RETRIES):
        try:
            time.sleep(PER_THREAD_DELAY + random.uniform(0, JITTER))
            text, lang, ttype = fetch_transcript(vid)
            rec = {
                "video_id": vid, "channel": ch,
                "title": video['title'], "description": video.get('description',''),
                "date_published": video.get('date',''), "duration": video.get('duration',''),
                "views": video['views'], "likes": 0, "comments": 0,
                "vidiq_score": 0, "engagement_rate": 0,
                "keywords": video.get('keywords',''),
                "transcript": text, "transcript_language": lang,
                "transcript_type": ttype, "transcript_length": len(text),
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
                    if vid not in progress["no_transcript"]: progress["no_transcript"].append(vid)
                with stats_lock:
                    stats["no_tx"] += 1
                    n = stats["ok"] + stats["no_tx"] + stats["fail"]
                with print_lock:
                    print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | NO TRANSCRIPT")
                return "no_tx"
            if "blocked" in err or "too many" in err:
                with stats_lock: stats["blocks"] += 1
                cooldown = min(COOLDOWN_BASE * (2 ** attempt), COOLDOWN_MAX)
                with print_lock:
                    print(f"  !!! BLOCKED ({ch[:15]}/{vid}) attempt {attempt+1}/{MAX_RETRIES} — wait {cooldown}s")
                thread_local.ytt = YouTubeTranscriptApi()
                time.sleep(cooldown)
                continue
            with stats_lock:
                stats["fail"] += 1
                n = stats["ok"] + stats["no_tx"] + stats["fail"]
            with progress_lock:
                progress.setdefault("failed", {})[vid] = str(e)[:200]
            with print_lock:
                print(f"  [{n}/{remaining}] {ch[:18]:18s} | {title[:38]:38s} | ERR: {str(e)[:50]}")
            return "fail"
    with stats_lock:
        stats["fail"] += 1
    with progress_lock:
        progress.setdefault("failed", {})[vid] = "blocked_max_retries"
    return "blocked"

def main():
    print("=" * 70)
    print(f"  PRIORITY Transcript Downloader — Latest 2025-26, >5K views")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # Load existing progress
    progress = json.load(open(PROGRESS_FILE)) if os.path.exists(PROGRESS_FILE) else {"completed":{}, "failed":{}, "no_transcript":[]}
    dataset = json.load(open(DATASET_JSON)) if os.path.exists(DATASET_JSON) else []
    existing_ids = {d["video_id"] for d in dataset}
    completed = set(progress.get("completed", {}).keys())

    # Clear old failures for retry
    progress["failed"] = {}

    # Build priority queue from CSVs
    priority = []
    for f in sorted(os.listdir(CSV_DIR)):
        if not (f.startswith("vidIQ CSV export for") and f.endswith(".csv")): continue
        channel = f.replace("vidIQ CSV export for ", "").split(" 2026")[0].strip()
        with open(os.path.join(CSV_DIR, f), "r", encoding="utf-8-sig") as fh:
            for row in csv.DictReader(fh):
                vid = row.get("ID", "")
                if not vid or vid in completed: continue
                text = " ".join(filter(None, [row.get("TITLE"), row.get("DESCRIPTION"), row.get("KEYWORDS")]))
                if not NRI_PAT.search(text): continue
                views = safe_int(row.get("VIEWS"))
                date = row.get("DATE PUBLISHED") or ""
                if views < MIN_VIEWS: continue
                if not ("2025" in date or "2026" in date): continue
                priority.append({
                    "id": vid, "channel": channel,
                    "title": row.get("TITLE") or "", "description": row.get("DESCRIPTION") or "",
                    "date": date, "duration": row.get("DURATION") or "",
                    "views": views, "keywords": row.get("KEYWORDS") or "",
                })

    # Sort by views descending
    priority.sort(key=lambda x: -x["views"])
    remaining = len(priority)

    print(f"\nPriority queue: {remaining} videos (2025-26, >5K views)")
    print(f"Already in dataset: {len(dataset)} transcripts")
    print(f"Workers: {NUM_WORKERS}")
    if remaining == 0:
        print("Nothing to download!"); return

    print("-" * 70)

    stats = {"ok": 0, "no_tx": 0, "fail": 0, "blocks": 0}
    t0 = time.time()
    last_cp = 0

    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
        futures = {executor.submit(process_video, v, progress, dataset, existing_ids, stats, remaining, t0): v["id"] for v in priority}
        for future in as_completed(futures):
            try: future.result()
            except Exception as e:
                with print_lock: print(f"  UNEXPECTED: {e}")
            with stats_lock:
                done = stats["ok"] + stats["no_tx"] + stats["fail"]
            if done - last_cp >= CHECKPOINT_INTERVAL:
                last_cp = done
                with progress_lock:
                    with open(PROGRESS_FILE, "w") as f: json.dump(progress, f)
                with dataset_lock:
                    with open(DATASET_JSON, "w") as f: json.dump(dataset, f, ensure_ascii=False, indent=2)
                with print_lock:
                    print(f"\n  >>> CP ({done}/{remaining}): {stats['ok']} ok | {stats['no_tx']} no tx | {stats['fail']} fail | {stats['blocks']} blocks | {len(dataset)} total\n")

    # Final save
    with open(PROGRESS_FILE, "w") as f: json.dump(progress, f)
    with open(DATASET_JSON, "w") as f: json.dump(dataset, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - t0
    print(f"\n{'=' * 70}")
    print(f"  COMPLETE — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Downloaded: {stats['ok']} | No transcript: {stats['no_tx']} | Failed: {stats['fail']} | Blocks: {stats['blocks']}")
    print(f"  Dataset: {len(dataset)} total | Time: {elapsed/60:.1f}m")
    print(f"{'=' * 70}")

if __name__ == "__main__":
    main()
