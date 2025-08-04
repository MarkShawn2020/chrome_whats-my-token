# Code Inspector 在 Chrome 扩展中的限制

## 问题说明

Code Inspector 在 Chrome 扩展的 popup、options 等页面中无法正常工作。这是由于 Chrome 扩展的安全限制导致的。

## 原因分析

### 1. Content Security Policy (CSP) 限制

Chrome 扩展（特别是 Manifest V3）有严格的 CSP 策略：
- 禁止使用 `eval()`、`new Function()`
- 禁止内联 JavaScript
- 禁止从远程源加载脚本
- 禁止动态代码执行

### 2. Code Inspector 的工作原理

Code Inspector 需要：
- 在运行时注入代码来监听 DOM 事件
- 动态创建覆盖层显示元素信息
- 与开发服务器通信获取源码位置
- 这些操作都被 Chrome 扩展的 CSP 阻止

### 3. 扩展环境的隔离性

- 扩展页面运行在独立的环境中
- 与普通网页有不同的权限和限制
- 开发工具的集成更加困难

## 解决方案

### 方案 1：在普通网页中开发（推荐）

1. **创建独立的开发页面**
   ```bash
   # 创建一个开发用的 HTML 文件
   touch dev-popup.html
   ```

2. **在 Vite 中配置开发服务器**
   ```typescript
   // vite.config.ts
   export default {
     server: {
       open: '/dev-popup.html'
     }
   }
   ```

3. **使用 iframe 或独立页面开发**
   - 在普通网页环境中开发组件
   - Code Inspector 可以正常工作
   - 开发完成后再集成到扩展中

### 方案 2：使用 React DevTools

1. **安装 React DevTools 扩展**
   - 可以检查组件树和 props
   - 支持在扩展环境中使用

2. **使用 Chrome DevTools**
   - Elements 面板查看 DOM 结构
   - Sources 面板设置断点调试

### 方案 3：添加开发模式按钮

```typescript
// 在组件中添加开发辅助功能
const DevHelper = () => {
  if (!IS_DEV) return null;
  
  const handleShowSource = (e: React.MouseEvent) => {
    if (e.altKey && e.shiftKey) {
      console.log('Component:', e.currentTarget);
      console.log('File: pages/popup/src/Popup.tsx');
    }
  };
  
  return <div onClick={handleShowSource}>...</div>;
};
```

### 方案 4：使用 Source Maps

1. **确保开发模式启用 source maps**
   ```typescript
   build: {
     sourcemap: IS_DEV
   }
   ```

2. **在 Chrome DevTools 中**
   - 可以看到原始源文件
   - 可以设置断点调试

## 最佳实践

1. **组件化开发**
   - 将复杂组件抽离到独立包
   - 在 Storybook 或独立页面中开发
   - 使用 Code Inspector 进行开发
   - 完成后集成到扩展中

2. **使用 Chrome DevTools**
   - 学习使用 Elements 面板快速定位元素
   - 使用 Sources 面板查看源码
   - 利用 React DevTools 检查组件

3. **日志调试**
   ```typescript
   // 添加调试信息
   console.log('%c[Component]', 'color: blue', {
     file: 'Popup.tsx',
     line: 42
   });
   ```

## 注意事项

- Code Inspector 主要设计用于普通网页开发
- Chrome 扩展的安全限制是为了保护用户
- 这些限制在生产环境中是必要的
- 建议采用组件化开发策略，在普通环境中使用 Code Inspector