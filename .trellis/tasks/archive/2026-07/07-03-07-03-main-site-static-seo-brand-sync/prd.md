# Main site static SEO brand sync

## Goal

把主站静态入口文档和首屏 HTML 元信息从旧品牌 `Biau Labs` 同步到当前公开品牌 `BIAU Port / 泊岸`。在 React 启动前、爬虫抓取、社交分享卡片和协作者阅读 README 时，都不应再看到旧品牌。

## Requirements

- `index.html` 的 `<title>`、description、Open Graph、Twitter title/description 使用 `BIAU Port 泊岸` 口径，并与 `src/utils/seo.ts` 的默认 SEO 文案保持一致。
- `README.md` 标题和项目简介使用 `BIAU Port / 泊岸`，项目定位保持“产品官网 / 项目展示 / 知识库 / 助手入口”，不要退回个人作品集或泛泛展示站叙述。
- 不改动站点域名、图片 URL、部署流程、模型密钥或任何私有配置。
- 不触碰公开项目事实、博客正文或状态 JSON，除非验证命令自动生成必要变化。

## Acceptance Criteria

- [x] `rg -n "Biau Labs|BIAU Labs|biau labs" index.html README.md src public docs` 无命中。
- [x] `index.html` 的静态 title、description、OG 和 Twitter meta 与 `BIAU Port 泊岸` 品牌一致。
- [x] `README.md` 能准确说明当前站点和助手 API 的用途，不包含旧品牌。
- [x] `npm.cmd run lint` 与 `npm.cmd run build` 通过。
- [x] `git diff --check` 与敏感扫描通过。

## Out of Scope

- 不重新设计首页视觉。
- 不修改线上 Cloudflare 配置。
- 不发布博客或改项目案例内容。

## Validation

- `rg -n "Biau Labs|BIAU Labs|biau labs" index.html README.md src public docs`: no matches.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed; Vite kept existing ineffective dynamic import warnings.
- `git diff --check`: passed with Windows line-ending warnings only.
- Sensitive scan: only descriptive `token` / `ADMIN_TOKEN` mentions in README were found; no real secrets or private endpoints were added.

## Spec Update

- Updated `.trellis/spec/frontend/quality-guidelines.md` with the Root Static SEO Shell convention.
