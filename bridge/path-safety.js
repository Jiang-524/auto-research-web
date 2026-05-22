// Path safety utilities for Local Research Bridge
// Prevents path traversal and restricts access to configured roots.

const path = require("path");

const DEFAULT_PROJECT_ROOT = path.resolve(
  process.env.AUTO_RESEARCH_PROJECT_ROOT ||
  process.env.AUTO_RESEARCH_WORKSPACE_ROOT ||
  path.join(__dirname, "..")
);
const DEFAULT_WORKSPACE_ROOT = path.resolve(
  process.env.AUTO_RESEARCH_WORKSPACE_ROOT || DEFAULT_PROJECT_ROOT
);

const ALLOWED_ROOTS = [
  DEFAULT_WORKSPACE_ROOT,
  process.env.AUTO_RESEARCH_PAPER_DIR || "",
  path.join(DEFAULT_PROJECT_ROOT, ".auto-research"),
  path.join(DEFAULT_PROJECT_ROOT, ".auto-research", "outputs"),
  path.join(DEFAULT_PROJECT_ROOT, ".auto-research", "index"),
  path.join(DEFAULT_PROJECT_ROOT, ".auto-research", "logs"),
].filter(Boolean).map((r) => path.resolve(r).toLowerCase());

function isPathSafe(inputPath, baseRoot) {
  const resolved = path.resolve(baseRoot || DEFAULT_WORKSPACE_ROOT, inputPath || "");
  const normalized = resolved.toLowerCase();

  // Check against allowed roots
  for (const root of ALLOWED_ROOTS) {
    if (!root) continue;
    if (normalized.startsWith(root + path.sep.toLowerCase()) || normalized === root) {
      return true;
    }
  }
  return false;
}

function safeResolve(relativePath, baseRoot) {
  if (!relativePath || typeof relativePath !== "string") return null;
  if (relativePath.includes("\0") || /(^|[\\/])\.\.([\\/]|$)/.test(relativePath)) {
    return null;
  }
  const root = path.resolve(baseRoot || DEFAULT_WORKSPACE_ROOT);
  if (path.isAbsolute(relativePath)) {
    const absolute = path.resolve(relativePath);
    return isPathSafe(absolute, root) ? absolute : null;
  }
  const resolved = path.resolve(root, relativePath);
  if (!isPathSafe(resolved, root)) return null;
  return resolved;
}

module.exports = { isPathSafe, safeResolve, ALLOWED_ROOTS, DEFAULT_PROJECT_ROOT, DEFAULT_WORKSPACE_ROOT };
