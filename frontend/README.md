# 前端项目开发指南

本文档规定了前端 React (基于 Vite 构建) 项目的环境配置、启动流程及代码规范。请在开发前仔细阅读。

## 目录

- [1. 环境依赖](#1-环境依赖)
- [2. 初始化与启动](#2-初始化与启动)
  - [2.1 正确导入项目 (IDE 规范)](#21-正确导入项目-ide-规范)
  - [2.2 安装项目依赖](#22-安装项目依赖)
  - [2.3 启动开发服务器](#23-启动开发服务器)
- [3. 代码规范与格式化](#3-代码规范与格式化)
- [4. Mock 与 Trip Plan 开发入口](#4-mock-与-trip-plan-开发入口)
  - [4.1 环境变量边界](#41-环境变量边界)
  - [4.2 Trip Plan 默认入口](#42-trip-plan-默认入口)
  - [4.3 推荐本地配置](#43-推荐本地配置)
  - [4.4 Mock 失败场景控制](#44-mock-失败场景控制)
  - [4.5 Trip Plan Mock 推荐使用方式](#45-trip-plan-mock-推荐使用方式)
  - [4.6 故障恢复与状态清理](#46-故障恢复与状态清理)
- [5. 常见问题排查 (FAQ)](#5-常见问题排查-faq)
  - [5.1 代码提交时被 pre-commit 钩子拦截](#51-代码提交时被-pre-commit-钩子拦截)
  - [5.2 运行启动命令提示 vite 不是内部或外部命令](#52-运行启动命令提示-vite-不是内部或外部命令)
- [6. JavaScript / JSX 混合开发指南](#6-javascript--jsx-混合开发指南)

---

## 1. 环境依赖

- **Node.js**: v22.0 或更高版本
- **包管理工具**: npm (随 Node.js 内置)

## 2. 初始化与启动

### 2.1 正确导入项目 (IDE 规范)

**重要提示：绝对禁止使用 IDE 单独打开 `frontend` 或 `backend` 子目录！**

本项目采用 Monorepo（单体仓库）架构，全局规范拦截器（Husky + Commitlint）配置在项目根目录。单独打开子目录将导致路径错乱、规范检测失效及代码提交失败。

**VS Code / WebStorm 正确导入步骤：**

1. 启动编辑器，选择打开**项目根目录**（即包含 `.git` 的顶级目录）。
2. 在编辑器内部的终端（Terminal）中，通过 `cd frontend` 进入前端工作区进行后续操作。

### 2.2 安装项目依赖

在首次拉取代码或团队成员更新了 `package.json` 后，必须按以下步骤安装依赖：

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装所有依赖
npm install
```

**注：不要意外将 node_modules 目录提交至git仓库。**

### 2.3 启动开发服务器

在 frontend 目录下执行以下命令启动本地开发服务：

```bash
npm run dev
```

服务启动后，默认监听 5173 端口。

## 3. 代码规范与格式化

本项目已集成 ESLint（用于逻辑与语法检查）和 Prettier（用于代码格式化）。根目录的 Git pre-commit 钩子会在代码提交前进行严格的拦截检查。

为避免提交失败，建议在 IDE 中配置“保存时自动格式化”，并显式指定使用Prettier格式化。若需手动修复，请在 frontend 目录下执行以下命令：

```bash
# 一键格式化项目中所有支持的文件 (格式化涉及缩进、单双引号、分号等)
npm run format

# 检查代码逻辑问题及未使用的变量
npm run lint
```

若直接执行 git commit -m "<消息>", 拦截脚本会执行检查，并在代码不规范时强制中断提交。

## 4. Mock 与 Trip Plan 开发入口

Trip Plan 当前支持在无真实后端时通过 MSW 进行本地演示，但需要明确区分“启用 mock 拦截”和“启用 Trip Plan dev fallback”这两个不同概念。

### 4.1 环境变量边界

`frontend/.env.example` 中这两个变量的职责不同：

- `VITE_ENABLE_MOCK=true`
  - 仅表示在开发环境下启用 MSW，对前端请求做 mock 拦截。
  - 这不会自动帮你进入一个现成 Trip，也不会跳过 Trip Creation。
- `VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=true`
  - 仅表示在开发环境下，为 Trip Plan 显式开启固定 mock trip 的自动 bootstrap。
  - 这是一个额外的 dev fallback 开关，不等同于“mock 已开启”。

### 4.2 Trip Plan 默认入口

- 当 `VITE_ENABLE_MOCK=true` 且没有开启 `VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK` 时：
  - `/planner` 默认仍然进入 creation-first 流程。
  - 这表示你在 mock-only 条件下测试的是“创建 Trip -> bootstrap -> 进入工作区”的主路径。
- 当 `VITE_ENABLE_MOCK=true` 且 `VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=true` 时：
  - `/planner` 会在开发环境中自动 bootstrap 固定 mock trip，便于快速进入已有 Trip 的调试场景。

### 4.3 推荐本地配置

如果你的目标是验证 Trip Plan 默认主路径，推荐保留：

```bash
VITE_ENABLE_MOCK=true
VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=false
```

如果你的目标是直接进入固定 mock trip 做调试，可临时切换为：

```bash
VITE_ENABLE_MOCK=true
VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=true
```

### 4.4 Mock 失败场景控制

当前 Trip Plan 支持通过 URL 参数 `tpMock` 进入少量受控失败场景，用于联调前验证错误态与恢复路径。

- `tpMock` 会覆盖当前 session 中存储的 mock failure flags
- `tpMock=clear` 会清除 `sessionStorage['tp.mock.flags']`
- 如果 URL 中没有 `tpMock`，则沿用当前 session 中已经持久化的 flags

示例：

```text
/planner?tpMock=trip-create-error
/planner?tpMock=trip-bootstrap-trip-error
/planner?tpMock=trip-bootstrap-days-error
/planner?tpMock=trip-day-route-error
/planner?tpMock=clear
```

目前支持的失败标记如下：

- `trip-create-error`：创建 Trip 接口失败
- `trip-bootstrap-trip-error`：bootstrap 过程中获取 Trip 概览失败
- `trip-bootstrap-days-error`：bootstrap 过程中获取 Trip days 失败
- `trip-day-route-error`：为当前 selected day 生成 route 失败

### 4.5 Trip Plan Mock 推荐使用方式

为避免混淆，建议按照以下顺序使用当前 Trip Plan mock 前端：

#### 方式一：验证默认主路径（推荐）

适用场景：验证当前 Trip Plan 在无真实后端下的主要可演示链路是否可正常工作。

推荐配置：

```bash
VITE_ENABLE_MOCK=true
VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=false
```

推荐操作步骤：

1. 启动前端开发服务器并访问 `/planner`
2. 进入 creation-first 页面
3. 手动创建一个 Trip
4. 等待 bootstrap 完成并进入正常工作区
5. 验证 Day Navigation、Itinerary、Day Route、Candidate Places 等当前已完成功能

该方式最接近当前 Trip Plan 的正式前端使用路径，也是日常自测时的首选入口。

#### 方式二：快速进入固定 mock trip

适用场景：你已经确认 creation-first 主路径无误，只想快速调试已有 Trip 的 Day / Route / Map 行为。

推荐配置：

```bash
VITE_ENABLE_MOCK=true
VITE_TRIP_PLAN_ENABLE_DEV_FALLBACK=true
```

启用后，开发环境下访问 `/planner` 会自动 bootstrap 固定 mock trip，省去每次手动创建 Trip 的步骤。

#### 方式三：验证错误态与恢复路径

适用场景：联调前确认 create / bootstrap / route 的失败分支是否可见、可恢复。

建议直接在 URL 上追加 `tpMock` 参数，例如：

```text
/planner?tpMock=trip-create-error
/planner?tpMock=trip-bootstrap-days-error
/planner?tpMock=trip-day-route-error
```

验证重点如下：

- create 失败后，是否仍可留在创建表单并重新提交
- bootstrap 失败后，是否可使用 `Retry Bootstrap` 或返回 creation-first
- day-route 失败后，是否仍可从现有 `Generate Route` 入口再次触发

### 4.6 故障恢复与状态清理

`tpMock` 的失败标记会写入当前浏览器 session，因此仅仅删除地址栏中的 query 参数，并不一定会立即恢复到正常场景。

如需清理当前 mock failure 状态，请直接访问：

```text
/planner?tpMock=clear
```

清理完成后，可按以下方式恢复：

- 如果你处于 Trip Creation 页面，可直接重新创建 Trip
- 如果你处于 bootstrap error 页面，可点击 `Retry Bootstrap`
- 如果你只是验证 route 失败，可回到正常页面后再次点击 `Generate Route`

**重要提示：** 若你发现“明明已经移除了失败参数，但页面仍持续报错”，优先先执行一次 `tpMock=clear`，再继续排查其他问题。

## 5. 常见问题排查 (FAQ)

### 5.1 代码提交时被 pre-commit 钩子拦截

现象：执行 git commit 时终端抛出红色错误，提示 前端代码格式不规范 或 前端 ESLint 检查未通过，提交被终止。

原因：代码中存在未使用的变量、致命逻辑错误，或排版不符合根目录约定的 `.prettierrc` 规范。

解决步骤：

- 仔细阅读终端输出的报错信息，定位具体出错的文件与行号。
- 确保在 frontend 目录下运行 npm run format 自动修复排版问题。
- 若存在 ESLint 报错（如未使用变量），请手动修改对应代码逻辑。
- 修复完成后，重新使用 git add 将修改后的文件加入暂存区，并再次尝试 commit。

### 5.2 运行启动命令提示 vite 不是内部或外部命令

现象：运行 npm run dev 时，终端报错 vite: command not found。

原因：本地缺少项目运行所需的核心依赖（如 node_modules 文件夹不存在或不完整）。

解决步骤：

- 确认当前终端路径位于 frontend 目录下。
- 执行 npm install 重新下载所有依赖。
- 待进度条走完后，再次执行启动命令。

## 6. JavaScript / JSX 混合开发指南

本项目核心为 TypeScript 架构，已配置了兼容纯 JavaScript 的设置。若需使用纯 JS 进行业务开发，请遵循以下步骤与规范：

### 6.1 严格的文件后缀命名限制

在 Vite 构建体系下，系统对包含 React 语法的 JS 文件扩展名有极其严格的区分限制：

- UI 组件必须使用 .jsx：只要文件中包含任何 React 标签语法（例如 `<div>`、`<Component>` 等），该文件绝对不能命名为 .js，必须命名为 .jsx。错误使用 .js 后缀会导致项目编译错误。
- 纯逻辑代码使用 .js：不包含任何 UI 渲染标签的纯业务逻辑、工具函数（如数学计算、API 请求封装等），请正常使用 .js 后缀。

### 6.2 跨语言调用约定

项目中已完成 ESLint TS + JS 校验与 TS 编译器的兼容放行，你可以基本零阻力进行混合调用：

- 在 JS 中调用 TS：在你的 .jsx 或 .js 文件中，可以直接 import 其他成员编写的 .ts 或 .tsx 文件并使用，Vite 会自动处理编译。
- 在 TS 中调用 JS：其他成员也可以在 .tsx 中直接引入你编写的 .jsx 组件。唯一的区别是，调用 .jsx 组件时 IDE 不会提供强制的 Props 属性类型推断提示（引擎会将其视作安全的 any 兼容处理），但这完全合法且能正常运行。

### 6.3 使用 JSDoc 增强团队协作

即使编写的是纯 JS/JSX 文件，为了方便团队中其他成员在调用你的组件时能获得 IDE 的智能参数提示，强烈建议在组件或复杂函数顶部添加极简的 JSDoc 注释：

```javaScript
// 示例：带有 JSDoc 注释的纯 JS 组件

/**
 * 欢迎横幅组件
 * * @param {Object} props
 * @param {string} props.userName - 用户的显示名称
 * @param {string} [props.role] - 用户的系统角色（可选）
 */
export default function WelcomeBanner(props) {
  const userName = props.userName || 'Guest';
  const role = props.role || 'User';

  return (
    <div className="p-4 bg-orange-100 rounded-xl mb-6">
      <h3 className="font-bold">👋 Hello, {userName}!</h3>
      <p className="text-sm">Role: {role}</p>
    </div>
  );
}
```

加上上述注释后，当其他人在任何文件中敲下 `<WelcomeBanner` 时，IDE 将自动提示 userName 和 role 两个属性。

作为参考的js组件与逻辑代码分别位于`components/WelcomeBanner.jsx`与`utils/greetingHelper.js`下，演示效果可访问 http://localhost:5173/login 查看

---
