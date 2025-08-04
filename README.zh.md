# WhatsMyToken

一个用于捕获和检查网络请求中身份验证令牌的浏览器扩展。基于 React 19、TypeScript 5、Vite 6 和 Turborepo 构建。

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=google-chrome&logoColor=white)
![](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white)

## 功能特性

- 🔍 **实时令牌捕获**: 自动捕获所有网络请求中的 Bearer 令牌
- 📊 **多级过滤**: 支持按当前域名、根域名 (*.example.com) 或查看全部的过滤方式
- 🗂️ **双视图模式**: 
  - **请求标签页**: 按时间顺序显示所有请求，并高亮显示 Bearer 令牌
  - **令牌标签页**: 按唯一令牌分组显示，可展开查看请求详情
- 🎯 **智能域名检测**: 智能提取根域名，支持复杂的顶级域名
- 📋 **一键复制**: 轻松复制令牌到剪贴板
- 🌓 **深色/浅色模式**: 根据系统偏好自动切换主题
- 🔄 **实时更新**: 捕获新令牌时实时更新界面
- 🧹 **令牌管理**: 一键清除所有令牌

## 安装

### 开发环境

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/whatsmytoken.git
   cd whatsmytoken
   ```

2. 安装依赖
   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. 启动开发服务器
   ```bash
   # Chrome 开发
   pnpm dev

   # Firefox 开发
   pnpm dev:firefox
   ```

4. 加载扩展
   - **Chrome**: 
     1. 打开 `chrome://extensions`
     2. 启用"开发者模式"
     3. 点击"加载已解压的扩展程序"
     4. 选择 `dist` 目录
   
   - **Firefox**: 
     1. 打开 `about:debugging`
     2. 点击"此 Firefox"
     3. 点击"临时载入附加组件"
     4. 选择 `dist/manifest.json`

### 生产构建

```bash
# Chrome 构建
pnpm build

# Firefox 构建
pnpm build:firefox

# 创建发布压缩包
pnpm zip
```

## 使用方法

1. **安装扩展**到你的浏览器
2. **访问任何使用** Bearer 令牌认证的网站
3. **点击工具栏中的扩展图标**打开弹出窗口
4. **通过两种方式查看**捕获的令牌：
   - **请求标签页**: 按时间顺序查看所有请求，Bearer 令牌会高亮显示
   - **令牌标签页**: 查看按唯一令牌分组的视图，可展开查看请求详情
5. **过滤令牌**：
   - 仅当前域名
   - 根域名及所有子域名 (*.example.com)
   - 所有域名
6. **点击"复制"按钮**一键复制令牌

## 开发

### 项目结构

```
whatsmytoken/
├── chrome-extension/     # 扩展清单和后台脚本
├── pages/               # 扩展页面和内容脚本
│   ├── popup/          # 主弹出窗口 UI
│   ├── content/        # 用于令牌拦截的内容脚本
│   ├── options/        # 选项页面（如需要）
│   └── ...
├── packages/           # 共享包
│   ├── storage/        # Chrome 存储 API 助手
│   ├── ui/            # 共享 UI 组件
│   ├── i18n/          # 国际化
│   └── ...
└── dist/              # 构建后的扩展文件
```

### 可用命令

```bash
# 开发
pnpm dev              # Chrome 开发模式（支持热更新）
pnpm dev:firefox      # Firefox 开发模式（支持热更新）

# 构建
pnpm build           # Chrome 生产构建
pnpm build:firefox   # Firefox 生产构建
pnpm zip            # 创建发布压缩包

# 代码质量
pnpm lint           # 运行 ESLint
pnpm lint:fix       # 修复 ESLint 问题
pnpm type-check     # TypeScript 类型检查
pnpm format         # 使用 Prettier 格式化

# 测试
pnpm e2e            # 运行端到端测试

# 工具
pnpm clean          # 清理所有构建产物
pnpm update-version # 更新扩展版本
```

### 核心技术

- **React 19** - UI 框架
- **TypeScript 5** - 类型安全
- **Vite 6** - 构建工具，支持热更新
- **Turborepo** - Monorepo 管理
- **Tailwind CSS** - 样式框架
- **Chrome Extension Manifest V3** - 现代扩展 API
- **WebdriverIO** - 端到端测试

## 工作原理

1. **内容脚本注入**: WhatsMyToken 向所有网页注入内容脚本
2. **请求拦截**: 脚本覆盖 `fetch` 和 `XMLHttpRequest` 以拦截所有网络请求
3. **令牌提取**: 解析 Authorization 头部以提取 Bearer 令牌
4. **后台服务**: 捕获的令牌被发送到后台服务工作线程
5. **存储**: 使用 Chrome 的存储 API 存储令牌及其详细信息（域名、URL、方法和时间戳）
6. **UI 更新**: 弹出窗口 UI 订阅存储变化以实现实时更新

## 隐私与安全

- WhatsMyToken 完全在你的浏览器本地运行
- 不会向外部服务器发送任何数据
- 所有捕获的令牌都使用 Chrome 的存储 API 本地存储
- 令牌只能通过扩展弹出窗口访问
- 可随时使用"清除全部"按钮清除所有数据

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

MIT 许可证 - 详见 LICENSE 文件

## 致谢

基于 Jonghakseo 的优秀项目 [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 构建。