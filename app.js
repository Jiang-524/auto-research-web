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
  paperTemplate: document.querySelector("#paperTemplate")
};

init();

async function init() {
  const [papersResponse, workflowsResponse] = await Promise.all([
    fetch("data/papers.json"),
    fetch("data/workflows.json")
  ]);

  const paperPayload = await papersResponse.json();
  state.papers = paperPayload.papers || [];
  state.workflows = await workflowsResponse.json();

  hydrateFilters();
  bindEvents();
  renderAll();
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderPapers();
  });

  els.topicFilter.addEventListener("change", (event) => {
    state.topic = event.target.value;
    renderPapers();
  });

  els.yearFilter.addEventListener("change", (event) => {
    state.year = event.target.value;
    renderPapers();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    renderPapers();
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.view = button.dataset.view;
      renderPapers();
    });
  });

  els.exportCuration.addEventListener("click", exportCuration);
}

function hydrateFilters() {
  const topics = new Set();
  const years = new Set();

  state.papers.forEach((paper) => {
    (paper.topics || []).forEach((topic) => topics.add(topic));
    if (paper.year) years.add(String(paper.year));
  });

  [...topics].sort().forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    els.topicFilter.append(option);
  });

  [...years].sort((a, b) => b.localeCompare(a)).forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    els.yearFilter.append(option);
  });
}

function renderAll() {
  renderPipeline();
  renderSkills();
  renderPapers();
}

function renderPipeline() {
  els.pipelineList.replaceChildren();
  state.workflows.pipeline.forEach((step) => {
    const item = document.createElement("article");
    item.className = "pipeline-step";
    item.innerHTML = `
      <div class="step-index">${step.stage}</div>
      <div class="step-body">
        <strong>${escapeHtml(step.name)}</strong>
        <p>${escapeHtml(step.output)}</p>
      </div>
    `;
    els.pipelineList.append(item);
  });
}

function renderSkills() {
  els.skillGrid.replaceChildren();
  state.workflows.skills.forEach((skill) => {
    const card = document.createElement("article");
    card.className = "skill-card";
    const modes = skill.modes.map((mode) => `<span>${escapeHtml(mode)}</span>`).join("");
    card.innerHTML = `
      <strong>${escapeHtml(skill.name)}</strong>
      <p>${escapeHtml(skill.description)}</p>
      <div class="mode-row">${modes}</div>
    `;
    els.skillGrid.append(card);
  });
}

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
  const bookmark = node.querySelector(".bookmark");
  const verify = node.querySelector(".verify");
  const link = node.querySelector(".paper-link");

  meta.innerHTML = `
    <span>${escapeHtml(paper.venue || "Source")}</span>
    <span>${escapeHtml(String(paper.year || "n.d."))}</span>
    <span>${escapeHtml((paper.authors || []).slice(0, 3).join(", "))}</span>
  `;
  title.textContent = paper.title;
  summary.textContent = paper.summary;
  tags.replaceChildren(...(paper.topics || []).map(createTag));

  const bookmarked = state.curation.bookmarks.includes(paper.id);
  const needsVerification = state.curation.verify.includes(paper.id);
  bookmark.classList.toggle("active", bookmarked);
  verify.classList.toggle("active", needsVerification);

  bookmark.addEventListener("click", () => toggleCuration("bookmarks", paper.id));
  verify.addEventListener("click", () => toggleCuration("verify", paper.id));
  link.href = paper.url;

  return node;
}

function createTag(text) {
  const tag = document.createElement("span");
  tag.className = "tag";
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

    const matchesQuery = !state.query || haystack.includes(state.query);
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
    .map((paper) => paper.fetchedAt || paper.publishedAt)
    .filter(Boolean)
    .sort()
    .reverse();
  els.updatedAt.textContent = dates[0] ? new Date(dates[0]).toLocaleDateString() : "--";
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
    papers: state.papers.filter((paper) =>
      state.curation.bookmarks.includes(paper.id) || state.curation.verify.includes(paper.id)
    )
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "auto-research-curation.json";
  link.click();
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

