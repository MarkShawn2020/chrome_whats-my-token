# CI/CD Release 修复总结

## 🎯 修复的问题

### 1. **缺失的依赖包** ✅
- **问题**: `Error: Cannot find module 'conventional-changelog-conventionalcommits'`
- **解决**: 安装了 `conventional-changelog-conventionalcommits` 依赖
- **原因**: 使用 `conventionalcommits` preset 需要这个包

### 2. **缺少初始版本标签** ✅
- **问题**: `No git tag version found on branch main` - 导致分析759个commits
- **解决**: 创建了初始标签 `v1.0.0`
- **原因**: semantic-release 需要一个起始点来计算版本变化

### 3. **仓库URL错误** ✅
- **问题**: 指向了错误的模板仓库
- **解决**: 更新为正确的仓库URL，并使用 GitHub context 变量避免硬编码

## 🚀 当前状态

- ✅ 所有依赖已安装
- ✅ 初始版本标签 v1.0.0 已创建
- ✅ semantic-release 配置已优化
- ✅ CI/CD workflow 已修复

## 📝 触发 Release 的 Commit 类型

| Commit 前缀 | 版本变化 | 示例 |
|------------|---------|------|
| `fix:` | Patch (1.0.0 → 1.0.1) | `fix: 修复token解析错误` |
| `feat:` | Minor (1.0.0 → 1.1.0) | `feat: 添加新功能` |
| `feat!:` 或包含 `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | `feat!: 重构API` |
| `perf:` | Patch | `perf: 优化性能` |
| `docs:` | 不触发 | 文档更新 |
| `chore:` | 不触发 | 维护任务 |

## 🎉 下一个版本

你最近的 `fix:` commit 应该会触发 v1.0.1 版本发布，包含：
- Chrome 扩展包 (whatsmytoken-v1.0.1-chrome.zip)
- Linux/Mac 构建包 (whatsmytoken-v1.0.1-dist.tar.gz)  
- Windows 构建包 (whatsmytoken-v1.0.1-dist.zip)
- 自动更新 CHANGELOG.md
- GitHub Release 页面和评论

## 🔍 验证方法

```bash
# 本地测试（需要 GITHUB_TOKEN）
GITHUB_TOKEN=your-token pnpm exec semantic-release --dry-run

# 或使用测试脚本
bash scripts/test-semantic-release.sh
```

## ⚡ 快速触发新版本

如果需要手动触发版本：
```bash
# 功能发布
git commit -m "feat: 添加令牌过滤功能" --allow-empty
git push

# 修复发布  
git commit -m "fix: 修复UI显示问题" --allow-empty
git push
```

---

**现在一切都应该正常工作了！** 🎊