# Project Manager / Workspace

The Project Manager makes auto-research-web feel like a personal AI research workspace.

## Workspace Root

E:/ccProject/researchWeb

## Capabilities

### Workspace Overview
- Active workspace name and root path
- Project type (research / paper / code / review / mixed)
- Git repository status
- Memory file status
- Bridge connection status

### Project File Tree
Browse allowed project files through the bridge:
- README.md, CLAUDE.md, office.md
- PROJECT_MEMORY.md, AGENT_CONTEXT.md
- docs/, .auto-research/
- and more

### Local File Output
Save generated content to local files through the bridge:
- Markdown notes
- Literature review drafts
- Paper outlines
- Review reports
- Response letters
- Prompt files
- Claude Code / Codex instruction files
- LaTeX snippets
- Experiment plans
- JSON task records
- Project memory files

The UI provides target path preview, overwrite warning, backup option, and success messages.

### Project Memory
The project memory is stored in:
- PROJECT_MEMORY.md
- AGENT_CONTEXT.md
- .auto-research/memory.json
- .auto-research/decisions.md
- .auto-research/task_log.md

### Claude Code Compatibility
If these files exist, they can be read and summarized:
- CLAUDE.md, office.md, README.md, TODO.md
- PROJECT_MEMORY.md, AGENT_CONTEXT.md
- docs/architecture.md, docs/usage.md

Templates can be generated for new projects.

## Security

- Only access configured workspace root
- Reject absolute paths from frontend unless validated
- Use relative paths under workspace root
- Prevent ../../ path traversal
- Do not expose .env or .env.local content
- Do not allow deleting files in first version
- Do not run arbitrary commands from frontend
- Backup before overwriting files
- Show preview before writing important files
