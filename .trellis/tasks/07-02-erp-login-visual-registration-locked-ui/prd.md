# ERP 登录页视觉与注册关闭态优化

## Goal

在 `D:/workspace4Cursor/erp` 优化 ERP 登录/注册页的第一屏观感和注册关闭态表达，让内部小伙伴或从 BIAU Port 项目页进入的访客更容易理解这是一个受控的团队工作台入口，而不是默认开放注册的公开 SaaS。

## User Value

- 登录页背景更像真实业务系统入口，视觉上能解释“店铺授权、插件采集、后台回填”的工作链路。
- 注册关闭时用户能更快理解下一步：使用已有账号、联系 Owner、回到项目说明，而不是以为页面坏了。
- 保持生产自助注册 gate 不变，降低误导和误操作风险。

## Confirmed Facts

- ERP 当前分支为 `codex/ozon-plugin-parity`，工作树干净。
- `apps/web/src/views/LoginView.vue` 已处理登录、注册、Owner 初始化、注册关闭提示、BIAU Port 回跳和安全说明。
- `apps/web/src/stores/auth.ts` 和后端 auth 已处理 token 同步、注册开关和角色归一化；本任务不改变这些行为。
- 上一个 child task 已在 `/overview` 增加登录后账号/角色与推荐路径引导。

## Requirements

1. 只修改 ERP 登录/注册页展示层，优先 `apps/web/src/views/LoginView.vue`。
2. 增强左侧视觉背景和工作链路表达，但不要引入新的外部图片、真实生产地址或私有信息。
3. 注册关闭态应有更明确的“受控入口”提示和可行动下一步：
   - 使用已有账号登录。
   - 联系 Owner 分配账号。
   - 从 BIAU Port 进入时可回项目说明。
4. 不开启普通注册、不修改 `registrationEnabled` 逻辑、不改变 `/auth/*` 调用或路由守卫。
5. 移动端布局不应出现横向溢出，按钮和提示文字保持可读。

## Acceptance Criteria

- [x] 登录页背景和左侧视觉区更清楚表达 ERP 工作链路和受控入口。
- [x] 注册关闭态比现有 alert 更明确，不诱导开启生产自助注册。
- [x] 登录、注册、Owner 初始化三种模式的原有流程和文案逻辑保持可用。
- [x] 桌面和移动端布局不出现明显挤压或横向溢出。
- [x] ERP root `npm.cmd run build` 和 `npm.cmd run test` 通过。
- [x] `git diff --check` 和变更文件敏感信息扫描通过。

## Validation

- ERP commit: `c7c5bec feat: refine ERP login landing` on `D:/workspace4Cursor/erp` branch `codex/ozon-plugin-parity`.
- ERP push: `origin/codex/ozon-plugin-parity` updated successfully.
- `npm.cmd run build` passed from ERP repo root. The existing build flow rebuilt extension output and synced the extension zip as part of current scripts; no tracked build artifact changed.
- `npm.cmd run test` passed from ERP repo root: API `17` test files / `149` tests, shared `2` test files / `4` tests.
- Login UI smoke passed with mocked `/api/auth/bootstrap` returning `registrationEnabled: false`, across desktop `1440x960` and mobile `390x844`, checking status badge, 3 flow steps, locked guidance, BIAU Port bridge, and no horizontal overflow.
- `git diff --check` passed.
- Sensitive-info scan over `apps/web/src/views/LoginView.vue` found only existing password form field names in the full-file scan; added-line scan found no matches.

## Out Of Scope

- 不修改后端注册策略、权限系统或 token 存储。
- 不新增真实账号、测试密码、生产地址、密钥或私有部署信息。
- 不部署、不发布插件、不更改公开主站项目详情内容。
