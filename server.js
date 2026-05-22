// Auto Research Web - Express backend server
// Serves static frontend from public/ and provides LLM API proxy routes.
// API keys are read from environment variables (.env file) - never exposed to frontend.

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

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

const corsOrigins = (process.env.CORS_ORIGIN || "")
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
  defaultMaxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS, 10) || 4096
};

function isLLMConfigured() {
  return !!LLM_CONFIG.apiKey;
}

// ---- Sanitized Error Handler ----
function apiError(res, status, message) {
  return res.status(status).json({ error: message });
}

// Catching malformed JSON
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body." });
  }
  next(err);
});

// ---- LLM Call Helper ----
async function callLLM(systemPrompt, userMessage, options = {}) {
  if (!isLLMConfigured()) {
    throw new Error("LLM not configured. Set LLM_API_KEY in .env file.");
  }

  const provider = LLM_CONFIG.provider.toLowerCase();
  const temperature = options.temperature ?? LLM_CONFIG.defaultTemperature;
  const maxTokens = options.maxTokens ?? LLM_CONFIG.defaultMaxTokens;

  // Anthropic uses a different API format
  if (provider === "anthropic") {
    return callAnthropicLLM(systemPrompt, userMessage, temperature, maxTokens);
  }

  // OpenAI-compatible (OpenAI, DeepSeek, OpenRouter, custom)
  return callOpenAICompatibleLLM(systemPrompt, userMessage, temperature, maxTokens);
}

async function callOpenAICompatibleLLM(systemPrompt, userMessage, temperature, maxTokens) {
  let url = LLM_CONFIG.baseURL;
  if (!url.endsWith("/")) url += "/";
  url += "chat/completions";

  const body = {
    model: LLM_CONFIG.model,
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
    throw new Error(`LLM API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  if (data.choices && data.choices[0]) {
    return data.choices[0].message.content;
  }
  throw new Error("Unexpected LLM response format");
}

async function callAnthropicLLM(systemPrompt, userMessage, temperature, maxTokens) {
  let url = LLM_CONFIG.baseURL;
  if (!url.endsWith("/")) url += "/";
  url += "messages";

  const body = {
    model: LLM_CONFIG.model,
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
    throw new Error(`Anthropic API error ${response.status}: ${errText.slice(0, 300)}`);
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
app.post("/api/summarize", async (req, res) => {
  try {
    const { text, title, authors, abstract } = req.body;
    if (!text && !abstract) {
      return apiError(res, 400, "Provide text or abstract to summarize.");
    }
    const content = text || abstract;
    const userMessage = [
      title ? `Title: ${title}` : "",
      authors ? `Authors: ${authors}` : "",
      `Content: ${content}`
    ].filter(Boolean).join("\n\n");
    const result = await callLLM(SUMMARIZER_PROMPT, userMessage);
    res.json({ result, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Summarize error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- API: Deep Research ----
app.post("/api/research", async (req, res) => {
  try {
    const { topic, mode } = req.body;
    if (!topic) return apiError(res, 400, "Research topic is required.");
    const modeConfig = DEEP_RESEARCH_MODES[mode] || DEEP_RESEARCH_MODES.full;
    const result = await callLLM(modeConfig.system, topic);
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Research error:", err.message);
    res.status(500).json({ error: err.message });
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
    const result = await callLLM(IDEA_GENERATOR_PROMPT, userMessage, { maxTokens: 8192 });
    res.json({ result, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Ideas error:", err.message);
    res.status(500).json({ error: err.message });
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
    const result = await callLLM(modeConfig.system, userMessage, { maxTokens: 16384 });
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Write error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- API: Paper Reviewer ----
app.post("/api/review", async (req, res) => {
  try {
    const { paper, mode } = req.body;
    if (!paper) return apiError(res, 400, "Paper content is required.");
    const modeConfig = REVIEWER_MODES[mode] || REVIEWER_MODES.full;
    const result = await callLLM(modeConfig.system, paper, { maxTokens: 8192 });
    res.json({ result, mode: modeConfig.label, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Review error:", err.message);
    res.status(500).json({ error: err.message });
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
    const result = await callLLM(systemPrompt, userMessage);
    res.json({ result, action, model: LLM_CONFIG.model });
  } catch (err) {
    console.error("Citation error:", err.message);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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

// ---- SPA fallthrough ----
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- General error handler (must be last) ----
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`Auto Research Web server running at http://localhost:${PORT}`);
  console.log(`LLM provider: ${LLM_CONFIG.provider} (${isLLMConfigured() ? "configured" : "NOT configured - set LLM_API_KEY in .env"})`);
  console.log(`Model: ${LLM_CONFIG.model}`);
  console.log(`Anthropic: ${LLM_CONFIG.provider === "anthropic" ? "native /v1/messages" : "OpenAI-compatible /v1/chat/completions"}`);
});
