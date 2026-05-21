# Auto Research Web

Auto Research Web is a static research dashboard for tracking, triaging, and reviewing robotics and machine-learning papers. It turns the workflow ideas from [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) into a browsable website: paper discovery, evidence status, topic collections, review queues, and pipeline visibility.

The first version is intentionally dependency-light so it can run on GitHub Pages without a build step.

## What is included

- Searchable and filterable paper list for robot manipulation, RL, IL, VLA, and related areas.
- Visual pipeline map based on the upstream Academic Research Skills stages.
- Skill explorer for Deep Research, Academic Paper, Academic Paper Reviewer, and Academic Pipeline.
- Local curation state with bookmarks, "needs verification", and exportable JSON.
- Python arXiv fetcher that refreshes `data/papers.json` using public APIs.
- GitHub Actions workflow for scheduled paper refreshes.

## Local use

Open `index.html` directly, or serve the directory:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

Refresh paper data:

```powershell
python scripts/fetch_papers.py --max-results 12 --output data/papers.json
```

## GitHub Pages

The repository is designed to publish from the `main` branch root. After Pages is enabled for the repo, the site URL is:

https://jiang-524.github.io/auto-research-web/

## Attribution and license note

This project is inspired by and adapts workflow concepts from `Imbad0202/academic-research-skills`, copyright Cheng-I Wu, licensed under CC BY-NC 4.0. This repository keeps that attribution visible and should be used for non-commercial research support unless licensing is clarified separately.

