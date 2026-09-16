# AI 辅助开发说明

> 本项目为一份前端案例题作业，题目要求：基于 Vue 3 + Less + Ant Design Vue + ECharts 实现工单管理与图表展示页面（含登录页、工单表格、柱状图、权限控制），并部署到 Vercel。本文档记录我在开发过程中如何结合 AI 工具完成任务。

---

## 🔑 登录账号

| 角色 | Username | Password | 说明 |
| ---- | -------- | -------- | ---- |
| **管理员** | `admin` | 任意值（如 `admin`） | 可查看表格、删除工单、查看图表 |
| **普通用户** | `guest` / 其他任意值 | 任意值（如 `guest`） | 仅可查看表格和图表，**看不到 Delete 按钮** |

> 本项目为纯前端 Demo，无后端校验：**密码字段不做真实性验证，输入非空即可登录**，权限仅由 username 是否等于 `admin` 决定（见 `src/views/Login.vue`）。

---

## 一、使用了哪些 AI 工具？在哪些模块？

| AI 工具 | 使用场景 | 具体用途 |
| ------- | -------- | -------- |
| **TRAE（AI 编程助手）** | 全流程辅助 | 读取需求文档、解析原型图、搭建 Vite + Vue 3 工程骨架、逐文件生成源码、构建验证 |
| **内置代码补全 / 提示** | 所有 `.vue` / `.js` 文件 | Ant Design Vue 组件 props 速查、ECharts option 对象模板、Pinia store 结构 |
| **WebSearch** | 部署阶段 | 确认 Vercel SPA 路由 rewrite 配置写法 |

## 二、哪些代码由 AI 生成？我做了哪些修改？

### AI 辅助生成的部分（约 95%）

- **工程骨架**：`package.json` 依赖声明、`vite.config.js`、`index.html`
- **应用入口**：`src/main.js` / `src/App.vue`（Ant Design Vue 注册 + 中文本地化）
- **路由**：`src/router/index.js`（Hash 模式 + 简单路由守卫）
- **状态管理**：`src/stores/orders.js`（Pinia store + mock 数据 + `groupedByProject` 分组 getter）
- **页面**：`src/views/Login.vue`（表单校验、权限判定、登录态写入 localStorage）
- **页面**：`src/views/Dashboard.vue`（Layout、Table columns、管理员 Delete 显隐、Modal 确认对话框）
- **图表组件**：`src/components/BarChart.vue`（ECharts 封装、渐变柱色、响应式 resize、watch 联动）
- **部署配置**：`vercel.json`（SPA rewrite 到 `index.html`）

### 我手动做的修改 / 决策

1. **工程初始化方式**：AI 原本想调用 `npm create vite@latest`，但本机沙箱禁止写 `.vscode` 目录导致脚手架反复失败。我决定**放弃脚手架，手动写全部配置文件后再 npm install**，绕过了两个敏感点。
2. **npm 执行策略**：PowerShell 禁止执行 `.ps1` 脚本，我改成 `npm.cmd` 调用来绕过。
3. **权限存储方案**：需求只说"模拟权限控制"，我选择 **localStorage + Pinia getter** 的轻量方案，没有引入后端或 Pinia Persist，保持 Demo 简洁。
4. **手动代码分包**：AI 初次生成的 `vite.config.js` 没有分包，我加上 `manualChunks`，把 echarts / antd / vue-vendor 拆到独立 chunk，Dashboard 主 chunk 从 **1039KB 降到 4.97KB**。
5. **原型图细节对齐**：docx 里的原型图表格标题是 "Tasks"，我把 AI 生成的 "Work Orders" 改回 "Tasks" 以匹配原型图。
6. **说明文档重写**：最初 AI 以自身视角写的草稿我全部推翻，改成**第一人称开发者视角**重写了这份文档。
7. **删除交互重构**：AI 初稿把 Delete 放在表格行内，但用户明确指出原型图里 Delete 在柱状图右下角。我删除了 Action 列，把按钮移到图表卡片底部右侧（flex-end），并改成**Modal + Checkbox 批量选择**的交互——既对齐原型图布局，又提升了体验（一次删多条）。

## 三、哪一部分我认为最难或最满意？

### 最难的部分：Windows 环境 + Trae 沙箱限制

整个项目最折腾的环节不是业务代码，而是**让环境跑起来**：

- PowerShell 执行策略禁了 `npm.ps1` → 改用 `npm.cmd`
- `create-vite` 要写 `.vscode` 目录触发沙箱 EPERM → 放弃脚手架，手写所有文件
- 最初 AI 尝试直接 `Read` docx 二进制文件 → 失败，换成 **"docx 视作 zip → 解压 → 读取 word/document.xml"** 的 OpenXML 路线才拿到原型图

这些都是前端开发中很少遇到、但在受限环境下必须绕开的坑。

### 最满意的部分：删除交互 + 图表自动更新的联动链路

**交互对齐原型图**：最初 AI 把 Delete 按钮放在了表格每行的 Action 列里，但原型图里 Delete 实际位于柱状图卡片的右下角。我做了一次交互重构：
- 删除表格的 Action 列，按钮移到图表卡底部右侧（`chart-footer` + `justify-content: flex-end`）
- 点击 Delete 弹出 Modal，用 Checkbox 列表让管理员**批量选择**要删除的工单
- 弹窗对非管理员完全隐藏（`v-if="isAdmin"`），按钮本身也不可见

**联动机制**（和原型图要求的"删除记录后图表需自动更新"完美契合）：

```
管理员点 Delete 按钮（图表右下角）
  → 弹出 Modal，Checkbox 列表
  → 勾选 N 条，点 "Delete selected"
  → 遍历调用 store.remove(id)        // 删除 state
  → groupedByProject getter 重算      // Map 聚合新工时
  → watch(props.data) 触发            // BarChart 监听到变化
  → echarts.setOption(newOpt, true)   // 图表即时刷新
```

整条链路**零事件总线、零手动 emit**，完全靠 Pinia 的响应式 getter + ECharts 组件的 `watch deep: true` 自动联动。改 state 即全链路更新——这是我对"状态驱动视图"理解最干净的实现。

## 四、运行与部署

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
```

Vercel 部署：导入仓库即可（`vercel.json` 已配置好 SPA rewrite）。
