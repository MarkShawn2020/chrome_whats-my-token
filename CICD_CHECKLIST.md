# CI/CD Release 检查清单

## 1. GitHub Repository Secrets 配置

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置以下 secrets：

### 必需的 Secrets

#### Chrome Web Store 发布相关
- [ ] `CHROME_EXTENSION_ID` - Chrome 扩展 ID
- [ ] `CHROME_CLIENT_ID` - OAuth2 客户端 ID
- [ ] `CHROME_CLIENT_SECRET` - OAuth2 客户端密钥
- [ ] `CHROME_REFRESH_TOKEN` - OAuth2 刷新令牌

### 如何获取这些值

1. **CHROME_EXTENSION_ID**
   - 如果是新扩展：先手动上传一次到 Chrome Web Store
   - 从 Chrome Web Store 开发者控制台获取扩展 ID

2. **OAuth2 认证信息**
   ```bash
   # 1. 访问 Google Cloud Console
   https://console.cloud.google.com/
   
   # 2. 创建新项目或选择现有项目
   
   # 3. 启用 Chrome Web Store API
   
   # 4. 创建 OAuth2 凭据（桌面应用类型）
   
   # 5. 使用以下脚本获取 refresh token
   npx chrome-webstore-upload-cli auth \
     --client-id YOUR_CLIENT_ID \
     --client-secret YOUR_CLIENT_SECRET
   ```

## 2. GitHub Actions 权限检查

确保 `.github/workflows/release.yml` 有正确的权限：

```yaml
permissions:
  contents: write      # 创建 releases 和 commits
  issues: write        # 评论 issues
  pull-requests: write # 评论 PRs
```

## 3. Commit Message 格式

Semantic Release 需要特定的 commit message 格式：

### 触发 Release 的 Commit 类型

| Commit 类型 | 格式 | 版本变化 | 示例 |
|------------|------|----------|------|
| 新功能 | `feat:` | Minor (1.0.0 → 1.1.0) | `feat: add token filter feature` |
| 修复 | `fix:` | Patch (1.0.0 → 1.0.1) | `fix: correct token parsing` |
| 破坏性变更 | `feat!:` 或 `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | `feat!: change storage format` |

### 不触发 Release 的 Commit 类型

- `chore:` - 维护任务
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `ci:` - CI/CD 配置

## 4. 验证步骤

### 4.1 本地测试 Semantic Release（干运行）

```bash
# 安装依赖
pnpm install

# 设置环境变量（仅用于测试）
export GITHUB_TOKEN="your-personal-access-token"

# 干运行模式
pnpm exec semantic-release --dry-run
```

### 4.2 检查 GitHub Token 权限

确保 GitHub Actions 使用的 token 有以下权限：
- ✅ Create releases
- ✅ Push to repository
- ✅ Create tags

### 4.3 验证 package.json 版本

当前版本应该与最新发布的版本一致：
```json
{
  "version": "1.0.0"  // 这将被 semantic-release 自动更新
}
```

## 5. 触发第一次 Release

### 方法 1：使用初始版本标签

```bash
# 如果还没有任何 release，创建初始标签
git tag v1.0.0
git push origin v1.0.0

# 然后创建一个新的 feat commit
git add .
git commit -m "feat: initial release setup"
git push
```

### 方法 2：直接创建功能 commit

```bash
# 创建一个会触发 release 的 commit
git add .
git commit -m "feat: add CI/CD pipeline for automated releases"
git push
```

## 6. 调试 Release 失败

### 查看 GitHub Actions 日志

1. 访问仓库的 Actions 标签
2. 查看失败的 workflow run
3. 展开 "Release" 步骤查看详细错误

### 常见问题及解决方案

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| "No release published" | 没有符合条件的 commits | 使用正确的 commit 格式 |
| "ENOGHTOKEN" | 缺少 GitHub token | 检查 secrets 配置 |
| "403 Forbidden" | Token 权限不足 | 检查仓库设置中的 Actions 权限 |
| "Cannot find module" | 依赖未安装 | 运行 `pnpm install` |

## 7. 手动触发 Release

如果需要手动触发 release：

```bash
# 使用 workflow_dispatch
# 在 GitHub Actions 页面点击 "Run workflow"
```

## 8. 验证 Chrome Web Store 发布

### 首次发布注意事项

1. **必须先手动发布一次**
   - Chrome Web Store 需要首次手动审核
   - 之后的更新可以自动发布

2. **检查发布状态**
   ```bash
   # 本地测试发布
   pnpm publish:chrome
   ```

## 9. 监控和通知

### 设置 GitHub 通知

1. 仓库 Settings → Notifications
2. 启用 Actions 失败通知
3. 可选：设置 Slack/Email 集成

### 查看 Release 历史

- GitHub Releases 页面：`https://github.com/YOUR_USERNAME/YOUR_REPO/releases`
- 查看自动生成的 CHANGELOG.md

## 快速诊断命令

```bash
# 检查 semantic-release 配置
cat .releaserc.json

# 验证 GitHub secrets（在 Actions 中）
echo "Extension ID: $CHROME_EXTENSION_ID"

# 检查最近的 commits
git log --oneline -10

# 查看 tags
git tag -l

# 测试 build
pnpm build
pnpm zip
```

## Release 产物说明

每个 GitHub Release 会包含以下文件：

1. **whatsmytoken-v{version}-chrome.zip**
   - Chrome 扩展包，可直接上传到 Chrome Web Store
   - 也可用于本地开发者模式安装

2. **whatsmytoken-v{version}-dist.tar.gz**
   - 完整的构建输出（适用于 Linux/Mac）
   - 包含所有编译后的文件

3. **whatsmytoken-v{version}-dist.zip**
   - 完整的构建输出（适用于 Windows）
   - 包含所有编译后的文件

### 手动安装方法

1. 从 GitHub Releases 下载 `whatsmytoken-v{version}-chrome.zip`
2. 解压到本地文件夹
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

## 成功标志

当 CI/CD 正常工作时，你应该看到：

1. ✅ GitHub Actions 显示绿色勾号
2. ✅ GitHub Releases 页面有新版本，包含三个下载文件
3. ✅ CHANGELOG.md 自动更新
4. ✅ package.json 版本号自动递增
5. ✅ Chrome Web Store 显示新版本（需要配置 secrets）
6. ✅ Release 评论中有安装说明