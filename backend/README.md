# 后端服务开发指南

本文档规定了后端 Spring Boot 项目的环境配置、启动流程及代码规范。请在开发前仔细阅读。

## 目录

- [1. 环境依赖](#1-环境依赖)
- [2. 初始化与启动](#2-初始化与启动)
  - [2.1 准备数据库](#21-准备数据库)
  - [2.2 配置数据库凭证](#22-配置数据库凭证)
  - [2.3 启动服务](#23-启动服务)
- [3. 代码规范与格式化](#3-代码规范与格式化)
- [4. 常见问题排查 (FAQ)](#4-常见问题排查-faq)
  - [4.1 终端执行 gradlew 提示找不到 Java](#41-终端执行-gradlew-提示找不到-java)

---

## 1. 环境依赖

- **JDK**: Temurin 21 JDK
- **数据库**: PostgreSQL 18
- **构建工具**: Gradle

## 2. 初始化与启动

### 2.1 正确导入项目

**重要提示：不要使用 IDE 单独打开 `backend` 或 `frontend` 子目录！**

本项目采用 Monorepo（单体仓库）架构，全局代码格式pre-commit检查器（Husky）配置在项目根目录。单独打开子目录可能导致代码提交报错。

**IntelliJ IDEA 正确导入步骤：**

1. 启动 IDEA，点击 **Open**，务必选择**项目根目录**（即包含 `.git` 的`travel-planner`顶级目录）并打开。
2. 在左侧项目树中展开 `backend` 文件夹。
3. 找到 `backend/build.gradle` 文件，右键点击并选择 **"Link Gradle Project"**（或点击 IDE 右下角弹出的加载提示）。
4. 等待 IDEA 将其识别为标准的 Java/Gradle 模块。

### 2.1 准备数据库

项目底层使用 Spring Data JDBC，**不会自动创建数据库实例与数据表**。在首次启动项目前，必须通过数据库客户端或命令行手动创建开发库：

```sql
CREATE DATABASE travelplanner_db;
```

### 2.2 配置数据库凭证

项目的默认连接凭证位于 src/main/resources/application.yml（默认账号/密码均为 postgres）。

若本地 PostgreSQL 凭证或参数与默认值不同，严禁修改甚至提交 yml 文件。请在 IDE 的 Run/Debug Configurations 中，或在系统层面配置以下环境变量以覆盖默认值：

```bash
DB_HOST=数据库IP
DB_PORT=数据库端口
DB_NAME=数据库名
DB_USERNAME=数据库用户名
DB_PASSWORD=数据库密码
```

### 2.3 启动服务

在 backend 目录下执行以下命令启动服务：

```bash
# Mac / Linux
./gradlew bootRun

# Windows
gradlew.bat bootRun
```

服务默认监听 8080 端口。

## 3. 代码规范与格式化

本项目已集成 Spotless 插件，并强制校验 Google Java Style 风格。根目录的 Git pre-commit 钩子会在代码提交前进行拦截检查。

提交代码前，可在 backend 目录下手动执行以下命令完成代码自动格式化：

```bash
./gradlew spotlessApply
```

若直接执行`git commit -m "<消息>"`, Husky会使用spotlessCheck并在代码格式不规范时拒绝提交。

## 4. 常见问题排查 (FAQ)

#### 4.1 终端执行 gradlew 提示找不到 Java

现象：在 IDE 的 Terminal 或系统终端运行 ./gradlew 相关的命令时，提示无法找到 Java 环境，但 IDE 内部点击运行按钮可以正常启动项目。

原因：终端环境独立于 IDE 内部配置，依赖操作系统的系统环境变量。

解决步骤：

- 确认本机 JDK 安装路径。
- 在系统环境变量中新建变量 JAVA_HOME，值为 JDK 安装根目录（路径末尾不包含 \bin）。
- 在系统变量 Path 中追加 %JAVA_HOME%\bin（Windows）或 $JAVA_HOME/bin（Mac/Linux）。
- 彻底关闭当前终端进程并重新打开，输入 java -version 确认配置生效。

通过在IDEA Gradle面板里运行Tasks > Verification > spotlessCheck/spotlessApply 可以绕过该需求执行格式化。

但Husky依然需要JAVA_HOME执行pre-commit的代码格式检查。

---
