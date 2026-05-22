// ============================================================
// Auto Research Web - Frontend SPA
// ============================================================

// ---- Configuration ----
const CFG = {
  apiBase: "/api",
  storageKeys: {
    curation: "autoResearchCuration",
    settings: "autoResearchSettings",
    tasks: "autoResearchTasks",
    collections: "autoResearchCollections"
  }
};

// ---- Feature Status Model ----
const STATUS = {
  IMPLEMENTED: "implemented",
  API_REQUIRED: "api-required",
  PLANNED: "planned"
};

function featureStatus(requiresLLM) {
  return requiresLLM ? STATUS.API_REQUIRED : STATUS.IMPLEMENTED;
}

// ---- State ----
const S = {
  page: "dashboard",
  papers: [],
  workflows: null,
  // Paper dashboard state
  query: "", topic: "all", year: "all", status: "all", view: "cards",
  curation: loadJSON(CFG.storageKeys.curation, { bookmarks: [], verify: [] }),
  settings: loadJSON(CFG.storageKeys.settings, {}),
  tasks: loadJSON(CFG.storageKeys.tasks, []),
  collections: loadJSON(CFG.storageKeys.collections, []),
  llmStatus: null
};

// ---- API Client ----
const API = {
  async status() {
    const r = await fetch(`${CFG.apiBase}/status`);
    return r.json();
  },
  async summarize(body) {
    const r = await fetch(`${CFG.apiBase}/summarize`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Summarization failed"); }
    return r.json();
  },
  async research(body) {
    const r = await fetch(`${CFG.apiBase}/research`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Research failed"); }
    return r.json();
  },
  async ideas(body) {
    const r = await fetch(`${CFG.apiBase}/ideas`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Idea generation failed"); }
    return r.json();
  },
  async write(body) {
    const r = await fetch(`${CFG.apiBase}/write`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Writing failed"); }
    return r.json();
  },
  async review(body) {
    const r = await fetch(`${CFG.apiBase}/review`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Review failed"); }
    return r.json();
  },
  async citation(body) {
    const r = await fetch(`${CFG.apiBase}/citation`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Citation tool failed"); }
    return r.json();
  },
  async exportFile(body) {
    const r = await fetch(`${CFG.apiBase}/export`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("Export failed");
    const blob = await r.blob();
    const disposition = r.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : "export.md";
    downloadBlob(blob, filename);
    return { success: true, filename };
  }
};

// ---- Utility Functions ----
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function escapeHtml(v) { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function loadJSON(key, def) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; } catch { return def; } }
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function downloadBlob(blob, filename) { const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = filename; a.click(); URL.revokeObjectURL(u); }
function copyText(text) { navigator.clipboard.writeText(text).then(() => showToast("Copied!")); }
function formatDate(d) { return d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""; }

let toastTimer;
function showToast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

// ---- Reusable UI Components ----
function statusBadge(statusType) {
  const labels = { [STATUS.IMPLEMENTED]: "Implemented", [STATUS.API_REQUIRED]: "API Required", [STATUS.PLANNED]: "Planned" };
  const cls = { [STATUS.IMPLEMENTED]: "badge-green", [STATUS.API_REQUIRED]: "badge-amber", [STATUS.PLANNED]: "badge-muted" };
  return `<span class="status-badge ${cls[statusType] || "badge-muted"}">${labels[statusType] || statusType}</span>`;
}

function loadingSpinner(msg) {
  return `<div class="loading-state"><div class="spinner"></div><p>${escapeHtml(msg || "Loading...")}</p></div>`;
}

function errorBox(errMsg, retryFn) {
  const retryBtn = retryFn ? `<button class="btn btn-sm btn-outline" onclick="(${retryFn.toString()})()">Retry</button>` : "";
  return `<div class="error-state"><p>${escapeHtml(errMsg)}</p>${retryBtn}</div>`;
}

function emptyBox(msg, actionHTML) {
  return `<div class="empty-state"><p>${escapeHtml(msg || "No data yet.")}</p>${actionHTML || ""}</div>`;
}

function resultPanel(content, opts = {}) {
  const title = opts.title ? `<div class="result-header"><strong>${escapeHtml(opts.title)}</strong><div class="result-actions">${copyBtn("result-content-" + (opts._id || "0"))}${opts.exportActions || ""}</div></div>` : "";
  return `<div class="result-panel">${title}<div class="result-content" id="result-content-${opts._id || "0"}">${escapeHtml(content)}</div></div>`;
}

function copyBtn(targetId) {
  return `<button class="btn btn-xs btn-outline" onclick="copyText(document.getElementById('${targetId}').textContent)" title="Copy to clipboard">Copy</button>`;
}

function exportMenu(contentGetter) {
  return `
    <div class="dropdown" style="display:inline-block">
      <button class="btn btn-xs btn-outline dropdown-toggle" onclick="this.nextElementSibling.classList.toggle('open')">Export</button>
      <div class="dropdown-menu">
        <button class="dropdown-item" onclick="this.closest('.dropdown-menu').classList.remove('open');API.exportFile({content:(${contentGetter.toString()})(),format:'markdown',filename:'export'})">Markdown</button>
        <button class="dropdown-item" onclick="this.closest('.dropdown-menu').classList.remove('open');API.exportFile({content:(${contentGetter.toString()})(),format:'json',filename:'export'})">JSON</button>
        <button class="dropdown-item" onclick="this.closest('.dropdown-menu').classList.remove('open');API.exportFile({content:(${contentGetter.toString()})(),format:'text',filename:'export'})">Plain Text</button>
        <button class="dropdown-item" onclick="this.closest('.dropdown-menu').classList.remove('open');API.exportFile({content:(${contentGetter.toString()})(),format:'latex',filename:'export'})">LaTeX</button>
      </div>
    </div>`;
}

function runButton(label, onClick, disabled) {
  return `<button class="btn btn-primary" onclick="${onClick}" ${disabled ? "disabled" : ""}>${escapeHtml(label)}</button>`;
}

// ---- Navigation ----
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "D" },
  { id: "collector", label: "Paper Collector", icon: "C" },
  { id: "summarizer", label: "Summarizer", icon: "S" },
  { id: "research", label: "Deep Research", icon: "R" },
  { id: "ideas", label: "Idea Generator", icon: "I" },
  { id: "writer", label: "Paper Writer", icon: "W" },
  { id: "reviewer", label: "Reviewer", icon: "V" },
  { id: "pipeline", label: "Pipeline", icon: "P" },
  { id: "citation", label: "Citation Tools", icon: "T" },
  { id: "export", label: "Export Center", icon: "E" },
  { id: "docs", label: "Docs / Guide", icon: "?" },
  { id: "settings", label: "Settings", icon: "*" }
];

function renderNav() {
  const nav = $(".sidebar-nav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map(item => `
    <a href="#${item.id}" class="nav-item ${S.page === item.id ? "active" : ""}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join("");
}

function navigate(page) {
  S.page = page;
  renderNav();
  renderPage();
  window.scrollTo(0, 0);
}

// ---- Page Renderers ----
function renderPage() {
  const container = $(".page-container");
  if (!container) return;
  container.innerHTML = "";

  switch (S.page) {
    case "dashboard": renderDashboard(container); break;
    case "collector": renderCollector(container); break;
    case "summarizer": renderSummarizer(container); break;
    case "research": renderResearch(container); break;
    case "ideas": renderIdeas(container); break;
    case "writer": renderWriter(container); break;
    case "reviewer": renderReviewer(container); break;
    case "pipeline": renderPipeline(container); break;
    case "citation": renderCitation(container); break;
    case "export": renderExportCenter(container); break;
    case "settings": renderSettings(container); break;
    case "docs": renderDocs(container); break;
    default: navigate("dashboard");
  }
}

// ---- Dashboard ----
function renderDashboard(c) {
  const paperCount = S.papers.length;
  const bookmarkCount = S.curation.bookmarks.length;
  const taskCount = S.tasks.length;
  const llmOk = S.llmStatus && S.llmStatus.llmConfigured;

  c.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">dashboard</p>
        <h2>Research Workspace</h2>
      </div>
    </div>

    <div class="dash-metrics">
      <div class="dash-metric"><strong>${paperCount}</strong><span>Papers</span></div>
      <div class="dash-metric"><strong>${bookmarkCount}</strong><span>Bookmarked</span></div>
      <div class="dash-metric"><strong>${taskCount}</strong><span>Recent Tasks</span></div>
      <div class="dash-metric ${llmOk ? 'dm-green' : 'dm-amber'}"><strong>${llmOk ? 'Connected' : 'Not Set'}</strong><span>API Status</span></div>
    </div>

    <div class="dash-grid">
      <div class="dash-card">
        <h3>Quick Actions</h3>
        <div class="quick-actions">
          <button class="btn btn-outline" onclick="navigate('collector')">Collect Papers</button>
          <button class="btn btn-outline" onclick="navigate('summarizer')">Summarize Paper</button>
          <button class="btn btn-outline" onclick="navigate('research')">Start Research</button>
          <button class="btn btn-outline" onclick="navigate('ideas')">Generate Ideas</button>
          <button class="btn btn-outline" onclick="navigate('writer')">Write Paper</button>
          <button class="btn btn-outline" onclick="navigate('reviewer')">Review Paper</button>
        </div>
      </div>
      <div class="dash-card">
        <h3>Research Workflow</h3>
        <div class="workflow-mini">
          ${["Research","Write","Integrity Check","Review","Revise","Finalize"].map((s,i) => `<div class="wf-step"><span class="wf-num">${i+1}</span><span>${s}</span></div>`).join("")}
        </div>
        <p style="margin-top:12px;font-size:0.82rem;color:var(--muted)">Click <a href="#pipeline" style="color:var(--green)">Pipeline</a> for the full 10-stage view.</p>
      </div>
    </div>

    <div class="dash-card" style="margin-top:16px">
      <h3>Features at a Glance</h3>
      <div class="feature-grid">
        ${[
          ["Deep Research","7 modes: full, quick, systematic-review, socratic, fact-check, lit-review, review","research",STATUS.API_REQUIRED],
          ["Academic Paper Writer","10 modes: full draft, plan, outline, abstract, lit-review, revision, coach, format, citation, disclosure","writer",STATUS.API_REQUIRED],
          ["Academic Paper Reviewer","6 modes: full, quick, guided, methodology, re-review, calibration","reviewer",STATUS.API_REQUIRED],
          ["Academic Pipeline","10-stage orchestrator with mandatory integrity gates","pipeline",STATUS.IMPLEMENTED],
          ["Idea Generator","Gap analysis, idea ranking, experiment plans","ideas",STATUS.API_REQUIRED],
          ["Paper Collector","Search, import, manage papers","collector",STATUS.IMPLEMENTED],
          ["Paper Summarizer","Structured paper analysis","summarizer",STATUS.API_REQUIRED],
          ["Citation Tools","Format convert, claim check, BibTeX","citation",STATUS.API_REQUIRED]
        ].map(([name,desc,page,st]) => `<div class="feature-card" onclick="navigate('${page}')" style="cursor:pointer"><strong>${name}</strong><p>${desc}</p>${statusBadge(st)}</div>`).join("")}
      </div>
    </div>

    ${S.tasks.length ? `
    <div class="dash-card" style="margin-top:16px">
      <h3>Recent Tasks</h3>
      <div class="task-list">
        ${S.tasks.slice(-5).reverse().map(t => `<div class="task-item"><span class="task-type">${escapeHtml(t.type)}</span><span class="task-date">${formatDate(t.date)}</span><span>${escapeHtml((t.summary||"").slice(0,80))}</span></div>`).join("")}
      </div>
    </div>` : ""}
  `;
}

// ---- Paper Collector ----
function renderCollector(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">collector</p><h2>Paper Collector</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">Search and import papers by topic, DOI, URL, arXiv ID, or manual entry.</p>

    <div class="module-card">
      <h3>Search & Import</h3>
      <div class="input-row">
        <input type="text" id="collectorInput" placeholder="Topic, DOI, arXiv ID, URL, or keywords..." class="input-full">
        <button class="btn btn-primary" id="collectorSearchBtn">Search</button>
      </div>
      <p style="margin-top:8px;font-size:0.78rem;color:var(--muted)">
        ${statusBadge(STATUS.PLANNED)} Real API search (arXiv, Semantic Scholar) requires backend integration. Currently searches local corpus.
      </p>
    </div>

    <div class="module-card">
      <h3>Manual Entry</h3>
      <div class="manual-entry-form" id="manualEntryForm">
        <div class="form-grid">
          <label>Title<input type="text" id="meTitle" class="input-full"></label>
          <label>Authors (comma separated)<input type="text" id="meAuthors" class="input-full"></label>
          <label>Year<input type="text" id="meYear" class="input-full"></label>
          <label>Venue<input type="text" id="meVenue" class="input-full"></label>
          <label>URL / DOI<input type="text" id="meUrl" class="input-full"></label>
          <label>Topics (comma separated)<input type="text" id="meTopics" class="input-full"></label>
        </div>
        <label style="margin-top:8px">Abstract<textarea id="meAbstract" rows="4" class="input-full"></textarea></label>
        <button class="btn btn-primary" id="meAddBtn" style="margin-top:12px">Add Paper</button>
      </div>
    </div>

    <div class="module-card">
      <h3>My Collection <span style="font-weight:400;color:var(--muted);font-size:0.8rem">(${S.collections.length} papers)</span></h3>
      <div id="collectionList">${S.collections.length ? S.collections.map(p => renderCollectionCard(p)).join("") : emptyBox("No papers in collection yet. Search or add papers above.")}</div>
    </div>
  `;

  setTimeout(() => {
    const searchBtn = $("#collectorSearchBtn");
    const searchInput = $("#collectorInput");
    if (searchBtn && searchInput) {
      const doSearch = () => {
        const q = searchInput.value.trim();
        if (!q) return;
        const results = findPapers(q);
        const list = $("#collectionList");
        if (list) {
          list.innerHTML = results.length
            ? `<p style="margin-bottom:8px;color:var(--muted);font-size:0.82rem">Found ${results.length} papers in local corpus:</p>` + results.map(p => renderCollectionCard(p)).join("")
            : emptyBox(`No matches for "${escapeHtml(q)}" in local corpus.`, `<button class="btn btn-sm btn-outline" style="margin-top:8px">Import from arXiv (API planned)</button>`);
        }
      };
      searchBtn.addEventListener("click", doSearch);
      searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
    }

    const addBtn = $("#meAddBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const title = $("#meTitle")?.value?.trim();
        if (!title) { showToast("Title is required"); return; }
        const paper = {
          id: "manual-" + Date.now(),
          title,
          authors: ($("#meAuthors")?.value || "").split(",").map(s => s.trim()).filter(Boolean),
          year: parseInt($("#meYear")?.value, 10) || null,
          venue: $("#meVenue")?.value?.trim() || "Manual Entry",
          url: $("#meUrl")?.value?.trim() || "",
          topics: ($("#meTopics")?.value || "").split(",").map(s => s.trim()).filter(Boolean),
          summary: $("#meAbstract")?.value?.trim() || "",
          fetchedAt: new Date().toISOString(),
          summaryStatus: "manual entry"
        };
        S.collections.push(paper);
        saveJSON(CFG.storageKeys.collections, S.collections);
        document.getElementById("manualEntryForm").querySelectorAll("input,textarea").forEach(el => { if (el.tagName !== "BUTTON") el.value = ""; });
        renderPage();
        showToast("Paper added to collection!");
      });
    }
  }, 50);
}

function renderCollectionCard(paper) {
  return `<div class="paper-card" style="cursor:default">
    <div class="paper-main">
      <div class="paper-meta">
        <span>${escapeHtml(paper.venue||"Source")}</span>
        <span>${escapeHtml(String(paper.year||"n.d."))}</span>
        <span>${escapeHtml((paper.authors||[]).slice(0,3).join(", "))}</span>
      </div>
      <h3>${escapeHtml(paper.title)}</h3>
      ${paper.summary ? `<p class="summary">${escapeHtml(paper.summary)}</p>` : ""}
      <div class="tag-row">${(paper.topics||[]).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    </div>
    <div class="paper-actions">
      ${paper.url ? `<a class="icon-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer" title="Open">AR</a>` : ""}
      <button class="icon-button" title="Remove" onclick="S.collections=S.collections.filter(p=>p.id!=='${paper.id}');saveJSON(CFG.storageKeys.collections,S.collections);renderPage();showToast('Removed')">X</button>
    </div>
  </div>`;
}

function findPapers(query) {
  const q = query.toLowerCase();
  return S.papers.filter(p => {
    const h = [p.title,p.summary,p.venue,...(p.authors||[]),...(p.topics||[])].join(" ").toLowerCase();
    return q.split(/\s+/).some(w => w.length > 2 && h.includes(w));
  });
}

// ---- Summarizer ----
function renderSummarizer(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">summarizer</p><h2>Paper Summarizer</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">Submit a paper (text, abstract, or metadata) for structured AI summarization. Extracts contribution, method, experiments, results, limitations, key claims, and citation candidates.</p>

    <div class="module-card">
      <h3>Input</h3>
      <label style="margin-bottom:6px;display:block">Select a paper from collection or paste text:</label>
      <select id="summarizerPaperSelect" class="input-full" style="margin-bottom:8px">
        <option value="">-- Select from collection --</option>
        ${S.collections.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join("")}
        ${S.papers.map(p => `<option value="${p.id}">${escapeHtml(p.title)} (corpus)</option>`).join("")}
      </select>
      <textarea id="summarizerInput" rows="8" class="input-full" placeholder="Or paste paper text / abstract here..."></textarea>
      <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
        <button class="btn btn-primary" id="summarizerRunBtn">Summarize</button>
        <span id="summarizerStatus"></span>
      </div>
    </div>

    <div id="summarizerResult"></div>
  `;

  setTimeout(() => {
    const select = $("#summarizerPaperSelect");
    const input = $("#summarizerInput");
    if (select && input) {
      select.addEventListener("change", () => {
        if (!select.value) return;
        const allPapers = [...S.collections, ...S.papers];
        const paper = allPapers.find(p => p.id === select.value);
        if (paper) {
          input.value = [`Title: ${paper.title}`, `Authors: ${(paper.authors||[]).join(", ")}`, paper.summary || ""].filter(Boolean).join("\n\n");
        }
      });
    }

    const btn = $("#summarizerRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const text = input?.value?.trim();
        if (!text) { showToast("Provide text or select a paper"); return; }
        const statusEl = $("#summarizerStatus");
        const resultEl = $("#summarizerResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Summarizing...");
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.summarize({ text });
          if (resultEl) resultEl.innerHTML = resultPanel(res.result, { title: "Structured Summary", _id: "sum" })
            + `<div style="margin-top:8px">${exportMenu(() => res.result)}</div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("summarize", `Summarized: ${text.slice(0,60)}...`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Deep Research ----
function renderResearch(c) {
  const modes = [
    { id: "full", label: "Full Research", desc: "Complete research pipeline from question to synthesis" },
    { id: "quick", label: "Quick Brief", desc: "Rapid literature scan with key findings" },
    { id: "systematic-review", label: "Systematic Review", desc: "PRISMA-compliant systematic review" },
    { id: "socratic", label: "Socratic Research", desc: "Guided question refinement through dialogue" },
    { id: "fact-check", label: "Fact-Check", desc: "Verify claims against cited sources" },
    { id: "lit-review", label: "Literature Review", desc: "Comprehensive literature review with bibliography" },
    { id: "review", label: "Research Review", desc: "Review the quality of existing research" }
  ];

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">deep research</p><h2>Deep Research</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">Multi-agent research investigation. 13 specialized agents cover question refinement, search strategy, literature retrieval, deduplication, screening, quality assessment, data extraction, synthesis, bias checking, and source verification.</p>

    <div class="module-card">
      <h3>Research Topic</h3>
      <input type="text" id="researchTopic" class="input-full" placeholder="Enter your research topic or question...">
    </div>

    <div class="module-card">
      <h3>Mode</h3>
      <div class="mode-grid">
        ${modes.map(m => `
          <label class="mode-card" id="mode-card-${m.id}">
            <input type="radio" name="researchMode" value="${m.id}" ${m.id === "full" ? "checked" : ""} style="display:none">
            <strong>${escapeHtml(m.label)}</strong>
            <p>${escapeHtml(m.desc)}</p>
          </label>
        `).join("")}
      </div>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" id="researchRunBtn">Run Research</button>
      <span id="researchStatus"></span>
    </div>

    <div id="researchResult" style="margin-top:16px"></div>
  `;

  setTimeout(() => {
    document.querySelectorAll(".mode-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        card.querySelector("input").checked = true;
      });
    });
    // Activate default
    const defaultCard = $("#mode-card-full");
    if (defaultCard) defaultCard.classList.add("active");

    const btn = $("#researchRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const topic = $("#researchTopic")?.value?.trim();
        if (!topic) { showToast("Enter a research topic"); return; }
        const mode = document.querySelector("input[name='researchMode']:checked")?.value || "full";
        const statusEl = $("#researchStatus");
        const resultEl = $("#researchResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner(`Running ${mode} research...`);
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.research({ topic, mode });
          if (resultEl) resultEl.innerHTML = `
            <div class="result-panel">
              <div class="result-header"><strong>Research Results</strong><span style="font-size:0.72rem;color:var(--muted)">Mode: ${res.mode} | Model: ${res.model}</span>${copyBtn("researchResultContent")}${exportMenu(() => res.result)}</div>
              <div class="result-content markdown-body" id="researchResultContent">${escapeHtml(res.result)}</div>
            </div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("research", `${mode}: ${topic.slice(0,80)}`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Idea Generator ----
function renderIdeas(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">idea generator</p><h2>Idea Generator</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">Generate research gaps, possible ideas, rank by novelty/feasibility/risk/resource/contribution, create experiment plans, and draft paper titles and hypotheses.</p>

    <div class="module-card">
      <h3>Research Context</h3>
      <label>Topic / Research Direction</label>
      <input type="text" id="ideasTopic" class="input-full" placeholder="e.g. diffusion policies for dexterous manipulation">
      <label style="margin-top:8px">Additional Context (optional)</label>
      <textarea id="ideasContext" rows="4" class="input-full" placeholder="Paste paper summaries, research notes, or constraints..."></textarea>
      <label style="margin-top:8px">Constraints (optional)</label>
      <input type="text" id="ideasConstraints" class="input-full" placeholder="e.g. limited compute, must use real robots, within 6 months">
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" id="ideasRunBtn">Generate Ideas</button>
      <span id="ideasStatus"></span>
    </div>

    <div id="ideasResult" style="margin-top:16px"></div>
  `;

  setTimeout(() => {
    const btn = $("#ideasRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const topic = $("#ideasTopic")?.value?.trim();
        if (!topic) { showToast("Enter a topic"); return; }
        const context = $("#ideasContext")?.value?.trim() || "";
        const constraints = $("#ideasConstraints")?.value?.trim() || "";
        const statusEl = $("#ideasStatus");
        const resultEl = $("#ideasResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Generating research ideas...");
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.ideas({ topic, context, constraints });
          if (resultEl) resultEl.innerHTML = `
            <div class="result-panel">
              <div class="result-header"><strong>Generated Ideas</strong>${copyBtn("ideasResultContent")}${exportMenu(() => res.result)}</div>
              <div class="result-content markdown-body" id="ideasResultContent">${escapeHtml(res.result)}</div>
            </div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("ideas", `Generated ideas for: ${topic.slice(0,80)}`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Paper Writer ----
function renderWriter(c) {
  const modes = [
    { id: "full", label: "Full Paper Draft", desc: "Complete paper from research to final draft" },
    { id: "plan", label: "Planning", desc: "Outline and argument map generation" },
    { id: "outline-only", label: "Outline Only", desc: "Detailed paper outline" },
    { id: "abstract-only", label: "Abstract Only", desc: "Generate polished abstract (3 variants)" },
    { id: "lit-review", label: "Literature Review", desc: "Write a lit review paper" },
    { id: "revision", label: "Revision", desc: "Revise draft with feedback" },
    { id: "revision-coach", label: "Revision Coach", desc: "Coaching on how to revise" },
    { id: "format-convert", label: "Format Conversion", desc: "Convert between formats" },
    { id: "citation-check", label: "Citation Check", desc: "Verify and correct citations" },
    { id: "disclosure", label: "AI Disclosure", desc: "Generate usage disclosure statement" }
  ];

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">paper writer</p><h2>Academic Paper Writer</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">12-agent paper writing pipeline with style calibration, writing quality check, LaTeX hardening, visualization, revision coaching, citation conversion, and disclosure support.</p>

    <div class="module-card">
      <h3>Content / Draft / Notes</h3>
      <textarea id="writerContent" rows="10" class="input-full" placeholder="Paste your research notes, draft, outline, or paper content..."></textarea>
    </div>

    <div class="module-card">
      <h3>Mode</h3>
      <select id="writerMode" class="input-full">
        ${modes.map(m => `<option value="${m.id}">${m.label} — ${m.desc}</option>`).join("")}
      </select>
    </div>

    <div class="module-card" id="writerExtraFields" style="display:none">
      <h3>Additional Options</h3>
      <label>Special Instructions</label>
      <input type="text" id="writerInstructions" class="input-full" placeholder="Any specific guidance...">
      <label style="margin-top:8px" id="writerFeedbackLabel" style="display:none">Feedback / Reviewer Comments</label>
      <textarea id="writerFeedback" rows="4" class="input-full" placeholder="Paste reviewer comments for revision mode..."></textarea>
      <label style="margin-top:8px" id="writerFormatLabel" style="display:none">Target Format</label>
      <select id="writerTargetFormat" class="input-full">
        <option value="markdown">Markdown</option>
        <option value="latex">LaTeX</option>
        <option value="docx">DOCX (via Pandoc)</option>
        <option value="pdf">PDF (via Tectonic)</option>
      </select>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" id="writerRunBtn">Run Writer</button>
      <span id="writerStatus"></span>
    </div>

    <div id="writerResult" style="margin-top:16px"></div>
  `;

  setTimeout(() => {
    const modeSelect = $("#writerMode");
    const extraFields = $("#writerExtraFields");
    const feedbackLabel = $("#writerFeedbackLabel");
    const formatLabel = $("#writerFormatLabel");

    const updateExtras = () => {
      const mode = modeSelect?.value;
      if (extraFields) extraFields.style.display = "block";
      if (feedbackLabel) feedbackLabel.style.display = (mode === "revision" || mode === "revision-coach") ? "block" : "none";
      if (formatLabel) formatLabel.style.display = (mode === "format-convert") ? "block" : "none";
    };
    if (modeSelect) { modeSelect.addEventListener("change", updateExtras); updateExtras(); }

    const btn = $("#writerRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const content = $("#writerContent")?.value?.trim();
        if (!content) { showToast("Provide content to work with"); return; }
        const mode = modeSelect?.value || "full";
        const instructions = $("#writerInstructions")?.value?.trim() || "";
        const feedback = $("#writerFeedback")?.value?.trim() || "";
        const targetFormat = $("#writerTargetFormat")?.value || "markdown";
        const statusEl = $("#writerStatus");
        const resultEl = $("#writerResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Writing...");
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.write({ content, mode, instructions, feedback, targetFormat });
          if (resultEl) resultEl.innerHTML = `
            <div class="result-panel">
              <div class="result-header"><strong>Output (${res.mode})</strong><span style="font-size:0.72rem;color:var(--muted)">Model: ${res.model}</span>${copyBtn("writerResultContent")}${exportMenu(() => $("#writerResultContent")?.textContent || "")}</div>
              <div class="result-content markdown-body" id="writerResultContent">${escapeHtml(res.result)}</div>
            </div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("writer", `${mode}: ${content.slice(0,60)}...`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Paper Reviewer ----
function renderReviewer(c) {
  const modes = [
    { id: "full", label: "Full Peer Review", desc: "Complete multi-perspective review" },
    { id: "quick", label: "Quick Review", desc: "Rapid review with key issues" },
    { id: "guided", label: "Guided Improvement", desc: "Focus on specific concerns" },
    { id: "methodology-focus", label: "Methodology Focus", desc: "Deep methods/stats review" },
    { id: "re-review", label: "Re-Review", desc: "Verify revisions" },
    { id: "calibration", label: "Calibration", desc: "Cross-review calibration" }
  ];

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">reviewer</p><h2>Academic Paper Reviewer</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">7-agent multi-perspective peer review simulating a 5-person editorial board: Editor-in-Chief, R1 Methodology, R2 Domain Expert, R3 Interdisciplinary, Devil's Advocate. 0-100 quality rubric with anti-sycophancy mechanism.</p>

    <div class="review-rubric-mini">
      <div class="rubric-item rubric-accept"><strong>80-100</strong> Accept</div>
      <div class="rubric-item rubric-minor"><strong>65-79</strong> Minor Revision</div>
      <div class="rubric-item rubric-major"><strong>50-64</strong> Major Revision</div>
      <div class="rubric-item rubric-reject"><strong>0-49</strong> Reject</div>
    </div>

    <div class="module-card">
      <h3>Paper to Review</h3>
      <textarea id="reviewerInput" rows="12" class="input-full" placeholder="Paste the full paper text, draft, or sections to review..."></textarea>
    </div>

    <div class="module-card">
      <h3>Mode</h3>
      <select id="reviewerMode" class="input-full">
        ${modes.map(m => `<option value="${m.id}">${m.label} — ${m.desc}</option>`).join("")}
      </select>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" id="reviewerRunBtn">Run Review</button>
      <span id="reviewerStatus"></span>
    </div>

    <div id="reviewerResult" style="margin-top:16px"></div>
  `;

  setTimeout(() => {
    const btn = $("#reviewerRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const paper = $("#reviewerInput")?.value?.trim();
        if (!paper) { showToast("Provide paper content to review"); return; }
        const mode = $("#reviewerMode")?.value || "full";
        const statusEl = $("#reviewerStatus");
        const resultEl = $("#reviewerResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Reviewing...");
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.review({ paper, mode });
          if (resultEl) resultEl.innerHTML = `
            <div class="result-panel">
              <div class="result-header"><strong>Review (${res.mode})</strong>${copyBtn("reviewerResultContent")}${exportMenu(() => res.result)}</div>
              <div class="result-content markdown-body" id="reviewerResultContent">${escapeHtml(res.result)}</div>
            </div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("review", `${mode}: review completed`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Pipeline ----
function renderPipeline(c) {
  if (!S.workflows || !S.workflows.pipeline) {
    c.innerHTML = `<div class="page-header"><h2>Pipeline</h2></div>${emptyBox("Workflow data not loaded.")}`;
    return;
  }

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">pipeline</p><h2>Academic Pipeline Orchestrator</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">10-stage pipeline from RESEARCH through FINALIZE. Mandatory integrity gates at stages 2.5 and 4.5. Each stage shows purpose, inputs, outputs, and links to the corresponding tool.</p>

    <div class="module-card">
      <h3>Pipeline Entry Modes</h3>
      <p style="font-size:0.82rem;color:var(--muted);margin-bottom:10px">Start the pipeline at different stages depending on your starting point.</p>
      <div class="mode-grid">
        <div class="mode-card" style="cursor:pointer" onclick="navigate('research')">
          <strong>Full Pipeline (from Research)</strong>
          <p>Start from a research question. Run Stage 1 Deep Research, then proceed through all stages.</p>
        </div>
        <div class="mode-card" style="cursor:pointer" onclick="navigate('reviewer')">
          <strong>Existing Paper Review Entry</strong>
          <p>Already have a draft? Enter at Stage 3 to get a multi-perspective peer review.</p>
        </div>
        <div class="mode-card" style="cursor:pointer" onclick="navigate('writer')">
          <strong>Reviewer Comments Entry</strong>
          <p>Have reviewer feedback? Enter at Stage 4 to revise your paper with coaching.</p>
        </div>
        <div class="mode-card">
          <strong>Resume from Passport</strong>
          <p>${statusBadge(STATUS.PLANNED)} Resume an interrupted session from a Material Passport. Planned feature.</p>
        </div>
      </div>
    </div>

    <div class="pipeline-full">
      ${S.workflows.pipeline.map((step, i) => {
        const isMandatory = ["2.5","4.5"].includes(step.stage);
        const toolLink = getToolForStage(step.stage);
        return `
          <div class="pipeline-stage-card ${isMandatory ? "mandatory" : ""}">
            <div class="ps-header">
              <span class="ps-num">${escapeHtml(step.stage)}</span>
              <div>
                <strong>${escapeHtml(step.name)}</strong>
                <span class="ps-agents">${step.agents||"?"} agent${step.agents!==1?"s":""}${isMandatory ? " • MANDATORY" : ""}</span>
              </div>
              ${toolLink ? `<a href="#${toolLink}" class="btn btn-xs btn-outline" style="flex-shrink:0">Open Tool</a>` : ""}
            </div>
            <p class="ps-output">${escapeHtml(step.output)}</p>
            ${step.deliverables ? `<div class="ps-deliverables">${step.deliverables.map(d => `<span>${escapeHtml(d)}</span>`).join("")}</div>` : ""}
            ${i < S.workflows.pipeline.length - 1 ? `<div class="ps-arrow">↓</div>` : ""}
          </div>`;
      }).join("")}
    </div>
  `;
}

function getToolForStage(stage) {
  const map = { "1": "research", "2": "writer", "2.5": "citation", "3": "reviewer", "3'": "reviewer", "4": "writer", "4'": "writer", "5": "export" };
  return map[stage] || null;
}

// ---- Citation Tools ----
function renderCitation(c) {
  const actions = [
    { id: "format-convert", label: "Format Convert", desc: "Convert citations between APA, MLA, IEEE, Chicago, Vancouver" },
    { id: "claim-check", label: "Claim Support Check", desc: "Verify if claims are supported by cited sources" },
    { id: "bibtex-helper", label: "BibTeX Helper", desc: "Generate accurate BibTeX entries" },
    { id: "hallucination-check", label: "Hallucination Check", desc: "Scan for potential fabricated citations or claims" }
  ];

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">citation tools</p><h2>Citation & Integrity Tools</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">Citation format conversion, claim-support checking, BibTeX helper, and hallucination risk detection. <strong>Note:</strong> Model-assisted verification is not a guarantee. Always independently verify critical citations.</p>

    <div class="module-card">
      <h3>Action</h3>
      <select id="citationAction" class="input-full">
        ${actions.map(a => `<option value="${a.id}">${a.label} — ${a.desc}</option>`).join("")}
      </select>
    </div>

    <div class="module-card">
      <h3>Input</h3>
      <textarea id="citationInput" rows="8" class="input-full" placeholder="Paste text, citations, or paper content..."></textarea>
      <div class="input-row" style="margin-top:8px" id="citationFormatRow" style="display:none">
        <label>Source Format<select id="citationSourceFmt" class="input-full"><option value="apa">APA</option><option value="mla">MLA</option><option value="ieee">IEEE</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="bibtex">BibTeX</option></select></label>
        <label>Target Format<select id="citationTargetFmt" class="input-full"><option value="apa">APA</option><option value="mla">MLA</option><option value="ieee">IEEE</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="bibtex">BibTeX</option></select></label>
      </div>
    </div>

    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-primary" id="citationRunBtn">Run</button>
      <span id="citationStatus"></span>
    </div>

    <div id="citationResult" style="margin-top:16px"></div>
  `;

  setTimeout(() => {
    const actionSelect = $("#citationAction");
    const formatRow = $("#citationFormatRow");
    const updateFormatRow = () => { if (formatRow) formatRow.style.display = actionSelect?.value === "format-convert" ? "flex" : "none"; };
    if (actionSelect) { actionSelect.addEventListener("change", updateFormatRow); updateFormatRow(); }

    const btn = $("#citationRunBtn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const text = $("#citationInput")?.value?.trim();
        if (!text) { showToast("Provide text to process"); return; }
        const action = actionSelect?.value || "format-convert";
        const sourceFormat = $("#citationSourceFmt")?.value || "apa";
        const targetFormat = $("#citationTargetFmt")?.value || "ieee";
        const statusEl = $("#citationStatus");
        const resultEl = $("#citationResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Processing...");
        if (resultEl) resultEl.innerHTML = "";
        try {
          const res = await API.citation({ action, text, sourceFormat, targetFormat });
          if (resultEl) resultEl.innerHTML = `
            <div class="result-panel">
              <div class="result-header"><strong>Result</strong>${copyBtn("citationResultContent")}${exportMenu(() => res.result)}</div>
              <div class="result-content markdown-body" id="citationResultContent">${escapeHtml(res.result)}</div>
            </div>`;
          if (statusEl) statusEl.innerHTML = "";
          addTask("citation", `${action} completed`);
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox(err.message, () => btn.click());
        }
      });
    }
  }, 50);
}

// ---- Export Center ----
function renderExportCenter(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">export</p><h2>Export Center</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">Export research results, paper drafts, reviews, and summaries in multiple formats: Markdown, JSON, Plain Text, LaTeX, BibTeX. Server-side DOCX/PDF conversion not yet implemented.</p>

    <div class="module-card">
      <h3>Content to Export</h3>
      <textarea id="exportContent" rows="10" class="input-full" placeholder="Paste content to export..."></textarea>
    </div>

    <div class="export-buttons" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">
      <button class="btn btn-primary" data-fmt="markdown">Export as Markdown</button>
      <button class="btn btn-outline" data-fmt="json">Export as JSON</button>
      <button class="btn btn-outline" data-fmt="text">Export as Plain Text</button>
      <button class="btn btn-outline" data-fmt="latex">Export as LaTeX</button>
      <button class="btn btn-outline" data-fmt="bibtex">Export as BibTeX</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>Quick Export: Curated Papers</h3>
      <p style="font-size:0.82rem;color:var(--muted)">Export your bookmarked and verification-flagged papers.</p>
      <button class="btn btn-outline" id="exportCurationBtn" style="margin-top:8px">Export Curation (JSON)</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>Format Support</h3>
      <div class="format-table">
        <div class="format-row"><span>Markdown</span><span class="badge-green status-badge">Implemented</span></div>
        <div class="format-row"><span>JSON</span><span class="badge-green status-badge">Implemented</span></div>
        <div class="format-row"><span>Plain Text</span><span class="badge-green status-badge">Implemented</span></div>
        <div class="format-row"><span>LaTeX</span><span class="badge-green status-badge">Implemented</span></div>
        <div class="format-row"><span>BibTeX</span><span class="badge-green status-badge">Implemented</span></div>
        <div class="format-row"><span>DOCX</span><span class="badge-amber status-badge">Planned — requires Pandoc</span></div>
        <div class="format-row"><span>PDF</span><span class="badge-amber status-badge">Planned — requires Tectonic/LaTeX</span></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.querySelectorAll("[data-fmt]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const content = $("#exportContent")?.value?.trim();
        if (!content) { showToast("Provide content to export"); return; }
        const fmt = btn.dataset.fmt;
        try {
          await API.exportFile({ content, format: fmt, filename: `research-export-${Date.now()}` });
          showToast(`Exported as ${fmt.toUpperCase()}`);
        } catch (err) {
          // Fallback: client-side download
          const blob = new Blob([content], { type: "text/plain" });
          downloadBlob(blob, `export-${Date.now()}.${fmt === "text" ? "txt" : fmt === "markdown" ? "md" : fmt}`);
          showToast(`Downloaded as ${fmt} (client-side)`);
        }
      });
    });

    const curationBtn = $("#exportCurationBtn");
    if (curationBtn) {
      curationBtn.addEventListener("click", () => {
        const payload = {
          exportedAt: new Date().toISOString(),
          bookmarks: S.curation.bookmarks,
          verify: S.curation.verify,
          papers: S.papers.filter(p => S.curation.bookmarks.includes(p.id) || S.curation.verify.includes(p.id))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        downloadBlob(blob, `curation-${Date.now()}.json`);
        showToast("Curation exported!");
      });
    }
  }, 50);
}

// ---- Settings ----
function renderSettings(c) {
  const s = S.settings;
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">settings</p><h2>API Configuration</h2></div>
    </div>
    <p class="page-desc">Configure your LLM provider. <strong>API keys are configured server-side</strong> in the <code>.env</code> file and never exposed to the browser. See the Docs page for setup instructions.</p>

    <div class="module-card">
      <h3>LLM Provider (Server-Side Configuration)</h3>
      <p style="font-size:0.82rem;color:var(--muted);margin-bottom:12px">These non-secret reference settings are saved in this browser for display only. The actual provider configuration and API key must be set in the backend server's <code>.env</code> file.</p>
      <div class="form-grid">
        <label>Provider
          <select id="setProvider" class="input-full">
            <option value="openai" ${s.provider==="openai"?"selected":""}>OpenAI</option>
            <option value="anthropic" ${s.provider==="anthropic"?"selected":""}>Anthropic</option>
            <option value="deepseek" ${s.provider==="deepseek"?"selected":""}>DeepSeek</option>
            <option value="openrouter" ${s.provider==="openrouter"?"selected":""}>OpenRouter / Custom</option>
          </select>
        </label>
        <label>Model<input type="text" id="setModel" class="input-full" value="${escapeHtml(s.model||'gpt-4o')}"></label>
        <label>Base URL<input type="text" id="setBaseUrl" class="input-full" value="${escapeHtml(s.baseUrl||'https://api.openai.com/v1')}"></label>
        <label>Temperature<input type="number" id="setTemp" class="input-full" value="${s.temperature||0.7}" min="0" max="2" step="0.1"></label>
        <label>Max Tokens<input type="number" id="setMaxTokens" class="input-full" value="${s.maxTokens||4096}" min="100" max="128000"></label>
      </div>
      <button class="btn btn-primary" id="saveSettingsBtn" style="margin-top:12px">Save Reference Settings</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>Current API Status</h3>
      <div id="apiStatusCheck">
        <button class="btn btn-outline" id="checkApiBtn">Check API Status</button>
        <span id="apiStatusResult" style="margin-left:8px"></span>
      </div>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>Security Notes</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8">
        <li>This page never asks for or stores API keys in browser storage.</li>
        <li>Run the backend server (<code>node server.js</code>) and configure provider credentials in <code>.env</code>.</li>
        <li>Never commit <code>.env</code> or any file containing real API keys to git.</li>
        <li>See <code>.env.example</code> for the required environment variables.</li>
      </ul>
    </div>
  `;

  setTimeout(() => {
    const saveBtn = $("#saveSettingsBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        S.settings = {
          provider: $("#setProvider")?.value || "openai",
          model: $("#setModel")?.value?.trim() || "gpt-4o",
          baseUrl: $("#setBaseUrl")?.value?.trim() || "https://api.openai.com/v1",
          temperature: parseFloat($("#setTemp")?.value) || 0.7,
          maxTokens: parseInt($("#setMaxTokens")?.value, 10) || 4096
        };
        saveJSON(CFG.storageKeys.settings, S.settings);
        showToast("Settings saved!");
      });
    }

    const checkBtn = $("#checkApiBtn");
    if (checkBtn) {
      checkBtn.addEventListener("click", async () => {
        const statusEl = $("#apiStatusResult");
        if (statusEl) statusEl.innerHTML = loadingSpinner("Checking...");
        try {
          const status = await API.status();
          S.llmStatus = status;
          if (statusEl) statusEl.innerHTML = status.llmConfigured
            ? `<span style="color:var(--green);font-weight:700">Connected — ${status.provider} / ${status.model}</span>`
            : `<span style="color:var(--amber);font-weight:700">Not configured — set LLM_API_KEY in the backend .env file</span>`;
        } catch (err) {
          if (statusEl) statusEl.innerHTML = errorBox("Cannot reach API server. Is the backend running? (node server.js)");
        }
      });
    }
  }, 50);
}

// ---- Docs / Usage Guide ----
function renderDocs(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">documentation</p><h2>Docs & Usage Guide</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">How to set up, configure, and use each module of Auto Research Web.</p>

    <div class="module-card">
      <h3>Installation</h3>
      <pre style="background:#f4f5f2;padding:14px;border-radius:7px;font-size:0.82rem;overflow-x:auto">git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
cp .env.example .env
# Edit .env with your LLM_API_KEY
npm start</pre>
      <p style="margin-top:8px;font-size:0.82rem;color:var(--muted)">Open <strong>http://localhost:3000</strong> in your browser.</p>
    </div>

    <div class="module-card">
      <h3>API Configuration</h3>
      <p style="font-size:0.84rem;line-height:1.6;margin-bottom:10px">API keys are configured in the <code>.env</code> file on the backend server and <strong>never exposed to the browser</strong>. See <code>.env.example</code> for the template.</p>
      <table class="format-table" style="font-size:0.8rem">
        <tr><td style="padding:6px 12px;font-weight:700">LLM_PROVIDER</td><td style="padding:6px 12px;color:var(--muted)">openai | anthropic | deepseek | openrouter</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_API_KEY</td><td style="padding:6px 12px;color:var(--muted)">Your provider API key (required)</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_MODEL</td><td style="padding:6px 12px;color:var(--muted)">e.g. gpt-4o, claude-sonnet-4-6, deepseek-chat</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_BASE_URL</td><td style="padding:6px 12px;color:var(--muted)">Provider API endpoint</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">PORT</td><td style="padding:6px 12px;color:var(--muted)">Server port (default: 3000)</td></tr>
      </table>
    </div>

    <div class="module-card">
      <h3>Module Guide</h3>
      <div class="feature-grid">
        <div class="feature-card"><strong>Dashboard</strong><p>Overview, metrics, quick actions, API status. Click any feature card to jump to that tool.</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>Paper Collector</strong><p>Search the local corpus by keyword. Add papers manually with title, authors, year, venue, URL, topics, abstract.</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>Paper Summarizer</strong><p>Select a paper or paste text. LLM extracts: contribution, method, experiments, results, limitations, key claims, citation candidates.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Deep Research</strong><p>7 modes: full, quick, systematic-review (PRISMA), socratic, fact-check, lit-review, research review. Each mode has a distinct LLM prompt.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Idea Generator</strong><p>Generate research gaps, ranked ideas (novelty/feasibility/risk/resources/contribution), experiment plans, paper titles, hypotheses.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Paper Writer</strong><p>10 modes: full draft, plan, outline, abstract, lit-review, revision, revision coach, format conversion, citation check, AI disclosure.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Paper Reviewer</strong><p>6 modes with 0-100 rubric: full, quick, guided, methodology-focus, re-review, calibration. Simulates editorial board with anti-sycophancy.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Pipeline</strong><p>10-stage orchestrator. Entry modes: full pipeline, existing paper review, reviewer comments, resume from passport. Mandatory integrity gates at 2.5 and 4.5.</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>Citation Tools</strong><p>Format conversion (APA/MLA/IEEE/Chicago/Vancouver/BibTeX), claim-support check, BibTeX helper, hallucination risk detection.</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>Export Center</strong><p>Export as Markdown, JSON, Plain Text, LaTeX, BibTeX. DOCX/PDF planned (requires Pandoc/Tectonic).</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
      </div>
    </div>

    <div class="module-card">
      <h3>Deployment</h3>
      <p style="font-size:0.84rem;line-height:1.6"><strong>GitHub Pages (static):</strong> Push the repository. Non-LLM features (Dashboard, Pipeline, Export, Paper Collector) work without a backend.<br><br>
      <strong>Full (with LLM):</strong> Deploy the Express server to Railway, Render, Fly.io, or a VPS. Set environment variables on the host. Update <code>CFG.apiBase</code> in <code>public/app.js</code> if the backend is on a different domain.</p>
    </div>

    <div class="module-card">
      <h3>Security</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8;padding-left:20px">
        <li>API keys are stored only in <code>.env</code> on the backend server</li>
        <li>The frontend only calls <code>/api/*</code> routes</li>
        <li><code>.env</code> is in <code>.gitignore</code> and never committed</li>
        <li>For local development, always use the backend server (<code>npm start</code>)</li>
        <li>All LLM results include a warning: model-assisted output must be verified by a human</li>
      </ul>
    </div>

    <div class="module-card">
      <h3>Known Limitations</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8;padding-left:20px">
        <li>arXiv/Semantic Scholar real-time search is not yet integrated into the web UI (Python fetch script exists in <code>scripts/</code>)</li>
        <li>DOCX export requires Pandoc; PDF requires Tectonic/LaTeX</li>
        <li>No automated test framework yet</li>
        <li>GitHub Pages cannot run the Express backend; LLM features require a deployed backend</li>
      </ul>
    </div>

    <div class="module-card">
      <h3>License & Attribution</h3>
      <p style="font-size:0.84rem;line-height:1.6">Licensed under <strong>CC BY-NC 4.0</strong>. Based on <a href="https://github.com/Imbad0202/academic-research-skills" target="_blank" rel="noreferrer" style="color:var(--green)">Academic Research Skills</a> by Cheng-I Wu, also CC BY-NC 4.0. This project is a visual, interactive web implementation inspired by the ARS workflow concepts. It is not the original ARS project.</p>
    </div>
  `;
}

// ---- Task tracking ----
function addTask(type, summary) {
  S.tasks.push({ type, summary, date: new Date().toISOString() });
  if (S.tasks.length > 50) S.tasks = S.tasks.slice(-50);
  saveJSON(CFG.storageKeys.tasks, S.tasks);
}

// ---- Paper Dashboard (existing feature, preserved) ----
function renderPaperDashboard() {
  const metricsEl = $(".metrics-grid");
  const workspaceGrid = $(".workspace-grid");
  const skillsPanel = $(".skills-panel");
  if (!metricsEl || !workspaceGrid) return;

  // Metrics
  const filtered = filterPapers();
  $(".app-header").style.display = "block";
  metricsEl.style.display = "grid";
  workspaceGrid.style.display = "grid";
  if (skillsPanel) skillsPanel.style.display = "block";

  document.querySelector("#paperCount").textContent = S.papers.length;
  document.querySelector("#bookmarkCount").textContent = S.curation.bookmarks.length;
  document.querySelector("#verifyCount").textContent = S.curation.verify.length;
  const dates = S.papers.map(p => p.fetchedAt || p.publishedAt).filter(Boolean).sort().reverse();
  document.querySelector("#updatedAt").textContent = dates[0] ? new Date(dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "--";
}

function filterPapers() {
  return S.papers.filter(paper => {
    const haystack = [paper.title, paper.summary, paper.venue, ...(paper.authors || []), ...(paper.topics || [])].join(" ").toLowerCase();
    const matchesQuery = !S.query || S.query.split(/\s+/).every(w => haystack.includes(w));
    const matchesTopic = S.topic === "all" || (paper.topics || []).includes(S.topic);
    const matchesYear = S.year === "all" || String(paper.year) === S.year;
    const matchesStatus = S.status === "all" || (S.status === "bookmarked" && S.curation.bookmarks.includes(paper.id)) || (S.status === "verify" && S.curation.verify.includes(paper.id));
    return matchesQuery && matchesTopic && matchesYear && matchesStatus;
  });
}

// ---- Initialization ----
async function init() {
  // Load data
  try {
    const [papersRes, workflowsRes] = await Promise.all([
      fetch("data/papers.json"),
      fetch("data/workflows.json")
    ]);
    const paperPayload = await papersRes.json();
    S.papers = paperPayload.papers || [];
    S.workflows = await workflowsRes.json();
  } catch (err) {
    console.warn("Data load failed:", err);
    S.papers = [];
    S.workflows = { pipeline: [], skills: [] };
  }

  // Check API status
  try {
    S.llmStatus = await API.status();
  } catch {
    S.llmStatus = { llmConfigured: false, error: "Backend not reachable" };
  }

  // Determine initial page from hash
  const hash = window.location.hash.slice(1);
  if (hash && NAV_ITEMS.some(n => n.id === hash)) {
    S.page = hash;
  }

  // Set up the app layout
  setupLayout();
  bindGlobalEvents();
  renderNav();
  renderPage();
  renderPaperDashboard();
  hydrateFilters();
  bindDashboardEvents();

  // Listen for hash changes
  window.addEventListener("hashchange", () => {
    const h = window.location.hash.slice(1);
    if (h && NAV_ITEMS.some(n => n.id === h)) {
      navigate(h);
      // Show/hide dashboard panels
      const isDashboard = h === "dashboard";
      $(".app-header").style.display = isDashboard ? "block" : "none";
      $(".metrics-grid").style.display = isDashboard ? "grid" : "none";
      $(".workspace-grid").style.display = isDashboard ? "grid" : "none";
      const sp = $(".skills-panel");
      if (sp) sp.style.display = isDashboard ? "block" : "none";
    }
  });
}

function setupLayout() {
  // Insert sidebar before main content
  const main = document.querySelector("main");
  if (!main) return;

  // Wrap existing dashboard content in a container
  const existingContent = main.innerHTML;
  main.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <p class="eyebrow" style="margin-bottom:2px">auto research</p>
          <strong>ARW</strong>
        </div>
        <nav class="sidebar-nav"></nav>
        <div class="sidebar-footer">
          <p style="font-size:0.68rem;color:var(--muted)">Based on ARS by<br>Cheng-I Wu</p>
          <a href="https://github.com/Imbad0202/academic-research-skills" target="_blank" rel="noreferrer" style="font-size:0.68rem;color:var(--green)">CC BY-NC 4.0</a>
        </div>
      </aside>
      <div class="main-content">
        <div class="page-container"></div>
        <div class="dashboard-content" style="display:none">${existingContent}</div>
      </div>
    </div>
  `;
}

function bindGlobalEvents() {
  document.addEventListener("click", (e) => {
    // Close dropdowns when clicking outside
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown-menu.open").forEach(m => m.classList.remove("open"));
    }
  });
}

function hydrateFilters() {
  const topicFilter = document.querySelector("#topicFilter");
  const yearFilter = document.querySelector("#yearFilter");
  if (!topicFilter || !yearFilter) return;

  const topics = new Set();
  const years = new Set();
  S.papers.forEach(paper => {
    (paper.topics || []).forEach(t => topics.add(t));
    if (paper.year) years.add(String(paper.year));
  });

  [...topics].sort().forEach(topic => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    topicFilter.append(opt);
  });

  [...years].sort((a, b) => b.localeCompare(a)).forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    yearFilter.append(opt);
  });
}

function bindDashboardEvents() {
  const searchInput = document.querySelector("#searchInput");
  const topicFilter = document.querySelector("#topicFilter");
  const yearFilter = document.querySelector("#yearFilter");
  const statusFilter = document.querySelector("#statusFilter");

  if (searchInput) searchInput.addEventListener("input", (e) => { S.query = e.target.value.trim().toLowerCase(); renderPaperDashboard(); });
  if (topicFilter) topicFilter.addEventListener("change", (e) => { S.topic = e.target.value; renderPaperDashboard(); });
  if (yearFilter) yearFilter.addEventListener("change", (e) => { S.year = e.target.value; renderPaperDashboard(); });
  if (statusFilter) statusFilter.addEventListener("change", (e) => { S.status = e.target.value; renderPaperDashboard(); });

  document.querySelectorAll(".segment").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      S.view = btn.dataset.view;
      renderPaperDashboard();
    });
  });
}

// Boot
document.addEventListener("DOMContentLoaded", init);
