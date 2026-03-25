# 协作指引

为保证代码库健康，该Repo采用类Git Flow协作模式并强制关键变更通过Pull Request（PR）合并。

请在编写第一行代码前，仔细阅读并严格遵循以下工作流。

## 注意

1. 为了保护其他组员的本地分支不受影响，**请勿**直接向 `main` 和 `develop` 分支推送（Push）代码。这两个分支已被设置保护。
2. `main` 与 `develop` 上所有的代码变更（无论多小）都必须通过 **Pull Request (PR)** 合并。
3. 提交变更前，请确保 GitHub Projects 看板上已有对应的Issue描述此次变更需要解决的问题/需求。

## 目录

1. [仓库克隆与提交指南](#实操指南)
2. [Commit Message 规范](#git-提交信息规范)

## 实操指南

### 第一步：克隆仓库并切换到开发主干

我们的日常开发基准分支是 `develop`，而不是 `main`。请按照以下步骤获取最新代码：

```bash
# 1. 克隆整个代码仓库到本地
git clone https://github.com/FLAG-Camp-T1/travel-planner.git

# 2. 进入项目根目录
cd travel-planner

# 3. 切换到 develop 分支（获取最新开发主干）
git switch develop

# 4. 拉取远端最新代码
git pull origin develop
```

### 第二步：创建自己的Feature Branch

**切忌**在 develop 分支上直接写代码。开发新功能或修复 Bug 时，请基于 develop 切出一个新的分支。

分支命名规范： <类型>/<Issue编号（如有）><简短英文描述>

- 新功能示例：feature/12-user-login
- 修 Bug 示例：bug/34-poi-bookmark-conflict

```Bash
# 确保你当前在 develop 分支上，该命令应当返回 develop
git branch --show-current

# 然后创建并切换到新分支
git switch -c feature/<branch-name>
```

### 第三步：提交代码变更 (Commit)

写完代码后，我们需要将其提交到本地暂存区。本项目遵循 [Angular Commit 规范](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md)

Commit Message格式： \<type>(\<scope>): \<subject>

```Bash
# 1. 将改动添加到暂存区
git add .

# 2. 书写规范的提交信息
# 新增功能演示：
git commit -m "feat(backend/login): implement user login backend"

# 修复Bug演示：
git commit -m "fix(frontend/login): fix misplaced login button"
```

(支持的 type 包含：build, ci, docs, feat, fix, perf, refactor, test, chore, revert. 详见Angular Commit规范文档与仓库根目录的.commitlintrc.js文件)

### 第四步：推送到远端并提交 Pull Request (PR)

当你在本地完成开发并自测通过后，将你的分支推送到 GitHub：

```Bash
# 将本地分支推送到远端仓库
git push -u origin feature/<branch-name>
```

在 GitHub 上提交 PR 的步骤：

1. 登录该项目对应的 GitHub 仓库页面，系统会提示你有一个刚推送的分支，点击 "Compare & pull request" 按钮。
2. 确保目标分支（base）是 develop，来源分支（compare）是你的 feature/xxx 分支。
3. 填写 PR 描述（关键）
   - 若有关联的Issue，必须在描述中写明 Closes #12（数字为你关联的 Issue 编号），这样 PR 合并后，关联的 Issue 也会自动关闭。
   - 请在 PR 内@与你合作开发该分支的组员（如有）以提醒他查看该变更。
4. 点击 "Create pull request"。

## Git 提交信息规范

为了清晰追踪每次变更，本项目已集成了 **Commitlint** 与 **Husky**。

### 1. 提交格式约束

任何通过 `git commit` 生成的提交记录，**必须**严格符合以下结构，否则在本地就会报错并拒绝提交：

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

### 2. 标准提交示例 ✅

```bash
# 好的示例（带 scope）
git commit -m "feat(auth): add user login token expiry"

# 好的示例（不带 scope）
git commit -m "fix: fix overflow of index page"

# 好的示例（关联了 GitHub 任务）
git commit -m "chore: upgrade Spring Boot dependency (#23)"
```

### 3. 错误提交示例 ❌（将被系统拦截）

```Bash
git commit -m "更新代码"               # 缺少 type
git commit -m "feat 新增了用户登录"    # 缺少冒号
git commit -m "Fix: 修复空指针异常"    # type 必须是纯小写字母
```

### 4. 提交失败了怎么办？

如果写错了格式导致终端报错（通常会看到 type must be one of [feat, fix, docs...] 的红色提示），你的代码依然处于暂存区（Staged）。

修复方法：
重新执行 `git commit -m "填写正确的格式"` 即可。

如果是因为上一次提交漏了某个文件，想要合并到上一个正确的 Commit 中，可以使用：

```Bash
git commit --amend --no-edit
```
