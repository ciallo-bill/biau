---
slug: "chunk-strategy-public"
title: "RAG 文档切分：Chunk 为什么决定答案能不能被验证"
column: "knowledge"
series: "AI 应用知识库"
tag: "AI 应用"
sourceCurrentSlug: "rag-chunk-strategy"
status: "draft"
generatedBy: "codex-reviewed-draft"
generatedAt: "2026-07-02T00:00:00.000Z"
reviewedAt: "2026-07-02T00:00:00.000Z"
modelStrategy: "Codex-only scaffold/review; model channel: none; previous model body reviewed against current evidence"
---

# RAG 文档切分：Chunk 为什么决定答案能不能被验证

## Evidence Pack
- `scripts/blog-rewrite-plan.json` 中的 `chunk-strategy-public` 选题。
- `src/data/blogShared.ts` 的 `knowledge` 栏目定义。
- `content-drafts/01-rag-overview-public.md` 和 `content-drafts/03-embedding-vector-search-public.md`，用于检查主题边界，避免和 RAG 总览、向量检索草稿重复。
- `legal-rag/apps/api/src/chunks/splitter.ts`：`CHUNK_SIZE = 850`、`OVERLAP = 120`；按段落累积，遇到 `第...条` 或 `位置：` 时优先切新 chunk；超长段落按固定窗口加 overlap 切分。
- `legal-rag/apps/api/src/documents/text.ts`：`cleanText` 规范换行、tab 和空格；`detectSection` 识别条款标题、位置标题和短标题；`estimateTokens` 给中文和拉丁文本估算 token。
- `legal-rag/apps/api/src/documents/ingestion-service.ts`：导入链路会清洗文本、项目内 hash 去重、切 chunk、补 metadata、批量 embedding，再 upsert 到 vector store。
- `legal-rag/apps/api/src/citations/citations.ts`：citation 输出包含 `documentId`、`title`、`chunkIndex`、`section` 和压缩空白后截断到 120 字符的 quote。
- `legal-rag/apps/api/src/rag/rag-service.ts`：查询链路召回向量和关键词候选，合并、过滤、rerank，最终引用前 3 个 answer chunks。
- `legal-rag/apps/api/src/validate.ts`：本地验证会导入文本、检查 chunk 数量、重复导入、project 隔离、citations、vector/rerank diagnostics 和 fallback/refusal。
- `legal-rag/apps/web/src/components/QaView.vue`：前端展示回答、diagnostics、引用来源、chunk 编号和 quote，并支持点击 citation 定位。

## Safe Public Facts
- 这是一篇知识积累草稿，主题来自 `scripts/blog-rewrite-plan.json` 的 `chunk-strategy-public` 选题。
- 公开角度是把 chunk 讲成 RAG 的最小证据单元，强调切分质量如何影响召回、引用和审查报告。
- Legal RAG 当前 splitter 会先按空行分段，再根据条款标题、位置标题和 chunk 长度决定切分边界。
- 每个 chunk 会保留 `title`、`content`、`chunkIndex`、`page`、`section`、`tokenEstimate` 和包含 `projectId` 的 metadata。
- 当前 `page` 是按 chunk index 估算的页码，用于演示和轻量定位；它不是 PDF parser 提取的真实物理页码。
- chunk 的 `section` 会进入 citation，前端引用卡片会显示 `title · section`、chunk 编号和 quote。
- citation quote 会压缩空白并截断，目标是让引用卡片可读，不是替代完整原文。
- 查询阶段只把通过可回答性判断的 chunks 转成 citations；证据不足时会走 refusal。
- 本轮只刷新草稿，不发布，不改公开博客运行时数据。

## Uncertain Or Stale Facts
- 当前草稿还没有补真实产品截图；如果未来公开发布，应优先使用真实 QA 引用卡片截图或自制流程图。
- Legal RAG 的实际线上模型、向量库配置、数据规模和当前服务健康状态不在本轮核验范围内。
- 复杂 PDF、OCR、表格保留和多模态解析仍属于后续方向，不能写成当前已完成能力。
- 如果未来引入真实 PDF 页码、OCR 或表格 parser，本文需要重新核对 `page`、`section` 和 citation 定位逻辑。
- 这篇文章曾有模型生成正文，本轮已由 Codex 按证据改写关键段落，但公开发布前仍应逐段审稿。

## Forbidden / Private Details
- Do not include real IPs, accounts, keys, database URLs, private dashboards, local secret paths, customer names, or sensitive metrics.
- 不公开真实模型中转站、数据库连接、部署后台、演示账号、客户合同、私有语料、访问指标或未脱敏日志。
- 不把 Legal RAG 包装成正式法律意见服务；法律判断仍需要人工复核。

## Draft Brief
- Column: 知识积累 / Knowledge Notes
- Column note: 适合长期有效的技术总结、架构理解、工程治理、AI 应用方法。
- Target reader: 正在做知识库、合同审查或长文档问答的开发者
- Summary: 解释 chunk size、overlap、元数据和合同条款切分之间的关系。
- Public angle: 把 chunk 讲成 RAG 的最小证据单元，强调切分质量如何影响召回、引用和审查报告。
- Knowledge points: Chunk size、Overlap、元数据、引用溯源
- Project examples: Legal RAG 条款级切分、企业制度文档入库

## Article Outline
- Problem boundary
- Core mechanism
- Engineering tradeoffs
- Example from this site or a sanitized project
- Common failure modes
- Practical checklist

## Model Strategy
- Writing mode: Codex-only scaffold/review.
- Model channel: none.
- 本轮没有调用 live model、`--generate`、`--polish-from` 或 live doctor。
- 历史正文里保留的模型表达已经按当前代码证据局部改写；如未来继续模型润色，应先确认 `strong` / `review` profile，再由 Codex 做事实、安全和重复度复核。

## Review Gates
- [x] Every project claim is backed by the evidence pack.
- [x] No private or sensitive information is included.
- [x] The selected column matches the actual purpose of the article.
- [x] Model-generated placeholders have been replaced or removed before publishing.
- [x] Hidden drafts remain hidden until explicitly curated.
- [x] No live model use happened in this refresh.
- [x] Estimated page and citation quote boundaries are explicit.
- [x] Practical checklist covers diagnostics and refusal paths.
- [ ] Publication still needs human review, optional screenshot/diagram decision, final code recency check, and explicit curation.

## Promotion Checklist
- [ ] Convert reviewed content into `src/data/blog-posts/<slug>.ts` only after review.
- [ ] Add summary metadata to `src/data/blog.ts`.
- [ ] Register a loader in `src/data/blogContent.ts` only if the post should be public/loadable.
- [ ] Add `blogCuration` only when ready for public visibility.
- [ ] Run `npm.cmd run blog:audit`, `assistant:index`, `sitemap:generate`, `lint`, and `build` after public promotion.

## Draft Body

### RAG 文档切分：Chunk 为什么决定答案能不能被验证

在构建 RAG 系统时，很多人第一时间关心的是 Embedding 模型的召回率，或者大模型最终生成的效果。但一旦系统进入合同审查、企业制度问答这类严肃场景，用户最在意的往往不再是“答案看起来对不对”，而是“答案能不能被验证”。

在这种需求下，文档切分就不再只是“把长文本塞进上下文窗口”的预处理步骤。每一个 Chunk，本质上变成了 RAG 系统的最小证据单元。切分的粒度、重叠怎么处理、元数据有没有保留，直接决定了最终生成出来的审查报告或问答引用是否可信。

这篇文章会从工程实践的角度，讨论 Chunk 的切分质量如何影响召回、引用溯源，以及在高要求场景下怎么取舍。

---

## 1. 问题的边界：为什么“能找到”不等于“能验证”

长文档问答或合同审查里，一个很典型的糟糕体验是这样的：LLM 给出了一段看起来很专业的结论，末尾还标了 `[1]`。用户点开引用来源，弹出来的却是一段 1000 Token 的文本块，里面横跨三个不同章节的内容。用户只能在这 1000 Token 里自己翻找，试图找到支撑结论的那一两句话。

这个问题的根源，在于切分边界和语义边界没有对齐。

一旦 RAG 的目标变成“生成可验证的报告”，问题的边界就从“怎么提高向量相似度”，转移到了“怎么提供精准的上下文证据”。如果一个 Chunk 跨了多个独立的合同条款，或者在切分时丢了“这是哪份文件、哪个章节”的信息，这个 Chunk 作为证据就是失效的。

## 2. 核心机制：把 Chunk 当成最小证据单元

要让答案可验证，需要重新审视文档切分里的三个核心参数：Chunk size、Overlap 和元数据。

**Chunk Size：证据的聚焦程度**
过大的 Chunk 会带进大量噪声，让 LLM 在生成时注意力偏移，同时让用户的溯源成本变得很高；过小的 Chunk 又容易丢掉必要的前置条件，比如只切到“应当承担违约责任”，却漏了前面触发这条责任的前提。在严肃场景下，Chunk Size 不应该由 Token 数量决定，而应该由“一个完整的逻辑单元”来决定。

**Overlap：证据的连贯性保障**
Overlap 的工程初衷，是为了防止硬切分截断关键句子。但从溯源视角看，Overlap 更重要的作用是保护“指代关系”和“条件-结论关系”。适当的重叠能保证，即使命中了边缘内容，LLM 和用户也能看到完整的语义闭环。

**元数据：证据的防伪标签**
纯文本的 Chunk 是没有定位能力的。一个合格的证据单元，必须携带丰富的元数据：文档名称、版本、章节标题、段落层级，甚至 PDF 的物理页码。当 LLM 引用这个 Chunk 时，前端就可以把这些元数据渲染成清晰的溯源卡片，而不是只甩一段裸文本。

## 3. 工程上的权衡：固定长度 vs. 语义/结构化切分

实际开发中，通常会面临两种切分策略的选择。

**策略 A：基于 Token/字符的固定长度切分（比如 LangChain 的 `RecursiveCharacterTextSplitter`）**
- 优势：实现非常简单，处理速度快，几乎不需要针对特定文档格式做适配。
- 劣势：对证据的破坏性很大。它可能把一条完整的免责条款从中间一分为二，导致前半部分和后半部分在向量空间里被映射到完全不同的方向，最终无法被同时召回。

**策略 B：基于文档结构的语义切分（比如按 Markdown 标题、HTML 标签或正则匹配条款来切分）**
- 优势：很好地保留了证据的完整性。召回的内容天然具备逻辑独立性，LLM 总结和用户验证的体验都明显更好。
- 劣势：工程复杂度高。需要写不少解析器来处理各种脏数据，有时甚至要引入多模态模型来解析复杂 PDF 的版面结构。

在合同审查这类高要求场景下，通常必须选择策略 B，或者采用“结构化切分 + 内部二次固定长度切分”的混合方式。

## 4. 实践案例：Legal RAG 的 section-aware chunk

Legal RAG 当前没有把“条款级切分”写成一个笼统口号，而是在 splitter 里做了几层可验证的边界处理。

第一层是文本清洗。导入服务会先调用 `cleanText`，统一换行、tab、连续空格和过多空行。这个动作看起来基础，但它决定后续按空行拆段是否稳定。如果清洗前后格式差异太大，chunk 边界就会变得不可复现。

第二层是 section 识别。`detectSection` 会尝试识别三类信息：`第...条` 形式的合同条款标题、`位置：` 开头的位置标题，以及长度不超过 28 且没有句末标点的短标题。识别出的 section 会写进 chunk，也会在 citation 里展示出来。

第三层是边界切换。splitter 按空行分段累积文本；如果新段落以条款或位置开头，并且当前 chunk 已有内容，就先推送当前 chunk，再开启新 chunk。这样做的目标不是绝对语义理解，而是避免一个 chunk 横跨多个明显的条款或位置段落。

第四层是长度兜底。当前 `CHUNK_SIZE` 是 850，`OVERLAP` 是 120。普通段落会尽量累积到限制内；超长段落再按固定窗口切分并带 overlap。也就是说，项目没有完全依赖固定长度，也没有假装能理解所有复杂文档结构，而是采用“结构优先，长度兜底”的折中。

这些 chunk 之后会保留 `title`、`content`、`chunkIndex`、`page`、`section`、`tokenEstimate` 和带 `projectId` 的 metadata。这里的 `page` 目前是按 chunk index 估算出的轻量页码，不是 PDF parser 提取的真实物理页码，所以公开讲解时不能把它包装成完整 PDF 溯源能力。

回答阶段生成 citation 时，会把 `title`、`section`、`chunkIndex` 和 quote 返回给前端。quote 会压缩空白并截断到适合卡片阅读的长度；QA 页面则把它渲染成可点击的引用来源。用户看到的不是“模型说了什么”，而是“这个结论关联到哪份文档、哪个 section、哪个 chunk 摘录”。

这也是 chunk 策略和前端体验之间最直接的关系：如果切分时丢了 section，前端就只能展示弱引用；如果 chunk 横跨多个条款，quote 可能仍然存在，但用户复核成本会明显上升。

## 5. 常见的失效模式

在构建可验证的 RAG 系统时，下面几个失效模式比较容易踩坑。

1. **代词悬空**
   切分时把“张三在 2023 年成立了公司。”和“他持有 60% 的股份。”切到了两个 Chunk。用户问“张三的持股比例”，第二个 Chunk 即使包含答案，也因为缺乏主语而很难被向量检索召回。

2. **“科学怪人”式的上下文拼接**
   当 Overlap 设得过大，且检索召回了相邻的两个 Chunk 时，如果没有在组装 Prompt 前做去重或合并，LLM 会看到大量重复甚至错位的句子，容易产生幻觉。

3. **元数据剥离**
   文档经过多个清洗管道时，最初提取的页码或章节信息被意外丢弃，最终存入向量数据库的只剩纯文本，溯源能力彻底丧失。

## 6. 实用检查清单

如果你正在重构知识库的文档切分模块，建议在部署前检查下面几项：

- [ ] **边界测试**：随机抽 20 个 Chunk，人工读一遍，评估它们是否构成一个独立、可理解的语义单元。
- [ ] **元数据校验**：检查存入向量数据库的 Payload，是否包含足够让用户在原文件里定位的字段（比如页码、章节名、文档 ID）。
- [ ] **独立检索测试**：暂时关掉 LLM 生成模块，直接输入 Query，观察召回的 Top-3 Chunks 能不能直接作为证据回答问题。
- [ ] **UI 溯源闭环**：前端界面是否提供了明显的引用标记；点击引用后，能不能高亮显示对应的 Chunk 文本及其元数据。
- [ ] **诊断字段检查**：一次问答是否能看到 vector、keyword、filtered、reranked 等候选数量，帮助定位是切分坏了、召回弱了，还是排序/生成出了问题。
- [ ] **拒答路径检查**：当资料不足或问题越界时，系统是否会拒答，而不是拿弱相关 chunk 硬生成一个顺滑结论。

发布前还需要再做一轮人工审稿：核对 Legal RAG 最新代码、是否补真实截图或流程图、是否需要模型润色，以及是否和 RAG 总览/向量检索草稿产生重复。

## Publish Blockers
- 需要人工确认本文不会和 RAG 总览、embedding / 向量检索专题重复。
- 需要在发布当天重新核对 splitter、text helpers、citation 和 QaView 是否仍保持当前字段与行为。
- 如果补截图，优先使用真实公开 QA 引用卡片或自制流程图；不使用伪造后台或未验证线上状态的生成图。
