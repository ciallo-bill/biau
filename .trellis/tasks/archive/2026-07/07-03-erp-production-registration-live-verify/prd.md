# ERP 生产注册线上验证与主站同步

## Goal

确认 ERP 生产注册不只是代码侧已开放，而是在线上入口真实可用，并把主站展示与状态页同步到准确状态。

## Requirements

- 检查 ERP 代码侧事实：
  - 生产普通自助注册默认开放。
  - 已有 Owner 后，新注册用户默认是 `operator`。
  - `ERP_REGISTRATION_ENABLED=0/false/no/off` 或未知/空值会关闭注册。
- 检查线上事实：
  - 部署分支是否包含最新注册开放提交。
  - 登录页是否出现注册入口。
  - `/api/auth/bootstrap` 是否返回 `registrationEnabled`。
  - 新注册账号能否登录，权限是否不是 Owner。
- 不提交生产账号密码、JWT secret、数据库连接或 HidenCloud 私有配置。
- 若需要用户手动配置平台环境变量，写清变量含义和安全值。

## Acceptance Criteria

- [ ] 记录 ERP 当前线上注册状态：open、closed-by-env、deploy-stale、blocked 或 unchecked。
- [ ] 如线上关闭，能判断是环境变量关闭、部署分支落后、API 不可达，还是前端路由问题。
- [ ] 如线上开放，验证新账号默认权限安全，不自动获得 Owner。
- [ ] 主站 ERP 项目详情和状态页与线上事实一致。
- [ ] synthetic 检查或手动验证步骤可以复现。

## Notes

- 推荐第一步：确认 ERP 部署平台监听的分支。当前本地最新工作在 `codex/ozon-plugin-parity`，需要确认线上是否已经使用包含注册开放提交的分支。

## Evidence 2026-07-04

- Current online status: `deploy-stale` / `registration-degraded`.
- Live ERP entry returned HTTP 200 and the app shell loaded.
- Live `GET /api/health` returned `status=ok`, `nodeEnv=production`, and a public git commit that is an ancestor of local `codex/ozon-plugin-parity`.
- Local ERP branch `codex/ozon-plugin-parity` contains later registration commits, including `e461f6c feat(auth): open erp self registration by default`.
- Live `GET /api/auth/bootstrap` returned `needsSetup=false` and `registrationEnabled=false`; therefore the current production login page will stay in controlled-login mode and will not show the registration switch.
- `npm.cmd run erp:synthetic` with a temporary shell-only API base URL now records `ozon-erp-health=online`, `ozon-erp-auth=degraded`, and `ozon-erp-plugin-sync=unchecked`.
- `npm.cmd run site:status` merges the ERP auth check as `degraded` instead of incorrectly treating a structurally valid bootstrap response as registration-open.

## Manual Follow-Up

- Redeploy ERP from the latest `codex/ozon-plugin-parity` / `origin/main` state, then rerun `npm.cmd run erp:synthetic` with `ERP_SYNTHETIC_API_BASE_URL`.
- If registration is still closed after redeploy, inspect the deployment platform value of `ERP_REGISTRATION_ENABLED`; do not put platform secrets or account credentials in this repository.
- Only after `registrationEnabled=true` should a disposable visitor account be registered to verify the new user role is `operator`.
