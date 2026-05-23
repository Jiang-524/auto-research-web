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
  llmStatus: null,
  lang: loadJSON("autoResearchLang", null) || "en"
};

// ---- i18n Translations ----
const T = {
  en: {
    dashboard: "Dashboard", collector: "Paper Collector", summarizer: "Paper Summarizer",
    research: "Deep Research", ideas: "Idea Generator", writer: "Paper Writer",
    reviewer: "Paper Reviewer", pipeline: "Pipeline", citation: "Citation Tools",
    export: "Export Center", docs: "Docs / Guide", settings: "Settings",
    runResearch: "Run Research", runWriter: "Run Writer", runReview: "Run Review",
    summarize: "Summarize", generateIdeas: "Generate Ideas", run: "Run",
    copy: "Copy", exportLabel: "Export", retry: "Retry",
    loading: "Loading...", noData: "No data yet.",
    apiRequired: "API Required", implemented: "Implemented", planned: "Planned",
    saveSettings: "Save Reference Settings",
    search: "Search", allTopics: "All topics", allYears: "All years", allStates: "All states",
    bookmarked: "Bookmarked", needsVerification: "Needs verification",
    papers: "Papers", updated: "Updated",
    quickActions: "Quick Actions", researchWorkflow: "Research Workflow",
    featuresGlance: "Features at a Glance",
    dashboardEyebrow: "research workspace", dashboardTitle: "Research Workspace",
    apiConnected: "Connected", apiNotSet: "Not Set", apiStatus: "API Status",
    recentTasks: "Recent Tasks",
    collectPapers: "Collect Papers", summarizePaper: "Summarize Paper",
    startResearch: "Start Research", generateIdeasBtn: "Generate Ideas",
    writePaper: "Write Paper", reviewPaper: "Review Paper",
    apiNotConfigured: "LLM not configured. Set LLM_API_KEY in .env file.",
    provideText: "Provide text or select a paper",
    provideTopic: "Enter a research topic",
    provideContent: "Provide content to work with",
    providePaper: "Provide paper content to review",
    provideTextCitation: "Provide text to process",
    provideContentExport: "Provide content to export",
    settingsDesc: "Configure your LLM provider. API keys are configured server-side in the .env file and never exposed to the browser. See the Docs page for setup instructions.",
    serverSideConfig: "LLM Provider (Server-Side Configuration)",
    settingsNote: "These settings are saved to localStorage for UI reference only. The actual API key must be set in the .env file on the backend server.",
    securityNotes: "Security Notes",
    securityItem1: "This page never asks for or stores API keys in browser storage.",
    securityItem2: "For a secure setup, run the backend server (node server.js) and configure .env instead.",
    securityItem3: "Never commit .env or any file containing real API keys to git.",
    securityItem4: "See .env.example for the required environment variables.",
    checkApiStatus: "Check API Status",
    apiCheckRunning: "Checking...",
    apiCheckOk: "Connected",
    apiCheckFail: "Not configured - set LLM_API_KEY in the backend .env file",
    apiCheckError: "Cannot reach API server. Is the backend running? (node server.js)",
    currentApiStatus: "Current API Status",
    exportAsMd: "Export as Markdown", exportAsJson: "Export as JSON",
    exportAsText: "Export as Plain Text", exportAsLatex: "Export as LaTeX",
    exportAsBibtex: "Export as BibTeX",
    quickExportCuration: "Quick Export: Curated Papers",
    quickExportDesc: "Export your bookmarked and verification-flagged papers.",
    exportCurationBtn: "Export Curation (JSON)",
    formatSupport: "Format Support",

    // DeepSeek V4 Pro specific
    deepseekV4Title: "DeepSeek V4 Pro Configuration",
    deepseekV4Desc: "DeepSeek V4 Pro is a recommended provider for this application. It offers strong academic reasoning capabilities at competitive pricing.",
    deepseekV4Config: `To use DeepSeek V4 Pro, configure your .env file as follows:

LLM_PROVIDER=deepseek
LLM_API_KEY=your-deepseek-key
LLM_MODEL=deepseek-v4-pro
LLM_BASE_URL=https://api.deepseek.com

# Optional: adjust temperature for academic tasks
DEFAULT_TEMPERATURE=0.3
DEFAULT_MAX_TOKENS=8192

Then run: npm start`,

    // Pipeline entry modes
    pipelineEntryTitle: "Pipeline Entry Modes",
    pipelineEntryDesc: "Start the pipeline at different stages depending on your starting point.",
    fullPipeline: "Full Pipeline (from Research)",
    fullPipelineDesc: "Start from a research question. Run Stage 1 Deep Research, then proceed through all stages.",
    paperReviewEntry: "Existing Paper Review Entry",
    paperReviewEntryDesc: "Already have a draft? Enter at Stage 3 to get a multi-perspective peer review.",
    reviewerCommentsEntry: "Reviewer Comments Entry",
    reviewerCommentsEntryDesc: "Have reviewer feedback? Enter at Stage 4 to revise your paper with coaching.",
    resumePassport: "Resume from Passport",
    resumePassportDesc: "Resume an interrupted session from a Material Passport. Planned feature.",

    // Manual entry
    manualEntry: "Manual Entry",
    addPaper: "Add Paper",
    titleRequired: "Title is required",
    paperAdded: "Paper added to collection!",
    myCollection: "My Collection",
    searchImport: "Search & Import",
    collectorSearchPlaceholder: "Topic, DOI, arXiv ID, URL, or keywords...",
    realApiNote: "Real API search (arXiv, Semantic Scholar) requires backend integration. Currently searches local corpus.",
    paperAddedToast: "Paper added to collection!",
    removed: "Removed",

    // Bridge & Runtime modes
    runtimeMode: "Runtime Mode", bridgeStatus: "Local Bridge Status",
    staticDemo: "Static Demo", personalHybrid: "Personal Hybrid", cloudApi: "Cloud API",
    connected: "Connected", notConnected: "Not Connected",
    bridgeEndpoint: "Bridge Endpoint", checkConnection: "Check Connection",
    lastCheck: "Last Check", paperLibraryPath: "Paper Library Path",
    dbPath: "Database Path", outputPath: "Output Path",
    privacyNote: "Private files and API keys stay on your machine.",
    startBridge1: "1. Start the local bridge.",
    startBridge2: "2. Make sure .env.local is configured.",
    startBridge3: "3. Confirm paper directory: E:/paper.",
    startBridge4: "4. Confirm database path.",
    startBridge5: "5. Click Check Connection.",

    // Paper Library
    paperLibrary: "Paper Library", scanFolder: "Scan Folder",
    importSelected: "Import Selected", reindex: "Rebuild Index",
    foundPapers: "Found Papers", newPapers: "New Papers",
    existingPapers: "Existing Papers", paperDetail: "Paper Detail",
    addNote: "Add Note", summarizePaper: "Summarize Paper",
    noPaperSelected: "No paper selected.",

    // Workspace
    workspace: "Workspace", projectManager: "Project Manager",
    fileTree: "File Tree", projectMemory: "Project Memory",
    gitStatus: "Git Status", readFile: "Read File",
    writeFile: "Write File", refreshMemory: "Refresh Memory",
    generateClaude: "Generate Claude Code Instruction",
    generateCodex: "Generate Codex Review Instruction",
    moreComing: "More features coming soon.",

    // Page eyebrow + title + description
    collectorEyebrow: "collector", collectorTitle: "Paper Collector",
    collectorDesc: "Search and import papers by topic, DOI, URL, arXiv ID, or manual entry.",
    summarizerEyebrow: "summarizer", summarizerTitle: "Paper Summarizer",
    summarizerDesc: "Submit a paper for structured AI summarization. Extracts contribution, method, experiments, results, limitations, key claims, and citation candidates.",
    researchEyebrow: "deep research", researchTitle: "Deep Research",
    researchDesc: "Multi-agent research investigation with 13 specialized agents covering question refinement, search strategy, literature retrieval, quality assessment, data extraction, synthesis, bias checking, and source verification.",
    ideasEyebrow: "idea generator", ideasTitle: "Idea Generator",
    ideasDesc: "Generate research gaps, possible ideas, rank by novelty/feasibility/risk/resource/contribution, create experiment plans, and draft paper titles and hypotheses.",
    writerEyebrow: "paper writer", writerTitle: "Academic Paper Writer",
    writerDesc: "12-agent paper writing pipeline with style calibration, writing quality check, LaTeX hardening, visualization, revision coaching, citation conversion, and disclosure support.",
    reviewerEyebrow: "reviewer", reviewerTitle: "Academic Paper Reviewer",
    reviewerDesc: "7-agent multi-perspective peer review simulating a 5-person editorial board. 0-100 quality rubric with anti-sycophancy mechanism.",
    pipelineEyebrow: "pipeline", pipelineTitle: "Academic Pipeline Orchestrator",
    pipelineDesc: "10-stage pipeline from RESEARCH through FINALIZE. Mandatory integrity gates at stages 2.5 and 4.5.",
    citationEyebrow: "citation tools", citationTitle: "Citation & Integrity Tools",
    citationDesc: "Citation format conversion, claim-support checking, BibTeX helper, and hallucination risk detection. Note: model-assisted verification is not a guarantee.",
    exportEyebrow: "export", exportTitle: "Export Center",
    exportDesc: "Export research results in Markdown, JSON, Plain Text, LaTeX, BibTeX. DOCX/PDF planned (requires Pandoc/Tectonic).",
    settingsEyebrow: "configuration", settingsTitle: "API Configuration",
    docsEyebrow: "documentation", docsTitle: "Docs & Usage Guide",
    docsDesc: "How to set up, configure, and use each module of Auto Research Web.",

    // Module card headings
    inputHeading: "Input", modeHeading: "Mode",
    researchTopicHeading: "Research Topic",
    contentDraftHeading: "Content / Draft / Notes",
    additionalOptions: "Additional Options",
    paperToReviewHeading: "Paper to Review",
    actionHeading: "Action",
    contentToExport: "Content to Export",
    selectPaperPrompt: "Select a paper from collection or paste text:",
    pasteTextPlaceholder: "Or paste paper text / abstract here...",
    researchTopicPlaceholder: "Enter your research topic or question...",
    contextOptional: "Additional Context (optional)",
    constraintsOptional: "Constraints (optional)",
    ideasTopicPlaceholder: "e.g. diffusion policies for dexterous manipulation",
    ideasContextPlaceholder: "Paste paper summaries, research notes, or constraints...",
    ideasConstraintsPlaceholder: "e.g. limited compute, must use real robots, within 6 months",
    writerContentPlaceholder: "Paste your research notes, draft, outline, or paper content...",
    specialInstructions: "Special Instructions",
    instructionsPlaceholder: "Any specific guidance...",
    feedbackReviewerComments: "Feedback / Reviewer Comments",
    feedbackPlaceholder: "Paste reviewer comments for revision mode...",
    targetFormatLabel: "Target Format",
    reviewerInputPlaceholder: "Paste the full paper text, draft, or sections to review...",
    citationInputPlaceholder: "Paste text, citations, or paper content...",
    exportContentPlaceholder: "Paste content to export...",
    sourceFormat: "Source Format", targetFormat: "Target Format",

    // Docs page sections
    docsInstallation: "Installation",
    docsApiConfig: "API Configuration",
    docsDualModelTitle: "Pro / Flash Dual-Model System",
    docsProModelTitle: "Pro Model (deepseek-v4-pro)",
    docsProModelDesc: "Used for deep thinking tasks: research, paper writing, peer review, idea generation, detailed summarization, claim verification, and hallucination checks. Higher temperature (0.3-0.4), larger context (8192 tokens).",
    docsFlashModelTitle: "Flash Model (deepseek-v4-flash)",
    docsFlashModelDesc: "Used for fast, low-cost tasks: paper search, rough reading, simple translation, citation format conversion, and BibTeX generation. Low temperature (0.1), smaller context (2048 tokens), faster and cheaper.",
    docsDualModelNote: "Configure in .env: LLM_FLASH_MODEL, LLM_FLASH_TEMPERATURE, LLM_FLASH_MAX_TOKENS. The pro model uses LLM_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS.",
    docsModuleGuide: "Module Guide",
    docsDeployment: "Deployment",
    docsSecurity: "Security",
    docsLimitations: "Known Limitations",
    docsLicense: "License & Attribution",
    docsInstallCode: `git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
cp .env.example .env
# Edit .env with your LLM_API_KEY
npm start`,
    docsInstallNote: "Open http://localhost:3000 in your browser.",
    docsDeploymentText: "GitHub Pages (static): Push the repository. Non-LLM features work without a backend. Full (with LLM): Deploy the Express server to Railway, Render, Fly.io, or a VPS. Set environment variables on the host.",
    docsSecurityText1: "API keys are stored only in .env on the backend server",
    docsSecurityText2: "The frontend only calls /api/* routes",
    docsSecurityText3: ".env is in .gitignore and never committed",
    docsSecurityText4: "Always use the backend server (npm start) for LLM features",
    docsSecurityText5: "All LLM results: model-assisted output must be verified by a human",
    docsLimitation1: "arXiv/Semantic Scholar real-time search not yet integrated into web UI (Python script in scripts/)",
    docsLimitation2: "DOCX export requires Pandoc; PDF requires Tectonic/LaTeX",
    docsLimitation3: "No automated test framework yet",
    docsLimitation4: "GitHub Pages cannot run Express backend; LLM features require deployed backend",
    docsLicenseText: "Licensed under CC BY-NC 4.0. Based on Academic Research Skills by Cheng-I Wu, also CC BY-NC 4.0. Visual web implementation inspired by ARS workflow concepts - not the original ARS project.",
    docsModuleDashboard: "Overview, metrics, quick actions, API status. Click any feature card to jump to that tool.",
    docsModuleCollector: "Search local corpus by keyword. Add papers manually with title, authors, year, venue, URL, topics, abstract.",
    docsModuleSummarizer: "Select a paper or paste text. LLM extracts: contribution, method, experiments, results, limitations, key claims, citation candidates.",
    docsModuleResearch: "7 modes: full, quick, systematic-review (PRISMA), socratic, fact-check, lit-review, research review. Each mode has a distinct LLM prompt.",
    docsModuleIdeas: "Generate research gaps, ranked ideas (novelty/feasibility/risk/resources/contribution), experiment plans, paper titles, hypotheses.",
    docsModuleWriter: "10 modes: full draft, plan, outline, abstract, lit-review, revision, revision coach, format conversion, citation check, AI disclosure.",
    docsModuleReviewer: "6 modes with 0-100 rubric. Simulates editorial board with Editor-in-Chief, methodology, domain, interdisciplinary reviewers, and Devil's Advocate.",
    docsModulePipeline: "10-stage orchestrator with mandatory integrity gates at 2.5 and 4.5. Entry modes: full pipeline, paper review, reviewer comments, resume from passport.",
    docsModuleCitation: "Format conversion (APA/MLA/IEEE/Chicago/Vancouver/BibTeX), claim-support check, BibTeX helper, hallucination risk detection.",
    docsModuleExport: "Export as Markdown, JSON, Plain Text, LaTeX, BibTeX. DOCX/PDF planned (requires Pandoc/Tectonic).",

    // Misc UI
    reviewerRubricTitle: "Review Rubric (0-100)",
    workflowDataError: "Workflow data not loaded.",
    openTool: "Open Tool",
    openPaper: "Open Paper", downloadPdf: "Download PDF",
    unbookmark: "Unbookmark", bookmark: "Bookmark",
    markVerification: "Mark for Verification", clearVerification: "Clear Verification",
    noMatches: "No papers match the current filters.",
    noPapersCollection: "No papers in collection yet. Search or add papers above.",
    importArxivPlanned: "Import from arXiv (API planned)",
    adaptFromArs: "Adapted from academic-research-skills",
    sidebarEyebrow: "auto research",
    arsAttribution: "Based on ARS by",
    researchWorkflowLabel: "Click Pipeline for the full 10-stage view.",
    collectorTitle2: "My Collection",
    foundPapersPrefix: "Found papers in local corpus:",
    noMatchesArxiv: 'No matches in local corpus.',
    reviewerRubricNote: "Model-assisted verification is not a guarantee. Always independently verify critical citations.",
    cloudApiConfigNote: "API Configuration for Cloud API mode.",
    personalHybridNote: "Configure local bridge endpoint and paths.",
  },
  zh: {
    dashboard: "仪表盘", collector: "论文收集器", summarizer: "论文总结器",
    research: "深度研究", ideas: "思路生成器", writer: "论文写作",
    reviewer: "论文审稿", pipeline: "流水线", citation: "引文工具",
    export: "导出中心", docs: "文档/指南", settings: "设置",
    runResearch: "运行研究", runWriter: "运行写作", runReview: "运行审稿",
    summarize: "总结", generateIdeas: "生成思路", run: "运行",
    copy: "复制", exportLabel: "导出", retry: "重试",
    loading: "加载中...", noData: "暂无数据。",
    apiRequired: "需要API", implemented: "已实现", planned: "计划中",
    saveSettings: "保存参考设置",
    search: "搜索", allTopics: "全部主题", allYears: "全部年份", allStates: "全部状态",
    bookmarked: "已收藏", needsVerification: "需要验证",
    papers: "论文", updated: "更新时间",
    quickActions: "快捷操作", researchWorkflow: "研究工作流",
    featuresGlance: "功能一览",
    dashboardEyebrow: "研究工作区", dashboardTitle: "研究工作区",
    apiConnected: "已连接", apiNotSet: "未设置", apiStatus: "API状态",
    recentTasks: "最近任务",
    collectPapers: "收集论文", summarizePaper: "总结论文",
    startResearch: "开始研究", generateIdeasBtn: "生成思路",
    writePaper: "写论文", reviewPaper: "审稿论文",
    apiNotConfigured: "LLM未配置。请在.env文件中设置LLM_API_KEY。",
    provideText: "请提供文本或选择论文",
    provideTopic: "请输入研究主题",
    provideContent: "请提供要处理的内容",
    providePaper: "请提供要审稿的论文内容",
    provideTextCitation: "请提供要处理的文本",
    provideContentExport: "请提供要导出的内容",
    settingsDesc: "配置您的LLM提供商。API密钥在服务器端的.env文件中配置，绝不会暴露给浏览器。请参阅文档页面了解设置说明。",
    serverSideConfig: "LLM提供商（服务器端配置）",
    settingsNote: "这些设置仅保存到localStorage作为UI参考。实际的API密钥必须在后端服务器的.env文件中设置。",
    securityNotes: "安全说明",
    securityItem1: "此页面不会请求或将API密钥存储在浏览器存储中。",
    securityItem2: "为了安全设置，请运行后端服务器（node server.js）并在.env中配置。",
    securityItem3: "切勿将.env或任何包含真实API密钥的文件提交到git。",
    securityItem4: "请参阅.env.example了解所需的环境变量。",
    checkApiStatus: "检查API状态",
    apiCheckRunning: "检查中...",
    apiCheckOk: "已连接",
    apiCheckFail: "未配置 - 请在后端.env文件中设置LLM_API_KEY",
    apiCheckError: "无法连接到API服务器。后端是否正在运行？（node server.js）",
    currentApiStatus: "当前API状态",
    exportAsMd: "导出为Markdown", exportAsJson: "导出为JSON",
    exportAsText: "导出为纯文本", exportAsLatex: "导出为LaTeX",
    exportAsBibtex: "导出为BibTeX",
    quickExportCuration: "快速导出：已策划论文",
    quickExportDesc: "导出您已收藏和标记为验证的论文。",
    exportCurationBtn: "导出策划（JSON）",
    formatSupport: "格式支持",

    // DeepSeek V4 Pro specific
    deepseekV4Title: "DeepSeek V4 Pro 配置",
    deepseekV4Desc: "DeepSeek V4 Pro 是本应用的推荐提供商。它以有竞争力的价格提供强大的学术推理能力。",
    deepseekV4Config: `要使用 DeepSeek V4 Pro，请在 .env 文件中配置如下：

LLM_PROVIDER=deepseek
LLM_API_KEY=您的deepseek密钥
LLM_MODEL=deepseek-v4-pro
LLM_BASE_URL=https://api.deepseek.com

# 可选：为学术任务调整temperature
DEFAULT_TEMPERATURE=0.3
DEFAULT_MAX_TOKENS=8192

然后运行：npm start`,

    // Pipeline entry modes
    pipelineEntryTitle: "流水线入口模式",
    pipelineEntryDesc: "根据您的起点，在不同的阶段开始流水线。",
    fullPipeline: "完整流水线（从研究开始）",
    fullPipelineDesc: "从研究问题开始。运行第1阶段深度研究，然后依次进行所有阶段。",
    paperReviewEntry: "已有论文审稿入口",
    paperReviewEntryDesc: "已有草稿？从第3阶段进入，获取多视角同行评审。",
    reviewerCommentsEntry: "审稿意见入口",
    reviewerCommentsEntryDesc: "已有审稿意见？从第4阶段进入，在指导下修改论文。",
    resumePassport: "从材料护照恢复",
    resumePassportDesc: "从材料护照恢复中断的会话。计划中的功能。",

    // Manual entry
    manualEntry: "手动录入",
    addPaper: "添加论文",
    titleRequired: "标题为必填项",
    paperAdded: "论文已添加到集合中！",
    myCollection: "我的集合",
    searchImport: "搜索与导入",
    collectorSearchPlaceholder: "主题、DOI、arXiv ID、URL或关键词...",
    realApiNote: "真实API搜索（arXiv、Semantic Scholar）需要后端集成。目前仅搜索本地语料库。",
    paperAddedToast: "论文已添加到集合中！",
    removed: "已移除",

    // Bridge & Runtime modes
    runtimeMode: "运行时模式", bridgeStatus: "本地桥接状态",
    staticDemo: "静态演示", personalHybrid: "个人混合模式", cloudApi: "云端API",
    connected: "已连接", notConnected: "未连接",
    bridgeEndpoint: "桥接端点", checkConnection: "检查连接",
    lastCheck: "最近检查", paperLibraryPath: "论文库路径",
    dbPath: "数据库路径", outputPath: "输出路径",
    privacyNote: "隐私说明：私密文件和API密钥保留在您的本地机器上。",
    startBridge1: "1. 启动本地桥接。",
    startBridge2: "2. 确认 .env.local 已配置。",
    startBridge3: "3. 确认论文目录：E:/paper。",
    startBridge4: "4. 确认数据库路径正确。",
    startBridge5: "5. 点击检查连接。",

    // Paper Library
    paperLibrary: "论文库", scanFolder: "扫描文件夹",
    importSelected: "导入选中", reindex: "重建索引",
    foundPapers: "发现论文", newPapers: "新论文",
    existingPapers: "已有论文", paperDetail: "论文详情",
    addNote: "添加备注", summarizePaper: "总结论文",
    noPaperSelected: "未选择论文",

    // Workspace
    workspace: "工作区", projectManager: "项目管理器",
    fileTree: "文件树", projectMemory: "项目记忆",
    gitStatus: "Git状态", readFile: "读取文件",
    writeFile: "写入文件", refreshMemory: "刷新记忆",
    generateClaude: "生成 Claude Code 指令",
    generateCodex: "生成 Codex 审稿指令",
    moreComing: "更多功能即将推出。",

    // Page eyebrow + title + description
    collectorEyebrow: "收集器", collectorTitle: "论文收集器",
    collectorDesc: "按主题、DOI、URL、arXiv ID或手动元数据搜索和导入论文。",
    summarizerEyebrow: "总结器", summarizerTitle: "论文总结器",
    summarizerDesc: "提交论文进行结构化AI总结。提取贡献、方法、实验、结果、局限性、关键声明和引用候选。",
    researchEyebrow: "深度研究", researchTitle: "深度研究",
    researchDesc: "13个专业智能体的多智能体研究调查，涵盖问题细化、搜索策略、文献检索、质量评估、数据提取、综合、偏差检查和来源验证。",
    ideasEyebrow: "思路生成", ideasTitle: "思路生成器",
    ideasDesc: "生成研究空白、可能的想法，按新颖性/可行性/风险/资源/贡献排名，创建实验计划，起草论文标题和假设。",
    writerEyebrow: "论文写作", writerTitle: "学术论文写作器",
    writerDesc: "12智能体论文写作流水线，包含风格校准、写作质量检查、LaTeX加固、可视化、修改指导、引用转换和披露支持。",
    reviewerEyebrow: "审稿", reviewerTitle: "学术论文审稿器",
    reviewerDesc: "7智能体多视角同行评审，模拟5人编辑委员会。0-100质量评分标准，具备反谄媚机制。",
    pipelineEyebrow: "流水线", pipelineTitle: "学术流水线编排器",
    pipelineDesc: "从研究到最终定稿的10阶段流水线。第2.5和4.5阶段为强制性完整性检查关卡。",
    citationEyebrow: "引文工具", citationTitle: "引文与完整性工具",
    citationDesc: "引文格式转换、声明支持检查、BibTeX助手和幻觉风险检测。注意：模型辅助验证并非保证。",
    exportEyebrow: "导出", exportTitle: "导出中心",
    exportDesc: "以Markdown、JSON、纯文本、LaTeX、BibTeX格式导出研究成果。DOCX/PDF计划中（需要Pandoc/Tectonic）。",
    settingsEyebrow: "配置", settingsTitle: "API配置",
    docsEyebrow: "文档", docsTitle: "文档与使用指南",
    docsDesc: "如何设置、配置和使用Auto Research Web的每个模块。",

    // Module card headings
    inputHeading: "输入", modeHeading: "模式",
    researchTopicHeading: "研究主题",
    contentDraftHeading: "内容 / 草稿 / 笔记",
    additionalOptions: "附加选项",
    paperToReviewHeading: "待审论文",
    actionHeading: "操作",
    contentToExport: "要导出的内容",
    selectPaperPrompt: "从集合中选择论文或粘贴文本：",
    pasteTextPlaceholder: "或在此粘贴论文文本/摘要...",
    researchTopicPlaceholder: "输入您的研究主题或问题...",
    contextOptional: "附加背景（可选）",
    constraintsOptional: "约束条件（可选）",
    ideasTopicPlaceholder: "例如：用于灵巧操作的扩散策略",
    ideasContextPlaceholder: "粘贴论文摘要、研究笔记或约束条件...",
    ideasConstraintsPlaceholder: "例如：有限计算资源，必须使用真实机器人，6个月内完成",
    writerContentPlaceholder: "粘贴您的研究笔记、草稿、大纲或论文内容...",
    specialInstructions: "特殊说明",
    instructionsPlaceholder: "任何具体指导...",
    feedbackReviewerComments: "反馈 / 审稿意见",
    feedbackPlaceholder: "为修改模式粘贴审稿意见...",
    targetFormatLabel: "目标格式",
    reviewerInputPlaceholder: "粘贴完整的论文文本、草稿或要审阅的章节...",
    citationInputPlaceholder: "粘贴文本、引文或论文内容...",
    exportContentPlaceholder: "粘贴要导出的内容...",
    sourceFormat: "源格式", targetFormat: "目标格式",

    // Docs page sections
    docsInstallation: "安装",
    docsApiConfig: "API配置",
    docsDualModelTitle: "Pro / Flash 双模型系统",
    docsProModelTitle: "Pro 模型（deepseek-v4-pro）",
    docsProModelDesc: "用于深度思考任务：研究、论文写作、同行评审、想法生成、详细总结、声明验证和幻觉检查。建议较高 temperature（0.3-0.4）和更大上下文（8192 tokens）。",
    docsFlashModelTitle: "Flash 模型（deepseek-v4-flash）",
    docsFlashModelDesc: "用于快速低成本任务：论文搜索、粗读、简单翻译、引用格式转换和 BibTeX 生成。低 temperature（0.1）、较小上下文（2048 tokens），更快更便宜。",
    docsDualModelNote: "在 .env 中配置：LLM_FLASH_MODEL、LLM_FLASH_TEMPERATURE、LLM_FLASH_MAX_TOKENS。Pro 模型使用 LLM_MODEL、DEFAULT_TEMPERATURE、DEFAULT_MAX_TOKENS。",
    docsModuleGuide: "模块指南",
    docsDeployment: "部署",
    docsSecurity: "安全",
    docsLimitations: "已知限制",
    docsLicense: "许可与归属",
    docsInstallCode: `git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
cp .env.example .env
# 在.env中编辑您的LLM_API_KEY
npm start`,
    docsInstallNote: "在浏览器中打开 http://localhost:3000。",
    docsDeploymentText: "GitHub Pages（静态）：推送仓库。非LLM功能无需后端即可工作。完整版（含LLM）：将Express服务器部署到Railway、Render、Fly.io或VPS。在主机上设置环境变量。",
    docsSecurityText1: "API密钥仅存储在后端服务器的.env文件中",
    docsSecurityText2: "前端仅调用/api/*路由",
    docsSecurityText3: ".env在.gitignore中，永不提交",
    docsSecurityText4: "LLM功能请始终使用后端服务器（npm start）",
    docsSecurityText5: "所有LLM结果：模型辅助输出必须由人工验证",
    docsLimitation1: "arXiv/Semantic Scholar实时搜索尚未集成到Web界面（scripts/中有Python脚本）",
    docsLimitation2: "DOCX导出需要Pandoc；PDF需要Tectonic/LaTeX",
    docsLimitation3: "尚未有自动化测试框架",
    docsLimitation4: "GitHub Pages无法运行Express后端；LLM功能需要部署后端",
    docsLicenseText: "基于CC BY-NC 4.0许可。基于Cheng-I Wu的Academic Research Skills，同样采用CC BY-NC 4.0许可。此为受ARS工作流概念启发的可视化Web实现——并非原始ARS项目。",
    docsModuleDashboard: "概览、指标、快捷操作、API状态。点击任意功能卡片跳转到对应工具。",
    docsModuleCollector: "按关键词搜索本地语料库。手动添加论文，包含标题、作者、年份、会议/期刊、URL、主题、摘要。",
    docsModuleSummarizer: "选择论文或粘贴文本。LLM提取：贡献、方法、实验、结果、局限性、关键声明、引用候选。",
    docsModuleResearch: "7种模式：完整、快速、系统综述（PRISMA）、苏格拉底式、事实核查、文献综述、研究评审。每种模式有独特的LLM提示。",
    docsModuleIdeas: "生成研究空白、排名想法（新颖性/可行性/风险/资源/贡献）、实验计划、论文标题、假设。",
    docsModuleWriter: "10种模式：完整草稿、计划、仅大纲、仅摘要、文献综述、修改、修改指导、格式转换、引用检查、AI披露。",
    docsModuleReviewer: "6种模式，0-100评分标准。模拟编辑委员会，包括主编、方法论、领域、跨学科审稿人和魔鬼代言人。",
    docsModulePipeline: "10阶段编排器，第2.5和4.5阶段为强制性完整性关卡。入口模式：完整流水线、论文审稿、审稿意见、从护照恢复。",
    docsModuleCitation: "格式转换（APA/MLA/IEEE/Chicago/Vancouver/BibTeX）、声明支持检查、BibTeX助手、幻觉风险检测。",
    docsModuleExport: "导出为Markdown、JSON、纯文本、LaTeX、BibTeX。DOCX/PDF计划中（需要Pandoc/Tectonic）。",

    // Misc UI
    reviewerRubricTitle: "审稿评分标准（0-100）",
    workflowDataError: "工作流数据未加载。",
    openTool: "打开工具", openPaper: "打开论文", downloadPdf: "下载PDF",
    unbookmark: "取消收藏", bookmark: "收藏",
    markVerification: "标记待验证", clearVerification: "清除验证",
    noMatches: "没有论文匹配当前筛选条件。",
    noPapersCollection: "集合中还没有论文。请在上方搜索或添加论文。",
    importArxivPlanned: "从arXiv导入（API计划中）",
    adaptFromArs: "改编自academic-research-skills",
    sidebarEyebrow: "自动研究",
    arsAttribution: "基于ARS",
    researchWorkflowLabel: "点击流水线查看完整的10阶段视图。",
    collectorTitle2: "我的集合",
    foundPapersPrefix: "在本地语料库中找到论文：",
    noMatchesArxiv: "本地语料库中无匹配。",
    reviewerRubricNote: "模型辅助验证并非保证。请始终独立验证关键引用。",
    cloudApiConfigNote: "云端API模式的API配置。",
    personalHybridNote: "配置本地桥接端点和路径。",
  }
};

function t(key) {
  const dict = T[S.lang] || T.en;
  return dict[key] || T.en[key] || key;
}

function toggleLang() {
  S.lang = S.lang === "en" ? "zh" : "en";
  saveJSON("autoResearchLang", S.lang);
  renderNav();
  renderPage();
  renderPaperDashboard();
}

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
  { id: "dashboard", key: "dashboard", icon: "D" },
  { id: "paper-library", key: "paperLibrary", icon: "B" },
  { id: "workspace", key: "workspace", icon: "W" },
  { id: "collector", key: "collector", icon: "C" },
  { id: "summarizer", key: "summarizer", icon: "S" },
  { id: "research", key: "research", icon: "R" },
  { id: "ideas", key: "ideas", icon: "I" },
  { id: "writer", key: "writer", icon: "W" },
  { id: "reviewer", key: "reviewer", icon: "V" },
  { id: "pipeline", key: "pipeline", icon: "P" },
  { id: "citation", key: "citation", icon: "T" },
  { id: "export", key: "export", icon: "E" },
  { id: "docs", key: "docs", icon: "?" },
  { id: "settings", key: "settings", icon: "*" }
];

function navLabel(item) { return t(item.key); }

function renderNav() {
  const nav = $(".sidebar-nav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map(item => `
    <a href="#${item.id}" class="nav-item ${S.page === item.id ? "active" : ""}">
      <span class="nav-icon">${item.icon}</span>
      <span>${t(item.key)}</span>
    </a>
  `).join("");

  // Update language toggle in footer
  const langBtn = $(".lang-toggle-btn");
  if (langBtn) {
    langBtn.textContent = S.lang === "en" ? "中文" : "EN";
    langBtn.title = S.lang === "en" ? "Switch to Chinese" : "切换到英文";
  }
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
    case "paper-library": renderPaperLibrary(container); break;
    case "workspace": renderWorkspace(container); break;
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
        <p class="eyebrow">${t("dashboardEyebrow")}</p>
        <h2>${t("dashboardTitle")}</h2>
      </div>
    </div>

    <div class="dash-metrics">
      <div class="dash-metric"><strong>${paperCount}</strong><span>${t("papers")}</span></div>
      <div class="dash-metric"><strong>${bookmarkCount}</strong><span>${t("bookmarked")}</span></div>
      <div class="dash-metric"><strong>${taskCount}</strong><span>${t("recentTasks")}</span></div>
      <div class="dash-metric ${llmOk ? 'dm-green' : 'dm-amber'}"><strong>${llmOk ? t("apiConnected") : t("apiNotSet")}</strong><span>${t("apiStatus")}</span></div>
    </div>

    <div class="dash-grid">
      <div class="dash-card">
        <h3>${t("quickActions")}</h3>
        <div class="quick-actions">
          <button class="btn btn-outline" onclick="navigate('collector')">${t("collectPapers")}</button>
          <button class="btn btn-outline" onclick="navigate('summarizer')">${t("summarizePaper")}</button>
          <button class="btn btn-outline" onclick="navigate('research')">${t("startResearch")}</button>
          <button class="btn btn-outline" onclick="navigate('ideas')">${t("generateIdeasBtn")}</button>
          <button class="btn btn-outline" onclick="navigate('writer')">${t("writePaper")}</button>
          <button class="btn btn-outline" onclick="navigate('reviewer')">${t("reviewPaper")}</button>
        </div>
      </div>
      <div class="dash-card">
        <h3>${t("researchWorkflow")}</h3>
        <div class="workflow-mini">
          ${["Research","Write","Integrity Check","Review","Revise","Finalize"].map((s,i) => `<div class="wf-step"><span class="wf-num">${i+1}</span><span>${s}</span></div>`).join("")}
        </div>
        <p style="margin-top:12px;font-size:0.82rem;color:var(--muted)">Click <a href="#pipeline" style="color:var(--green)">Pipeline</a> for the full 10-stage view.</p>
      </div>
    </div>

    <div class="dash-card" style="margin-top:16px">
      <h3>${t("featuresGlance")}</h3>
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
      <div><p class="eyebrow">${t("collectorEyebrow")}</p><h2>${t("collectorTitle")}</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">${t("collectorDesc")}</p>

    <div class="module-card">
      <h3>${t("searchImport")}</h3>
      <div class="input-row">
        <input type="text" id="collectorInput" placeholder="${t("collectorSearchPlaceholder")}" class="input-full">
        <button class="btn btn-primary" id="collectorSearchBtn">${t("search")}</button>
      </div>
      <p style="margin-top:8px;font-size:0.78rem;color:var(--muted)">
        ${statusBadge(STATUS.PLANNED)} ${t("realApiNote")}
      </p>
    </div>

    <div class="module-card">
      <h3>${t("manualEntry")}</h3>
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
      <h3>${t("collectorTitle2")} <span style="font-weight:400;color:var(--muted);font-size:0.8rem">(${S.collections.length} papers)</span></h3>
      <div id="collectionList">${S.collections.length ? S.collections.map(p => renderCollectionCard(p)).join("") : emptyBox(t("noPapersCollection"))}</div>
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
      <div><p class="eyebrow">${t("summarizerEyebrow")}</p><h2>${t("summarizerTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("summarizerDesc")}</p>

    <div class="module-card">
      <h3>${t("inputHeading")}</h3>
      <label style="margin-bottom:6px;display:block">${t("selectPaperPrompt")}</label>
      <select id="summarizerPaperSelect" class="input-full" style="margin-bottom:8px">
        <option value="">-- Select from collection --</option>
        ${S.collections.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join("")}
        ${S.papers.map(p => `<option value="${p.id}">${escapeHtml(p.title)} (corpus)</option>`).join("")}
      </select>
      <textarea id="summarizerInput" rows="8" class="input-full" placeholder="${t("pasteTextPlaceholder")}"></textarea>
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
      <div><p class="eyebrow">${t("researchEyebrow")}</p><h2>${t("researchTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("researchDesc")}</p>

    <div class="module-card">
      <h3>${t("researchTopicHeading")}</h3>
      <input type="text" id="researchTopic" class="input-full" placeholder="${t("researchTopicPlaceholder")}">
    </div>

    <div class="module-card">
      <h3>${t("modeHeading")}</h3>
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
      <div><p class="eyebrow">${t("ideasEyebrow")}</p><h2>${t("ideasTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("ideasDesc")}</p>

    <div class="module-card">
      <h3>${t("researchTopicHeading")}</h3>
      <label>${t("researchTopicHeading")}</label>
      <input type="text" id="ideasTopic" class="input-full" placeholder="${t("ideasTopicPlaceholder")}">
      <label style="margin-top:8px">${t("contextOptional")}</label>
      <textarea id="ideasContext" rows="4" class="input-full" placeholder="${t("ideasContextPlaceholder")}"></textarea>
      <label style="margin-top:8px">${t("constraintsOptional")}</label>
      <input type="text" id="ideasConstraints" class="input-full" placeholder="${t("ideasConstraintsPlaceholder")}">
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
      <div><p class="eyebrow">${t("writerEyebrow")}</p><h2>${t("writerTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("writerDesc")}</p>

    <div class="module-card">
      <h3>${t("contentDraftHeading")}</h3>
      <textarea id="writerContent" rows="10" class="input-full" placeholder="${t("writerContentPlaceholder")}"></textarea>
    </div>

    <div class="module-card">
      <h3>${t("modeHeading")}</h3>
      <select id="writerMode" class="input-full">
        ${modes.map(m => `<option value="${m.id}">${m.label} — ${m.desc}</option>`).join("")}
      </select>
    </div>

    <div class="module-card" id="writerExtraFields" style="display:none">
      <h3>${t("additionalOptions")}</h3>
      <label>${t("specialInstructions")}</label>
      <input type="text" id="writerInstructions" class="input-full" placeholder="${t("instructionsPlaceholder")}">
      <label style="margin-top:8px" id="writerFeedbackLabel" style="display:none">${t("feedbackReviewerComments")}</label>
      <textarea id="writerFeedback" rows="4" class="input-full" placeholder="${t("feedbackPlaceholder")}"></textarea>
      <label style="margin-top:8px" id="writerFormatLabel" style="display:none">${t("targetFormatLabel")}</label>
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
      <div><p class="eyebrow">${t("reviewerEyebrow")}</p><h2>${t("reviewerTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("reviewerDesc")}</p>

    <div class="review-rubric-mini">
      <div class="rubric-item rubric-accept"><strong>80-100</strong> Accept</div>
      <div class="rubric-item rubric-minor"><strong>65-79</strong> Minor Revision</div>
      <div class="rubric-item rubric-major"><strong>50-64</strong> Major Revision</div>
      <div class="rubric-item rubric-reject"><strong>0-49</strong> Reject</div>
    </div>

    <div class="module-card">
      <h3>${t("paperToReviewHeading")}</h3>
      <textarea id="reviewerInput" rows="12" class="input-full" placeholder="${t("reviewerInputPlaceholder")}"></textarea>
    </div>

    <div class="module-card">
      <h3>${t("modeHeading")}</h3>
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
    c.innerHTML = `<div class="page-header"><h2>${t("pipeline")}</h2></div>${emptyBox(t("workflowDataError"))}`;
    return;
  }

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">${t("pipelineEyebrow")}</p><h2>${t("pipelineTitle")}</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">${t("pipelineDesc")}</p>

    <div class="module-card">
      <h3>${t("pipelineEntryTitle")}</h3>
      <p style="font-size:0.82rem;color:var(--muted);margin-bottom:10px">${t("pipelineEntryDesc")}</p>
      <div class="mode-grid">
        <div class="mode-card" style="cursor:pointer" onclick="navigate('research')">
          <strong>${t("fullPipeline")}</strong>
          <p>${t("fullPipelineDesc")}</p>
        </div>
        <div class="mode-card" style="cursor:pointer" onclick="navigate('reviewer')">
          <strong>${t("paperReviewEntry")}</strong>
          <p>${t("paperReviewEntryDesc")}</p>
        </div>
        <div class="mode-card" style="cursor:pointer" onclick="navigate('writer')">
          <strong>${t("reviewerCommentsEntry")}</strong>
          <p>${t("reviewerCommentsEntryDesc")}</p>
        </div>
        <div class="mode-card">
          <strong>${t("resumePassport")}</strong>
          <p>${statusBadge(STATUS.PLANNED)} ${t("resumePassportDesc")}</p>
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
      <div><p class="eyebrow">${t("citationEyebrow")}</p><h2>${t("citationTitle")}</h2></div>
      ${statusBadge(STATUS.API_REQUIRED)}
    </div>
    <p class="page-desc">${t("citationDesc")}</p>

    <div class="module-card">
      <h3>${t("actionHeading")}</h3>
      <select id="citationAction" class="input-full">
        ${actions.map(a => `<option value="${a.id}">${a.label} — ${a.desc}</option>`).join("")}
      </select>
    </div>

    <div class="module-card">
      <h3>${t("inputHeading")}</h3>
      <textarea id="citationInput" rows="8" class="input-full" placeholder="${t("citationInputPlaceholder")}"></textarea>
      <div class="input-row" style="margin-top:8px" id="citationFormatRow" style="display:none">
        <label>${t("sourceFormat")}<select id="citationSourceFmt" class="input-full"><option value="apa">APA</option><option value="mla">MLA</option><option value="ieee">IEEE</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="bibtex">BibTeX</option></select></label>
        <label>${t("targetFormat")}<select id="citationTargetFmt" class="input-full"><option value="apa">APA</option><option value="mla">MLA</option><option value="ieee">IEEE</option><option value="chicago">Chicago</option><option value="vancouver">Vancouver</option><option value="bibtex">BibTeX</option></select></label>
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
      <div><p class="eyebrow">${t("exportEyebrow")}</p><h2>${t("exportTitle")}</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">${t("exportDesc")}</p>

    <div class="module-card">
      <h3>${t("contentToExport")}</h3>
      <textarea id="exportContent" rows="10" class="input-full" placeholder="${t("exportContentPlaceholder")}"></textarea>
    </div>

    <div class="export-buttons" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">
      <button class="btn btn-primary" data-fmt="markdown">${t("exportAsMd")}</button>
      <button class="btn btn-outline" data-fmt="json">${t("exportAsJson")}</button>
      <button class="btn btn-outline" data-fmt="text">${t("exportAsText")}</button>
      <button class="btn btn-outline" data-fmt="latex">${t("exportAsLatex")}</button>
      <button class="btn btn-outline" data-fmt="bibtex">${t("exportAsBibtex")}</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>${t("quickExportCuration")}</h3>
      <p style="font-size:0.82rem;color:var(--muted)">${t("quickExportDesc")}</p>
      <button class="btn btn-outline" id="exportCurationBtn" style="margin-top:8px">${t("exportCurationBtn")}</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>${t("formatSupport")}</h3>
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

// ---- Paper Library ----
function renderPaperLibrary(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">paper database</p><h2>${t("paperLibrary")}</h2></div>
    </div>
    <div class="bridge-status-bar" id="paperBridgeStatus">
      <span class="bridge-dot bridge-dot-offline"></span>
      <span>Bridge: checking...</span>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>Library Status</h3>
      <div id="libStatus">Loading...</div>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>Scan & Import</h3>
      <button class="btn btn-outline" id="scanFolderBtn">${t("scanFolder")}</button>
      <button class="btn btn-outline" id="reindexBtn" style="margin-left:8px">${t("reindex")}</button>
      <div id="scanResult" style="margin-top:8px;font-size:0.84rem"></div>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>Paper Search</h3>
      <input type="search" id="paperSearchInput" class="input-full" placeholder="Search by title, author, venue, keyword..." style="margin-bottom:8px">
      <div id="paperSearchResults" style="font-size:0.84rem"></div>
    </div>
  `;

  setTimeout(async () => {
    updateBridgeStatusBar("paperBridgeStatus");
    loadLibraryStatus();

    $("#scanFolderBtn")?.addEventListener("click", async () => {
      const r = await safeFetch("/papers/scan", { method: "POST" });
      const el = $("#scanResult");
      if (el) el.innerHTML = r.error
        ? errorBox(r.error)
        : `<span style="color:var(--green)">Found ${r.found} files (${r.newCount} new, ${r.existingCount} existing) in ${r.paperDir}</span>`;
    });

    $("#reindexBtn")?.addEventListener("click", async () => {
      const r = await safeFetch("/library/reindex", { method: "POST" });
      loadLibraryStatus();
    });

    $("#paperSearchInput")?.addEventListener("input", debounce(async (e) => {
      const q = e.target.value.trim();
      if (!q) { const el = $("#paperSearchResults"); if (el) el.innerHTML = ""; return; }
      const results = await safeFetch("/papers/search", {
        method: "POST", body: JSON.stringify({ query: q })
      });
      const el = $("#paperSearchResults");
      if (el && Array.isArray(results)) {
        el.innerHTML = results.slice(0, 20).map(p => `
          <div class="paper-search-item" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <strong>${escapeHtml(p.title || "Untitled")}</strong>
            <span style="color:var(--muted)"> ${p.authors || ""} · ${p.year || ""} · ${p.venue || ""}</span>
            ${p.local_path ? `<span style="color:var(--green);margin-left:6px;font-size:0.75rem">local</span>` : ""}
          </div>
        `).join("");
      }
    }, 300));
  }, 50);
}

async function loadLibraryStatus() {
  const r = await safeFetch("/db/health");
  const el = $("#libStatus");
  if (el && r.ok) {
    el.innerHTML = `
      <div class="form-grid" style="font-size:0.84rem">
        <div><strong>Database:</strong> <code style="font-size:0.75rem">${escapeHtml(r.dbPath)}</code></div>
        <div><strong>Papers:</strong> ${r.paperCount} | <strong>Chunks:</strong> ${r.chunkCount} | <strong>Tasks:</strong> ${r.taskCount}</div>
      </div>`;
  } else if (el) {
    el.innerHTML = errorBox("Cannot connect to paper database. Is the bridge running?");
  }
}

// ---- Workspace / Project Manager ----
function renderWorkspace(c) {
  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">project manager</p><h2>${t("workspace")}</h2></div>
    </div>
    <div class="bridge-status-bar" id="workspaceBridgeStatus">
      <span class="bridge-dot bridge-dot-offline"></span>
      <span>Bridge: checking...</span>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>Workspace Overview</h3>
      <div id="wsOverview">Loading...</div>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>${t("fileTree")}</h3>
      <div id="wsFileTree" style="font-size:0.84rem;font-family:monospace">Loading...</div>
    </div>

    <div class="module-card" style="margin-top:12px">
      <h3>${t("projectMemory")}</h3>
      <div id="wsMemory" style="font-size:0.84rem">Loading...</div>
      <button class="btn btn-outline" id="refreshMemoryBtn" style="margin-top:8px">${t("refreshMemory")}</button>
    </div>
  `;

  setTimeout(async () => {
    updateBridgeStatusBar("workspaceBridgeStatus");
    loadWorkspaceOverview();
    loadFileTree();
    loadProjectMemory();

    $("#refreshMemoryBtn")?.addEventListener("click", loadProjectMemory);
  }, 50);
}

async function loadWorkspaceOverview() {
  const r = await safeFetch("/workspace/health");
  const el = $("#wsOverview");
  if (el && r.ok) {
    const git = await safeFetch("/workspace/git/status");
    el.innerHTML = `
      <div style="font-size:0.84rem;line-height:1.8">
        <div><strong>Root:</strong> ${escapeHtml(r.workspaceRoot)}</div>
        <div><strong>Type:</strong> ${r.projectType} | <strong>Memory files:</strong> ${(r.memoryFiles||[]).join(", ")}</div>
        ${!git.error ? `<div><strong>Git:</strong> branch <code>${escapeHtml(git.branch)}</code>, ${git.changedFiles} changed files</div>` : ""}
      </div>`;
  } else if (el) {
    el.innerHTML = errorBox("Cannot connect to workspace. Is the bridge running?");
  }
}

async function loadFileTree() {
  const r = await safeFetch("/workspace/tree");
  const el = $("#wsFileTree");
  if (el && Array.isArray(r)) {
    el.innerHTML = renderFileTree(r, 0);
  } else if (el) {
    el.innerHTML = "<span style='color:var(--muted)'>Cannot load file tree.</span>";
  }
}

function renderFileTree(items, depth) {
  return items.map(item => `
    <div style="padding-left:${depth * 16}px;padding-top:2px">
      ${item.type === "directory" ? "📁" : "📄"} ${escapeHtml(item.name)}
      ${item.size ? `<span style="color:var(--muted);font-size:0.7rem"> (${formatBytes(item.size)})</span>` : ""}
      ${item.children ? renderFileTree(item.children, depth + 1) : ""}
    </div>
  `).join("");
}

async function loadProjectMemory() {
  const r = await safeFetch("/workspace/memory");
  const el = $("#wsMemory");
  if (el) {
    let html = "";
    if (r.projectMemory) html += `<div style="margin-bottom:8px"><strong>PROJECT_MEMORY.md:</strong><pre style="font-size:0.78rem;max-height:200px;overflow-y:auto;background:var(--bg);padding:8px;border-radius:6px">${escapeHtml(r.projectMemory.slice(0, 2000))}</pre></div>`;
    if (r.agentContext) html += `<div style="margin-bottom:8px"><strong>AGENT_CONTEXT.md:</strong><pre style="font-size:0.78rem;max-height:150px;overflow-y:auto;background:var(--bg);padding:8px;border-radius:6px">${escapeHtml(r.agentContext.slice(0, 1000))}</pre></div>`;
    if (r.decisions) html += `<div style="margin-bottom:8px"><strong>Recent Decisions:</strong><pre style="font-size:0.78rem;max-height:100px;overflow-y:auto;background:var(--bg);padding:8px;border-radius:6px">${escapeHtml(r.decisions.slice(0, 800))}</pre></div>`;
    el.innerHTML = html || "<span style='color:var(--muted)'>No project memory files found.</span>";
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0B";
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / 1048576).toFixed(1) + "MB";
}

// ---- Bridge Helpers ----
async function safeFetch(url, options = {}) {
  try {
    const bridgeBase = S.settings.bridgeUrl || "http://127.0.0.1:8765";
    const r = await fetch(bridgeBase + url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
      signal: AbortSignal.timeout(5000)
    });
    return r.json();
  } catch {
    return { error: "Bridge not reachable" };
  }
}

async function updateBridgeStatusBar(elementId) {
  const el = $("#" + elementId);
  if (!el) return;
  try {
    const health = await safeFetch("/health");
    const dot = el.querySelector(".bridge-dot");
    const txt = el.querySelector("span:last-child");
    if (health.ok) {
      if (dot) { dot.className = "bridge-dot bridge-dot-online"; }
      if (txt) txt.textContent = `Connected · ${health.llmProvider}/${health.llmModel} · v${health.version}`;
    } else {
      if (dot) { dot.className = "bridge-dot bridge-dot-offline"; }
      if (txt) txt.textContent = "Not connected";
    }
  } catch {
    const dot = el.querySelector(".bridge-dot");
    if (dot) { dot.className = "bridge-dot bridge-dot-offline"; }
  }
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// ---- Settings ----
function renderSettings(c) {
  const s = S.settings;
  const mode = s.runtimeMode || "static-demo";
  const bridgeUrl = s.bridgeUrl || "http://127.0.0.1:8765";

  c.innerHTML = `
    <div class="page-header">
      <div><p class="eyebrow">${t("settingsEyebrow")}</p><h2>${t("settingsTitle")}</h2></div>
    </div>

    <div class="module-card">
      <h3>${t("runtimeMode")}</h3>
      <p style="font-size:0.84rem;color:var(--muted);margin-bottom:10px">
        Choose how you want to use Auto Research Web. ${t("privacyNote")}
      </p>
      <div class="runtime-mode-selector">
        <label class="runtime-option ${mode==='static-demo'?'runtime-active':''}">
          <input type="radio" name="runtimeMode" value="static-demo" ${mode==='static-demo'?'checked':''}>
          <strong>${t("staticDemo")}</strong>
          <span>Public demo. No private papers. No real API keys. No bridge required.</span>
        </label>
        <label class="runtime-option ${mode==='personal-hybrid'?'runtime-active':''}">
          <input type="radio" name="runtimeMode" value="personal-hybrid" ${mode==='personal-hybrid'?'checked':''}>
          <strong>${t("personalHybrid")}</strong>
          <span>Online console + local bridge. Private papers, local DB, personal LLM.</span>
        </label>
        <label class="runtime-option ${mode==='cloud-api'?'runtime-active':''}">
          <input type="radio" name="runtimeMode" value="cloud-api" ${mode==='cloud-api'?'checked':''}>
          <strong>${t("cloudApi")}</strong>
          <span>Cloud backend deployment. Not required now. Future option.</span>
        </label>
      </div>
      ${mode === 'personal-hybrid' ? `
        <div style="margin-top:10px">
          <label>${t("bridgeEndpoint")}<input type="text" id="setBridgeUrl" class="input-full" value="${escapeHtml(bridgeUrl)}"></label>
        </div>` : ""}
      <button class="btn btn-primary" id="saveRuntimeBtn" style="margin-top:10px">Save Runtime Settings</button>
    </div>

    ${mode === "personal-hybrid" ? `
    <div class="module-card" style="margin-top:16px">
      <h3>${t("bridgeStatus")}</h3>
      <div id="bridgeStatusCard">
        <div class="bridge-status-bar">
          <span class="bridge-dot bridge-dot-offline"></span>
          <span>Checking...</span>
        </div>
      </div>
      <button class="btn btn-outline" id="checkBridgeBtn" style="margin-top:8px">${t("checkConnection")}</button>
      <div id="bridgeHealthDetail" style="margin-top:8px;font-size:0.82rem"></div>
      <div id="bridgeSetupHint" style="margin-top:8px;font-size:0.82rem;color:var(--muted)">
        <p style="font-weight:600;margin-bottom:4px">If not connected:</p>
        <ol style="padding-left:18px;line-height:1.8">
          <li>Copy <code>.env.example</code> to <code>.env.local</code> and configure.</li>
          <li>Run <code>node server.js</code> in the project directory.</li>
          <li>Make sure the bridge port is 8765.</li>
          <li>Click Check Connection.</li>
        </ol>
      </div>
    </div>` : ""}

    <div class="module-card" style="margin-top:16px">
      <h3>${t("serverSideConfig")}</h3>
      <p style="font-size:0.82rem;color:var(--muted);margin-bottom:12px">${t("settingsNote")}</p>
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
      <button class="btn btn-primary" id="saveSettingsBtn" style="margin-top:12px">${t("saveSettings")}</button>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>${t("currentApiStatus")}</h3>
      <div id="apiStatusCheck">
        <button class="btn btn-outline" id="checkApiBtn">${t("checkApiStatus")}</button>
        <span id="apiStatusResult" style="margin-left:8px"></span>
      </div>
    </div>

    <div class="module-card" style="margin-top:16px">
      <h3>${t("securityNotes")}</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8">
        <li>${t("securityItem1")}</li>
        <li>${t("securityItem2")}</li>
        <li>${t("securityItem3")}</li>
        <li>${t("securityItem4")}</li>
        <li>The online static site cannot read your local files. The local bridge grants controlled access.</li>
        <li>API keys stay in .env.local and are never sent to the browser.</li>
      </ul>
    </div>
  `;

  setTimeout(() => {
    // Runtime mode save
    $("#saveRuntimeBtn")?.addEventListener("click", () => {
      const modeRadio = document.querySelector("input[name='runtimeMode']:checked");
      S.settings.runtimeMode = modeRadio?.value || "static-demo";
      S.settings.bridgeUrl = $("#setBridgeUrl")?.value?.trim() || "http://127.0.0.1:8765";
      saveJSON(CFG.storageKeys.settings, S.settings);
      showToast("Runtime settings saved! Reloading...");
      setTimeout(() => renderPage(), 300);
    });

    // Bridge health check
    $("#checkBridgeBtn")?.addEventListener("click", async () => {
      const detailEl = $("#bridgeHealthDetail");
      if (detailEl) detailEl.innerHTML = loadingSpinner("Checking...");
      try {
        const health = await safeFetch("/health");
        if (detailEl && health.ok) {
          detailEl.innerHTML = `
            <div style="background:#e8f5e9;padding:12px;border-radius:6px;font-size:0.82rem;line-height:1.8">
              <strong style="color:#2e7d32">Connected</strong>
              <div>Mode: ${escapeHtml(health.mode)} v${escapeHtml(health.version)}</div>
              <div>Project: ${escapeHtml(health.projectRoot)}</div>
              <div>Paper dir: ${escapeHtml(health.paperLibraryPath)}</div>
              <div>DB: ${escapeHtml(health.dbPath)}</div>
              <div>Output: ${escapeHtml(health.outputPath)}</div>
              <div>LLM: ${health.llmConfigured ? health.llmProvider + " / " + health.llmModel : "Not configured"}</div>
            </div>`;
        } else if (detailEl) {
          detailEl.innerHTML = errorBox("Cannot reach bridge at " + (S.settings.bridgeUrl || "http://127.0.0.1:8765"));
        }
      } catch {
        if (detailEl) detailEl.innerHTML = errorBox("Bridge not reachable.");
      }
    });

    // Existing settings save
    const saveBtn = $("#saveSettingsBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        S.settings = {
          ...S.settings,
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
            ? `<div style="color:var(--green);font-weight:700">Connected — ${status.provider}</div><div style="font-size:0.78rem;color:var(--muted);margin-top:4px">Pro: ${status.proModel || status.model} (research/writing/review/ideas)<br>Flash: ${status.flashModel || "N/A"} (search/rough read/translate/format)</div>`
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
      <div><p class="eyebrow">${t("docsEyebrow")}</p><h2>${t("docsTitle")}</h2></div>
      ${statusBadge(STATUS.IMPLEMENTED)}
    </div>
    <p class="page-desc">${t("docsDesc")}</p>

    <div class="module-card">
      <h3>${t("docsInstallation")}</h3>
      <pre style="background:#f4f5f2;padding:14px;border-radius:7px;font-size:0.82rem;overflow-x:auto;white-space:pre-wrap">${t("docsInstallCode")}</pre>
      <p style="margin-top:8px;font-size:0.82rem;color:var(--muted)">${t("docsInstallNote")}</p>
    </div>

    <div class="module-card">
      <h3>${t("docsApiConfig")}</h3>
      <p style="font-size:0.84rem;line-height:1.6;margin-bottom:10px">API keys are configured in the <code>.env</code> file on the backend server and <strong>never exposed to the browser</strong>. See <code>.env.example</code> for the template.</p>
      <table class="format-table" style="font-size:0.8rem">
        <tr><td style="padding:6px 12px;font-weight:700">LLM_PROVIDER</td><td style="padding:6px 12px;color:var(--muted)">openai | anthropic | deepseek | openrouter</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_API_KEY</td><td style="padding:6px 12px;color:var(--muted)">Your provider API key (required)</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_MODEL</td><td style="padding:6px 12px;color:var(--muted)">e.g. gpt-4o, claude-sonnet-4-6, deepseek-v4-pro</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">LLM_BASE_URL</td><td style="padding:6px 12px;color:var(--muted)">Provider API endpoint</td></tr>
        <tr><td style="padding:6px 12px;font-weight:700">PORT</td><td style="padding:6px 12px;color:var(--muted)">Server port (default: 3000)</td></tr>
      </table>
    </div>

    <div class="module-card">
      <h3>${t("docsDualModelTitle")}</h3>
      <div class="feature-grid" style="margin-bottom:12px">
        <div class="feature-card"><strong>${t("docsProModelTitle")}</strong><p>${t("docsProModelDesc")}</p></div>
        <div class="feature-card"><strong>${t("docsFlashModelTitle")}</strong><p>${t("docsFlashModelDesc")}</p></div>
      </div>
      <p style="font-size:0.78rem;color:var(--muted);margin-bottom:16px">${t("docsDualModelNote")}</p>

      <h3>${t("docsModuleGuide")}</h3>
      <div class="feature-grid">
        <div class="feature-card"><strong>${t("dashboard")}</strong><p>${t("docsModuleDashboard")}</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>${t("collector")}</strong><p>${t("docsModuleCollector")}</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>${t("summarizer")}</strong><p>${t("docsModuleSummarizer")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("research")}</strong><p>${t("docsModuleResearch")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("ideas")}</strong><p>${t("docsModuleIdeas")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("writer")}</strong><p>${t("docsModuleWriter")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("reviewer")}</strong><p>${t("docsModuleReviewer")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("pipeline")}</strong><p>${t("docsModulePipeline")}</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
        <div class="feature-card"><strong>${t("citation")}</strong><p>${t("docsModuleCitation")}</p>${statusBadge(STATUS.API_REQUIRED)}</div>
        <div class="feature-card"><strong>${t("export")}</strong><p>${t("docsModuleExport")}</p>${statusBadge(STATUS.IMPLEMENTED)}</div>
      </div>
    </div>

    <div class="module-card">
      <h3>${t("docsDeployment")}</h3>
      <p style="font-size:0.84rem;line-height:1.6">${t("docsDeploymentText")}</p>
    </div>

    <div class="module-card">
      <h3>${t("docsSecurity")}</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8;padding-left:20px">
        <li>${t("docsSecurityText1")}</li>
        <li>${t("docsSecurityText2")}</li>
        <li>${t("docsSecurityText3")}</li>
        <li>${t("docsSecurityText4")}</li>
        <li>${t("docsSecurityText5")}</li>
      </ul>
    </div>

    <div class="module-card">
      <h3>${t("docsLimitations")}</h3>
      <ul style="font-size:0.84rem;color:var(--muted);line-height:1.8;padding-left:20px">
        <li>${t("docsLimitation1")}</li>
        <li>${t("docsLimitation2")}</li>
        <li>${t("docsLimitation3")}</li>
        <li>${t("docsLimitation4")}</li>
      </ul>
    </div>

    <div class="module-card">
      <h3>${t("deepseekV4Title")}</h3>
      <p style="font-size:0.84rem;line-height:1.6;margin-bottom:10px">${t("deepseekV4Desc")}</p>
      <pre style="background:#f4f5f2;padding:14px;border-radius:7px;font-size:0.8rem;overflow-x:auto;white-space:pre-wrap">${t("deepseekV4Config")}</pre>

      <h3>${t("docsLicense")}</h3>
      <p style="font-size:0.84rem;line-height:1.6">${t("docsLicenseText")}</p>
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
          <p class="eyebrow" style="margin-bottom:2px">${t("sidebarEyebrow")}</p>
          <strong>ARW</strong>
        </div>
        <nav class="sidebar-nav"></nav>
        <div class="sidebar-footer">
          <button class="lang-toggle-btn" onclick="toggleLang()" title="Switch language" style="width:100%;margin-bottom:8px">中文</button>
          <p style="font-size:0.68rem;color:var(--muted)">${t("arsAttribution")}<br>Cheng-I Wu</p>
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
