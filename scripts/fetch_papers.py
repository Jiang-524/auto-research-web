#!/usr/bin/env python3
"""Fetch recent arXiv papers for the Auto Research Web dashboard.

The script intentionally uses only the Python standard library so GitHub
Actions can run it without dependency installation.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import textwrap
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.error import HTTPError, URLError


ARXIV_API = "https://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"

TOPIC_QUERIES = {
    "robot manipulation": 'all:"robot manipulation"',
    "reinforcement learning": 'all:"reinforcement learning" AND all:robot',
    "imitation learning": 'all:"imitation learning" AND all:robot',
    "VLA": 'all:"vision language action" OR all:"vision-language-action"',
    "dexterous manipulation": 'all:"dexterous manipulation"',
    "embodied AI": 'all:"embodied AI" AND all:robot'
}

TAG_RULES = {
    "VLA": ["vision-language-action", "vision language action", "vla"],
    "robot manipulation": ["manipulation", "grasp", "pick", "place"],
    "reinforcement learning": ["reinforcement learning", "rl", "policy optimization"],
    "imitation learning": ["imitation learning", "behavior cloning", "demonstration"],
    "diffusion": ["diffusion"],
    "foundation models": ["foundation model", "large language model", "vision-language"],
    "dexterous manipulation": ["dexterous", "hand"],
    "sim-to-real": ["sim-to-real", "simulation-to-real", "domain randomization"],
    "benchmark": ["benchmark", "dataset"]
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-results", type=int, default=10, help="Results per topic query.")
    parser.add_argument("--output", default="data/papers.json", help="Output JSON path.")
    parser.add_argument("--sleep", type=float, default=3.0, help="Delay between arXiv requests.")
    parser.add_argument("--timeout", type=float, default=12.0, help="Network timeout per arXiv request.")
    args = parser.parse_args()

    papers = {}
    for topic, query in TOPIC_QUERIES.items():
        try:
            topic_papers = fetch_topic(topic, query, args.max_results, args.timeout)
        except (HTTPError, TimeoutError, URLError, ET.ParseError) as error:
            print(f"Warning: skipped {topic}: {error}")
            continue

        for paper in topic_papers:
            existing = papers.get(paper["id"])
            if existing:
                existing_topics = set(existing["topics"])
                existing_topics.update(paper["topics"])
                existing["topics"] = sorted(existing_topics)
            else:
                papers[paper["id"]] = paper
        time.sleep(args.sleep)

    if not papers:
        previous = load_previous_payload(Path(args.output))
        if previous.get("papers"):
            previous["generatedAt"] = dt.datetime.now(dt.timezone.utc).isoformat()
            previous["source"] = f"{previous.get('source', 'previous data')} (arXiv refresh failed)"
            write_payload(Path(args.output), previous)
            print(f"Kept {len(previous['papers'])} existing papers in {args.output}")
            return
        raise SystemExit("No arXiv results fetched and no previous paper data exists.")

    ordered = sorted(papers.values(), key=lambda item: item.get("publishedAt", ""), reverse=True)

    payload = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": "arXiv API",
        "papers": ordered,
    }

    write_payload(Path(args.output), payload)
    print(f"Wrote {len(ordered)} papers to {args.output}")


def fetch_topic(topic: str, query: str, max_results: int, timeout: float) -> list[dict]:
    params = {
        "search_query": query,
        "start": "0",
        "max_results": str(max_results),
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    url = f"{ARXIV_API}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "auto-research-web/0.1"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read()

    root = ET.fromstring(body)
    return [entry_to_paper(entry, topic) for entry in root.findall(f"{ATOM}entry")]


def entry_to_paper(entry: ET.Element, topic: str) -> dict:
    title = clean_text(entry.findtext(f"{ATOM}title", default="Untitled"))
    abstract = clean_text(entry.findtext(f"{ATOM}summary", default=""))
    published = entry.findtext(f"{ATOM}published", default="")
    authors = [
        clean_text(author.findtext(f"{ATOM}name", default=""))
        for author in entry.findall(f"{ATOM}author")
    ]
    arxiv_id = entry.findtext(f"{ATOM}id", default="")
    year = published[:4] if published else ""
    topics = infer_topics(f"{title} {abstract}", seed=topic)

    return {
        "id": stable_id(arxiv_id or title),
        "title": title,
        "authors": authors[:8],
        "year": int(year) if year.isdigit() else None,
        "venue": "arXiv",
        "publishedAt": published,
        "fetchedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "topics": topics,
        "summary": summarize_abstract(abstract),
        "url": arxiv_id,
        "pdfUrl": arxiv_id.replace("/abs/", "/pdf/") if "/abs/" in arxiv_id else arxiv_id,
        "summaryStatus": "abstract-derived; needs human verification",
    }


def clean_text(value: str) -> str:
    return " ".join(value.replace("\n", " ").split())


def infer_topics(text: str, seed: str) -> list[str]:
    lowered = text.lower()
    topics = {seed}
    for tag, needles in TAG_RULES.items():
        if any(needle in lowered for needle in needles):
            topics.add(tag)
    return sorted(topics)


def summarize_abstract(abstract: str) -> str:
    if not abstract:
        return "No abstract available from arXiv."
    sentences = abstract.replace("? ", "?. ").replace("! ", "!. ").split(". ")
    summary = ". ".join(sentence.strip() for sentence in sentences[:2] if sentence.strip())
    if len(summary) < 160 and len(sentences) > 2:
        summary = ". ".join(sentence.strip() for sentence in sentences[:3] if sentence.strip())
    summary = textwrap.shorten(summary, width=420, placeholder="...")
    return summary if summary.endswith(".") else f"{summary}."


def stable_id(value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]
    tail = value.rstrip("/").split("/")[-1].replace(".", "-")
    return f"arxiv-{tail}-{digest}"


def load_previous_payload(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def write_payload(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
