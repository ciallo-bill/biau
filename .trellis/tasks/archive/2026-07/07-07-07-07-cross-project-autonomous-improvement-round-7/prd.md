# Cross-project autonomous improvement round 7

## Goal

Continue sustained improvements after Round 6, focusing on the internal assistant's Agentic Workspace final-shape readiness, knowledge-admin operations, evidence-first blog quality, and reliability observation across `blog-semi` plus related project surfaces.

本轮继续用户的长期自主完善目标：默认按推荐路线执行，不等待用户醒来做选择；优先推进能本地验证、能提升最终形态、不会泄露敏感信息的改进。涉及云平台、真实生产账号、模型真实业务调用、正式 APK 发布批准等事项只记录为人工 gate。

## Requirements

- R1. 优先收口内部助手最终形态相关的本地可验证问题：成员级模型渠道、知识管理、Agentic Workspace 工作台、低敏诊断、同步/导入状态、会话和管理体验。
- R2. 继续优化主站公开内容质量：知识积累文章要有资料依据、概念解释和项目关联；项目详情页继续提高正文图文证据，但不伪造截图。
- R3. 继续完善可靠性观察：状态页、synthetic JSON、外链可用性和检查脚本必须如实表达 `online/degraded/offline/gated/unchecked`。
- R4. 关联项目主体可以做低风险、可验证的改动，但每次进入前必须读取该项目自己的规则、README、脚本和 git 状态。
- R5. 不提交真实 token、数据库 URL、模型渠道、后台密码、私有后台地址、签名文件路径、未批准 APK 链接、真实用户数据或内部监控地址。
- R6. 不做 provider ping、模型测活、无业务意义 doctor；真实模型调用只能用于用户批准的业务任务。
- R7. 每个子任务必须留下可审计产物：代码、数据、状态快照、验证记录、文档沉淀或 manual gate 更新。
- R8. `blog-semi` 在 `main` 成功提交后默认推送 `origin main`；关联仓库推送前先确认仓库规则、分支和敏感 diff。

## Acceptance Criteria

- [ ] 父任务包含 `prd.md`、`design.md`、`implement.md` 和 `manual-gates.md`。
- [ ] 至少完成 1 个 P1 子任务并推送可验证成果。
- [ ] 内部助手、公开内容、可靠性观察或关联项目展示中至少一个方向得到实质改进。
- [ ] 已完成子任务都有最小相关验证记录。
- [ ] 人工 gate 集中记录，且没有阻塞其他可推进任务。
- [ ] 没有提交任何密钥、生产凭据、数据库连接串、私有模型渠道、未批准 APK 链接或敏感业务数据。
- [ ] 完成整轮后汇总结果、剩余人工待办、验证记录、提交和后续建议。

## Notes

- 本父任务只管理路线和验收；实现由子任务完成。
- 默认第一候选子任务：内部助手知识管理/Agentic Workspace 运营可用性 polish。
