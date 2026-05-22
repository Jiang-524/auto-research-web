// Workspace / Project Manager module
// Manages project file browsing, reading, writing, and project memory.

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { safeResolve, DEFAULT_WORKSPACE_ROOT } = require("./path-safety");

const WORKSPACE_ROOT = DEFAULT_WORKSPACE_ROOT;

function workspaceHealth() {
  const memoryFiles = [
    "PROJECT_MEMORY.md", "AGENT_CONTEXT.md", "CLAUDE.md",
    "office.md", "README.md", "todo.md"
  ];
  const existing = memoryFiles.filter((f) =>
    fs.existsSync(path.join(WORKSPACE_ROOT, f))
  );
  return {
    ok: true,
    workspaceRoot: WORKSPACE_ROOT,
    projectType: "research",
    memoryFiles: existing,
    gitAvailable: fs.existsSync(path.join(WORKSPACE_ROOT, ".git"))
  };
}

function workspaceConfig() {
  return {
    workspaceRoot: WORKSPACE_ROOT,
    paperDir: process.env.AUTO_RESEARCH_PAPER_DIR || "E:/paper",
    dbPath: process.env.AUTO_RESEARCH_DB_PATH || "",
    outputDir: process.env.AUTO_RESEARCH_OUTPUT_DIR || "",
    indexPath: process.env.AUTO_RESEARCH_INDEX_DIR || "",
    logDir: process.env.AUTO_RESEARCH_LOG_DIR || "",
    llmProvider: process.env.LLM_PROVIDER || "not configured",
    llmModel: process.env.LLM_MODEL || "not configured"
  };
}

function fileTree(dirPath = "") {
  const base = safeResolve(dirPath, WORKSPACE_ROOT);
  if (!base || !fs.existsSync(base)) return [];

  const allowedDirs = [
    "", "docs", ".auto-research", "bridge", "public", "prompts", "data", "scripts"
  ];
  const allowedFiles = [
    "README.md", "CLAUDE.md", "PROJECT_MEMORY.md", "AGENT_CONTEXT.md",
    "office.md", "todo.md", "LOCAL_BRIDGE.md", "PAPER_LIBRARY.md",
    "PROJECT_MANAGER.md", "NOTICE.md", "ARS_SKILL_MAP.md",
    ".auto-research/memory.json", ".auto-research/decisions.md",
    ".auto-research/task_log.md"
  ];

  function walk(currentPath, depth = 0) {
    if (depth > 3) return [];
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".auto-research") continue;
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = path.join(currentPath, entry.name);
      const relative = path.relative(WORKSPACE_ROOT, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (depth < 2 || allowedDirs.some((d) => relative.startsWith(d))) {
          results.push({ name: entry.name, type: "directory", path: relative, children: walk(full, depth + 1) });
        }
      } else if (entry.isFile()) {
        if (depth === 0 || allowedFiles.some((f) => relative.includes(f)) || /\.(md|json|yml|yaml|js|css|html)$/i.test(entry.name)) {
          const stat = fs.statSync(full);
          results.push({ name: entry.name, type: "file", path: relative, size: stat.size });
        }
      }
    }
    return results.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }
  return walk(base);
}

function readFile(relativePath) {
  const resolved = safeResolve(relativePath, WORKSPACE_ROOT);
  if (!resolved) return { error: "Path not allowed or does not exist." };
  if (!fs.existsSync(resolved)) return { error: "File not found." };
  const lowered = resolved.toLowerCase();
  if (lowered.includes(".env") && !lowered.endsWith(".example")) {
    return { error: "Cannot read environment files." };
  }
  const content = fs.readFileSync(resolved, "utf-8");
  return { path: relativePath, content, size: content.length };
}

function writeFile(relativePath, content, options = {}) {
  const { overwrite = false, backup = true } = options;
  const resolved = safeResolve(relativePath, WORKSPACE_ROOT);
  if (!resolved) return { error: "Path not allowed." };
  const lowered = resolved.toLowerCase();
  if (lowered.includes(".env") && !lowered.endsWith(".example")) {
    return { error: "Cannot write environment files." };
  }
  if (fs.existsSync(resolved) && !overwrite) {
    return { error: "File exists. Set overwrite: true to replace.", exists: true };
  }
  // Backup before overwrite
  if (fs.existsSync(resolved) && backup) {
    const bak = resolved + ".bak";
    fs.copyFileSync(resolved, bak);
  }
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(resolved, content, "utf-8");
  return { path: relativePath, written: true, size: content.length };
}

function getProjectMemory() {
  const memoryPath = path.join(WORKSPACE_ROOT, "PROJECT_MEMORY.md");
  const contextPath = path.join(WORKSPACE_ROOT, "AGENT_CONTEXT.md");
  const decisionsPath = path.join(WORKSPACE_ROOT, ".auto-research", "decisions.md");
  const taskLogPath = path.join(WORKSPACE_ROOT, ".auto-research", "task_log.md");

  return {
    projectMemory: fs.existsSync(memoryPath) ? fs.readFileSync(memoryPath, "utf-8").slice(0, 5000) : null,
    agentContext: fs.existsSync(contextPath) ? fs.readFileSync(contextPath, "utf-8").slice(0, 3000) : null,
    decisions: fs.existsSync(decisionsPath) ? fs.readFileSync(decisionsPath, "utf-8").slice(0, 3000) : null,
    taskLog: fs.existsSync(taskLogPath) ? fs.readFileSync(taskLogPath, "utf-8").slice(0, 3000) : null,
    lastUpdated: new Date().toISOString()
  };
}

function readOffice() {
  const officePath = path.join(WORKSPACE_ROOT, "office.md");
  if (!fs.existsSync(officePath)) return { error: "office.md not found." };
  const content = fs.readFileSync(officePath, "utf-8");
  return { path: "office.md", content, size: content.length };
}

function getGitStatus() {
  try {
    const result = execSync("git status --short", {
      cwd: WORKSPACE_ROOT,
      timeout: 5000,
      encoding: "utf-8"
    });
    const branch = execSync("git branch --show-current", {
      cwd: WORKSPACE_ROOT,
      timeout: 5000,
      encoding: "utf-8"
    }).trim();
    const changes = result.trim().split("\n").filter(Boolean);
    return {
      branch,
      changedFiles: changes.length,
      dirty: changes.length > 0,
      summary: changes.slice(0, 20)
    };
  } catch {
    return { error: "Git not available or not a git repository." };
  }
}

module.exports = {
  workspaceHealth, workspaceConfig,
  fileTree, readFile, writeFile,
  getProjectMemory, readOffice, getGitStatus
};
