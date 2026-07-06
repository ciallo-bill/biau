# Round 6 Xunqiu status APK backend gate

## Goal

Inspect Xunqiu frontend/backend repositories and improve main-site Xunqiu status, APK, backend, or project-detail gate semantics using only public-safe local evidence.

本任务目标是把“寻球”相关公开展示和可靠性观察从泛泛说明推进到更可验证的状态：APK 是否公开、后端是否可观测、展示页和项目详情是否准确，必须基于本地仓库和公开安全数据，不把未批准下载或生产配置写进 Git。

## Requirements

- R1. 读取 `D:\workspace4Codex\xunqiu` 和 `D:\workspace4Codex\xunqiu-backend-modern` 的本地规则、README、脚本和 git 状态。
- R2. 检查 `blog-semi` 当前 Xunqiu 项目详情、状态目标、synthetic 脚本和 public status 快照。
- R3. 如果能从本地证据确认展示/状态缺口，完成一个小步改进：优先选择状态契约、APK gate、后端 health gate、项目详情说明或验证脚本。
- R4. 不公开真实后端 URL、数据库 URL、token、账号密码、签名路径、未批准 APK 下载链接或私有监控地址。
- R5. 不执行需要生产凭据的 live 调用；外链可用性只做低敏访问或记录为人工 gate。
- R6. 修改后运行相关主站验证；如果修改关联仓库，也运行该仓库的最小相关验证。

## Acceptance Criteria

- [x] 已读取 Xunqiu 前端/后端项目规则、README、脚本和 git 状态。
- [x] 已确认主站当前 Xunqiu 展示/status/synthetic 语义。
- [x] 完成一个 public-safe、可本地验证的 Xunqiu gate 或展示改进。
- [x] 相关验证通过，并记录不能自动处理的人工 gate。
- [ ] 提交并推送 `blog-semi`；关联仓库只有在符合仓库规则且 diff 安全时才提交/推送。

## Notes

- 本任务默认不发布 APK；只允许记录 gate 或展示已批准公开的产物。
- `D:\workspace4Codex\xunqiu` 是聚合目录，Android64 目录不是独立 git 仓库；`xunqiu-showcase-site` 是独立干净仓库；`D:\workspace4Codex\xunqiu-backend-modern` 是独立干净仓库。
