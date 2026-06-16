分析完成。以下是只读实施计划。

## blog-semi 站点版本化截图实施计划

### 一、要截哪些路由

站点用客户端 `pushState` 路由(`src/App.tsx:22-27`),不是真正的多页应用。直接访问对应路径即可命中初始视图:

| 视图 | 路由 | 注意 |
| --- | --- | --- |
| 首页 | `/` | `home` 视图,含 hero 轮播 + 项目分类 + 案例矩阵 |
| 项目页 | `/projects` | `projects` 视图,默认进入 AI 分类展示台 |
| 博客页 | `/blogs` | 路由是 `/blogs`(复数),不是 `/blog`;`viewByRoute` 映射到 `blog` 视图 |

只截这三个顶层视图,不进入任何 `*Detail` 详情页(任务非目标)。

### 二、尺寸与文件命名

固定两档,与 `current-task.md` 的 Allowed Paths 完全一致,不要改名:

- 桌面 `1440x900`,移动 `390x844`
- 输出目录:`public/images/projects/showcase/`

```
blog-semi-home-desktop.png      blog-semi-home-mobile.png
blog-semi-projects-desktop.png  blog-semi-projects-mobile.png
blog-semi-blogs-desktop.png     blog-semi-blogs-mobile.png
```

CSS 断点为 `1180px / 980px / 760px`(`src/App.css`),所以 1440 命中完整桌面布局、390 命中最窄移动布局,两档能覆盖响应式两端。

### 三、截图执行方式

1. 本地起 `npm run dev`(Vite,默认 `5173`)。
2. 用 playwright MCP:`browser_resize` 设视口 → `browser_navigate` 到目标路由 → 等内容稳定(hero 图、项目预览图为 `loading="lazy"`,需滚动或等加载)→ `browser_take_screenshot` 存到目标文件名。
3. 建议用 `fullPage: true` 截整页,确保案例矩阵、项目缩略图带等下方内容都进入证据;若只要首屏需明确说明。
4. 暗色/语言状态保持默认(`light` + `zh`,见 `src/App.tsx:338-339`),与站点当前主内容一致。

### 四、公开安全风险(重点核查)

- 本任务截的是站点自身公开内容,正文已脱敏,风险低于此前 ERP/xunqiu 任务。
- 仍需确认:截图里不要出现浏览器地址栏中的 `localhost:5173` 私有端口、本地路径、devtools、个人书签栏。playwright 截的是页面内容区,默认不含浏览器 chrome,符合要求。
- hero 轮播第一张是 `legal-rag-reviewed.png`,确认载入的是已脱敏的既有素材,不引入新敏感图。
- 控制台不应有报错或失败请求(验收标准第 9 条),截图前先看 `browser_console_messages` / `browser_network_requests`。

### 五、验证命令

按 CLAUDE.md 顺序:

```bash
npm run lint
npm run build
```

加上:
- PNG 解码与尺寸核验(确认 1440x900 / 390x844,文件能 decode)。
- 浏览器 QA:`/`、`/projects`、`/blogs` 在两档视口下加载,无 console error、无失败请求、无横向溢出(`.project-thumb-strip` 用了 `overflow-x: auto`,`src/App.css:124`,移动端要确认是预期内的内部滚动而非整页溢出)。
- 改了 `docs/showcase-assets.md` 后,跑一次敏感/公开措辞扫描。

### 六、不要做的事

- 不重设计首页、项目页、案例页、博客页,不改页面文案。
- 不动 `../reference-projects`。
- 不引入真实用户数据、凭据、本地路径、cookie、token、部署密钥。
- 不截管理后台或已登录的第三方页面。
- 不顺手补其他项目的素材缺口(超出本切片范围)。
- 文件名严格按 Allowed Paths,不自创命名或额外尺寸。
- 在 `docs/showcase-assets.md` 里只把 blog-semi 那一行的「版本化截图」缺口标为已覆盖,并在「已上线文件」追加这 6 个路径,不改其他行。

补充一点:`docs/showcase-assets.md:24` 当前 blog-semi 行缺口写的是「首页、项目页、博客页的版本化截图」,完成后应改为「无」,下一步列保留每次大改后的桌面/移动截图。

需要我继续进入实施(切换出只读模式)吗?
