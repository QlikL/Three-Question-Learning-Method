## Why

当前网页背景是纯静态浅灰色，视觉上缺乏层次感和高级感。为页面添加全屏浅色动态渐变流光效果，可以增强视觉吸引力，让页面更具现代感和沉浸感，同时不影响用户阅读和操作。

## What Changes

- 新增全屏渐变流光背景层，使用 CSS 动画实现柔和的浅色调渐变流动效果
- 颜色方案：`#fdfbfb → #ebedee → #f9f2e7 → #e0e7ff`（白、浅灰、淡黄、浅蓝紫）
- 渐变流动周期 8-12 秒，角度缓慢变化
- 实现"云朵光晕"和"光条扫过"效果，增加光感层次
- 流光层使用 `pointer-events: none` 确保不影响页面交互
- 支持深色模式自动切换（深色模式下不显示流光或使用深色调）
- 在浅色模式和深色模式切换时平滑过渡

## Capabilities

### New Capabilities
- `gradient-streaming-light`: 全屏浅色动态渐变流光背景效果，包括云朵光晕和光条扫过动画

### Modified Capabilities

（无）

## Impact

- CSS：新增流光样式文件 `css/components/gradientBackground.css`
- JS：新增背景控制逻辑 `js/components/gradientBackground.js`（管理主题切换时的样式切换）
- HTML：在 `index.html` 中引入新样式和脚本
- 性能：纯 CSS 动画，GPU 加速，不影响页面渲染性能
- 兼容性：支持 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
