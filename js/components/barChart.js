/**
 * 柱状图组件 BarChart
 * 基于 Canvas 绘制学科对比柱状图
 */
const BarChart = {
    /** 学科配色方案 */
    COLORS: [
        '#2563EB', '#7C3AED', '#DB2777', '#EA580C',
        '#16A34A', '#0891B2', '#4F46E5', '#C026D3',
        '#E11D48', '#CA8A04', '#0D9488', '#6366F1'
    ],

    /**
     * 渲染柱状图
     * @param {HTMLElement} container
     * @param {Object} options
     * @param {string[]} options.labels - 标签数组
     * @param {number[]} options.values - 数值数组 (0-100)
     * @param {string} [options.title] - 图表标题
     * @param {number} [options.width] - 宽度
     * @param {number} [options.height] - 高度
     */
    render(container, options = {}) {
        const {
            labels = [],
            values = [],
            title = '',
            width = 600,
            height = 350
        } = options;

        const dpr = window.devicePixelRatio || 1;
        container.innerHTML = `
            <div class="barchart-wrapper">
                ${title ? `<h4 class="chart-title">${title}</h4>` : ''}
                <canvas class="barchart-canvas" style="width:${width}px;height:${height}px;" width="${width * dpr}" height="${height * dpr}"></canvas>
            </div>
        `;

        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const count = labels.length;
        if (count === 0) return;

        const padding = { top: 35, right: 30, bottom: 70, left: 50 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;
        const barW = Math.min(60, (chartW / count) * 0.55);
        const gap = (chartW - barW * count) / (count + 1);
        const maxVal = 100;

        ctx.clearRect(0, 0, width, height);

        // 网格线
        const gridSteps = [0, 25, 50, 75, 100];
        gridSteps.forEach(val => {
            const y = padding.top + chartH - (val / maxVal) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(val.toString(), padding.left - 10, y);
        });

        // 柱体
        for (let i = 0; i < count; i++) {
            const x = padding.left + gap + i * (barW + gap);
            const barH = (values[i] / maxVal) * chartH;
            const y = padding.top + chartH - barH;
            const color = this.COLORS[i % this.COLORS.length];

            // 渐变
            const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
            grad.addColorStop(0, color);
            grad.addColorStop(1, color + '60');

            // 柱体（圆角顶部）
            ctx.beginPath();
            const r = Math.min(4, barW / 4);
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // 值标签
            ctx.fillStyle = '#1E293B';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(values[i].toString(), x + barW / 2, y - 6);

            // X轴标签（支持换行）
            ctx.fillStyle = '#475569';
            ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            const label = labels[i];
            const maxLabelW = barW + 16;
            const chars = label.split('');
            let line = '';
            const lines = [];
            for (let n = 0; n < chars.length; n++) {
                const test = line + chars[n];
                if (ctx.measureText(test).width > maxLabelW && n > 0) {
                    lines.push(line);
                    line = chars[n];
                } else {
                    line = test;
                }
            }
            lines.push(line);

            const lineH = 16;
            const labelY = padding.top + chartH + 12;
            lines.forEach((l, idx) => {
                ctx.fillText(l, x + barW / 2, labelY + idx * lineH);
            });
        }
    }
};

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
        this.moveTo(x + r[0], y);
        this.lineTo(x + w - r[1], y);
        this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
        this.lineTo(x + w, y + h - r[2]);
        this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
        this.lineTo(x + r[3], y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
        this.lineTo(x, y + r[0]);
        this.quadraticCurveTo(x, y, x + r[0], y);
        this.closePath();
        return this;
    };
}
