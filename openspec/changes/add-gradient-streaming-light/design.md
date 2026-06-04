## Context

当前网页使用纯静态 `#F8FAFC` 浅灰背景，页面视觉层次单一。用户希望添加全屏动态渐变流光效果，提升页面视觉吸引力。现有项目使用 CSS 变量管理主题，通过 `data-theme` 属性切换深色/浅色模式，所有样式都基于 CSS 变量系统。

## Goals / Non-Goals

**Goals:**
- 全屏渐变流光背景，柔和浅色调，不影响内容阅读
- "云朵光晕"效果：多个柔和光团缓慢移动、叠加
- "光条扫过"效果：明亮光线横向或斜向扫过
- 纯 CSS 动画实现，GPU 加速，不卡顿
- 流动周期 8-12 秒，动画循环自然无缝
- 支持主题切换（浅色模式显示，深色模式自动隐藏或切换为深色调）
- `pointer-events: none` 确保不影响页面交互

**Non-Goals:**
- 不修改现有页面内容和功能逻辑
- 不添加外部依赖（如 GSAP、Three.js）
- 不需要用户交互触发的动态效果
- 不在移动端单独适配（使用同一套 CSS 动画）

## Decisions

### 1. 使用多层 CSS 动画叠加实现流光效果

**方案选择**：多层 `div` + CSS `@keyframes` 动画

**理由**：
- 纯 CSS 方案，无需 JS 渲染循环，性能最优
- 通过 `transform` 和 `opacity` 动画触发 GPU 加速
- 多层叠加可以实现"云朵光晕"的柔和感和"光条扫过"的方向感

**实现结构**：
```
.gradient-bg（固定定位，全屏，pointer-events: none）
├── .gradient-layer-1（大面积渐变，8s 周期旋转）
├── .gradient-layer-2（云朵光晕效果，12s 周期漂移）
├── .gradient-layer-3（光条扫过效果，10s 周期移动）
└── .gradient-layer-4（辅助光晕，15s 周期漂移）
```

### 2. 渐变旋转使用 `transform: rotate()` 而非 `background: linear-gradient()` 动画

**方案选择**：固定渐变 + `transform: rotate()` 旋转整个层

**理由**：
- `background` 的 `linear-gradient` 角度不支持 CSS 动画过渡
- `transform: rotate()` 由 GPU 处理，性能好
- 通过 200%+ 的背景尺寸和 `background-position` 移动来实现流动感

### 3. 颜色方案

**浅色模式**：
- 主渐变：`#fdfbfb` → `#ebedee` → `#f9f2e7` → `#e0e7ff`
- 光晕：`rgba(255, 200, 200, 0.15)`（浅粉）、`rgba(200, 220, 255, 0.15)`（浅蓝）
- 光条：`rgba(255, 255, 255, 0.4)` → `rgba(255, 255, 255, 0)`（白色扫光）

**深色模式**：
- 流光层 `opacity: 0`（完全隐藏）

### 4. 主题切换处理

**方案选择**：CSS `[data-theme="dark"]` 选择器控制显示/隐藏

**理由**：
- 与现有主题系统一致，无需额外 JS 逻辑
- 深色模式下隐藏流光，保持深色背景的一致性

## Risks / Trade-offs

- **性能风险** → 多层动画可能在低端设备卡顿：使用 `will-change: transform` 提示浏览器优化，控制动画层数不超过 4 层
- **兼容性风险** → 旧浏览器不支持 `mix-blend-mode`：降级为普通叠加，不影响核心功能
- **视觉干扰** → 动画可能分散注意力：控制动画速度缓慢（8-12s 周期），颜色柔和，不使用高饱和度色彩
