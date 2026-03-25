// .commitlintrc.js
module.exports = {
  // 继承默认的 Angular 规范
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许的提交类型 (type)
    'type-enum': [
      2, // 不符合则阻断提交
      'always',
      [
        'build',     // 构建相关 (Build)
        'ci',      // 持续集成 (Continuous Integration)
        'docs',     // 文档修改 (Documentation)
        'feat',    // 新增功能 (Feature)
        'fix',      // Bug 修复 (Fix)
        'perf',     // 性能优化 (Performance)
        'refactor', // 代码重构 (Refactor)
        'test',     // 测试相关 (Test)
        'chore',    // 构建过程或辅助工具的变动 (Chore)
        'revert',   // 回滚 (Revert)
      ],
    ],
    'type-empty': [2, 'never'],    // type 不能为空
    'subject-empty': [2, 'never'], // 简短描述 (subject) 不能为空
    'subject-full-stop': [0],      // 取消强制 subject 必须以句号结尾的要求
  },
};