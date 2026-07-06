# Cross-project autonomous improvement round 6

## Goal

Continue sustained improvements across blog-semi and related projects after Round 5, prioritizing Xunqiu status/APK/backend gates, Playlab/game showcase checks, project-detail visual evidence, and internal assistant knowledge-admin polish while recording manual/platform gates.

本轮继续用户的长期自主完善目标：在用户休息期间，默认按推荐路线推进 `blog-semi` 主站及关联项目中可本地验证、可公开展示、能提升演示可信度的工作；遇到平台、凭据、发布审批或真实模型调用，只记录人工 gate，不阻塞其他任务。

## Requirements

- R1. 先完成可本地验证的主站/关联项目改进，不等待云平台手动操作。
- R2. 每个关联项目开工前读取该项目自己的 `AGENTS.md`、`CLAUDE.md`、`.cursor/rules`、README、脚本和 git 状态。
- R3. 优先级默认如下：
  - P1 Xunqiu 展示、APK、后端状态和主站 status/项目详情同步。
  - P1 Game/Playlab 外链、试玩入口、截图/标题/favicon/status 一致性。
  - P1 项目详情页正文配图、流程图、架构图和证据结构继续补强。
  - P1 内部助手知识管理、Agentic Workspace 管理体验、低敏诊断和本地 smoke。
  - P2 博客知识积累内容质量、AI Daily/Studio 写作流程和人工审核队列。
- R4. 不提交真实 token、数据库 URL、模型渠道、后台密码、私有后台地址、签名文件路径、未批准 APK 链接或真实用户数据。
- R5. 不做 provider ping、模型测活或无业务意义 doctor；真实模型调用只能用于用户批准的业务任务。
- R6. 每个子任务必须有可审计产物：代码、数据、状态快照、验证记录、文档沉淀或 manual gate 更新。
- R7. `blog-semi` 在 `main` 成功提交后默认推送 `origin main`；关联仓库推送前先确认仓库规则、分支和敏感 diff。

## Acceptance Criteria

- [ ] 父任务包含 `prd.md`、`design.md`、`implement.md` 和 `manual-gates.md`。
- [ ] 至少完成 1 个 P1 子任务并推送可验证成果。
- [ ] 至少一个关联项目的公开展示、状态页或演示入口可信度得到改进。
- [ ] 已完成子任务都有最小相关验证记录。
- [ ] 人工 gate 集中记录，且没有阻塞其他可推进任务。
- [ ] 没有提交任何密钥、生产凭据、数据库连接串、私有模型渠道、未批准 APK 链接或敏感业务数据。
- [ ] 完成整轮后汇总结果、剩余人工待办、验证记录、提交和后续建议。

## Notes

- 本父任务只管理路线和验收；实现由子任务完成。
