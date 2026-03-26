# 项目协作与开发指南

本文档规定了 Travel Planner 项目的整体协作模式、全局环境配置及代码提交规范。请在编写第一行代码前仔细阅读。

## 附录

此处提到的git操作并非都一定要用命令完成。如果还不熟悉git命令，可以尝试一下这个[交互式学习git命令的网站](https://learngitbranching.js.org/)

## 目录

- [1. 全局环境依赖](#1-全局环境依赖)
- [2. 协作开发流程](#2-协作开发流程)
  - [2.1 注意事项](#21-注意事项)
  - [2.2 克隆仓库与初始化](#22-克隆仓库与初始化)
  - [2.3 创建特性分支](#23-创建特性分支)
  - [2.4 推送与合并-PR](#24-推送与合并-pr)
- [3. 代码提交规范](#3-代码提交规范)
  - [3.1 提交格式约束](#31-提交格式约束)
  - [3.2 提交示例](#32-提交示例)
  - [3.3 提交失败处理](#33-提交失败处理)
- [4. 子模块开发指南](#4-子模块开发指南)
- [5. 容器化开发环境 (Docker 一键部署)](#5-容器化开发环境-docker-一键部署)

---

## 1. 全局环境依赖

本项目采用 Monorepo（单体仓库）架构，在根目录配置了全局代码规范检查器（Husky + Commitlint）。**为了保证代码提交时格式检查正常运行，无论是否同时参与前后端开发，均需在本地安装并配置以下基础环境：**

- **Node.js & npm** (v22.0+): 必须安装。用于在代码提交时触发根目录的 Husky 钩子以及执行 Commitlint 提交信息格式检查。
- **JDK 21 & `JAVA_HOME` 环境变量**: 必须正确配置。Husky 钩子会在提交前触发后端 Java 代码的 Spotless 格式化检查，若操作系统未正确配置 `JAVA_HOME` 变量，将导致代码提交失败。

## 2. 协作开发流程

为保证代码库健康，该 Repo 采用类 Git Flow 协作模式，并强制关键变更通过 Pull Request（PR）合并。

### 2.1 注意事项

1. **保护分支**：为了保护其他组员的本地分支不受影响，**禁止**直接向 `main` 和 `develop` 分支推送（Push）代码。这两个分支已被设置保护。
2. **强制 PR**：`main` 与 `develop` 上所有的代码变更（无论多小）都必须通过 **Pull Request (PR)** 合并。
3. **关联 Issue**：提交变更前，请确保 GitHub Projects 看板上已有对应的 Issue 描述此次变更需要解决的问题或需求。

### 2.2 克隆仓库与初始化

日常开发基准分支是 `develop`，而不是 `main`。请按照以下步骤获取最新代码：

```bash
# 1. 克隆整个代码仓库到本地
git clone [https://github.com/FLAG-Camp-T1/travel-planner.git](https://github.com/FLAG-Camp-T1/travel-planner.git)

# 2. 进入项目根目录
cd travel-planner

# 3. 切换到 develop 分支（获取最新开发主干）
git switch develop

# 4. 拉取远端最新代码
git pull origin develop

# 5. 安装全局依赖，初始化 Git Hook 管理工具 Husky
npm install
```

**重要提示：绝对不要使用 IDE 单独打开 frontend 或 backend 子目录！请务必使用 IDE 打开包含 .git 的顶级项目根目录，否则将导致路径错乱、规范检测失效且代码可能无法提交。**

### 2.3 创建特性分支

**切忌**在 develop 分支上直接写代码。开发新功能或修复 Bug 时，请基于 develop 切出一个新的分支。

**分支命名规范：** <类型>/<Issue编号（如有）><简短英文描述>

- 新功能示例：feature/12-user-login
- 修 Bug 示例：bug/34-poi-bookmark-conflict

```bash
# 确保你当前在 develop 分支上，该命令应当返回 develop
git branch --show-current

# 然后创建并切换到新分支
git switch -c feature/<branch-name>
```

### 2.4 推送与合并 (PR)

当你在本地完成开发、通过自测并在本地完成了规范的 Commit（详见第3节）后，将你的分支推送到 GitHub：

```bash
# 将本地分支推送到远端仓库
git push -u origin feature/<branch-name>
```

**在 GitHub 上提交 PR 的步骤：**

1. 登录该项目对应的 GitHub 仓库页面，点击 "Compare & pull request" 按钮。
2. 确保目标分支（base）是 develop，来源分支（compare）是你的特性分支。
3. 填写 PR 描述（关键）：

- 若有关联的 Issue，必须在描述中写明 `Closes #<number>`（数字为你关联的 Issue 编号），以实现 PR 合并后自动关闭关联 Issue。
- 请在 PR 内 @ 与你合作开发该分支的组员（如有）以提醒代码 Review。

4. 点击 "Create pull request"。

## 3. 代码提交规范

为了清晰追踪每次变更，本项目遵循 Angular Commit 规范，并集成了 Commitlint 与 Husky 进行严格校验。

### 3.1 提交格式约束

任何通过 `git commit` 生成的提交记录，**必须**严格符合以下结构，否则在本地执行`git commit -m "<消息>"`就会报错并拒绝提交：

`<type>(<scope>): <subject>`

- **type（必填）:** 提交的类别。只能从以下关键字中挑选：
  - `build`: 与构建过程相关的提交
  - `ci`: 与持续集成（CI）配置相关的提交
  - `docs`: 仅更新文档说明 (Documentation)
  - `feat`: 新增功能 (Feature)
  - `fix`: 修复缺陷 (Bug Fix)
  - `perf`: 性能优化 (Performance)
  - `refactor`: 代码重构 (非新增功能、非修 Bug)
  - `test`: 新增或修改测试用例
  - `chore`: 杂项更新 (如修改构建脚本、更新依赖包)
  - `revert`: 代码回滚

- **scope（选填）:** 影响范围。用于说明本次修改涉及的模块（例如：`auth`, `user-service`, `frontend-ui`）。
- **subject（必填）:** 简短精炼的描述。说明你做了什么。

### 3.2 提交示例

**✅ 标准提交示例**

```bash
# 新增功能演示（带 scope）
git commit -m "feat(auth): add user login token expiry"

# 修复Bug演示（不带 scope）
git commit -m "fix: fix overflow of index page"

# 杂项更新演示（注明了关联的 GitHub 任务）
git commit -m "chore: upgrade Spring Boot dependency (#23)"
```

**❌ 错误提交示例（将被检查器拦截）**

```Bash
git commit -m "更新代码"               # 缺少 type
git commit -m "feat 新增了用户登录"    # 缺少冒号
git commit -m "Fix: 修复空指针异常"    # type 必须是纯小写字母
```

### 3.3 提交失败处理

如果写错了格式导致终端报错，通常会看到中文排错提示。

修复方法：
按照提示执行了格式修复命令后，再执行 `git commit -m "<填写正确格式的提交信息>"` 即可。

如果是因为上一次提交漏了某个文件，想要合并到上一个正确的 Commit 中而不改变提交信息，可以使用：

```bash
git commit --amend --no-edit
```

## 4. 子模块开发指南

有关具体的前端/后端项目的运行命令、调试方式与本地构建细节，请参见各子模块的专属文档：

- [前端项目开发指南-README](./frontend/README.md)
- [后端服务开发指南-README](./backend/README.md)

---

## 5. 容器化开发环境 (Docker 一键部署)

本项目支持使用 Docker 进行一键化的本地开发环境部署。

此方案将自动拉起 PostgreSQL 18 数据库、Spring Boot 后端 以及 React 前端，并支持代码的实时热重载。

> Vite + React 支持标准的热重载，只需修改代码后保存即可\
> Spring Boot 通过引入 devtools 支持检测到构建产物变更时快速重启，需要打开IDE的自动构建项目/自动生成项目选项。

### 5.1 启动环境

在项目根目录下，确保 Docker Desktop 已运行，然后执行：

```bash
# 后台启动并构建所有服务
docker-compose up -d --build
```

首次运行可能需要几分钟下载基础镜像及依赖，需耐心等待。

启动完成后，可以通过以下地址访问服务：

- 前端页面: localhost:5173
- 后端 API: localhost:8080
- 数据库连接: localhost:5432

### 5.2 查看日志

如果某个服务没有正常响应，可以通过以下命令查看容器日志：

```bash
# 查看所有服务的实时日志
docker-compose logs -f

# 仅查看前端或后端的实时日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 5.3 调试后端服务

Docker 容器映射了 5005 端口用于 Debugger 连接。

需要在IDEA中执行以下操作创建一个连接至后端Docker的调试器

1. 创建一个新的运行/调试配置
2. 选择“远程 JVM 调试”

- 模式: 附加到远程 JVM
- Host: localhost
- Port: 5005

3. 在平常运行本地 Spring Boot 应用的位置点 BackendApplication，切换到刚创建的 Debugger
4. 点击 Debug 按钮，连接成功即可正常调试

### 5.4 停止与清理环境

```bash
# 仅停止运行中的容器（保留数据库数据）
docker-compose stop

# 停止容器并移除它们（保留数据库数据）
docker-compose down
```

**⚠️ 彻底清空数据库（危险操作）：**

如果需要清理所有脏数据，让 PostgreSQL 恢复到初始的空库状态，请附加 -v 参数以销毁所有相关的命名卷

```bash
docker-compose down -v
```

---
