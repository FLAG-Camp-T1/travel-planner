# 前端项目开发指南

本文档规定了前端 React (基于 Vite 构建) 项目的环境配置、启动流程及代码规范。请在开发前仔细阅读。

## 目录

- [1. 环境依赖](#1-环境依赖)
- [2. 初始化与启动](#2-初始化与启动)
  - [2.1 正确导入项目 (IDE 规范)](#21-正确导入项目-ide-规范)
  - [2.2 安装项目依赖](#22-安装项目依赖)
  - [2.3 启动开发服务器](#23-启动开发服务器)
- [3. 代码规范与格式化](#3-代码规范与格式化)
- [4. 常见问题排查 (FAQ)](#4-常见问题排查-faq)
  - [4.1 代码提交时被 pre-commit 钩子拦截](#41-代码提交时被-pre-commit-钩子拦截)
  - [4.2 运行启动命令提示 vite 不是内部或外部命令](#42-运行启动命令提示-vite-不是内部或外部命令)
- [5. JavaScript / JSX 混合开发指南](#5-javascript--jsx-混合开发指南)

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

## 4. 常见问题排查 (FAQ)

### 4.1 代码提交时被 pre-commit 钩子拦截

现象：执行 git commit 时终端抛出红色错误，提示 前端代码格式不规范 或 前端 ESLint 检查未通过，提交被终止。

原因：代码中存在未使用的变量、致命逻辑错误，或排版不符合根目录约定的 `.prettierrc` 规范。

解决步骤：

- 仔细阅读终端输出的报错信息，定位具体出错的文件与行号。
- 确保在 frontend 目录下运行 npm run format 自动修复排版问题。
- 若存在 ESLint 报错（如未使用变量），请手动修改对应代码逻辑。
- 修复完成后，重新使用 git add 将修改后的文件加入暂存区，并再次尝试 commit。

### 4.2 运行启动命令提示 vite 不是内部或外部命令

现象：运行 npm run dev 时，终端报错 vite: command not found。

原因：本地缺少项目运行所需的核心依赖（如 node_modules 文件夹不存在或不完整）。

解决步骤：

- 确认当前终端路径位于 frontend 目录下。
- 执行 npm install 重新下载所有依赖。
- 待进度条走完后，再次执行启动命令。

## 5. JavaScript / JSX 混合开发指南

本项目核心为 TypeScript 架构，已配置了兼容纯 JavaScript 的设置。若需使用纯 JS 进行业务开发，请遵循以下步骤与规范：

### 5.1 严格的文件后缀命名限制

在 Vite 构建体系下，系统对包含 React 语法的 JS 文件扩展名有极其严格的区分限制：

- UI 组件必须使用 .jsx：只要文件中包含任何 React 标签语法（例如 `<div>`、`<Component>` 等），该文件绝对不能命名为 .js，必须命名为 .jsx。错误使用 .js 后缀会导致项目编译错误。
- 纯逻辑代码使用 .js：不包含任何 UI 渲染标签的纯业务逻辑、工具函数（如数学计算、API 请求封装等），请正常使用 .js 后缀。

### 5.2 跨语言调用约定

项目中已完成 ESLint TS + JS 校验与 TS 编译器的兼容放行，你可以基本零阻力进行混合调用：

- 在 JS 中调用 TS：在你的 .jsx 或 .js 文件中，可以直接 import 其他成员编写的 .ts 或 .tsx 文件并使用，Vite 会自动处理编译。
- 在 TS 中调用 JS：其他成员也可以在 .tsx 中直接引入你编写的 .jsx 组件。唯一的区别是，调用 .jsx 组件时 IDE 不会提供强制的 Props 属性类型推断提示（引擎会将其视作安全的 any 兼容处理），但这完全合法且能正常运行。

### 5.3 使用 JSDoc 增强团队协作

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
