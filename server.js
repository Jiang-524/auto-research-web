// Auto Research Web - Express backend server
// Serves static frontend from public/ and provides LLM API proxy routes.
// API keys are read from local environment files - never exposed to frontend.

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });
require("dotenv").config({ path: path.join(__dirname, ".env") });

function setEnvDefault(key, value) {
  if (process.env[key] === undefined && value !== undefined && value !== null && value !== "") {
    process.env[key] = String(value);
  }
}

function loadLocalJsonConfig() {
  const configPath = path.join(__dirname, "config.local.json");
  if (!fs.existsSync(configPath)) return;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    setEnvDefault("AUTO_RESEARCH_BRIDGE_PORT", config.bridge?.port);
    setEnvDefault("AUTO_RESEARCH_BRIDGE_HOST", config.bridge?.host);
    setEnvDefault("AUTO_RESEARCH_ALLOWED_ORIGINS", Array.isArray(config.bridge?.allowedOrigins) ? config.bridge.allowedOrigins.join(",") : config.bridge?.allowedOrigins);
    setEnvDefault("AUTO_RESEARCH_PROJECT_ROOT", config.workspace?.projectRoot);
    setEnvDefault("AUTO_RESEARCH_WORKSPACE_ROOT", config.workspace?.workspaceRoot);
    setEnvDefault("AUTO_RESEARCH_PAPER_DIR", config.paths?.paperDir);
    setEnvDefault("AUTO_RESEARCH_DB_PATH", config.paths?.dbPath);
    setEnvDefault("AUTO_RESEARCH_OUTPUT_DIR", config.paths?.outputDir);
    setEnvDefault("AUTO_RESEARCH_INDEX_DIR", config.paths?.indexDir);
    setEnvDefault("AUTO_RESEARCH_LOG_DIR", config.paths?.logDir);
    setEnvDefault("LLM_PROVIDER", config.llm?.provider);
    setEnvDefault("LLM_MODEL", config.llm?.model);
    setEnvDefault("LLM_BASE_URL", config.llm?.baseURL);
    setEnvDefault("LLM_API_KEY", config.llm?.apiKey);
    setEnvDefault("DEFAULT_TEMPERATURE", config.llm?.temperature);
    setEnvDefault("DEFAULT_MAX_TOKENS", config.llm?.maxTokens);
  } catch (err) {
    console.warn("Ignoring invalid config.local.json:", err.message);
  }
}

loadLocalJsonConfig();

const {
  DEEP_RESEARCH_MODES,
  PAPER_WRITER_MODES,
  REVIEWER_MODES,
  IDEA_GENERATOR_PROMPT,
  SUMMARIZER_PROMPT,
  CITATION_TOOLS_PROMPTS
} = require("./prompts");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ---- Middleware ----
app.use(express.json({ limit: "2mb" }));

const corsOrigins = (process.env.AUTO_RESEARCH_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (corsOrigins.length) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    }
  }));
}

// Only serve allowlisted frontend files from public/
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    // Prevent caching of data files during development
    if (filePath.endsWith(".json")) {
      res.setHeader("Cache-Control", "public, max-age=300");
    }
  }
}));

// ---- LLM Provider Configuration ----
const LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || "openai",
  apiKey: process.env.LLM_API_KEY || "",
  model: process.env.LLM_MODEL || "gpt-4o",
  baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
  defaultTemperature: parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7,
  defaultMaxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS, 10) || 4096,

  // Flash model — fast/cheap for simple tasks (search, rough read, translate, format convert)
  flashModel: process.env.LLM_FLASH_MODEL || process.env.LLM_MODEL || "deepseek-chat",
  flashTemperature: parseFloat(process.env.LLM_FLASH_TEMPERATURE) || 0.1,
  flashMaxTokens: parseInt(process.env.LLM_FLASH_MAX_TOKENS, 10) || 2048,
};

function isLLMConfigured() {
  return !!LLM_CONFIG.apiKey;
}

// ---- Dual-Model LLM Call Helpers ----
// Pro model: deep thinking tasks (research, writing, review, deep summarize, ideas)
async function callLLMPro(systemPrompt, userMessage, options = {}) {
  return callLLMWithModel(LLM_CONFIG.model, systemPrompt, userMessage, {
    temperature: options.temperature ?? LLM_CONFIG.defaultTemperature,
    maxTokens: options.maxTokens ?? LLM_CONFIG.defaultMaxTokens
  });
}

// Flash model: fast/cheap tasks (search, rough read, translate, format convert)
async function callLLMFlash(systemPrompt, userMessage, options = {}) {
  return callLLMWithModel(LLM_CONFIG.flashModel, systemPrompt, userMessage, {
    temperature: options.temperature ?? LLM_CONFIG.flashTemperature,
    maxTokens: options.maxTokens ?? LLM_CONFIG.flashMaxTokens
  });
}

// Default: use pro model (backward compatible)
async function callLLM(systemPrompt, userMessage, options = {}) {
  return callLLMPro(systemPrompt, userMessage, options);
}

async function callLLMWithModel(modelName, systemPrompt, userMessage, options = {}) {
  if (!isLLMConfigured()) {
    throw new Error("LLM not configured. Set LLM_API_KEY in .env file.");
  }

  const provider = LLM_CONFIG.provider.toLowerCase();
  const temperature = options.temperature ?? LLM_CONFIG.defaultTemperature;
  const maxTokens = options.maxTokens ?? LLM_CONFIG.defaultMaxTokens;

  if (provider === "anthropic") {
    return callAnthropicLLMWithModel(modelName, systemPrompt, userMessage, temperature, maxTokens);
  }
  return callOpenAICompatibleLLMWithModel(modelName, systemPrompt, userMessage, temperature, maxTokens);
}

// ---- Sanitized Error Handler ----
function apiError(res, status, message) {
  return res.status(status).json({ error: message });
}

class LLMApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sanitizeProviderError(message) {
  return String(message || "")
    .replace(/api key:\s*\*+[A-Za-z0-9_-]+/gi, "api key: <redacted>")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer <redacted>");
}

function clientErrorMessage(err) {
  const message = sanitizeProviderError(err?.message || err);
  if (err?.statusCode === 401 || /LLM API error 401|Authentication Fails/i.test(message)) {
    return "LLM API authentication failed. Check LLM_API_KEY in .env.local and restart the local bridge.";
  }
  return message || "Unexpected server error";
}

function sendCaughtError(res, err, fallbackStatus = 500) {
  const status = Number.isInteger(err?.statusCode) ? err.statusCode : fallbackStatus;
  return res.status(status).json({ error: clientErrorMessage(err) });
}

// Catching malformed JSON
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body." });
  }
  next(err);
});

async function callOpenAICompatibleLLMWithModel(modelName, systemPrompt, userMessage, temperature, maxTokens) {
  let url = LLM_CONFIG.baseURL;
  if (!url.endsWith("/")) url += "/";
  url += "chat/completions";

  const body = {
    model: modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature,
    max_tokens: maxTokens
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LLM_CONFIG.apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new LLMApiError(response.status, `LLM API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  if (data.choices && data.choices[0]) {
    return data.choices[0].message.content;
  }
  throw new Error("Unexpected LLM response format");
}

async function callAnthropicLLMWithModel(modelName, systemPrompt, userMessage, temperature, maxTokens) {
  let url = LLM_CONFIG.baseURL;
  if (!url.endsWith("/")) url += "/";
  url += "messages";

  const body = {
    model: modelName,
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage }
    ],
    max_tokens: maxTokens,
    temperature
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LLM_CONFIG.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new LLMApiError(response.status, `Anthropic API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  if (data.content && data.content[0]) {
    return data.content[0].text;
  }
  throw new Error("Unexpected Anthropic response format");
}

// ---- API: Status ----
app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    llmConfigured: isLLMConfigured(),
    provider: LLM_CONFIG.provider,
    model: LLM_CONFIG.model,
    proModel: LLM_CONFIG.model,
    flashModel: LLM_CONFIG.flashModel,
    anthropicSupported: true,
    features: {
      deepResearch: { implemented: true, requiresLLM: true },
      paperWriter: { implemented: true, requiresLLM: true },
      paperReviewer: { implemented: true, requiresLLM: true },
      ideaGenerator: { implemented: true, requiresLLM: true },
      summarizer: { implemented: true, requiresLLM: true },
      citationTools: { implemented: true, requiresLLM: true },
      paperCollector: { implemented: true, requiresLLM: false },
      pipelineOrchestrator: { implemented: true, requiresLLM: false },
      exportCenter: { implemented: true, requiresLLM: false }
    }
  });
});

// ---- API: Paper Summarizer ----
// Flash for simple/fast summary, Pro for detailed/deep summary
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, title, authors, abstract, depth } = req.body;
    if (!text && !abstract) {
      return apiError(res, 400, "Provide text or abstract to summarize.");
    }
    const content = text || abstract;
    const userMessage = [
      title ? `Title: ${title}` : "",
      authors ? `Authors: ${authors}` : "",
      `Content: ${content}`
    ].filter(Boolean).join("\n\n");
    const useFlash = depth === "quick" || depth === "rough" || !depth;
    const callFn = useFlash ? callLLMFlash : callLLMPro;
    const modelUsed = useFlash ? LLM_CONFIG.flashModel : LLM_CONFIG.model;
    const result = await callFn(SUMMARIZER_PROMPT, userMessage);
    res.json({ result, model: modelUsed, tier: useFlash ? "flash" : "pro" });
  } catch (err) {
    console.error("Summarize error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Deep Research ----
app.post("/api/research", async (req, res) => {
  try {
    const { topic, mode } = req.body;
    if (!topic) return apiError(res, 400, "Research topic is required.");
    const modeConfig = DEEP_RESEARCH_MODES[mode] || DEEP_RESEARCH_MODES.full;
    const result = await callLLMPro(modeConfig.system, topic);
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model, tier: "pro" });
  } catch (err) {
    console.error("Research error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Idea Generator ----
app.post("/api/ideas", async (req, res) => {
  try {
    const { topic, context, constraints } = req.body;
    if (!topic) return apiError(res, 400, "Topic is required.");
    const userMessage = [
      `Research Topic: ${topic}`,
      context ? `Additional Context: ${context}` : "",
      constraints ? `Constraints: ${constraints}` : ""
    ].filter(Boolean).join("\n\n");
    const result = await callLLMPro(IDEA_GENERATOR_PROMPT, userMessage, { maxTokens: 8192 });
    res.json({ result, model: LLM_CONFIG.model, tier: "pro" });
  } catch (err) {
    console.error("Ideas error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Paper Writer ----
app.post("/api/write", async (req, res) => {
  try {
    const { content, mode, instructions, feedback, targetFormat } = req.body;
    if (!content) return apiError(res, 400, "Content/outline/research notes are required.");
    const modeConfig = PAPER_WRITER_MODES[mode] || PAPER_WRITER_MODES.full;
    let userMessage = content;
    if (instructions) userMessage += `\n\nSpecial Instructions: ${instructions}`;
    if (feedback) userMessage += `\n\nFeedback to address: ${feedback}`;
    if (targetFormat) userMessage += `\n\nTarget output format: ${targetFormat}`;
    const result = await callLLMPro(modeConfig.system, userMessage, { maxTokens: 16384 });
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model, tier: "pro" });
  } catch (err) {
    console.error("Write error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Paper Reviewer ----
app.post("/api/review", async (req, res) => {
  try {
    const { paper, mode } = req.body;
    if (!paper) return apiError(res, 400, "Paper content is required.");
    const modeConfig = REVIEWER_MODES[mode] || REVIEWER_MODES.full;
    const result = await callLLMPro(modeConfig.system, paper, { maxTokens: 8192 });
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model, tier: "pro" });
  } catch (err) {
    console.error("Review error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Citation Tools ----
app.post("/api/citation", async (req, res) => {
  try {
    const { action, text, sourceFormat, targetFormat } = req.body;
    if (!text) return apiError(res, 400, "Text or citation data is required.");
    const promptMap = CITATION_TOOLS_PROMPTS;
    let systemPrompt = promptMap[action] || promptMap["format-convert"];
    let userMessage = text;
    if (action === "format-convert" && sourceFormat && targetFormat) {
      userMessage = `Convert the following from ${sourceFormat} to ${targetFormat}:\n\n${text}`;
    }
    // Flash for simple format/bibtex tasks, Pro for claim/hallucination checks
    const useFlash = action === "format-convert" || action === "bibtex-helper";
    const callFn = useFlash ? callLLMFlash : callLLMPro;
    const modelUsed = useFlash ? LLM_CONFIG.flashModel : LLM_CONFIG.model;
    const result = await callFn(systemPrompt, userMessage);
    res.json({ result, action, model: modelUsed, tier: useFlash ? "flash" : "pro" });
  } catch (err) {
    console.error("Citation error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Export ----
app.post("/api/export", (req, res) => {
  try {
    const { content, format, filename } = req.body;
    if (!content) return apiError(res, 400, "Content is required.");
    const fmt = (format || "markdown").toLowerCase();
    let mimeType, fileExt, body;
    switch (fmt) {
      case "json":
        mimeType = "application/json"; fileExt = ".json";
        body = typeof content === "string" ? content : JSON.stringify(content, null, 2);
        break;
      case "latex":
        mimeType = "application/x-latex"; fileExt = ".tex";
        body = typeof content === "string" ? content : String(content);
        break;
      case "bibtex":
        mimeType = "application/x-bibtex"; fileExt = ".bib";
        body = typeof content === "string" ? content : String(content);
        break;
      case "text": case "plain":
        mimeType = "text/plain"; fileExt = ".txt";
        body = typeof content === "string" ? content : String(content);
        break;
      case "markdown": default:
        mimeType = "text/markdown"; fileExt = ".md";
        body = typeof content === "string" ? content : String(content);
        break;
    }
    const safeFilename = (filename || "export").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}${fileExt}"`);
    res.send(body);
  } catch (err) {
    console.error("Export error:", err.message);
    sendCaughtError(res, err);
  }
});

// ---- API: Modes listing ----
app.get("/api/modes/:module", (req, res) => {
  const { module } = req.params;
  let modes;
  switch (module) {
    case "research": modes = Object.entries(DEEP_RESEARCH_MODES).map(([k, v]) => ({ id: k, label: v.label, desc: v.desc })); break;
    case "writer": modes = Object.entries(PAPER_WRITER_MODES).map(([k, v]) => ({ id: k, label: v.label, desc: v.desc })); break;
    case "reviewer": modes = Object.entries(REVIEWER_MODES).map(([k, v]) => ({ id: k, label: v.label, desc: v.desc })); break;
    default: return apiError(res, 404, "Unknown module");
  }
  res.json({ module, modes });
});

// ================================================================
// Local Research Bridge Endpoints
// ================================================================

const BRIDGE_ENABLED = true;
const BRIDGE_VERSION = "0.3.0";

// ---- Bridge: Health ----
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mode: "local-bridge",
    version: BRIDGE_VERSION,
    projectRoot: process.env.AUTO_RESEARCH_PROJECT_ROOT || process.env.AUTO_RESEARCH_WORKSPACE_ROOT || __dirname,
    paperLibraryPath: process.env.AUTO_RESEARCH_PAPER_DIR || "E:/paper",
    dbPath: process.env.AUTO_RESEARCH_DB_PATH || "",
    outputPath: process.env.AUTO_RESEARCH_OUTPUT_DIR || "",
    indexPath: process.env.AUTO_RESEARCH_INDEX_DIR || "",
    llmConfigured: isLLMConfigured(),
    llmProvider: LLM_CONFIG.provider,
    llmModel: LLM_CONFIG.model
  });
});

// ---- Bridge: Paper Library ----
try {
  const paperDb = require("./bridge/paper-db");
  paperDb.initDb();

  app.get("/db/health", (_req, res) => res.json(paperDb.dbHealth()));

  app.get("/papers", (req, res) => {
    const { limit, offset, status, year } = req.query;
    res.json(paperDb.listPapers({ limit: parseInt(limit) || 50, offset: parseInt(offset) || 0, status, year }));
  });

  app.get("/papers/:id", (req, res) => {
    const paper = paperDb.getPaper(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    const notes = paperDb.getNotes(req.params.id);
    res.json({ ...paper, notes });
  });

  app.post("/papers/scan", (_req, res) => {
    const result = paperDb.scanPaperFolder();
    res.json(result);
  });

  app.post("/papers/import", (req, res) => {
    const { paper } = req.body;
    if (!paper || !paper.title) return res.status(400).json({ error: "Paper title is required" });
    const result = paperDb.importPaper(paper);
    res.json(result);
  });

  app.post("/papers/search", (req, res) => {
    const results = paperDb.searchPapers(req.body || {});
    res.json(results);
  });

  app.post("/papers/:id/summarize", async (req, res) => {
    try {
      if (!isLLMConfigured()) return res.status(503).json({ error: "LLM not configured. Set LLM_API_KEY in .env.local." });
      const paper = paperDb.getPaper(req.params.id);
      if (!paper) return res.status(404).json({ error: "Paper not found" });
      const content = paper.abstract || paper.title;
      const result = await callLLM(SUMMARIZER_PROMPT, `Title: ${paper.title}\nAuthors: ${paper.authors}\nContent: ${content}`);
      const id = `summary_${Date.now()}`;
      const db = paperDb.getDb();
      db.prepare("INSERT INTO paper_summaries (id, paper_id, summary_type, content, model) VALUES (?,?,?,?,?)").run(id, paper.id, "general", result, LLM_CONFIG.model);
      res.json({ id, paperId: paper.id, summary: result, model: LLM_CONFIG.model });
    } catch (err) {
      console.error("Summarize paper error:", err.message);
      sendCaughtError(res, err);
    }
  });

  app.post("/papers/:id/notes", (req, res) => {
    const { note_type, content } = req.body;
    if (!content) return res.status(400).json({ error: "Note content is required" });
    const result = paperDb.addNote(req.params.id, note_type || "general", content);
    res.json(result);
  });

  app.post("/library/reindex", (_req, res) => {
    const result = paperDb.scanPaperFolder();
    res.json({ reindexed: true, ...result });
  });

  app.get("/tasks/:id", (req, res) => {
    const db = paperDb.getDb();
    const task = db.prepare("SELECT * FROM research_tasks WHERE id = ?").get(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });
} catch (err) {
  console.warn("Paper Library bridge not available:", err.message);
}

// ---- Bridge: Workspace / Project Manager ----
try {
  const workspace = require("./bridge/workspace");

  app.get("/workspace/health", (_req, res) => res.json(workspace.workspaceHealth()));

  app.get("/workspace/config", (_req, res) => res.json(workspace.workspaceConfig()));

  app.get("/workspace/tree", (_req, res) => {
    const tree = workspace.fileTree();
    res.json(tree);
  });

  app.post("/workspace/read-file", (req, res) => {
    const { path: filePath } = req.body || {};
    if (!filePath) return res.status(400).json({ error: "path is required" });
    const result = workspace.readFile(filePath);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  });

  app.post("/workspace/write-file", (req, res) => {
    const { path: filePath, content, overwrite, backup } = req.body || {};
    if (!filePath || content === undefined) return res.status(400).json({ error: "path and content are required" });
    const result = workspace.writeFile(filePath, content, { overwrite, backup });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  });

  app.post("/workspace/generate-file", (req, res) => {
    const { type, targetPath } = req.body || {};
    if (!type || !targetPath) return res.status(400).json({ error: "type and targetPath are required" });
    const content = `# ${type.replace(/_/g, " ")}\n\nGenerated at: ${new Date().toISOString()}\n\n`;
    const result = workspace.writeFile(targetPath, content, { overwrite: false, backup: true });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  });

  app.get("/workspace/memory", (_req, res) => {
    res.json(workspace.getProjectMemory());
  });

  app.post("/workspace/memory/update", (req, res) => {
    const { content } = req.body || {};
    if (!content) return res.status(400).json({ error: "content is required" });
    const result = workspace.writeFile("PROJECT_MEMORY.md", content, { overwrite: true, backup: true });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  });

  app.get("/workspace/git/status", (_req, res) => {
    res.json(workspace.getGitStatus());
  });

  app.get("/workspace/read-office", (_req, res) => {
    const result = workspace.readOffice();
    if (result.error) return res.status(404).json(result);
    res.json(result);
  });
} catch (err) {
  console.warn("Workspace bridge not available:", err.message);
}

// ---- SPA fallthrough ----
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- General error handler (must be last) ----
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---- Start ----
const bridgePort = parseInt(process.env.AUTO_RESEARCH_BRIDGE_PORT, 10) || parseInt(process.env.PORT, 10) || 8765;
const bridgeHost = process.env.AUTO_RESEARCH_BRIDGE_HOST || process.env.HOST || "127.0.0.1";
app.listen(bridgePort, bridgeHost, () => {
  console.log(`=== Auto Research Web - Local Research Bridge v${BRIDGE_VERSION} ===`);
  console.log(`Bridge running at http://${bridgeHost}:${bridgePort}`);
  console.log(`Health: http://${bridgeHost}:${bridgePort}/health`);
  console.log(`LLM provider: ${LLM_CONFIG.provider} (${isLLMConfigured() ? "configured" : "NOT configured"})`);
  console.log(`Pro model: ${LLM_CONFIG.model} (research, writing, review, ideas, deep summarize)`);
  console.log(`Flash model: ${LLM_CONFIG.flashModel} (search, rough read, translate, format convert)`);
  console.log(`Project root: ${process.env.AUTO_RESEARCH_PROJECT_ROOT || __dirname}`);
  console.log(`Paper dir: ${process.env.AUTO_RESEARCH_PAPER_DIR || "not set"}`);
});
