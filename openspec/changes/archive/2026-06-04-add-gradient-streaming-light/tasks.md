## 1. CSS 样式实现

- [x] 1.1 创建 `css/components/gradientBackground.css`，定义 `.gradient-bg` 全屏固定定位容器样式
- [x] 1.2 实现第一层大面积渐变旋转动画（`@keyframes gradientRotate`，8s 周期，`#fdfbfb → #ebedee → #f9f2e7 → #e0e7ff`）
- [x] 1.3 实现第二层云朵光晕效果（`@keyframes cloudDrift`，12s 周期，浅粉/浅蓝光团漂移）
- [x] 1.4 实现第三层光条扫过效果（`@keyframes lightSweep`，10s 周期，白色光线横向扫过）
- [x] 1.5 实现第四层辅助光晕（`@keyframes auxGlow`，15s 周期，增强光感层次）
- [x] 1.6 添加 `[data-theme="dark"] .gradient-bg { opacity: 0; }` 深色模式隐藏样式
- [x] 1.7 使用 `will-change: transform` 和 `pointer-events: none` 优化性能和交互

## 2. JS 逻辑

- [x] 2.1 创建 `js/components/gradientBackground.js`，实现 `GradientBackground.init()` 方法，在 `#app` 容器内创建多层 DOM 元素
- [x] 2.2 实现主题切换时的平滑过渡（监听 `data-theme` 属性变化，切换流光层 `opacity`）

## 3. 集成到页面

- [x] 3.1 在 `index.html` 中引入 `css/components/gradientBackground.css`
- [x] 3.2 在 `index.html` 中引入 `js/components/gradientBackground.js`
- [x] 3.3 在 `app.js` 应用初始化时调用 `GradientBackground.init()`

## 4. 验证

- [x] 4.1 验证浅色模式下流光效果正常显示，动画流畅无卡顿
- [x] 4.2 验证深色模式下流光完全隐藏，不影响深色背景
- [x] 4.3 验证主题切换时流光平滑过渡
- [x] 4.4 验证页面所有按钮、链接、输入框均可正常交互
