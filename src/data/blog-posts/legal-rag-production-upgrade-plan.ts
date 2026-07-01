import type { BlogPost } from '../blogShared'

const post: BlogPost = {
  "slug": "legal-rag-production-upgrade-plan",
  "title": "Legal RAG 生产化改造路线：从 MVP 闭环到可交付原型",
  "tag": "项目复盘",
  "column": "project-notes",
  "detail": "Legal RAG 已经跑通演示闭环，下一步要补文档解析、pgvector、队列、人审、评估和部署。本文把升级路线拆成可执行阶段。",
  "date": "2026-06-20",
  "readTime": "10 min",
  "series": "AI 应用知识库",
  "knowledgePoints": [
    "项目改造清单",
    "RAG 生产化",
    "交付路线"
  ],
  "scenarios": [
    "legal-rag 下一版规划",
    "项目复盘",
    "AI 应用迭代路线"
  ],
  "practiceChecklist": [
    "保留 MVP 可演示闭环，同时逐步替换生产级依赖",
    "先补 parser、pgvector、队列和评测集四个基础能力",
    "每次改造都保留可验证结果和回滚边界"
  ],
  "sections": [
    {
      "title": "概念：生产化不是推翻 MVP",
      "body": "legal-rag 当前价值是跑通合同导入、chunk、mock embedding、向量召回、RAG 问答、citations 和风险审查闭环。它适合证明产品路径和工程边界，但还不是完整生产系统，因为还缺真实 embedding、持久化向量库、PDF/DOCX/OCR parser、队列、权限和评测集。"
    },
    {
      "title": "第一阶段：补文档解析和清洗",
      "body": "下一版可以先补 PDF/DOCX parser，并设计清洗模块，处理页眉页脚、断行、条款号、表格、页码和 OCR 低置信度文本。文档入库前要保留 source、page、section、chunkIndex 和 quote，为引用溯源打基础。"
    },
    {
      "title": "第二阶段：从内存向量库到 pgvector",
      "body": "把 MemoryVectorStore 替换为 PgVectorStore，使用 PostgreSQL + pgvector 持久化 chunk 和 embedding。查询时结合 documentId、tenantId、status、source 等 metadata filter，再做向量相似度。这样系统重启后数据不丢，也能逐步支持多文档和多租户。"
    },
    {
      "title": "第三阶段：把入库和审查放进队列",
      "body": "文档解析、chunk、embedding、索引写入和批量审查都应该拆成异步任务。API 创建 job，Worker 执行任务并更新状态，前端通过 SSE 或轮询展示进度。失败任务要有 retry、backoff、错误分类和人工接管。"
    },
    {
      "title": "第四阶段：补评估、人审和审计",
      "body": "生产化版本要准备 golden set，统计召回命中率、citation 命中率、风险类型命中率和结构化输出成功率。高风险结论、缺引用结论、低置信度 OCR 结果要进入人工复核，同时记录审核人、决策、修改和时间。"
    },
    {
      "title": "交付材料：让升级路线可解释",
      "body": "展示站可以继续部署为静态网站，legal-rag 应用本身拆成前端、API、Worker、PostgreSQL/pgvector、Redis 和对象存储。交付材料包括架构图、启动文档、环境变量、演示脚本、评测样例和已知边界。这样既能说明现状，也能说明下一版路线。"
    }
  ],
  "takeaways": [
    "legal-rag 下一版重点是 parser、pgvector、队列、评估、人审和部署分层。",
    "生产化不是推翻 MVP，而是在保留闭环的前提下替换关键依赖。",
    "清晰的改造路线能让项目更真实、可迭代、可交付。"
  ]
}

export default post
