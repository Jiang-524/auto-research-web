const MANDATORY_STAGES = new Set(["2.5", "4.5"]);

const SKILL_ICONS = {
  "deep-research": "ic-dr",
  "academic-paper": "ic-ap",
  "academic-reviewer": "ic-rv",
  "academic-pipeline": "ic-pl"
};

const SKILL_LABELS = {
  "deep-research": "DR",
  "academic-paper": "AP",
  "academic-reviewer": "RV",
  "academic-pipeline": "PL"
};

const state = {
  papers: [],
  workflows: null,
  query: "",
  topic: "all",
  year: "all",
  status: "all",
  view: "cards",
  curation: loadCuration()
};

const els = {
  paperList: document.querySelector("#paperList"),
  pipelineList: document.querySelector("#pipelineList"),
  skillGrid: document.querySelector("#skillGrid"),
  paperCount: document.querySelector("#paperCount"),
  bookmarkCount: document.querySelector("#bookmarkCount"),
  verifyCount: document.querySelector("#verifyCount"),
  updatedAt: document.querySelector("#updatedAt"),
  searchInput: document.querySelector("#searchInput"),
  topicFilter: document.querySelector("#topicFilter"),
  yearFilter: document.querySelector("#yearFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  exportCuration: document.querySelector("#exportCuration"),
  paperTemplate: document.querySelector("#paperTemplate"),
  featureModal: document.querySelector("#featureModal"),
  paperModal: document.querySelector("#paperModal"),
  modalEyebrow: document.querySelector("#modalEyebrow"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  paperModalTitle: document.querySelector("#paperModalTitle"),
  paperModalBody: document.querySelector("#paperModalBody")
};

init();

async function init() {
  try {
    const [papersRes, workflowsRes] = await Promise.all([
      fetch("data/papers.json"),
      fetch("data/workflows.json")
    ]);
    const paperPayload = await papersRes.json();
    state.papers = paperPayload.papers || [];
    state.workflows = await workflowsRes.json();
  } catch (err) {
    console.warn("Data load failed:", err);
    state.papers = [];
    state.workflows = { pipeline: [], skills: [] };
  }

  hydrateFilters();
  bindEvents();
  renderAll();
}

function bindEvents() {
  els.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    renderPapers();
  });

  els.topicFilter.addEventListener("change", (e) => {
    state.topic = e.target.value;
    renderPapers();
  });

  els.yearFilter.addEventListener("change", (e) => {
    state.year = e.target.value;
    renderPapers();
  });

  els.statusFilter.addEventListener("change", (e) => {
    state.status = e.target.value;
    renderPapers();
  });

  document.querySelectorAll(".segment").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.view = btn.dataset.view;
      renderPapers();
    });
  });

  els.exportCuration.addEventListener("click", exportCuration);

  els.featureModal.querySelector(".modal-close").addEventListener("click", () => {
    els.featureModal.close();
  });

  els.paperModal.querySelector(".modal-close").addEventListener("click", () => {
    els.paperModal.close();
  });

  els.featureModal.addEventListener("click", (e) => {
    if (e.target === els.featureModal) els.featureModal.close();
  });

  els.paperModal.addEventListener("click", (e) => {
    if (e.target === els.paperModal) els.paperModal.close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      els.featureModal.close();
      els.paperModal.close();
    }
  });
}

function hydrateFilters() {
  const topics = new Set();
  const years = new Set();

  state.papers.forEach((paper) => {
    (paper.topics || []).forEach((t) => topics.add(t));
    if (paper.year) years.add(String(paper.year));
  });

  [...topics].sort().forEach((topic) => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    els.topicFilter.append(opt);
  });

  [...years].sort((a, b) => b.localeCompare(a)).forEach((year) => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    els.yearFilter.append(opt);
  });
}

function renderAll() {
  renderPipeline();
  renderSkills();
  renderPapers();
}

/* ---- Pipeline ---- */

function renderPipeline() {
  els.pipelineList.replaceChildren();
  if (!state.workflows || !state.workflows.pipeline) return;

  state.workflows.pipeline.forEach((step) => {
    const isMandatory = MANDATORY_STAGES.has(step.stage);
    const item = document.createElement("article");
    item.className = "pipeline-step" + (isMandatory ? " mandatory" : "");
    item.innerHTML = `
      <div class="step-index">${escapeHtml(step.stage)}</div>
      <div class="step-body">
        <strong>${escapeHtml(step.name)}</strong>
        <span class="step-agents">${step.agents || "?"} agent${step.agents !== 1 ? "s" : ""}${isMandatory ? " • MANDATORY" : ""}</span>
        <p>${escapeHtml(step.output)}</p>
      </div>
    `;
    item.addEventListener("click", () => openPipelineDetail(step));
    els.pipelineList.append(item);
  });
}

function openPipelineDetail(step) {
  const isMandatory = MANDATORY_STAGES.has(step.stage);
  els.modalEyebrow.textContent = `Pipeline Stage ${step.stage}${isMandatory ? " • MANDATORY" : ""}`;
  els.modalTitle.textContent = step.name;
  els.modalBody.innerHTML = `
    <div class="pipeline-detail-header">
      <div class="pipeline-detail-stage ${isMandatory ? "stage-mandatory" : "stage-normal"}">${escapeHtml(step.stage)}</div>
      <div>
        <strong style="font-size:1.05rem">${escapeHtml(step.name)}</strong>
        <p style="color:var(--muted);font-size:0.82rem;margin-top:4px">${step.agents || "?"} agent${step.agents !== 1 ? "s" : ""}</p>
      </div>
    </div>
    <p style="line-height:1.6;font-size:0.9rem">${escapeHtml(step.detail || step.output)}</p>
    ${step.deliverables ? `
      <h3>Deliverables</h3>
      <ul class="pipeline-deliverables">
        ${step.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
      </ul>
    ` : ""}
  `;
  els.featureModal.showModal();
}

/* ---- Skills / Features ---- */

function renderSkills() {
  els.skillGrid.replaceChildren();
  if (!state.workflows || !state.workflows.skills) return;

  state.workflows.skills.forEach((skill) => {
    const card = document.createElement("article");
    card.className = "skill-card";
    const iconCls = SKILL_ICONS[skill.id] || "ic-dr";
    const iconLabel = SKILL_LABELS[skill.id] || "??";
    card.innerHTML = `
      <div class="skill-icon ${iconCls}">${iconLabel}</div>
      <div>
        <strong>${escapeHtml(skill.name)}</strong>
        <span class="skill-agents">${skill.agents} agent${skill.agents !== 1 ? "s" : ""}</span>
      </div>
      <p>${escapeHtml(skill.description)}</p>
      <div class="mode-row">${(skill.modes || []).slice(0, 4).map((m) => `<span>${escapeHtml(typeof m === "string" ? m : m.name)}</span>`).join("")}</div>
    `;
    card.addEventListener("click", () => openFeatureModal(skill));
    els.skillGrid.append(card);
  });
}

function openFeatureModal(skill) {
  els.modalEyebrow.textContent = "Feature Detail";
  els.modalTitle.textContent = skill.name;

  let body = "";

  // Description
  body += `<p style="line-height:1.6;font-size:0.92rem;margin-bottom:16px">${escapeHtml(skill.description)}</p>`;

  // Agents
  if (skill.agents_detail && skill.agents_detail.length) {
    body += `<h3>Agent Team (${skill.agents_detail.length})</h3>`;
    body += `<ul class="agent-list">${skill.agents_detail.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>`;
  }

  // Modes
  if (skill.modes && skill.modes.length) {
    body += `<h3>Modes</h3>`;
    body += `<ul class="mode-list">${skill.modes.map((m) => {
      const name = typeof m === "string" ? m : m.name;
      const desc = typeof m === "string" ? "" : (m.desc || "");
      return `<li><strong>${escapeHtml(name)}</strong><span>${escapeHtml(desc)}</span></li>`;
    }).join("")}</ul>`;
  }

  // Rubric (Reviewer only)
  if (skill.rubric) {
    body += `<h3>Quality Rubric (0-100)</h3>`;
    body += `<div class="rubric-thresholds">${skill.rubric.thresholds.map((t) => `
      <div class="rubric-threshold rubric-${
        t.label === "Accept" ? "accept" : t.label === "Minor Revision" ? "minor" : t.label === "Major Revision" ? "major" : "reject"
      }">
        <span class="range">${escapeHtml(t.range)}</span>
        <span class="label">${escapeHtml(t.label)}</span>
      </div>
    `).join("")}</div>`;
    if (skill.rubric.dimensions) {
      body += `<ul class="rubric-dimensions">${skill.rubric.dimensions.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`;
    }
  }

  // Checkpoint system (Pipeline only)
  if (skill.checkpoint_system) {
    body += `<h3>Adaptive Checkpoint System</h3>`;
    body += `<div class="checkpoint-levels">${skill.checkpoint_system.levels.map((l) => `
      <div class="checkpoint-level${l.name === "Integrity Checkpoint" ? " mandatory-checkpoint" : ""}">
        <strong>${escapeHtml(l.name)}</strong>
        <span>For: ${escapeHtml(l.for)} &mdash; ${escapeHtml(l.includes)}</span>
      </div>
    `).join("")}</div>`;
  }

  // Deep Research demo
  if (skill.id === "deep-research") {
    body += `
      <h3>Quick Research Demo</h3>
      <div class="research-demo">
        <div class="demo-input-row">
          <input type="text" id="researchDemoInput" placeholder="Enter a research topic, e.g. diffusion policies for dexterous manipulation">
          <button class="demo-btn" id="researchDemoBtn">Search</button>
        </div>
        <div class="demo-results" id="researchDemoResults"></div>
      </div>
    `;
  }

  els.modalBody.innerHTML = body;

  // Wire up research demo
  if (skill.id === "deep-research") {
    setTimeout(() => {
      const input = document.querySelector("#researchDemoInput");
      const btn = document.querySelector("#researchDemoBtn");
      const results = document.querySelector("#researchDemoResults");
      if (input && btn && results) {
        const runDemo = () => {
          const query = input.value.trim();
          if (!query) return;
          const matching = findRelevantPapers(query);
          results.innerHTML = `
            <div class="demo-result-item">
              <div class="step-label">1. Research Question</div>
              <p style="margin:0">Refining: <em>${escapeHtml(query)}</em></p>
            </div>
            <div class="demo-result-item">
              <div class="step-label">2. Search Strategy</div>
              <p style="margin:0">Semantic Scholar + arXiv query constructed. Found <strong>${matching.length}</strong> relevant papers in corpus.</p>
            </div>
            <div class="demo-result-item">
              <div class="step-label">3. Synthesis</div>
              <p style="margin:0">${matching.length > 0
                ? `Top match: <strong>${escapeHtml(matching[0].title)}</strong> (${matching[0].year}). Key topics: ${(matching[0].topics || []).slice(0, 3).join(", ")}.`
                : "No direct matches in current corpus. A full research run would query arXiv and Semantic Scholar APIs for the latest papers."}</p>
            </div>
          `;
        };
        btn.addEventListener("click", runDemo);
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") runDemo(); });
      }
    }, 100);
  }

  els.featureModal.showModal();
}

function findRelevantPapers(query) {
  const q = query.toLowerCase();
  return state.papers.filter((p) => {
    const haystack = [p.title, p.summary, p.venue, ...(p.authors || []), ...(p.topics || [])].join(" ").toLowerCase();
    return haystack.includes(q) || q.split(" ").some((w) => w.length > 3 && haystack.includes(w));
  });
}

/* ---- Papers ---- */

function renderPapers() {
  const papers = filteredPapers();
  els.paperList.className = `paper-list ${state.view === "compact" ? "compact" : ""}`;
  els.paperList.replaceChildren();

  if (!papers.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No papers match the current filters.";
    els.paperList.append(empty);
  }

  papers.forEach((paper) => els.paperList.append(renderPaperCard(paper)));
  updateMetrics(papers);
}

function renderPaperCard(paper) {
  const node = els.paperTemplate.content.firstElementChild.cloneNode(true);
  const meta = node.querySelector(".paper-meta");
  const title = node.querySelector("h3");
  const summary = node.querySelector(".summary");
  const tags = node.querySelector(".tag-row");
  const bookmarkBtn = node.querySelector(".bookmark");
  const verifyBtn = node.querySelector(".verify");
  const link = node.querySelector(".paper-link");

  meta.innerHTML = `
    <span>${escapeHtml(paper.venue || "Source")}</span>
    <span>${escapeHtml(String(paper.year || "n.d."))}</span>
    <span>${escapeHtml((paper.authors || []).slice(0, 3).join(", "))}${(paper.authors || []).length > 3 ? " et al." : ""}</span>
  `;
  title.textContent = paper.title;
  summary.textContent = paper.summary;
  tags.replaceChildren(...(paper.topics || []).map(createTag));

  const bookmarked = state.curation.bookmarks.includes(paper.id);
  const needsVerification = state.curation.verify.includes(paper.id);
  bookmarkBtn.classList.toggle("active", bookmarked);
  verifyBtn.classList.toggle("active", needsVerification);

  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCuration("bookmarks", paper.id);
  });
  verifyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCuration("verify", paper.id);
  });
  link.href = paper.url;

  // Click card to open paper detail
  node.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    openPaperDetail(paper);
  });

  return node;
}

function openPaperDetail(paper) {
  els.paperModalTitle.textContent = paper.title;
  const statusLabel = paper.summaryStatus === "verified" ? "Verified" : "Needs Verification";
  const statusCls = paper.summaryStatus === "verified" ? "tag" : "tag";

  els.paperModalBody.innerHTML = `
    <div class="paper-detail-grid">
      <div class="detail-meta">
        <span class="tag" style="border-color:rgba(55,107,158,0.24);background:rgba(55,107,158,0.08);color:var(--blue)">${escapeHtml(paper.venue || "Source")}</span>
        <span class="tag">${escapeHtml(String(paper.year || "n.d."))}</span>
        <span class="tag ${paper.summaryStatus === "verified" ? "" : ""}" style="${paper.summaryStatus !== "verified" ? "border-color:rgba(176,107,34,0.24);background:rgba(176,107,34,0.08);color:var(--amber)" : ""}">${escapeHtml(statusLabel)}</span>
      </div>
      <p style="font-size:0.82rem;color:var(--muted)">${escapeHtml((paper.authors || []).join(", "))}</p>
      <div class="tag-row">${(paper.topics || []).map(createTag).map((t) => t.outerHTML).join("")}</div>
      <p class="detail-abstract">${escapeHtml(paper.summary)}</p>
      <div class="detail-actions">
        <a class="detail-btn primary" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer">Open Paper</a>
        ${paper.pdfUrl ? `<a class="detail-btn" href="${escapeHtml(paper.pdfUrl)}" target="_blank" rel="noreferrer">Download PDF</a>` : ""}
        <button class="detail-btn" id="detailBookmark">${state.curation.bookmarks.includes(paper.id) ? "Unbookmark" : "Bookmark"}</button>
        <button class="detail-btn" id="detailVerify">${state.curation.verify.includes(paper.id) ? "Clear Verification" : "Mark for Verification"}</button>
      </div>
    </div>
  `;

  setTimeout(() => {
    const bmBtn = document.querySelector("#detailBookmark");
    const vfBtn = document.querySelector("#detailVerify");
    if (bmBtn) bmBtn.addEventListener("click", () => {
      toggleCuration("bookmarks", paper.id);
      els.paperModal.close();
    });
    if (vfBtn) vfBtn.addEventListener("click", () => {
      toggleCuration("verify", paper.id);
      els.paperModal.close();
    });
  }, 50);

  els.paperModal.showModal();
}

function createTag(text) {
  const tag = document.createElement("span");
  tag.className = "tag";
  const lowered = text.toLowerCase();
  if (["vla", "vision-language-action"].some((k) => lowered.includes(k))) tag.className += " vla";
  if (["reinforcement learning", "rl"].some((k) => lowered.includes(k))) tag.className += " rl";
  if (["foundation model", "llm"].some((k) => lowered.includes(k))) tag.className += " fm";
  tag.textContent = text;
  return tag;
}

function filteredPapers() {
  return state.papers.filter((paper) => {
    const haystack = [
      paper.title,
      paper.summary,
      paper.venue,
      ...(paper.authors || []),
      ...(paper.topics || [])
    ].join(" ").toLowerCase();

    const matchesQuery = !state.query || state.query.split(/\s+/).every((w) => haystack.includes(w));
    const matchesTopic = state.topic === "all" || (paper.topics || []).includes(state.topic);
    const matchesYear = state.year === "all" || String(paper.year) === state.year;
    const matchesStatus =
      state.status === "all" ||
      (state.status === "bookmarked" && state.curation.bookmarks.includes(paper.id)) ||
      (state.status === "verify" && state.curation.verify.includes(paper.id));

    return matchesQuery && matchesTopic && matchesYear && matchesStatus;
  });
}

function updateMetrics(filtered) {
  els.paperCount.textContent = filtered.length;
  els.bookmarkCount.textContent = state.curation.bookmarks.length;
  els.verifyCount.textContent = state.curation.verify.length;

  const dates = state.papers
    .map((p) => p.fetchedAt || p.publishedAt)
    .filter(Boolean)
    .sort()
    .reverse();
  els.updatedAt.textContent = dates[0] ? new Date(dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "--";
}

function toggleCuration(bucket, paperId) {
  const set = new Set(state.curation[bucket]);
  if (set.has(paperId)) {
    set.delete(paperId);
  } else {
    set.add(paperId);
  }
  state.curation[bucket] = [...set];
  saveCuration();
  renderPapers();
}

function exportCuration() {
  const payload = {
    exportedAt: new Date().toISOString(),
    bookmarks: state.curation.bookmarks,
    verify: state.curation.verify,
    papers: state.papers.filter((p) =>
      state.curation.bookmarks.includes(p.id) || state.curation.verify.includes(p.id)
    )
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "auto-research-curation.json";
  a.click();
  URL.revokeObjectURL(url);
}

function loadCuration() {
  try {
    const raw = localStorage.getItem("autoResearchCuration");
    if (!raw) return { bookmarks: [], verify: [] };
    const parsed = JSON.parse(raw);
    return {
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      verify: Array.isArray(parsed.verify) ? parsed.verify : []
    };
  } catch {
    return { bookmarks: [], verify: [] };
  }
}

function saveCuration() {
  localStorage.setItem("autoResearchCuration", JSON.stringify(state.curation));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
