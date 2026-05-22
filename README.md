# Auto Research Web

An online personal AI research console with a local bridge for private execution.

> "Use the online console anywhere, and connect it to your own local research bridge when you want to work with private papers, local storage, and personal LLM credentials."

## Live Demo

**https://jiang-524.github.io/auto-research-web/**

GitHub Pages serves the static frontend. LLM-backed features and private paper access require running the Local Research Bridge.

## Runtime Modes

### Static Demo Mode
Public demo. No private papers. No real API keys. No bridge required.

### Personal Hybrid Mode (Recommended)
Online console + Local Research Bridge at `http://127.0.0.1:8765`. Private papers, local SQLite database, personal LLM credentials — all stay on your machine.

### Cloud Mode (Future)
Full cloud deployment with serverless backend and cloud database. Not required now.

## Quick Start

### Prerequisites
- Node.js 18+
- Windows (bridge configured for Windows paths by default)
- Paper folder at E:/paper (or configure your own path)

### Install

```bash
git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
```

### Configure

```bash
cp .env.example .env.local
# Edit .env.local with your real values
```

Required variables:
```env
LLM_API_KEY=your-real-api-key
AUTO_RESEARCH_PAPER_DIR=E:/paper
AUTO_RESEARCH_BRIDGE_HOST=127.0.0.1
```

### Run the Bridge

```bash
node server.js
# Bridge running at http://127.0.0.1:8765
```

### Use the Console

Open https://jiang-524.github.io/auto-research-web/ → Settings → Personal Hybrid Mode → Check Connection.

## Features

### Without Bridge (Static Demo)
- Dashboard with research workspace metrics
- Paper Collector (local corpus search, manual entry)
- Paper Triage with bookmarks and verification
- Academic Pipeline (10-stage research workflow)
- Export Center (Markdown, JSON, LaTeX, BibTeX)
- Docs and Usage Guide

### With Bridge (Personal Hybrid)
- **Paper Library**: scan, import, search, and manage local papers
- **Project Manager**: browse workspace files, read/write, project memory
- **Paper Summarizer**: structured LLM summaries
- **Deep Research**: 7 research modes
- **Idea Generator**: research gaps and experiment plans
- **Paper Writer**: drafting, revision, and format conversion
- **Paper Reviewer**: multi-perspective peer review
- **Citation Tools**: format conversion, BibTeX, integrity checks
- **Local File Output**: save generated content to your machine
- **Git Integration**: view repository status

## Architecture

```text
Online Web Console (GitHub Pages)
    ↓
Local Research Bridge at http://127.0.0.1:8765
    ↓
Local SQLite Paper Database
    ↓
Local Paper Folder (E:/paper)
    ↓
Local Outputs / Project Memory / Indexes
```

## Documentation

- [Local Bridge Setup](LOCAL_BRIDGE.md)
- [Paper Library](PAPER_LIBRARY.md)
- [Project Manager](PROJECT_MANAGER.md)
- [.env.example](.env.example)

## Security

- The online static site cannot read your local files
- The local bridge grants controlled access to configured folders only
- The bridge binds to `127.0.0.1` by default
- API keys stay in .env.local — never exposed to the browser
- Do not expose the bridge to the public internet
- Do not commit .env.local, config.local.json, or database files
- Path traversal is blocked
- No arbitrary command execution from the frontend

## Project Structure

```text
auto-research-web/
├── bridge/
│   ├── path-safety.js     # Path traversal prevention
│   ├── paper-db.js        # SQLite paper database module
│   └── workspace.js        # Workspace/file management
├── public/
│   ├── index.html          # SPA shell
│   ├── app.js              # Frontend application
│   ├── styles.css          # Stylesheet
│   └── data/               # Static data
├── prompts/
│   └── index.js            # LLM prompt templates
├── server.js               # Express bridge server
├── .env.example            # Configuration template
├── config.local.example.json
├── LOCAL_BRIDGE.md
├── PAPER_LIBRARY.md
├── PROJECT_MANAGER.md
└── README.md
```

## Scripts

```bash
npm start          # Start bridge server (port 8765)
npm run validate   # Syntax check
npm run smoke      # Security smoke test
npm run fetch-papers  # Refresh papers from arXiv
```

## License

CC BY-NC 4.0. Based on [Academic Research Skills](https://github.com/Imbad0202/academic-research-skills) by Cheng-I Wu.
