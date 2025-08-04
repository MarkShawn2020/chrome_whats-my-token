# Code Inspector 功能使用说明

## 功能介绍

WhatsMyToken 扩展已集成 code-inspector-plugin，让您能够：
- 点击扩展界面上的任何元素
- 自动在代码编辑器中打开对应的源代码文件
- 光标会自动定位到该元素的具体代码位置

## 使用方法

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **激活 Code Inspector**
   - Mac: 按住 `Option + Shift`
   - Windows/Linux: 按住 `Alt + Shift`
   
3. **定位代码**
   - 按住上述组合键
   - 移动鼠标到想要查看的元素上（会显示遮罩层）
   - 点击元素，代码编辑器会自动打开并定位到对应代码

## 支持的编辑器

- VSCode
- Cursor
- WebStorm
- Atom
- HBuilderX
- PhpStorm
- PyCharm
- IntelliJ IDEA
- 更多...

## 注意事项

1. Code Inspector 仅在开发模式下启用
2. 确保您的编辑器已经打开并配置了正确的项目路径
3. 浏览器控制台会显示相关的组合键提示

## 示例

在 popup 页面中：
1. 运行 `pnpm dev`
2. 加载扩展到浏览器
3. 点击扩展图标打开 popup
4. 按住 `Option + Shift` (Mac) 或 `Alt + Shift` (Windows)
5. 点击任何 Bearer token 卡片或按钮
6. 编辑器会自动打开 `pages/popup/src/Popup.tsx` 并定位到相应代码

## 故障排除

如果 Code Inspector 不工作：
1. 确保开发服务器正在运行
2. 检查浏览器控制台是否有 code-inspector 相关的成功日志
3. 确认编辑器已打开且有权限访问项目文件
4. 尝试重新加载扩展