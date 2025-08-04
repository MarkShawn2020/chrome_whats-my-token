#!/bin/bash

echo "🚀 初始化 Release 设置"
echo "====================="

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ 错误: 当前目录不是 Git 仓库"
  exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  警告: 不在 main 分支上"
  read -p "是否切换到 main 分支? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git checkout main
  fi
fi

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  有未提交的更改"
  git status --short
  read -p "是否提交这些更改? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "chore: prepare for release"
  else
    echo "❌ 请先处理未提交的更改"
    exit 1
  fi
fi

# 检查是否有现有标签
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$LATEST_TAG" ]; then
  echo "ℹ️  没有找到现有标签"
  
  # 从 package.json 读取版本
  PACKAGE_VERSION=$(node -p "require('./package.json').version")
  echo "📦 package.json 版本: $PACKAGE_VERSION"
  
  read -p "是否创建初始标签 v$PACKAGE_VERSION? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git tag "v$PACKAGE_VERSION"
    echo "✅ 创建标签: v$PACKAGE_VERSION"
    
    read -p "是否推送标签到远程仓库? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin "v$PACKAGE_VERSION"
      echo "✅ 标签已推送"
    fi
  fi
else
  echo "📌 最新标签: $LATEST_TAG"
fi

# 创建一个触发 release 的 commit
echo ""
echo "📝 创建一个新功能来触发 release:"
echo "示例 commit messages:"
echo "  - feat: add automated CI/CD pipeline"
echo "  - fix: correct manifest version handling"
echo "  - feat!: major architecture redesign"
echo ""

read -p "是否创建一个示例 commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # 创建一个小的更改
  echo "# Release Triggered" >> .release-trigger
  git add .release-trigger
  git commit -m "feat: add automated release pipeline

- Configured semantic-release for version management
- Added GitHub Actions for CI/CD
- Integrated Chrome Web Store publishing
- Created comprehensive documentation"
  
  echo "✅ 创建了触发 release 的 commit"
  
  read -p "是否推送到远程仓库以触发 release? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo "✅ 已推送! 请查看 GitHub Actions 页面"
    echo "🔗 https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
  fi
fi

echo ""
echo "✅ 初始化完成!"
echo ""
echo "📋 检查清单:"
echo "1. 确保已在 GitHub 设置了必要的 Secrets"
echo "2. 访问 GitHub Actions 页面查看 workflow 运行状态"
echo "3. 检查 Releases 页面是否有新版本"
echo ""
echo "💡 运行 'pnpm tsx scripts/test-release.ts' 进行配置检查"