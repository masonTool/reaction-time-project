---
name: commit-push
description: 提交所有变更并推送到远程仓库
---

## 步骤 1: 检查状态并暂存

```bash
git status
git branch --show-current
git add .
```

如果没有变更，提示用户并结束。

## 步骤 2: 生成 Commit 信息

使用 `git diff --cached` 分析变更，按 Conventional Commits 格式生成：

```
<type>(<scope>): <中文描述>
```

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具 |

**描述规则**：使用中文、简洁明了、不加句号、≤50 字符

**示例**：`feat(auth): 添加密码重置功能`、`fix(ui): 修复按钮对齐问题`

## 步骤 3: 提交并推送

```bash
git commit -m "<type>(<scope>): <subject>"
git push origin <current-branch>
```

如果分支在远程不存在：

```bash
git push -u origin <current-branch>
```

如果推送失败（远程有更新），先 pull 再 push：

```bash
git pull --rebase origin <current-branch>
git push origin <current-branch>
```
