import type { BlogPost } from '../blogShared'

const post: BlogPost = {
  "slug": "pet-workspace-pipeline",
  "title": "AI 生成管线：任务编排、QA Gate 与 App 发布边界",
  "tag": "AI 应用",
  "category": "tech",
  "detail": "生成类 AI 项目不能停在单次出图。本文讨论如何把生成任务、自动质检、人工复核、发布记录和 App API 组织成可控管线。",
  "date": "2026-06-14",
  "readTime": "11 min",
  "series": "项目案例",
  "knowledgePoints": [
    "AI 生成管线",
    "QA Gate",
    "App API 契约"
  ],
  "scenarios": [
    "AI 素材生成",
    "移动端资产发布",
    "人审工作台"
  ],
  "practiceChecklist": [
    "为生成任务设计 queued、running、qa_failed、reviewing、published 等状态",
    "用 QA Gate 过滤结构缺失和明显不合格产物",
    "让 App 只消费稳定资源契约，不理解生成管线内部细节"
  ],
  "sections": [
    {
      "title": "业务背景：生成结果需要进入流程",
      "body": "生成类项目最容易停留在“输入提示词，得到一张图”的阶段。但当生成结果要进入移动端应用，系统就必须回答更多问题：任务现在处于什么状态，产物结构是否完整，质量是否达标，谁确认发布，App 如何拿到稳定资源。生成能力只有进入管线，才具备可交付价值。"
    },
    {
      "title": "任务模型：从 prompt 到可追踪 Job",
      "body": "每次生成都应该形成独立任务，记录输入摘要、模型配置、资源版本、当前状态、失败原因和 traceId。queued、running、qa_failed、repairing、reviewing、published 等状态能让前端展示进度，也能让 Worker 在失败后重试或恢复。任务模型越稳定，后续接入新模型和新资源类型越轻。"
    },
    {
      "title": "QA Gate：先过滤结构和流程问题",
      "body": "自动质检不是为了完全替代人工，而是把明显不合格的候选提前挡住。QA Gate 可以检查资源是否缺文件、尺寸是否正确、元数据是否完整、命名是否符合约定、是否能被 App 正常读取。这样人工复核可以把注意力放在视觉质量、风格一致性和发布判断上。"
    },
    {
      "title": "人工复核：高影响资产要有发布记录",
      "body": "AI 生成资产一旦进入 App，就会影响用户体验。因此发布前需要人工确认、驳回原因和版本记录。人审并不削弱自动化价值，反而让生成结果有明确责任边界：哪些结果通过了检查，哪些被修复或拒绝，最终哪个版本对 App 可见。"
    },
    {
      "title": "App API：移动端只依赖稳定契约",
      "body": "App 不应该理解 Worker、模型、修复流程和审核细节，只需要消费稳定的资源索引、下载地址、版本号、状态字段和降级资源。通过 App API 契约隔离生成管线内部变化，后续更换模型、调整 QA 规则或迁移对象存储，都不会直接破坏移动端展示层。"
    },
    {
      "title": "案例价值：把 AI 生成做成工程系统",
      "body": "Pet Workspace 的展示重点不是单张生成效果，而是任务编排、QA Gate、人审发布和 App 消费链路。这个案例能说明 AI 生成项目如何从创意实验走向可运营管线，也能体现后端状态机、Worker、审核后台和移动端契约之间的协作。"
    }
  ],
  "takeaways": [
    "AI 生成项目的核心不是单次生成，而是任务、质检、人审和发布闭环。",
    "QA Gate 负责过滤结构和流程问题，人工复核负责最终质量判断。",
    "稳定 App API 能把生成管线和移动端体验解耦。"
  ]
}

export default post
