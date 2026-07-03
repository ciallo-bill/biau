# Pet showcase APK public release gate

## Goal

把 Pet 展示页的 APK 下载从“发布门禁说明”推进到“符合公开条件后可下载”。如果当前工作区没有满足公开条件的 release APK，则记录 blocker 和缺口，不公开 debug / unsigned / 未核验包。

## Requirements

- 只基于 `D:\workspace4Cursor\pet` / `pet/gamer` 工作区和主站现有展示页的真实文件与构建证据判断，不依赖旧 README。
- 公开 APK 前必须满足：
  - release 或等价公开构建，不是 debug 包。
  - 有版本号、构建时间或 release note。
  - 有 SHA-256 校验摘要和文件大小。
  - 下载文件放在公开静态目录或确认的公开下载位置。
  - 展示页说明当前版本、适用平台、安装风险提示、回滚/后续版本方向。
  - 不暴露签名文件路径、密钥、内部 API、私有账号、未脱敏截图或本地绝对路径。
- 如果条件满足，更新 `public/pet-app-showcase/` 下载入口、主站项目页/状态说明和必要的 synthetic/status 检查。
- 如果条件不满足，保持下载 gate，不放真实下载链接，并在任务记录中列出缺失项和下一步。

## Acceptance Criteria

- [ ] 已检查 Pet 工作区构建产物并记录 APK 是否满足公开条件。
- [ ] 满足条件时，展示页能直接下载公开 APK，并显示版本、大小、SHA-256、风险提示和回滚说明。
- [ ] 不满足条件时，展示页仍保持 gated 状态，且任务记录列出 blocker。
- [ ] 主站 Pet 项目页、状态页或 synthetic 检查与实际下载状态一致。
- [ ] `npm.cmd run pet:synthetic`、`npm.cmd run lint`、`npm.cmd run build` 通过或记录不可运行原因。
- [ ] `git diff --check` 与敏感扫描通过。

## Human Review Gate

- 用户已要求“按照 APK 的公开条件把 APK 公开出来”，但如果发现当前只有 debug/unsigned/未知来源包，不能绕过条件公开；必须记录 blocker。
