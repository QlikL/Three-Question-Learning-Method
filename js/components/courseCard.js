/**
 * 课程卡片组件 CourseCard
 * 展示课程缩略信息、进度条、菜单操作
 */
const CourseCard = {
    /**
     * 渲染课程卡片列表
     * @param {HTMLElement} container
     * @param {Array} courses - 课程数组（已排序）
     * @param {Object} options - 配置 { onClick, onArchive, onDelete }
     */
    renderList(container, courses, options = {}) {
        if (!courses || courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <p>还没有课程，输入一个问题开始学习吧！</p>
                </div>
            `;
            return;
        }

        // 直接使用传入的课程顺序，不再内部排序
        container.innerHTML = `
            <div class="course-grid">
                ${courses.map(course => this._renderCard(course)).join('')}
            </div>
        `;

        // 绑定事件
        courses.forEach(course => {
            const card = document.getElementById('course-card-' + course.id);
            if (!card) return;

            // 点击卡片跳转学习空间
            card.addEventListener('click', (e) => {
                // 阻止菜单按钮和资料按钮的点击冒泡
                if (e.target.closest('.card-menu-btn')) return;
                if (e.target.closest('.context-menu')) return;
                if (e.target.closest('.material-btn')) return;
                if (options.onClick) options.onClick(course.id);
            });

            // 菜单按钮
            const menuBtn = card.querySelector('.card-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._showContextMenu(e, course, options);
                });
            }

            // 资料按钮
            const materialBtn = card.querySelector('.material-btn');
            if (materialBtn) {
                materialBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (options.onMaterials) options.onMaterials(course.id);
                });
            }
        });
    },

    /** 渲染单个卡片 HTML */
    _renderCard(course) {
        const progress = course.getProgressPercent ? course.getProgressPercent() : 0;
        const phaseLabels = ['第一问', '第二问', '第三问'];
        const phases = [
            course.progress?.phase1,
            course.progress?.phase2,
            course.progress?.phase3
        ];

        return `
            <div class="course-card card card-enter" id="course-card-${course.id}">
                <div class="card-header">
                    <span class="course-title">${course.title || '未命名课程'}</span>
                    <div class="card-actions">
                        <button class="card-action-btn material-btn" title="查看资料" data-action="materials">
                            📄
                        </button>
                        <button class="card-menu-btn" title="更多操作">⋯</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="course-meta">
                        <span class="badge ${course.status === 'completed' ? 'badge-success' : 'badge-primary'}">
                            ${course.status === 'completed' ? '已完成' : course.status === 'archived' ? '已归档' : '学习中'}
                        </span>
                        <span class="course-time">${this._formatTime(course.updatedAt)}</span>
                    </div>
                    <div class="course-progress">
                        <div class="progress-label">学习进度</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width:${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <div class="course-phases">
                        ${phases.map((done, i) => `
                            <span class="phase-item ${done ? 'done' : ''}">
                                ${done ? '✓' : '○'} ${phaseLabels[i]}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /** 显示右键/点击菜单 */
    _showContextMenu(event, course, options) {
        // 移除已存在的菜单
        const existing = document.querySelector('.context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        menu.innerHTML = `
            <div class="context-menu-item" data-action="upload">📎 上传资料</div>
            <div class="context-menu-item" data-action="export">📥 导出课程</div>
            <div class="divider"></div>
            ${course.status !== 'archived' ? `
                <div class="context-menu-item" data-action="archive">📦 归档</div>
            ` : `
                <div class="context-menu-item" data-action="restore">🔄 恢复</div>
            `}
            ${course.status !== 'completed' ? '' : ''}
            <div class="context-menu-item danger" data-action="delete">🗑 删除</div>
        `;

        document.body.appendChild(menu);

        // 绑定菜单事件
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;

            const action = item.dataset.action;
            switch (action) {
                case 'archive':
                    if (options.onArchive) options.onArchive(course.id);
                    break;
                case 'restore':
                    if (options.onRestore) options.onRestore(course.id);
                    break;
                case 'delete':
                    Dialog.confirm('确定要删除课程「' + course.title + '」吗？此操作不可撤销。').then(confirmed => {
                        if (confirmed && options.onDelete) options.onDelete(course.id);
                    });
                    break;
                case 'upload':
                    Router.navigate('/knowledge/' + course.id + '?upload=true');
                    break;
                case 'export':
                    this._exportCourse(course);
                    break;
            }
            menu.remove();
        });

        // 点击空白关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    },

    /** 导出课程为JSON文件 */
    async _exportCourse(course) {
        try {
            const [graph, mm, debate, quiz, material] = await Promise.all([
                Store.getKnowledgeGraph(course.id),
                Store.getMentalModel(course.id),
                Store.getDebate(course.id),
                Store.getQuiz(course.id),
                Store.getMaterial(course.id)
            ]);

            const exportData = {
                version: 1,
                exportedAt: Date.now(),
                course,
                knowledgeGraph: graph || null,
                mentalModels: mm || null,
                debates: debate || null,
                quizzes: quiz || null,
                materials: material || null
            };

            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const date = new Date().toISOString().slice(0, 10);
            const safeName = (course.title || '课程').replace(/[\\/:*?"<>|]/g, '_');
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeName}_${date}.json`;
            a.click();
            URL.revokeObjectURL(url);

            Dialog.toast('课程导出成功！', 'success');
        } catch (err) {
            console.error('导出课程失败:', err);
            Dialog.toast('导出失败：' + err.message, 'error');
        }
    },

    /** 格式化时间 */
    _formatTime(timestamp) {
        if (!timestamp) return '';
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return minutes + '分钟前';
        if (hours < 24) return hours + '小时前';
        if (days < 7) return days + '天前';
        return new Date(timestamp).toLocaleDateString('zh-CN');
    }
};
