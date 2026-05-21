# TODO

## Difficult or blocked items

- arXiv API refresh timed out from the local machine during the first run. The site keeps seed data, and `scripts/fetch_papers.py` now preserves existing data if refresh fails. Re-test from GitHub Actions or a network with stable access to `export.arxiv.org`.
- Full parity with `academic-research-skills` requires turning the four upstream skill families into interactive workflows, not only visual summaries. The current scaffold verifies the first four "Features at a glance" as visible website modules.
- Summaries are currently seed or abstract-derived. LLM summarization, claim verification, and human approval should be added by the main implementation agent before treating entries as citation-ready.

