# Repository Guidelines

## 项目结构与模块组织

本仓库是一个静态 Web 工具，并带有 Electron 桌面端封装。核心页面在
`index.html`，浏览器端逻辑在 `app.js`，样式在 `styles.css`。Electron
入口位于 `desktop/`：`main.cjs` 负责窗口、菜单和导航限制，`preload.cjs`
用于隔离预加载桥接。第三方前端依赖放在 `vendor/`，当前主要是
`vendor/xlsx.full.min.js`。GitHub Pages 部署流程位于
`.github/workflows/pages.yml`；本地打包产物输出到 `release/`，不要提交。

## 技术栈与代码规范

技术栈保持轻量：原生 HTML、CSS、JavaScript、Electron、`electron-builder`
和 vendored XLSX 解析库，不引入前端构建链。遵循现有风格：JavaScript 使用
分号，嵌套块使用两空格缩进，稳定引用优先使用 `const`，变量和函数使用清晰的
camelCase，例如 `dashboardState`、`rankingMetricSelect`、`createWindow`。
DOM 查询集中放在 `app.js` 顶部附近，渲染、解析、事件处理逻辑拆成职责明确的小
函数。保留既有中文用户界面文案。

## 开发、构建与验证命令

- `npm install`：安装 Electron 和打包依赖。
- `npm run desktop`：用当前源码启动桌面端。
- `npm run check`：对 `desktop/main.cjs`、`desktop/preload.cjs`、`app.js`
  执行 Node 语法检查。
- `npm run pack`：在 `release/` 生成未压缩桌面端构建。
- `npm run dist`：生成各平台安装包。

静态网页可直接打开 `index.html`，也可使用本地静态服务器。需要本地构建预览时，
应监听 `0.0.0.0` 并返回或告知本机局域网 IP 访问地址，例如
`http://192.168.x.x:5177/`，便于同网段设备验证。

## 测试与提交流程

当前没有独立自动化测试套件。提交前至少运行 `npm run check`，并手动验证受影响
流程：CSV/XLSX 上传、模拟驾驶舱、结果导出、Electron 启动或静态页面访问。遵循
最小改动原则，只改完成目标所必需的文件和行为；编译、检查、手动验证通过后再提交。
每次提交或交付本地页面改动时，都应启动可局域网访问的静态预览服务，并把本机局域网
访问网址发给用户验证。
每次改动都应形成一个聚焦、可回滚的原子 git 提交。如新增测试，请放入 `tests/`
并在本文补充运行命令。

## 安全与数据约束

不要保存、提交或缓存任何本地敏感数据，包括用户上传表格、导出结果、API Key、
本地路径、账号信息和构建产物。应用当前设计是不内置业务数据、不读取环境变量、不
使用持久化浏览器存储；新增存储、网络请求或 Electron 能力时必须保持这一隐私模型。

## 设计与可视化原则

遵循奥卡姆剃刀：优先选择最简单、最高效、最容易维护的实现，不为短期需求引入复杂
抽象。页面设计应具备清晰的信息层级、稳定的交互状态和良好的视觉节奏。数据可视化
要服务于业务判断：图表可读、指标命名明确、颜色克制且有区分度，避免装饰性元素干扰
排行、趋势、热力图和机构对比等核心信息。

## Commit 与 Pull Request 规范

近期提交使用简短祈使句，例如 `Add region average markers to institution
bars`，回滚使用标准 `Revert "..."`。每个提交聚焦一个行为变化。PR 应包含变更摘要、
验证步骤、可见 UI 改动截图，以及对数据安全、外部 API、部署或打包影响的说明。验收
通过后推送到 `main`，由 GitHub Pages workflow 自动部署线上静态页面。
