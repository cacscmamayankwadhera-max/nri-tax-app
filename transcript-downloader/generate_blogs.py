#!/usr/bin/env python3
"""
NRI Blog Generator — AEO/GEO/SEO Optimized
============================================
Processes YouTube transcripts into structured, AI-searchable blog content
optimized for Answer Engine, Generative Engine, and Search Engine visibility.

Clusters transcripts by topic, extracts Q&As, and generates
2026-updated blog articles for the NRI Tax Suite.

Usage:
    python3 generate_blogs.py
"""

import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime

try:
    sys.stdout = os.fdopen(sys.stdout.fileno(), "w", buffering=1)
except Exception:
    pass

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_FILE = os.path.join(OUTPUT_DIR, "transcripts_dataset.json")
BLOGS_DIR = os.path.join(OUTPUT_DIR, "blogs")
BLOG_INDEX = os.path.join(BLOGS_DIR, "blog_index.json")

# ─── Topic Taxonomy ──────────────────────────────────────────────────────────

TOPIC_CONFIG = {
    "nri-property-sale-capital-gains": {
        "title": "NRI Property Sale & Capital Gains Tax in India (2026 Guide)",
        "keywords": [r"property.*sale", r"capital gain", r"ltcg", r"stcg", r"section 54",
                     r"section 45", r"flat.*sold", r"house.*sale", r"plot.*sale",
                     r"indexation", r"cii", r"tds.*property", r"section 195",
                     r"section 54ec", r"54f", r"registration", r"stamp duty"],
        "seo_title": "NRI Property Sale Tax India 2026 | Capital Gains, TDS, Section 54 Guide",
        "meta_description": "Complete guide for NRIs selling property in India in 2026. Covers LTCG vs STCG, dual tax options (20% indexed vs 12.5% flat), TDS under Section 195, Section 54/54EC exemptions, and repatriation rules.",
        "target_queries": [
            "How is property sale taxed for NRIs in India?",
            "What is the TDS rate on NRI property sale?",
            "Can NRIs claim Section 54 exemption?",
            "LTCG vs STCG on property for NRI",
            "How to calculate capital gains on property sold by NRI",
        ],
    },
    "nri-tax-filing-itr": {
        "title": "NRI Income Tax Filing in India — ITR Guide for 2026",
        "keywords": [r"itr", r"income tax return", r"tax filing", r"filing.*return",
                     r"form.*itr", r"due date", r"belated", r"revised",
                     r"assessment year", r"financial year", r"fy.*26",
                     r"income tax.*nri", r"nri.*tax.*india"],
        "seo_title": "NRI Income Tax Filing India 2026 | ITR Forms, Due Dates, Step-by-Step",
        "meta_description": "Step-by-step guide for NRIs filing income tax returns in India for AY 2026-27. Covers ITR form selection, due dates, new vs old regime, common mistakes, and penalties for late filing.",
        "target_queries": [
            "Which ITR form should NRI file?",
            "What is the due date for NRI tax filing in India?",
            "Do NRIs need to file ITR in India?",
            "New regime vs old regime for NRI",
            "Penalty for late ITR filing for NRI",
        ],
    },
    "nri-tds-rates-refund": {
        "title": "TDS on NRI Income in India — Rates, Refund & Section 197 (2026)",
        "keywords": [r"tds.*rate", r"tds.*nri", r"section 195", r"tds.*refund",
                     r"lower.*tds", r"section 197", r"tds.*deduct",
                     r"tds.*interest", r"tds.*rent", r"tds.*dividend",
                     r"30%.*tds", r"20%.*tds", r"withholding"],
        "seo_title": "TDS Rates for NRIs 2026 | Section 195, Refund Claims, Lower TDS Certificate",
        "meta_description": "Complete TDS guide for NRIs in India 2026. Covers TDS rates on property sale (20%), NRO interest (30%), dividends, rent income. How to claim refund and apply for Section 197 lower TDS certificate.",
        "target_queries": [
            "What is the TDS rate for NRI on property sale?",
            "How can NRI claim TDS refund?",
            "TDS on NRO fixed deposit for NRI",
            "Section 197 lower deduction certificate for NRI",
            "Why is NRI TDS so high?",
        ],
    },
    "nre-nro-fcnr-banking": {
        "title": "NRE vs NRO vs FCNR Accounts — NRI Banking Guide (2026)",
        "keywords": [r"nre.*account", r"nro.*account", r"fcnr", r"nre.*nro",
                     r"nri.*bank", r"bank.*account.*nri", r"repatriat",
                     r"fd.*nri", r"fixed deposit.*nri", r"savings.*nri",
                     r"interest.*nre", r"interest.*nro", r"tax.*free.*nre"],
        "seo_title": "NRE vs NRO vs FCNR Account 2026 | Which NRI Bank Account to Use",
        "meta_description": "Detailed comparison of NRE, NRO, and FCNR accounts for NRIs in 2026. Covers tax treatment, repatriation limits, interest rates, FD options, and which account to use for salary, rent, and investments.",
        "target_queries": [
            "Difference between NRE and NRO account",
            "Is NRE interest tax free?",
            "Which bank account should NRI open in India?",
            "Can NRI repatriate money from NRO account?",
            "FCNR deposit benefits for NRI",
        ],
    },
    "nri-investment-mutual-funds": {
        "title": "NRI Investment in India — Mutual Funds, Stocks & SIP Guide (2026)",
        "keywords": [r"mutual fund.*nri", r"nri.*invest", r"sip.*nri", r"stock.*nri",
                     r"demat.*nri", r"equity.*nri", r"portfolio.*nri",
                     r"nifty", r"sensex", r"invest.*india",
                     r"pis", r"pms", r"aif"],
        "seo_title": "NRI Investment India 2026 | Mutual Funds, Stocks, SIP for Non-Residents",
        "meta_description": "How NRIs can invest in Indian mutual funds, stocks, and SIPs in 2026. Covers KYC requirements, PIS permission, tax implications, FATCA compliance, and best investment strategies for NRIs.",
        "target_queries": [
            "Can NRI invest in mutual funds in India?",
            "How to start SIP as NRI?",
            "NRI stock market investment India",
            "KYC requirements for NRI investing in India",
            "Tax on mutual fund returns for NRI",
        ],
    },
    "dtaa-double-taxation-ftc": {
        "title": "DTAA for NRIs — Avoid Double Taxation with Foreign Tax Credit (2026)",
        "keywords": [r"dtaa", r"double tax", r"tax treaty", r"foreign tax credit",
                     r"ftc", r"form 67", r"trc", r"tax residency certificate",
                     r"bilateral", r"relief.*section 90", r"section 91"],
        "seo_title": "DTAA Guide for NRIs 2026 | Foreign Tax Credit, Form 67, Treaty Benefits",
        "meta_description": "How NRIs can avoid double taxation using DTAA and Foreign Tax Credit in 2026. Covers India's tax treaties with US, UK, UAE, Canada, Singapore, Form 67 filing, TRC requirements, and Section 90/91 relief.",
        "target_queries": [
            "How does DTAA benefit NRIs?",
            "DTAA between India and USA for NRI",
            "How to claim foreign tax credit in India?",
            "Is Form 67 mandatory for FTC?",
            "NRI double taxation avoidance",
        ],
    },
    "fema-compliance-nri": {
        "title": "FEMA Compliance for NRIs — Rules, Penalties & Common Mistakes (2026)",
        "keywords": [r"fema", r"enforcement directorate", r"ed ", r"foreign exchange",
                     r"compliance.*nri", r"penalty.*nri", r"rbi.*nri",
                     r"lrs", r"liberalised remittance", r"form 15ca", r"form 15cb",
                     r"repatriation", r"compounding"],
        "seo_title": "FEMA Rules for NRIs 2026 | Compliance, Penalties, 15CA/15CB, LRS Limits",
        "meta_description": "Essential FEMA compliance guide for NRIs in 2026. Covers common violations, ED penalties, Form 15CA/15CB for repatriation, LRS limits, NRE/NRO conversion rules, and how to stay compliant.",
        "target_queries": [
            "FEMA rules for NRI property sale",
            "FEMA penalty for NRI",
            "Form 15CA 15CB for NRI repatriation",
            "LRS limit for NRI sending money from India",
            "What happens if NRI doesn't convert to NRO account?",
        ],
    },
    "gift-city-nri-investment": {
        "title": "GIFT City for NRIs — Tax-Free Investing in India (2026)",
        "keywords": [r"gift city", r"ifsc", r"gandhinagar", r"ifsca",
                     r"nse ix", r"zero tax.*gift", r"gift.*aif",
                     r"gift.*fd", r"international.*financial"],
        "seo_title": "GIFT City NRI Investment 2026 | Tax-Free Funds, FDs, Stock Exchange",
        "meta_description": "How NRIs can invest tax-free through GIFT City IFSC in 2026. Covers AIF funds, fixed deposits, NSE IX stock exchange, zero-tax benefits, and comparison with NRE/NRO investments.",
        "target_queries": [
            "What is GIFT City for NRI investment?",
            "Is GIFT City tax free for NRI?",
            "How to invest in GIFT City from abroad?",
            "GIFT City vs NRE account for NRI",
            "GIFT City AIF funds for NRI",
        ],
    },
    "nri-rental-income-house-property": {
        "title": "NRI Rental Income Tax in India — House Property Guide (2026)",
        "keywords": [r"rental income", r"house property", r"rent.*nri", r"let.*out",
                     r"tenant.*nri", r"deemed let out", r"standard deduction.*30",
                     r"home loan.*nri", r"section 24", r"municipal tax"],
        "seo_title": "NRI Rental Income Tax India 2026 | TDS, Deductions, House Property Rules",
        "meta_description": "Guide to NRI rental income taxation in India 2026. Covers 30% standard deduction, home loan interest (Section 24), deemed let-out property, TDS on rent, and loss set-off rules.",
        "target_queries": [
            "How is rental income taxed for NRI in India?",
            "TDS on rental income for NRI",
            "Can NRI claim home loan deduction on rental property?",
            "Deemed let-out property tax for NRI",
            "Standard deduction on house property income",
        ],
    },
    "nri-budget-2026-changes": {
        "title": "Budget 2026 Impact on NRIs — TCS Cut, Property TDS, Foreign Assets",
        "keywords": [r"budget 2026", r"union budget", r"sitharaman.*nri",
                     r"tcs.*cut", r"tcs.*reduction", r"tan.*property",
                     r"foreign asset.*disclosure", r"budget.*impact"],
        "seo_title": "India Budget 2026 for NRIs | TCS Changes, Property Rules, Foreign Asset Scheme",
        "meta_description": "How India's Union Budget 2026 impacts NRIs. Key changes: TCS on education/medical remittance cut to 2%, TAN requirement removed for property TDS, and Foreign Assets Disclosure Scheme 2026.",
        "target_queries": [
            "Budget 2026 changes for NRI",
            "TCS rate for NRI education remittance 2026",
            "Foreign Asset Disclosure Scheme 2026",
            "TAN removed for NRI property sale?",
            "India budget impact on NRI investments",
        ],
    },
    "nri-residency-status-determination": {
        "title": "NRI Residency Status in India — How to Determine NR, RNOR, Resident (2026)",
        "keywords": [r"residency status", r"residential status", r"non.resident",
                     r"rnor", r"resident.*ordinary", r"182 days", r"60 days",
                     r"deemed resident", r"section 6", r"stay.*india",
                     r"passport.*stamp", r"days.*india"],
        "seo_title": "NRI Residency Status India 2026 | NR vs RNOR vs Resident Determination",
        "meta_description": "How to determine your residency status as an NRI in India for 2026. Covers 182-day rule, modified 60-day rule, RNOR status, deemed resident provisions, and tax implications of each status.",
        "target_queries": [
            "How to determine NRI status in India?",
            "182 day rule for NRI India",
            "What is RNOR status for NRI?",
            "Deemed resident rule for NRI",
            "How many days can NRI stay in India?",
        ],
    },
    "nri-retirement-pension-planning": {
        "title": "NRI Retirement Planning — Pension, EPF, NPS & Return to India (2026)",
        "keywords": [r"retire", r"pension", r"epf.*nri", r"ppf.*nri", r"nps.*nri",
                     r"return.*india.*retire", r"corpus", r"swp",
                     r"systematic withdrawal"],
        "seo_title": "NRI Retirement Planning India 2026 | Pension, EPF, NPS, SWP Guide",
        "meta_description": "Retirement planning guide for NRIs returning to India in 2026. Covers EPF withdrawal, PPF continuation, NPS for NRIs, systematic withdrawal plans, pension taxation, and corpus planning.",
        "target_queries": [
            "Can NRI continue PPF account?",
            "EPF withdrawal for NRI",
            "NPS for NRI India",
            "Retirement planning for NRI returning to India",
            "How much corpus does NRI need to retire in India?",
        ],
    },
}


# ─── Processing Functions ────────────────────────────────────────────────────

def classify_transcript(transcript):
    """Assign topic(s) to a transcript based on keywords."""
    text = f"{transcript['title']} {transcript['keywords']} {transcript['description']}".lower()
    matches = []
    for topic_id, config in TOPIC_CONFIG.items():
        score = sum(1 for kw in config["keywords"] if re.search(kw, text))
        if score >= 1:
            matches.append((topic_id, score))
    matches.sort(key=lambda x: -x[1])
    return [m[0] for m in matches[:3]]  # max 3 topics per transcript


def extract_key_insights(transcripts):
    """Extract key sentences and facts from transcripts for a topic cluster."""
    insights = []
    for t in transcripts:
        text = t["transcript"]
        # Skip very short transcripts
        if len(text) < 200:
            continue

        insights.append({
            "title": t["title"],
            "channel": t["channel"],
            "video_id": t["video_id"],
            "views": t["views"],
            "date": t["date_published"],
            "transcript_length": t["transcript_length"],
            "lang": t["transcript_language"],
            "text": text,
        })

    # Sort by views (most popular = most validated content)
    insights.sort(key=lambda x: -x["views"])
    return insights


def _make_tags(keywords):
    tags = []
    for kw in keywords:
        clean = re.sub(r'[\\.*+?^${}()|[\]]', ' ', kw).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if clean:
            tags.append(clean)
    return json.dumps(tags)


def generate_blog_content(topic_id, config, insights):
    """Generate AEO/GEO/SEO optimized blog content from transcript insights."""

    # Header with schema markup hints
    blog = f"""---
slug: "{topic_id}"
title: "{config['seo_title']}"
meta_description: "{config['meta_description']}"
date: "{datetime.now().strftime('%Y-%m-%d')}"
last_updated: "{datetime.now().strftime('%Y-%m-%d')}"
author: "MKW Advisors Tax Team"
category: "NRI Tax Guide"
tags: {_make_tags(config['keywords'][:8])}
sources_count: {len(insights)}
total_views: {sum(i['views'] for i in insights):,}
schema_type: "Article"
faq_schema: true
---

# {config['title']}

"""

    # AEO: Quick Answer Box (for AI answer engines)
    blog += f"""## Quick Answer

> **{config['target_queries'][0]}**
>
> [This section will be filled with a concise, factual answer derived from the transcript insights below. The answer should be 2-3 sentences that directly answer the query with specific numbers, dates, and section references for FY 2025-26 / AY 2026-27.]

---

"""

    # GEO: Structured FAQ section (for generative AI citations)
    blog += "## Frequently Asked Questions\n\n"
    for q in config["target_queries"]:
        blog += f"""### {q}

[Answer to be synthesized from transcript insights. Must include:
- Specific numbers/rates for 2026
- Relevant section references
- Practical actionable steps]

"""

    # Source transcripts section
    blog += "---\n\n## Source Transcripts\n\n"
    blog += f"*{len(insights)} videos analyzed, {sum(i['views'] for i in insights):,} total views*\n\n"

    for i, insight in enumerate(insights[:20], 1):  # Top 20 by views
        # Truncate transcript for blog reference
        excerpt = insight["text"][:1000].strip()
        if len(insight["text"]) > 1000:
            excerpt += "..."

        blog += f"""### {i}. {insight['title']}

- **Channel:** {insight['channel']}
- **Views:** {insight['views']:,}
- **Published:** {insight['date']}
- **Language:** {insight['lang']}
- **Video:** https://youtube.com/watch?v={insight['video_id']}

<details>
<summary>Transcript excerpt ({insight['transcript_length']:,} chars total)</summary>

{excerpt}

</details>

"""

    # Full transcript data for AI processing
    blog += "---\n\n## Full Transcript Data (for AI processing)\n\n"
    blog += "```json\n"

    # Include full transcripts as structured data
    transcript_data = []
    for insight in insights:
        transcript_data.append({
            "video_id": insight["video_id"],
            "title": insight["title"],
            "channel": insight["channel"],
            "views": insight["views"],
            "date": insight["date"],
            "transcript": insight["text"],
        })

    blog += json.dumps(transcript_data, ensure_ascii=False, indent=2)[:50000]  # Cap at 50K chars
    if len(json.dumps(transcript_data)) > 50000:
        blog += "\n... (truncated, see transcripts_dataset.json for full data)"
    blog += "\n```\n"

    return blog


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  NRI Blog Generator — AEO/GEO/SEO Optimized")
    print("=" * 70)

    # Load transcripts
    if not os.path.exists(DATASET_FILE):
        print("ERROR: No transcripts_dataset.json found. Run download_transcripts.py first.")
        sys.exit(1)

    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        transcripts = json.load(f)

    print(f"\nLoaded {len(transcripts)} transcripts")

    # Classify into topics
    topic_clusters = defaultdict(list)
    unclassified = []

    for t in transcripts:
        topics = classify_transcript(t)
        if topics:
            for topic in topics:
                topic_clusters[topic].append(t)
        else:
            unclassified.append(t)

    print(f"\nTopic clusters:")
    for topic_id, items in sorted(topic_clusters.items(), key=lambda x: -len(x[1])):
        config = TOPIC_CONFIG[topic_id]
        total_views = sum(i["views"] for i in items)
        print(f"  {topic_id}: {len(items)} transcripts, {total_views:,} views")

    print(f"  (unclassified): {len(unclassified)} transcripts")

    # Generate blogs
    os.makedirs(BLOGS_DIR, exist_ok=True)
    blog_index = []

    for topic_id, items in sorted(topic_clusters.items(), key=lambda x: -len(x[1])):
        config = TOPIC_CONFIG[topic_id]
        insights = extract_key_insights(items)

        if not insights:
            print(f"\n  Skipping {topic_id} — no usable transcripts")
            continue

        print(f"\n  Generating: {config['title']}")
        print(f"    Sources: {len(insights)} transcripts, {sum(i['views'] for i in insights):,} views")

        blog_content = generate_blog_content(topic_id, config, insights)

        # Save blog
        blog_file = os.path.join(BLOGS_DIR, f"{topic_id}.md")
        with open(blog_file, "w", encoding="utf-8") as f:
            f.write(blog_content)

        blog_index.append({
            "slug": topic_id,
            "title": config["seo_title"],
            "meta_description": config["meta_description"],
            "file": f"{topic_id}.md",
            "sources": len(insights),
            "total_views": sum(i["views"] for i in insights),
            "target_queries": config["target_queries"],
            "generated": datetime.now().isoformat(),
        })

        print(f"    Saved: {blog_file}")

    # Save index
    with open(BLOG_INDEX, "w", encoding="utf-8") as f:
        json.dump(blog_index, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 70}")
    print(f"  Generated {len(blog_index)} blog templates")
    print(f"  Index: {BLOG_INDEX}")
    print(f"  Blogs: {BLOGS_DIR}/")
    print(f"{'=' * 70}")

    print(f"\nNext steps:")
    print(f"  1. Feed each blog through Claude AI to:")
    print(f"     - Synthesize transcript insights into coherent answers")
    print(f"     - Update all facts/rates for FY 2025-26 / AY 2026-27")
    print(f"     - Generate FAQ schema markup")
    print(f"     - Add internal links to NRI Tax Suite")
    print(f"  2. Add to Next.js app as /blog/[slug] pages")
    print(f"  3. Submit to Google Search Console")


if __name__ == "__main__":
    main()
