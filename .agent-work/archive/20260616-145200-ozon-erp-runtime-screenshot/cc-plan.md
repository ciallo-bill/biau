好的，我已经阅读了当前任务、素材清单和主站路由。现在给出只读分析后的简短实施计划：

## 简短实施计划

### 目标
为 Ozon ERP 案例补充一张公开安全的后台运行截图 `public/images/projects/showcase/ozon-erp-admin-runtime.png`。

### 当前状态分析
1. **素材清单显示**：Ozon ERP 当前有封面图、运营链路图、数据审批模型图、后台模块视图（SVG），但缺少**脱敏真实后台截图**
2. **案例页期望**：`/cases/ozon-erp` 需要展示"管理后台视图目录、Prisma 数据模型、Chrome MV3 插件入口、部署与交付文档"四类证据
3. **源项目限制**：reference-projects/erp 只读，不能启动真实 API/数据库/Ozon 连接

### 最小步骤（推荐方案）

由于源 ERP 项目依赖真实 API + PostgreSQL + Redis + Ozon API，并且涉及真实店铺和订单数据，**不建议启动真实前端**。推荐：

#### 方案 A：复用已有后台模块 SVG（最安全）
- 当前已有 `ozon-erp-admin-console.svg`（后台模块视图）
- **建议**：将该 SVG 复制为 `-runtime.png` 名称，或在 App.tsx 中直接引用现有 SVG
- **优点**：零风险、无需运行、公开安全
- **缺点**：不是"真实运行截图"

#### 方案 B：用 Playwright 对静态 HTML mock 截图
1. 在 `/tmp` 创建脱敏后台 HTML 模板（模拟商品、订单列表布局）
2. 使用 blog-semi 项目的 Playwright MCP 工具截图
3. 输出到目标路径
4. **优点**：像真实页面、可控数据
5. **缺点**：需要编写 mock HTML

#### 方案 C：从设计工具生成占位图（备选）
- 用 Figma 或图片生成工具创建后台布局占位图
- 标注"示例界面，真实数据已脱敏"
- 最不推荐，因为缺少真实感

### 推荐执行（方案 B 详细步骤）

1. **准备 mock HTML**（5 分钟）
   - 创建 `/tmp/ozon-erp-mock.html`
   - 用 Semi Design CDN + 简单表格，模拟商品列表（5-8 行脱敏数据：`商品-001`、`¥ ***`、`库存 **`）
   - 侧边栏：商品、订单、店铺、工具、设置
   - 顶栏：标题 "Ozon ERP 管理后台"

2. **使用 Playwright 截图**（2 分钟）
   ```bash
   # 假设有 playwright MCP 可用
   # 导航到 file:///tmp/ozon-erp-mock.html
   # 截图保存到目标路径
   ```

3. **验证与记录**（3 分钟）
   - 确认 PNG 可解码
   - 扫描是否包含敏感信息
   - 更新 `docs/showcase-assets.md` 标记缺口已覆盖

### 风险
- **最大风险**：如果运行真实 ERP 前端，即使不连 API，也可能暴露配置、路径、店铺 ID 占位符
- **缓解**：只用纯 HTML mock，不启动真实前端代码

### 验证命令
```bash
file public/images/projects/showcase/ozon-erp-admin-runtime.png
grep -r "店铺" public/images/projects/showcase/ozon-erp-admin-runtime.png  # 二进制，预期无文本泄露
npm run lint
npm run build
```

### 浏览器 QA
- 打开 `http://localhost:5173/cases/ozon-erp`
- 确认新截图在证据矩阵中显示
- 检查桌面（1920px）和移动端（393px）响应式

---

**推荐**：先确认用户是否接受**方案 A（复用 SVG）**或**方案 B（Playwright 截图 mock HTML）**，再继续实施。
