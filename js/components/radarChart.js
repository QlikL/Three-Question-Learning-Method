/**
 * 能力雷达图组件 RadarChart
 * 基于 Canvas 绘制六边形能力维度雷达图
 */
const RadarChart = {
    /**
     * 渲染雷达图
     * @param {HTMLElement} container
     * @param {Object} options
     * @param {string[]} options.dimensions - 维度名数组
     * @param {number[]} options.values - 各维度得分 (0-10)
     * @param {number} [options.max=10] - 满分
     * @param {number} [options.size=400] - 画布尺寸
     */
    render(container, options = {}) {
        const {
            dimensions = [],
            values = [],
            max = 10,
            size = 400
        } = options;

        container.innerHTML = `
            <div class="radar-chart-wrapper" style="width:100%;max-width:${size}px;margin:0 auto;">
                <canvas class="radar-chart-canvas" width="${size}" height="${size}"></canvas>
            </div>
        `;

        const canvas = container.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.35;
        const count = dimensions.length;
        const angleStep = (2 * Math.PI) / count;
        const startAngle = -Math.PI / 2;

        ctx.clearRect(0, 0, size, size);

        const getPoint = (index, r) => {
            const angle = startAngle + index * angleStep;
            return {
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle)
            };
        };

        const drawPolygon = (r, strokeStyle, fillStyle, lineWidth) => {
            ctx.beginPath();
            for (let i = 0; i <= count; i++) {
                const p = getPoint(i % count, r);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                ctx.fill();
            }
            if (strokeStyle) {
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth || 1;
                ctx.stroke();
            }
        };

        // 背景网格（3层）
        const gridLevels = [0.33, 0.66, 1.0];
        gridLevels.forEach((ratio, i) => {
            const gridColor = `rgba(148, 163, 184, ${0.08 + i * 0.04})`;
            drawPolygon(radius * ratio, `rgba(148, 163, 184, ${0.12 + i * 0.06})`, gridColor, 1);
        });

        // 轴线
        for (let i = 0; i < count; i++) {
            const p = getPoint(i, radius);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // 刻度值（左侧显示）
        ctx.font = '11px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        gridLevels.forEach(ratio => {
            const val = Math.round(max * ratio);
            ctx.fillText(val, cx - 6, cy - radius * ratio);
        });

        // 数据区域
        const dataPoints = values.map((v, i) => getPoint(i, (v / max) * radius));

        // 渐变填充
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');

        ctx.beginPath();
        dataPoints.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 数据点
        dataPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#2563EB';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // 标签
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        dimensions.forEach((dim, i) => {
            const labelR = radius + 28;
            const p = getPoint(i, labelR);
            const val = values[i] !== undefined ? values[i].toFixed(1) : '0';

            ctx.font = 'bold 13px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.fillStyle = '#334155';
            ctx.fillText(dim, p.x, p.y - 8);

            ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.fillStyle = '#2563EB';
            ctx.fillText(val, p.x, p.y + 10);
        });

        // 中心综合分
        const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(avg, cx, cy - 8);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('综合', cx, cy + 16);
    }
};
