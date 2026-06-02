/**
 * 知识图谱渲染组件 KnowledgeGraphRenderer
 * 基于Canvas绘制动态知识图谱，支持节点点击、拖拽、缩放
 */
const KnowledgeGraphRenderer = {
    /** Canvas 上下文 */
    _ctx: null,
    /** 节点数据 */
    _nodes: [],
    /** 边数据 */
    _edges: [],
    /** 是否正在拖拽 */
    _dragging: false,
    /** 当前拖拽的节点 */
    _dragNode: null,
    /** 拖拽偏移 */
    _dragOffset: { x: 0, y: 0 },
    /** 是否正在拖动画布 */
    _panning: false,
    /** 画布拖动起始位置 */
    _panStart: { x: 0, y: 0 },
    /** 缩放比例 */
    _scale: 1,
    /** 画布偏移 */
    _offset: { x: 0, y: 0 },
    /** 动画帧ID */
    _animId: null,
    /** 选中的节点 */
    _selectedNode: null,

    /**
     * 渲染知识图谱
     * @param {HTMLElement} container
     * @param {Object} graphData - { nodes, edges }
     */
    render(container, graphData, courseTitle) {
        this._courseTitle = courseTitle || '';
        container.innerHTML = `
            <div class="knowledge-graph-container">
                <canvas class="knowledge-graph-canvas" id="kg-canvas"></canvas>
                <div class="kg-info-panel" id="kg-info-panel" style="display:none;">
                    <h4 class="kg-info-title" id="kg-info-title"></h4>
                    <p class="kg-info-desc" id="kg-info-desc"></p>
                    <button class="btn btn-primary btn-sm kg-detail-btn" id="kg-node-detail-btn">🔍 详细信息</button>
                </div>
                <div class="kg-controls">
                    <button class="btn btn-sm btn-secondary" id="kg-zoom-in">＋</button>
                    <button class="btn btn-sm btn-secondary" id="kg-zoom-out">−</button>
                    <button class="btn btn-sm btn-secondary" id="kg-reset">⟲ 重置</button>
                </div>
            </div>
        `;

        this._nodes = graphData.nodes || [];
        this._edges = this._deduplicateEdges(graphData.edges || []);
        this._scale = 1;
        this._offset = { x: 0, y: 0 };
        this._selectedNode = null;

        const canvas = document.getElementById('kg-canvas');
        const rect = container.getBoundingClientRect();
        const containerWidth = Math.max(800, rect.width || 1000);
        const containerHeight = Math.max(600, rect.height || 700);
        
        // 设置Canvas的实际像素尺寸
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // 确保容器支持滚动和正确显示
        container.style.overflow = 'auto';
        container.style.position = 'relative';
        
        this._ctx = canvas.getContext('2d');
        
        // 为节点分配初始位置（简易布局）- 在设置Canvas尺寸后执行
        this._layoutNodes();
        
        // 计算图谱边界，自动居中
        this._centerGraph();

        this._bindEvents(canvas);
        this._draw();
    },

    /** 合并同一对节点之间的多条边 */
    _deduplicateEdges(edges) {
        const edgeMap = {};
        edges.forEach(edge => {
            const key = [edge.source, edge.target].sort().join('->');
            if (!edgeMap[key]) {
                edgeMap[key] = { ...edge };
            } else {
                const existing = edgeMap[key].relation || edgeMap[key].label || '';
                const current = edge.relation || edge.label || '';
                if (current && existing !== current) {
                    const merged = existing ? existing + ' / ' + current : current;
                    edgeMap[key].relation = merged;
                    edgeMap[key].label = merged;
                }
            }
        });
        return Object.values(edgeMap);
    },

    /** 分层辐射式布局 */
    _layoutNodes() {
        const canvas = document.getElementById('kg-canvas');
        const w = canvas?.width || 800;
        const h = canvas?.height || 600;
        const centerX = w / 2;
        const centerY = h / 2;
        const R = Math.min(w, h);

        const nodeMap = {};
        this._nodes.forEach(n => { nodeMap[n.id] = n; });

        const childrenMap = {};
        this._edges.forEach(e => {
            const sn = nodeMap[e.source];
            const tn = nodeMap[e.target];
            if (!sn || !tn) return;
            const parentId = sn.depth <= tn.depth ? e.source : e.target;
            const childId = sn.depth <= tn.depth ? e.target : e.source;
            if (parentId !== childId) {
                if (!childrenMap[parentId]) childrenMap[parentId] = [];
                if (!childrenMap[parentId].includes(childId)) childrenMap[parentId].push(childId);
            }
        });

        const depthMap = {};
        this._nodes.forEach(n => {
            if (!depthMap[n.depth]) depthMap[n.depth] = [];
            depthMap[n.depth].push(n);
        });

        const depths = Object.keys(depthMap).map(Number).sort((a, b) => a - b);

        // Depth 0: center
        if (depthMap[0]) {
            depthMap[0].forEach(n => {
                n.x = centerX;
                n.y = centerY;
            });
        }

        // Depth 1: circle around center, sorted by neighbor order
        if (depthMap[1]) {
            const nodes1 = depthMap[1];
            const radius1 = R * 0.25;
            const sorted1 = this._sortByAdjacency(nodes1, childrenMap);
            const angleStep1 = (2 * Math.PI) / sorted1.length;
            sorted1.forEach((node, i) => {
                const angle = angleStep1 * i - Math.PI / 2;
                node.x = centerX + radius1 * Math.cos(angle);
                node.y = centerY + radius1 * Math.sin(angle);
                node._angle = angle;
            });
        }

        // Depth 2: clustered near their parent depth-1 node
        if (depthMap[2]) {
            const nodes2 = depthMap[2];
            const parentGroups = {};
            nodes2.forEach(n2 => {
                let parentId = null;
                for (const [pid, children] of Object.entries(childrenMap)) {
                    if (children.includes(n2.id)) { parentId = pid; break; }
                }
                if (!parentId) parentId = 'misc';
                if (!parentGroups[parentId]) parentGroups[parentId] = [];
                parentGroups[parentId].push(n2);
            });

            Object.entries(parentGroups).forEach(([parentId, children]) => {
                const parent = nodeMap[parentId];
                if (!parent) {
                    children.forEach((n, i) => {
                        n.x = centerX + R * 0.4 * Math.cos((2 * Math.PI / children.length) * i);
                        n.y = centerY + R * 0.4 * Math.sin((2 * Math.PI / children.length) * i);
                    });
                    return;
                }

                const baseAngle = parent._angle !== undefined ? parent._angle : Math.atan2(parent.y - centerY, parent.x - centerX);
                const radius2 = R * 0.4;
                const spread = Math.PI * 0.6;
                const count = children.length;

                children.forEach((child, i) => {
                    const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread;
                    const angle = baseAngle + offset;
                    child.x = centerX + radius2 * Math.cos(angle);
                    child.y = centerY + radius2 * Math.sin(angle);
                });
            });
        }

        // Handle orphan nodes
        this._nodes.filter(n => n.x === undefined || isNaN(n.x)).forEach((node, i, arr) => {
            const angleStep = (2 * Math.PI) / arr.length;
            node.x = centerX + R * 0.35 * Math.cos(angleStep * i);
            node.y = centerY + R * 0.35 * Math.sin(angleStep * i);
        });

        // Collision resolution
        for (let round = 0; round < 10; round++) {
            let moved = false;
            for (let i = 0; i < this._nodes.length; i++) {
                for (let j = i + 1; j < this._nodes.length; j++) {
                    const a = this._nodes[i], b = this._nodes[j];
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const minD = this._getNodeRadius(a) + this._getNodeRadius(b) + 36;
                    if (dist < minD) {
                        const push = (minD - dist) / 2 + 1;
                        const angle = Math.atan2(dy, dx);
                        a.x -= Math.cos(angle) * push;
                        a.y -= Math.sin(angle) * push;
                        b.x += Math.cos(angle) * push;
                        b.y += Math.sin(angle) * push;
                        moved = true;
                    }
                }
            }
            if (!moved) break;
        }

        this._reduceEdgeCrossings();
    },

    /** 按邻接关系排序节点（减少交叉） */
    _sortByAdjacency(nodes, childrenMap) {
        if (nodes.length <= 2) return [...nodes];
        const sorted = [nodes[0]];
        const remaining = new Set(nodes.slice(1).map(n => n.id));

        while (sorted.length < nodes.length) {
            const last = sorted[sorted.length - 1];
            const neighbors = childrenMap[last.id] || [];
            let bestId = null;
            for (const nid of neighbors) {
                if (remaining.has(nid)) { bestId = nid; break; }
            }
            if (!bestId) {
                bestId = remaining.values().next().value;
            }
            if (bestId) {
                remaining.delete(bestId);
                sorted.push(nodes.find(n => n.id === bestId));
            } else break;
        }
        return sorted;
    },

    /** 减少连线交叉 */
    _reduceEdgeCrossings() {
        const buildNodeIndex = () => {
            const map = {};
            this._nodes.forEach(n => { map[n.id] = n; });
            return map;
        };
        const nodeMap = buildNodeIndex();

        const countCrossings = () => {
            let count = 0;
            for (let i = 0; i < this._edges.length; i++) {
                for (let j = i + 1; j < this._edges.length; j++) {
                    const a = nodeMap[this._edges[i].source];
                    const b = nodeMap[this._edges[i].target];
                    const c = nodeMap[this._edges[j].source];
                    const d = nodeMap[this._edges[j].target];
                    if (!a || !b || !c || !d) continue;
                    if (a.id === c.id || a.id === d.id || b.id === c.id || b.id === d.id) continue;
                    if (this._segmentsCross(a, b, c, d)) count++;
                }
            }
            return count;
        };

        const initialCrossings = countCrossings();
        if (initialCrossings === 0) return;

        const sameDepthGroups = {};
        this._nodes.forEach(n => {
            if (!sameDepthGroups[n.depth]) sameDepthGroups[n.depth] = [];
            sameDepthGroups[n.depth].push(n);
        });

        for (let pass = 0; pass < 3; pass++) {
            let improved = false;
            Object.values(sameDepthGroups).forEach(group => {
                if (group.length < 3) return;
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const before = countCrossings();
                        const tmpX = group[i].x, tmpY = group[i].y;
                        group[i].x = group[j].x;
                        group[i].y = group[j].y;
                        group[j].x = tmpX;
                        group[j].y = tmpY;
                        const after = countCrossings();
                        if (after < before) {
                            improved = true;
                        } else {
                            group[j].x = group[i].x;
                            group[j].y = group[i].y;
                            group[i].x = tmpX;
                            group[i].y = tmpY;
                        }
                    }
                }
            });
            if (!improved) break;
        }
    },

    /** 判断两条线段是否交叉 */
    _segmentsCross(a, b, c, d) {
        const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        const d1 = cross(c, d, a);
        const d2 = cross(c, d, b);
        const d3 = cross(a, b, c);
        const d4 = cross(a, b, d);
        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }
        return false;
    },
    
    /** 自动居中图谱 */
    _centerGraph() {
        if (this._nodes.length === 0) return;
        
        const canvas = document.getElementById('kg-canvas');
        if (!canvas) return;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // 计算所有节点的边界框
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        this._nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
        });
        
        // 计算图谱的中心点
        const graphCenterX = (minX + maxX) / 2;
        const graphCenterY = (minY + maxY) / 2;
        
        // Canvas的中心点
        const canvasCenterX = canvasWidth / 2;
        const canvasCenterY = canvasHeight / 2;
        
        // 计算需要移动的偏移量
        const offsetX = canvasCenterX - graphCenterX;
        const offsetY = canvasCenterY - graphCenterY;
        
        // 移动所有节点
        this._nodes.forEach(node => {
            node.x += offsetX;
            node.y += offsetY;
        });
    },

    /** 绑定Canvas交互事件 */
    _bindEvents(canvas) {
        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left - this._offset.x) / this._scale,
                y: (clientY - rect.top - this._offset.y) / this._scale
            };
        };

        // 鼠标事件
        canvas.addEventListener('mousedown', (e) => {
            const pos = getPos(e);
            const node = this._hitTest(pos.x, pos.y);
            if (node) {
                // 点击节点，开始拖拽节点
                this._dragging = true;
                this._dragNode = node;
                this._dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
            } else {
                // 点击空白处，开始拖动画布
                this._panning = true;
                this._panStart = { x: e.clientX - this._offset.x, y: e.clientY - this._offset.y };
                canvas.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this._dragging && this._dragNode) {
                // 拖拽节点
                const pos = getPos(e);
                this._dragNode.x = pos.x - this._dragOffset.x;
                this._dragNode.y = pos.y - this._dragOffset.y;
                this._draw();
            } else if (this._panning) {
                // 拖动画布
                this._offset.x = e.clientX - this._panStart.x;
                this._offset.y = e.clientY - this._panStart.y;
                this._draw();
            }
        });

        window.addEventListener('mouseup', () => {
            this._dragging = false;
            this._dragNode = null;
            this._panning = false;
            canvas.style.cursor = 'grab';
        });

        // 点击选中节点
        canvas.addEventListener('click', (e) => {
            // 如果刚刚进行了拖动操作，不触发点击
            if (this._dragging || this._panning) return;
            const pos = getPos(e);
            const node = this._hitTest(pos.x, pos.y);
            if (node) {
                this._selectedNode = node;
                this._showNodeInfo(node);
                this._draw();
            } else {
                this._selectedNode = null;
                document.getElementById('kg-info-panel').style.display = 'none';
                this._draw();
            }
        });

        // 滚轮缩放 - 以鼠标位置为中心
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            
            // 获取鼠标在Canvas中的位置
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 计算鼠标在缩放前的世界坐标
            const worldX = (mouseX - this._offset.x) / this._scale;
            const worldY = (mouseY - this._offset.y) / this._scale;
            
            // 应用缩放
            const newScale = Math.max(0.3, Math.min(3, this._scale * delta));
            
            // 调整偏移量，使鼠标位置保持不变
            this._offset.x = mouseX - worldX * newScale;
            this._offset.y = mouseY - worldY * newScale;
            
            // 更新缩放比例
            this._scale = newScale;
            
            this._draw();
        });

        // 缩放按钮
        document.getElementById('kg-zoom-in')?.addEventListener('click', () => {
            this._scale = Math.min(3, this._scale * 1.2);
            this._draw();
        });
        document.getElementById('kg-zoom-out')?.addEventListener('click', () => {
            this._scale = Math.max(0.3, this._scale * 0.8);
            this._draw();
        });
        document.getElementById('kg-reset')?.addEventListener('click', () => {
            this._scale = 1;
            this._offset = { x: 0, y: 0 };
            this._layoutNodes();
            this._draw();
        });
    },

    /** 碰撞检测 */
    _hitTest(x, y) {
        // 遍历所有节点，检查点击位置是否在节点范围内
        for (let i = this._nodes.length - 1; i >= 0; i--) {
            const n = this._nodes[i];
            const radius = this._getNodeRadius(n);
            if (Math.abs(n.x - x) < radius && Math.abs(n.y - y) < radius) {
                return n;
            }
        }
        return null;
    },

    /**
     * 根据节点深度获取节点半径
     * @param {Object} node - 节点对象
     * @returns {number} 节点半径
     */
    _getNodeRadius(node) {
        const radii = { 0: 32, 1: 26, 2: 22 };
        return radii[node.depth] || 24;
    },

    /** 显示节点详情 */
    _showNodeInfo(node) {
        const panel = document.getElementById('kg-info-panel');
        const title = document.getElementById('kg-info-title');
        const desc = document.getElementById('kg-info-desc');
        if (panel && title && desc) {
            title.textContent = node.label;
            desc.textContent = node.description || '暂无详细描述';
            panel.style.display = 'block';
        }

        const btn = document.getElementById('kg-node-detail-btn');
        if (btn) {
            btn.onclick = () => {
                const courseTitle = this._courseTitle || '当前课程';
                const message = `请详细介绍「${node.label}」这个知识点，它属于「${courseTitle}」课程。请从以下几个方面展开：\n1. 核心概念和定义\n2. 关键原理和机制\n3. 实际应用场景\n4. 与其他知识点的关联`;
                AiChatWidget.openWithMessage(message);
            };
        }
    },

    /** 根据节点深度获取配色方案 */
    _getNodeColors(depth) {
        const palette = {
            0: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
            1: { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6' },
            2: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' }
        };
        return palette[depth] || palette[0];
    },

    /** 绘制知识图谱 */
    _draw() {
        const ctx = this._ctx;
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景网格
        this._drawGrid(ctx, canvas);

        ctx.save();
        ctx.translate(this._offset.x, this._offset.y);
        ctx.scale(this._scale, this._scale);

        // 绘制边（带箭头的曲线）
        const edgeAngleMap = {};
        this._edges.forEach((edge, idx) => {
            const source = this._nodes.find(n => n.id === edge.source);
            const target = this._nodes.find(n => n.id === edge.target);
            if (!source || !target) return;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // 计算垂直于连线方向的法向量
            const nx = -dy / dist;
            const ny = dx / dist;

            // 为相邻节点间的多条边分配不同弧度
            const key = [edge.source, edge.target].sort().join('-');
            if (!edgeAngleMap[key]) edgeAngleMap[key] = 0;
            const curveIdx = edgeAngleMap[key];
            edgeAngleMap[key]++;

            const baseCurve = Math.min(30, dist * 0.1);
            const curveOffset = curveIdx * 16;
            const curvature = baseCurve + curveOffset;

            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const cpX = midX + nx * curvature;
            const cpY = midY + ny * curvature;

            const sourceColor = this._getNodeColors(source.depth);
            const targetColor = this._getNodeColors(target.depth);

            const grad = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
            grad.addColorStop(0, this._hexToRgba(sourceColor.border, 0.2));
            grad.addColorStop(0.5, this._hexToRgba(sourceColor.border, 0.45));
            grad.addColorStop(1, this._hexToRgba(targetColor.border, 0.2));

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 箭头
            const angle = Math.atan2(target.y - cpY, target.x - cpX);
            const arrowLen = 10;
            const targetRadius = this._getNodeRadius(target);
            const arrowX = target.x - Math.cos(angle) * (targetRadius + 2);
            const arrowY = target.y - Math.sin(angle) * (targetRadius + 2);

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - arrowLen * Math.cos(angle - 0.35), arrowY - arrowLen * Math.sin(angle - 0.35));
            ctx.lineTo(arrowX - arrowLen * Math.cos(angle + 0.35), arrowY - arrowLen * Math.sin(angle + 0.35));
            ctx.closePath();
            ctx.fillStyle = this._hexToRgba(targetColor.border, 0.6);
            ctx.fill();

            // 关系标签
            const relation = edge.relation || edge.label || '';
            if (relation) {
                ctx.font = '11px "PingFang SC", "Microsoft YaHei", sans-serif';
                const tm = ctx.measureText(relation);
                const labelPadX = 6;
                const labelPadY = 4;
                const lx = cpX;
                const ly = cpY - 10;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
                ctx.beginPath();
                const bw = tm.width + labelPadX * 2;
                const bh = 16 + labelPadY;
                const br = 8;
                ctx.moveTo(lx - bw / 2 + br, ly - bh);
                ctx.lineTo(lx + bw / 2 - br, ly - bh);
                ctx.quadraticCurveTo(lx + bw / 2, ly - bh, lx + bw / 2, ly - bh + br);
                ctx.lineTo(lx + bw / 2, ly - br);
                ctx.quadraticCurveTo(lx + bw / 2, ly, lx + bw / 2 - br, ly);
                ctx.lineTo(lx - bw / 2 + br, ly);
                ctx.quadraticCurveTo(lx - bw / 2, ly, lx - bw / 2, ly - br);
                ctx.lineTo(lx - bw / 2, ly - bh + br);
                ctx.quadraticCurveTo(lx - bw / 2, ly - bh, lx - bw / 2 + br, ly - bh);
                ctx.fill();

                ctx.fillStyle = 'rgba(71, 85, 105, 0.8)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(relation, lx, ly - 3);
            }
        });

        // 绘制节点
        this._nodes.forEach(node => {
            const isSelected = this._selectedNode && this._selectedNode.id === node.id;
            const baseRadius = this._getNodeRadius(node);
            const scale = isSelected ? 1.08 : 1;
            const radius = baseRadius * scale;
            const colors = this._getNodeColors(node.depth);
            const icons = { 0: '💡', 1: '🔬', 2: '📎' };
            const icon = icons[node.depth] || '📌';

            // 选中态光晕
            if (isSelected) {
                ctx.save();
                const glow = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 24);
                glow.addColorStop(0, this._hexToRgba(colors.border, 0.3));
                glow.addColorStop(1, this._hexToRgba(colors.border, 0));
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 节点阴影
            ctx.save();
            ctx.shadowColor = this._hexToRgba(colors.border, 0.2);
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;

            // 渐变填充
            const nodeGrad = ctx.createLinearGradient(node.x - radius, node.y - radius, node.x + radius, node.y + radius);
            nodeGrad.addColorStop(0, '#FFFFFF');
            nodeGrad.addColorStop(1, colors.bg);

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = nodeGrad;
            ctx.fill();
            ctx.restore();

            // 彩色边框
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = isSelected ? 2.8 : 2;
            ctx.stroke();

            // 图标
            ctx.font = `${Math.max(12, radius * 0.5)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, node.x, node.y - 1);

            // 节点标签（下方）
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(node.label, node.x, node.y + radius + 6);
        });

        ctx.restore();
    },

    /** 绘制背景网格 */
    _drawGrid(ctx, canvas) {
        const gridSize = 30;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(canvas.width, y + 0.5);
            ctx.stroke();
        }
    },

    /** HEX颜色转RGBA */
    _hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /** 销毁组件 */
    destroy() {
        if (this._animId) cancelAnimationFrame(this._animId);
    }
};
