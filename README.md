# Auto Research Web

Auto Research Web is a visual academic research workflow application inspired by [Academic Research Skills](https://github.com/Imbad0202/academic-research-skills) by Cheng-I Wu. It turns the ARS research, writing, review, revision, citation, integrity, and export workflows into a browsable web app with an optional Express backend for LLM-backed tools.

## Live Demo

GitHub Pages: `https://jiang-524.github.io/auto-research-web/`

GitHub Pages serves the static frontend only. LLM-backed features require running or deploying the Express backend with server-side environment variables.

## Features

### Implemented Without API Keys

- **Dashboard**: research workspace metrics, quick actions, API status, and feature cards.
- **Paper Collector**: local corpus search and manual paper entry.
- **Paper Dashboard**: searchable/filterable paper triage with bookmarks and verification flags.
- **Academic Pipeline**: 10-stage workflow with mandatory integrity gates and entry modes.
- **Export Center**: Markdown, JSON, plain text, LaTeX, and BibTeX export.
- **Docs / Usage Guide**: setup, module usage, deployment, security, and limitations.

### LLM-Backed With Backend `.env`

- **Paper Summarizer**: contribution, method, experiments, results, limitations, key claims, and citation candidates.
- **Deep Research**: full, quick, systematic-review, socratic, fact-check, lit-review, and review modes.
- **Idea Generator**: research gaps, ranked ideas, hypotheses, experiment plans, and title suggestions.
- **Academic Paper Writer**: full draft, plan, outline-only, abstract-only, lit-review, revision, revision coach, format conversion, citation check, and disclosure.
- **Academic Paper Reviewer**: full, quick, guided, methodology-focus, re-review, and calibration.
- **Citation / Integrity Tools**: format conversion, claim-support checking, BibTeX helper, and hallucination-risk review.

### Planned

- Real-time arXiv / Semantic Scholar import in the Paper Collector UI.
- DOCX export via Pandoc.
- PDF export via a LaTeX/Tectonic pipeline.

## Quick Start

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3 if you want to run the arXiv refresh script

### Install

```bash
git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
```

### Configure LLM Provider

Copy the example file and put real provider credentials in `.env`. Do not commit `.env`.

```bash
cp .env.example .env
```

Example:

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-key-here
LLM_MODEL=gpt-4o
LLM_BASE_URL=https://api.openai.com/v1
```

Supported providers:

| Provider | `LLM_PROVIDER` | `LLM_BASE_URL` |
|---|---|---|
| OpenAI | `openai` | `https://api.openai.com/v1` |
| Anthropic | `anthropic` | `https://api.anthropic.com/v1` |
| DeepSeek | `deepseek` | `https://api.deepseek.com/v1` |
| OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` |
| Custom OpenAI-compatible | `openai` | your endpoint |

### Run

```bash
npm start
```

Open `http://localhost:3000`.

## Project Structure

```text
auto-research-web/
├── public/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── data/
│       ├── papers.json
│       └── workflows.json
├── prompts/
│   └── index.js
├── scripts/
│   └── fetch_papers.py
├── server.js
├── smoke-test.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## API Architecture

```text
Browser SPA
  -> /api/* on Express
  -> server reads LLM_API_KEY from process.env
  -> provider API call
  -> JSON response rendered in the browser
```

The browser never asks for or stores provider API keys. The Settings page stores only non-secret display/reference preferences. Provider keys belong in backend environment variables.

## Module Guide

### Paper Collector

Search the local corpus by topic/keyword or add paper metadata manually. Real-time arXiv/Semantic Scholar search is planned.

### Paper Summarizer

Select a paper or paste paper text/abstract, then run a structured LLM summary. Results include copy and export controls.

### Deep Research

Enter a topic and select one of seven modes: full, quick, systematic-review, socratic, fact-check, lit-review, or review.

### Idea Generator

Provide a topic, optional paper summaries, and constraints. The LLM returns gaps, ranked ideas, hypotheses, experiment plans, and title candidates.

### Academic Paper Writer

Paste notes, an outline, a draft, or reviewer feedback. Choose a writing or revision mode and export the generated output.

### Academic Paper Reviewer

Paste paper text and choose full, quick, guided, methodology-focus, re-review, or calibration mode.

### Pipeline Orchestrator

Use the 10-stage workflow from research through final process summary. Entry modes cover full pipeline, existing paper review, reviewer comments, and planned passport resume.

### Citation / Integrity Tools

Run citation format conversion, claim-support checks, BibTeX generation, or hallucination-risk review. Model-assisted verification is not a guarantee; independently verify critical claims.

### Export Center

Export content as Markdown, JSON, plain text, LaTeX, or BibTeX. DOCX and PDF are planned.

## Scripts

```bash
npm start             # Start Express server
npm run dev           # Same as start
npm run validate      # Syntax-check server, prompts, and smoke test script
npm run smoke         # Temporary server smoke/security checks
npm run fetch-papers  # Refresh papers from arXiv
```

## Configuration

| Variable | Required | Default | Description |
|---|---:|---|---|
| `LLM_PROVIDER` | No | `openai` | `openai`, `anthropic`, `deepseek`, `openrouter`, or custom OpenAI-compatible |
| `LLM_API_KEY` | Yes for LLM tools | empty | Provider API key |
| `LLM_MODEL` | No | `gpt-4o` | Model name |
| `LLM_BASE_URL` | No | `https://api.openai.com/v1` | Provider base URL |
| `DEFAULT_TEMPERATURE` | No | `0.7` | Sampling temperature |
| `DEFAULT_MAX_TOKENS` | No | `4096` | Max output tokens |
| `PORT` | No | `3000` | Express server port |
| `CORS_ORIGIN` | No | unset | Comma-separated frontend origins allowed to call a separately deployed backend |

When frontend and backend are hosted on different domains, set `CORS_ORIGIN` to the exact frontend origin:

```env
CORS_ORIGIN=https://jiang-524.github.io
```

## Deployment

### Static GitHub Pages

GitHub Pages should deploy the `public/` directory. Static modules work there: Dashboard, Paper Collector, Paper Dashboard, Pipeline, Export Center, and Docs. LLM-backed modules show API-required states unless a separate backend is deployed.

### Full Backend Deployment

Deploy the Express server to a Node.js host such as Railway, Render, Fly.io, or a VPS. Configure environment variables on the host. If the backend is on a different domain, set `CORS_ORIGIN` and update `CFG.apiBase` in `public/app.js` to the backend URL.

## Security

- Never commit `.env`.
- API keys are read only by the backend from environment variables.
- The frontend does not collect API keys.
- Express serves static assets from `public/` only.
- `npm run smoke` checks private files are not served as source.
- Use `CORS_ORIGIN` for cross-domain backend deployments.

## Known Limitations

1. Paper Collector searches the local corpus only; real-time arXiv/Semantic Scholar UI import is planned.
2. DOCX/PDF export is not implemented.
3. LLM summaries, reviews, and citation checks require human verification.
4. GitHub Pages cannot run the Express backend.
5. The project has smoke tests but not a full unit/integration test suite.

## License and Attribution

This project is licensed under **CC BY-NC 4.0**.

Based on [Academic Research Skills](https://github.com/Imbad0202/academic-research-skills) by Cheng-I Wu, also licensed under CC BY-NC 4.0.

This project is a visual, interactive web implementation inspired by ARS workflow concepts. It is not the original ARS project.
