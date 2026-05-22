# Local Research Bridge

The Local Research Bridge enables Auto Research Web to access your private papers, local storage, and personal LLM API credentials — all while keeping sensitive data on your Windows machine.

## Architecture

```
Online Web Console (GitHub Pages)
        ↓
Local Research Bridge at http://127.0.0.1:8765
        ↓
Local SQLite Paper Database
        ↓
Local Paper Folder: E:/paper
        ↓
Local Outputs / Project Memory / Indexes
```

## Product Sentence

"Use the online console anywhere, and connect it to your own local research bridge when you want to work with private papers, local storage, and personal LLM credentials."

## Runtime Modes

### A. Static Demo Mode
- The GitHub Pages site works as a public demo and documentation site.
- No private papers are accessed.
- No real API keys are used.
- No local bridge is required.
- Users can browse features and understand workflows.

### B. Personal Hybrid Mode (Recommended)
- The online web console is opened in the browser.
- A Local Research Bridge runs on your Windows machine.
- The bridge reads your local paper library at E:/paper.
- The bridge stores results locally.
- The bridge stores paper metadata and summaries in a local SQLite database.
- The bridge reads LLM credentials from local .env.local or config.local.json.
- The frontend never directly exposes API keys.

### C. Cloud Mode (Future Optional)
- Frontend + backend/serverless functions can be deployed to Vercel/Cloudflare/etc.
- API keys are stored in cloud environment variables.
- Data can be stored in Supabase/PostgreSQL/S3/R2/etc.

## Setup

1. Clone the repo and install:
   ```bash
   git clone https://github.com/Jiang-524/auto-research-web.git
   cd auto-research-web
   npm install
   ```

2. Configure your .env.local:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your real values
   ```

3. Start the bridge:
   ```bash
   node server.js
   ```

4. Open the online console:
   https://jiang-524.github.io/auto-research-web/

5. Go to Settings → select Personal Hybrid Mode → Check Connection.

## Configuration Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTO_RESEARCH_BRIDGE_PORT` | Bridge server port | 8765 |
| `AUTO_RESEARCH_BRIDGE_HOST` | Bridge listen host | 127.0.0.1 |
| `AUTO_RESEARCH_ALLOWED_ORIGINS` | CORS origins (comma-separated) | localhost origins |
| `AUTO_RESEARCH_PROJECT_ROOT` | Project root path | E:/ccProject/researchWeb |
| `AUTO_RESEARCH_WORKSPACE_ROOT` | Workspace root path | same as project root |
| `AUTO_RESEARCH_PAPER_DIR` | Paper library folder | E:/paper |
| `AUTO_RESEARCH_DB_PATH` | SQLite database path | .../.auto-research/research.db |
| `AUTO_RESEARCH_OUTPUT_DIR` | Generated output directory | .../.auto-research/outputs |
| `AUTO_RESEARCH_INDEX_DIR` | Search index directory | .../.auto-research/index |
| `AUTO_RESEARCH_LOG_DIR` | Log directory | .../.auto-research/logs |
| `LLM_PROVIDER` | LLM provider (openai/anthropic/deepseek) | deepseek |
| `LLM_MODEL` | Model name | deepseek-chat |
| `LLM_BASE_URL` | API base URL | https://api.deepseek.com |
| `LLM_API_KEY` | API key (never exposed to frontend) | (required) |

## Security

- The online static site cannot directly read arbitrary local folders.
- The local bridge grants controlled access to configured folders only.
- The bridge binds to 127.0.0.1 by default; do not bind it to a public interface unless you understand the risk.
- API keys stay in .env.local.
- The bridge never returns API keys to frontend.
- Do not expose the bridge to the public internet.
- Do not commit .env.local or local database/output files.
- Path traversal is blocked.
- No arbitrary shell command execution from frontend.
- No file deletion in the first version.
- Backups are created before overwriting important files.

## Bridge Endpoints

### Health
```
GET /health
```
Returns bridge status, paths, LLM configuration (without API key).

### Paper Library
```
GET  /db/health          - Database status
GET  /papers              - List papers (paginated)
GET  /papers/:id          - Paper detail with notes
POST /papers/scan         - Scan configured paper folder
POST /papers/import       - Import paper into database
POST /papers/search       - Search papers
POST /papers/:id/summarize - Run LLM summary
POST /papers/:id/notes    - Add note to paper
POST /library/reindex     - Rebuild search index
GET  /tasks/:id           - Get task status
```

### Workspace / Project Manager
```
GET  /workspace/health        - Workspace overview
GET  /workspace/config        - Non-secret workspace config
GET  /workspace/tree          - File tree
POST /workspace/read-file     - Read allowed file
POST /workspace/write-file    - Write file (with backup)
POST /workspace/generate-file - Generate template file
GET  /workspace/memory        - Project memory
POST /workspace/memory/update - Update project memory
GET  /workspace/git/status    - Git status summary
GET  /workspace/read-office   - Read office.md
```
