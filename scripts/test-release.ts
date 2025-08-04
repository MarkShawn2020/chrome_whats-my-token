#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 检查 Semantic Release 配置...\n');

// 检查必要文件
const requiredFiles = [
  '.releaserc.json',
  'package.json',
  '.github/workflows/release.yml'
];

console.log('1. 检查必要文件:');
let allFilesExist = true;
for (const file of requiredFiles) {
  const exists = existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
  console.error('\n❌ 缺少必要文件，请确保所有文件都存在。');
  process.exit(1);
}

// 检查 package.json
console.log('\n2. 检查 package.json:');
const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
console.log(`   当前版本: ${packageJson.version}`);
console.log(`   项目名称: ${packageJson.name}`);

// 检查依赖
console.log('\n3. 检查 semantic-release 依赖:');
const requiredDeps = [
  'semantic-release',
  '@semantic-release/changelog',
  '@semantic-release/git',
  '@semantic-release/github',
  '@semantic-release/exec'
];

for (const dep of requiredDeps) {
  const installed = packageJson.devDependencies?.[dep] || packageJson.dependencies?.[dep];
  console.log(`   ${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ''}`);
}

// 检查 Git 状态
console.log('\n4. 检查 Git 状态:');
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`   当前分支: ${branch}`);
  
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status) {
    console.log('   ⚠️  有未提交的更改');
  } else {
    console.log('   ✅ 工作区干净');
  }
  
  // 检查最近的 tags
  try {
    const tags = execSync('git tag -l --sort=-version:refname | head -5', { encoding: 'utf-8' }).trim();
    if (tags) {
      console.log('\n   最近的标签:');
      tags.split('\n').forEach(tag => console.log(`     - ${tag}`));
    } else {
      console.log('   ℹ️  没有找到标签');
    }
  } catch (e) {
    console.log('   ℹ️  无法获取标签信息');
  }
} catch (error) {
  console.error('   ❌ Git 命令失败:', error.message);
}

// 检查环境变量
console.log('\n5. 检查环境变量:');
const envVars = [
  'GITHUB_TOKEN',
  'CHROME_EXTENSION_ID',
  'CHROME_CLIENT_ID',
  'CHROME_CLIENT_SECRET',
  'CHROME_REFRESH_TOKEN'
];

for (const envVar of envVars) {
  const hasValue = !!process.env[envVar];
  const display = hasValue ? `✅ ${envVar} (已设置)` : `❌ ${envVar} (未设置)`;
  console.log(`   ${display}`);
}

// 测试 semantic-release（干运行）
console.log('\n6. 测试 Semantic Release (干运行模式):');
console.log('   运行命令: pnpm exec semantic-release --dry-run --no-ci\n');

if (!process.env.GITHUB_TOKEN) {
  console.log('   ⚠️  需要设置 GITHUB_TOKEN 环境变量才能运行测试');
  console.log('   示例: GITHUB_TOKEN=your-token pnpm tsx scripts/test-release.ts');
} else {
  try {
    execSync('pnpm exec semantic-release --dry-run --no-ci', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('\n✅ Semantic Release 测试通过！');
  } catch (error) {
    console.error('\n❌ Semantic Release 测试失败');
  }
}

// 提供下一步建议
console.log('\n📋 下一步建议:');
console.log('1. 确保在 GitHub 仓库设置中配置了所有必要的 Secrets');
console.log('2. 使用正确的 commit 格式 (feat:, fix:, etc.)');
console.log('3. 推送到 main 分支触发自动发布');
console.log('\n💡 提示: 查看 CICD_CHECKLIST.md 获取详细说明');