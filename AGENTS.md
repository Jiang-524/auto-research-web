# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

An **auto research summary website** that uses Codex skills (inspired by [academic-research-skills](https://github.com/Imbad0202/academic-research-skills)) to automate literature search, summarization, and structured presentation. The output is a browsable web frontend that aggregates and organizes recent papers in robot manipulation, RL, IL, VLA, and related areas.

## Tech stack (planned)

- **Backend / pipeline**: Codex skills + Python scripts for paper fetching (Semantic Scholar / arXiv API), summarization, and categorization
- **Frontend**: Static site (likely React or vanilla HTML/JS) — searchable, filterable paper list with tags, summaries, and links
- **Hosting**: GitHub Pages or similar static hosting

## Reference

- Primary inspiration: https://github.com/Imbad0202/academic-research-skills — a Codex skill suite covering research → writing → review → revision pipeline
- The key takeaway: AI handles the busywork (literature search, formatting, fact-checking), human stays in the loop for judgment

## Key design goals

- Auto-fetch and summarize recent papers from target venues (ICRA, CoRL, RSS, ICML, NeurIPS, ICLR, RA-L, etc.)
- Present summaries in a clean, filterable web UI
- Support topic-based collections and periodic updates
- Human-in-the-loop: flag interesting papers, curate collections, verify summaries

## Status: initial scaffold

No implementation yet. The next step is to decide on tech stack, set up the skill pipeline, and scaffold the frontend.
