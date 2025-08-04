# Release Artifacts 说明

## 概述

CI/CD pipeline 现在会在每个 GitHub Release 中包含以下构建产物：

### 1. Chrome 扩展包
**文件名**: `whatsmytoken-v{version}-chrome.zip`
- 用途：可直接上传到 Chrome Web Store 或本地安装
- 内容：优化后的扩展文件，包含 manifest.json 和所有必要资源

### 2. 完整构建输出（Linux/Mac）
**文件名**: `whatsmytoken-v{version}-dist.tar.gz`
- 用途：适合 Linux 和 Mac 用户的压缩包
- 内容：dist 文件夹的完整内容

### 3. 完整构建输出（Windows）
**文件名**: `whatsmytoken-v{version}-dist.zip`
- 用途：适合 Windows 用户的压缩包
- 内容：dist 文件夹的完整内容

## 工作流程

1. **版本检测**：使用 `semantic-release --dry-run` 预先检测是否需要发布新版本
2. **构建产物**：如果需要发布，先构建所有产物并使用正确的版本号命名
3. **创建 Release**：semantic-release 创建 GitHub Release 并上传所有产物
4. **自动发布**：如果配置了 Chrome Web Store secrets，自动发布到商店

## 命名规范

所有发布文件都遵循以下命名模式：
```
whatsmytoken-v{major}.{minor}.{patch}-{type}.{ext}
```

示例：
- `whatsmytoken-v1.2.0-chrome.zip`
- `whatsmytoken-v1.2.0-dist.tar.gz`
- `whatsmytoken-v1.2.0-dist.zip`

## 使用场景

1. **Chrome Web Store 发布**：使用 `-chrome.zip` 文件
2. **本地开发测试**：解压 `-chrome.zip` 并在开发者模式加载
3. **源码审查**：下载 `-dist.tar.gz` 或 `-dist.zip` 查看完整构建输出
4. **自定义部署**：使用 dist 压缩包进行自定义部署或修改

## 自动化特性

- ✅ 版本号自动从 semantic-release 获取
- ✅ 所有产物自动命名，包含版本信息
- ✅ Release 页面自动添加安装说明
- ✅ 支持 Chrome Web Store 自动发布（需配置 secrets）

## 未来改进

- [ ] 支持 Edge 浏览器扩展包
- [ ] 添加源码包（source.tar.gz）
- [ ] 支持增量更新包
- [ ] 添加校验和文件（SHA256）