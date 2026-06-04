/**
 * 全屏渐变流光背景组件
 * 使用纯 CSS 动画实现柔和浅色调渐变流动效果
 */
const GradientBackground = {
    /** 初始化流光背景 */
    init() {
        const app = document.getElementById('app');
        if (!app || app.querySelector('.gradient-bg')) return;

        const settings = Store.getSettings();
        const enabled = settings.gradientBgEnabled !== false; // 默认开启

        const bg = document.createElement('div');
        bg.className = 'gradient-bg';
        if (!enabled) bg.style.display = 'none';
        bg.innerHTML = `
            <div class="gradient-layer-1"></div>
            <div class="gradient-layer-2"></div>
            <div class="gradient-layer-3"></div>
            <div class="gradient-layer-4"></div>
            <div class="gradient-layer-5"></div>
            <div class="gradient-layer-6"></div>
            <div class="gradient-layer-7"></div>
            <div class="gradient-layer-8"></div>
        `;
        app.insertBefore(bg, app.firstChild);
    },

    /** 设置流光背景启用状态 */
    setEnabled(enabled) {
        const bg = document.querySelector('.gradient-bg');
        if (bg) {
            bg.style.display = enabled ? '' : 'none';
        }
    }
};