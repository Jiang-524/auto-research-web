# Auto Research Web - 使用手册 / User Manual

**English | 中文**

---

## 目录 / Table of Contents

1. [快速开始 / Quick Start](#1-快速开始--quick-start)
2. [仪表盘 / Dashboard](#2-仪表盘--dashboard)
3. [论文收集器 / Paper Collector](#3-论文收集器--paper-collector)
4. [论文总结器 / Paper Summarizer](#4-论文总结器--paper-summarizer)
5. [深度研究 / Deep Research](#5-深度研究--deep-research)
6. [思路生成器 / Idea Generator](#6-思路生成器--idea-generator)
7. [学术论文写作器 / Paper Writer](#7-学术论文写作器--paper-writer)
8. [学术论文审稿器 / Paper Reviewer](#8-学术论文审稿器--paper-reviewer)
9. [学术流水线 / Pipeline Orchestrator](#9-学术流水线--pipeline-orchestrator)
10. [引文与完整性工具 / Citation Tools](#10-引文工具--citation-tools)
11. [导出中心 / Export Center](#11-导出中心--export-center)
12. [API配置 / Settings](#12-api配置--settings)
13. [部署 / Deployment](#13-部署--deployment)
14. [故障排除 / Troubleshooting](#14-故障排除--troubleshooting)

---

## 1. 快速开始 / Quick Start

### 安装 / Installation

```bash
git clone https://github.com/Jiang-524/auto-research-web.git
cd auto-research-web
npm install
```

### 配置API密钥 / Configure API Keys

复制环境变量模板并填入您的API密钥：
Copy the environment template and fill in your API key:

```bash
cp .env.example .env
# 编辑.env文件 / Edit .env file
```

**推荐配置（DeepSeek V4 Pro）/ Recommended configuration:**

```env
LLM_PROVIDER=deepseek
LLM_API_KEY=<your-deepseek-api-key>
LLM_MODEL=deepseek-v4-pro
LLM_BASE_URL=https://api.deepseek.com
DEFAULT_TEMPERATURE=0.3
DEFAULT_MAX_TOKENS=8192
```

**支持的提供商 / Supported Providers:**

| 提供商 Provider | LLM_PROVIDER | 基础URL Base URL |
|---|---|---|
| DeepSeek V4 Pro (推荐) | `deepseek` | `https://api.deepseek.com` |
| OpenAI (GPT-4o) | `openai` | `https://api.openai.com/v1` |
| Anthropic (Claude) | `anthropic` | `https://api.anthropic.com/v1` |
| OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` |

### 启动 / Start

```bash
npm start
```

在浏览器中打开 **http://localhost:3000**。
Open **http://localhost:3000** in your browser.

### 语言切换 / Language Switch

点击侧边栏底部的 **中文/EN** 按钮即可在中英文之间切换。
Click the **中文/EN** button at the bottom of the sidebar to switch between Chinese and English.

---

## 2. 仪表盘 / Dashboard

仪表盘是您的研究工作区总览页面。

### 功能说明 / Features

| 区域 Section | 说明 Description |
|---|---|
| **指标卡片 / Metrics** | 显示论文总数、已收藏数、API连接状态 |
| **快捷操作 / Quick Actions** | 一键跳转到各功能模块 |
| **研究工作流 / Research Workflow** | 6步研究流程概览 |
| **功能一览 / Features at a Glance** | 所有模块的功能卡片，点击即可跳转 |
| **最近任务 / Recent Tasks** | 最近运行的任务记录 |

### 操作步骤 / How to Use

1. 查看仪表盘了解当前状态
2. 点击快捷操作按钮进入对应功能
3. 或点击功能一览中的卡片直接跳转

---

## 3. 论文收集器 / Paper Collector

管理和导入论文的工具。

### 功能说明 / Features

- **搜索与导入 / Search & Import**: 按关键词搜索本地论文语料库
- **手动录入 / Manual Entry**: 手动添加论文元数据（标题、作者、年份、会议/期刊、URL、主题、摘要）
- **我的集合 / My Collection**: 查看和管理已添加的论文

### 操作步骤 / How to Use

1. **搜索论文**: 在搜索框中输入关键词、DOI、arXiv ID或URL，点击"搜索"
2. **手动添加**: 填写论文信息表单，点击"添加论文"
3. **管理集合**: 在"我的集合"中查看论文，点击链接打开原文，点击X移除论文

注意：实时arXiv/Semantic Scholar API搜索功能计划中，目前仅搜索本地语料库。

---

## 4. 论文总结器 / Paper Summarizer

使用AI对论文进行结构化分析和总结。

### 输入方式 / Input Methods

1. 从集合下拉菜单中选择一篇论文
2. 或在文本框中直接粘贴论文文本/摘要

### 输出内容 / Output

AI会提取以下结构化信息：
- **贡献 / Contribution**: 论文的主要贡献
- **方法 / Method**: 关键方法论
- **实验 / Experiments**: 实验设置和主要结果
- **结果 / Results**: 主要发现及其意义
- **局限性 / Limitations**: 论文的局限性
- **关键声明 / Key Claims**: 3-5个最重要的声明
- **引用候选 / Citation Candidates**: 应一并引用的相关论文

### 操作步骤 / How to Use

1. 选择论文或粘贴文本
2. 点击 **"总结"** 按钮
3. 等待AI处理（需要配置API密钥）
4. 查看结构化结果
5. 使用 **"复制"** 按钮复制结果
6. 使用 **"导出"** 按钮下载为Markdown/JSON/文本等格式

---

## 5. 深度研究 / Deep Research

多智能体研究调查工具，模拟13个专业研究智能体的协作。

### 7种研究模式 / 7 Research Modes

| 模式 Mode | 说明 Description | 适用场景 Use Case |
|---|---|---|
| **完整研究 / Full** | 完整的研究流程，从问题到综合报告 | 全面的文献调查 |
| **快速简报 / Quick** | 快速文献扫描，提取关键发现 | 快速了解一个领域 |
| **系统综述 / Systematic Review** | PRISMA合规的系统性综述 | 正式的系统综述论文 |
| **苏格拉底式 / Socratic** | 通过对话引导问题细化 | 研究问题还不够清晰时 |
| **事实核查 / Fact-Check** | 验证声明是否被引用来源支持 | 检查论文中的声明 |
| **文献综述 / Lit Review** | 全面的文献综述与参考书目 | 写文献综述章节 |
| **研究评审 / Research Review** | 评审现有研究的质量 | 评估领域研究质量 |

### 操作步骤 / How to Use

1. 输入您的研究主题或问题
2. 选择研究模式（默认为"完整研究"）
3. 点击 **"运行研究"** 按钮
4. 等待AI生成研究报告
5. 使用 **"复制"** 和 **"导出"** 按钮保存结果

---

## 6. 思路生成器 / Idea Generator

基于您的研究方向生成研究空白、研究思路和实验计划。

### 输入 / Input

- **研究主题 / Topic**: 您的研究方向（必填）
- **附加背景 / Context**: 论文摘要、研究笔记等（可选）
- **约束条件 / Constraints**: 资源、时间等限制（可选）

### 输出 / Output

AI会生成：
- **研究空白 / Research Gaps**: 当前文献中的5-10个具体空白
- **研究思路 / Research Ideas**: 5-10个具体可行的研究思路
- **评分排名 / Rankings**: 每个思路按以下维度评分（1-10）：
  - 新颖性 / Novelty
  - 可行性 / Feasibility
  - 风险 / Risk
  - 所需资源 / Resources Required
  - 预期贡献 / Expected Contribution
- **实验计划 / Experiment Plans**: 前3个思路的具体实验设计
- **论文标题 / Paper Titles**: 3-5个可能的论文标题
- **假设 / Hypotheses**: 可检验的假设

---

## 7. 学术论文写作器 / Paper Writer

12智能体论文写作流水线。

### 10种写作模式 / 10 Writing Modes

| 模式 | 说明 | 需要输入 |
|---|---|---|
| **完整草稿 / Full Draft** | 从研究笔记到完整论文草稿 | 研究笔记/大纲 |
| **计划 / Plan** | 论文计划和论证图 | 研究主题 |
| **仅大纲 / Outline Only** | 详细的层级大纲 | 研究主题 |
| **仅摘要 / Abstract Only** | 生成3个摘要变体 | 研究发现 |
| **文献综述 / Lit Review** | 写文献综述论文 | 参考文献 |
| **修改 / Revision** | 根据反馈修改草稿 | 草稿+反馈 |
| **修改指导 / Revision Coach** | 如何根据审稿意见修改 | 审稿意见 |
| **格式转换 / Format Conversion** | 在Markdown/LaTeX/DOCX之间转换 | 源文本 |
| **引用检查 / Citation Check** | 验证和更正引用格式 | 论文文本 |
| **AI披露 / AI Disclosure** | 生成AI使用声明 | 使用情况描述 |

---

## 8. 学术论文审稿器 / Paper Reviewer

7智能体多视角同行评审，模拟5人编辑委员会。

### 评分标准 / Rubric

| 分数 Score | 决定 Verdict | 说明 |
|---|---|---|
| 80-100 | 接受 / Accept | 论文质量优秀 |
| 65-79 | 小修 / Minor Revision | 需要少量修改 |
| 50-64 | 大修 / Major Revision | 需要大量修改 |
| 0-49 | 拒绝 / Reject | 存在严重问题 |

### 6种审稿模式 / 6 Review Modes

- **完整审稿 / Full**: 全面多视角评审
- **快速审稿 / Quick**: 关注3-5个最重要问题
- **指导改进 / Guided**: 聚焦特定方面
- **方法论焦点 / Methodology Focus**: 深入方法/统计审查
- **再审稿 / Re-Review**: 验证修改是否解决了之前的问题
- **校准 / Calibration**: 跨评审校准

---

## 9. 学术流水线 / Pipeline Orchestrator

10阶段研究流水线，从研究到最终定稿。

### 流水线阶段 / Pipeline Stages

```
研究(1) → 写作(2) → 完整性检查(2.5) → 审稿(3) → 再审稿(3')
  → 修改指导 → 修改(4) → 再次修改(4') → 最终完整性检查(4.5)
  → 定稿(5) → 过程总结(6)
```

**强制性关卡**: 阶段2.5和4.5为红色标注，不可跳过。

### 入口模式 / Entry Modes

- **完整流水线**: 从研究问题开始，逐步完成所有阶段
- **论文审稿入口**: 已有草稿，从第3阶段审稿开始
- **审稿意见入口**: 已有审稿意见，从第4阶段修改开始
- **从护照恢复**: 从中断的会话恢复（计划中）

---

## 10. 引文工具 / Citation Tools

### 4种操作 / 4 Actions

| 操作 Action | 说明 |
|---|---|
| **格式转换 / Format Convert** | APA/MLA/IEEE/Chicago/Vancouver/BibTeX互转 |
| **声明检查 / Claim Check** | 检查声明是否得到引用来源支持 |
| **BibTeX助手 / BibTeX Helper** | 从论文元数据生成准确的BibTeX条目 |
| **幻觉检查 / Hallucination Check** | 扫描潜在的虚假引用或声明 |

**⚠️ 重要提示**: 模型辅助验证不能替代人工核实。关键引用必须由人工独立验证。

---

## 11. 导出中心 / Export Center

### 支持的格式 / Supported Formats

| 格式 | 状态 | 说明 |
|---|---|---|
| Markdown (.md) | ✅ 已实现 | 适合进一步编辑 |
| JSON (.json) | ✅ 已实现 | 适合程序化处理 |
| Plain Text (.txt) | ✅ 已实现 | 纯文本输出 |
| LaTeX (.tex) | ✅ 已实现 | 适合学术排版 |
| BibTeX (.bib) | ✅ 已实现 | 参考文献管理 |
| DOCX (.docx) | 🔲 计划中 | 需要Pandoc |
| PDF (.pdf) | 🔲 计划中 | 需要Tectonic/LaTeX引擎 |

### 快捷导出

**导出策划**: 一键导出您已收藏和标记为需要验证的论文（JSON格式）。

---

## 12. API配置 / Settings

### 服务器端配置（推荐）

1. 在后端服务器上创建 `.env` 文件
2. 设置 `LLM_API_KEY` 等环境变量
3. 启动服务器：`npm start`
4. API密钥永远不会暴露给浏览器

### 设置页面说明

设置页面保存非敏感的显示/参考偏好到浏览器localStorage。实际的API密钥必须在后端 `.env` 文件中配置。

---

## 13. 部署 / Deployment

### GitHub Pages（静态）

推送仓库到GitHub，启用Pages。以下功能无需后端即可工作：
- 仪表盘、论文收集器、流水线、导出中心、文档

### 完整部署（含LLM功能）

将Express服务器部署到：
- Railway、Render、Fly.io
- 或任何VPS

在部署平台上设置环境变量（LLM_API_KEY等）。

---

## 14. 故障排除 / Troubleshooting

| 问题 Problem | 解决方案 Solution |
|---|---|
| LLM功能返回500错误 | 检查.env文件中的LLM_API_KEY是否正确配置 |
| 无法连接API服务器 | 确认后端正在运行：`npm start`，检查端口3000 |
| 页面加载但无数据显示 | 检查 `public/data/papers.json` 文件是否存在 |
| 语言切换无效 | 清除浏览器缓存后重试 |
| npm install失败 | 确认Node.js版本 >= 18.0.0 |
| 端口被占用 | 设置环境变量 `PORT=3001` 使用其他端口 |
| 中文显示乱码 | 确认浏览器编码设置为UTF-8 |

### 运行验证 / Run Validation

```bash
npm run validate    # 语法检查
npm run smoke       # 20项冒烟测试
```

---

## 许可与归属 / License & Attribution

CC BY-NC 4.0

基于 Cheng-I Wu 的 [Academic Research Skills](https://github.com/Imbad0202/academic-research-skills)，同样采用 CC BY-NC 4.0 许可。

本项目是受ARS工作流概念启发的可视化Web实现，并非原始ARS项目。

---

*最后更新: 2026-05-23*
