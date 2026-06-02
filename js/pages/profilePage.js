/**
 * 个人中心页面逻辑 ProfilePage
 * 学习数据总览、课程归档、资料上传历史
 */
const ProfilePage = {
    /**
     * 渲染个人中心
     * @param {HTMLElement} container
     */
    async render(container) {
        // 移除首页的全宽样式，恢复正常布局
        const appContent = container.closest('.app-content');
        if (appContent) {
            appContent.classList.remove('home-content');
        }

        container.innerHTML = `
            <div class="page-container profile-page">
                <div class="profile-header">
                    <h2 class="profile-title">👤 个人中心</h2>
                    <button class="settings-btn" onclick="Router.navigate('/settings')" title="设置">
                        ⚙
                    </button>
                </div>

                <div class="profile-section">
                    <h3 class="section-title">📊 学习数据总览</h3>
                    <div class="profile-stats-grid">
                        <div class="stat-card stat-card-clickable" id="stat-courses" data-filter="all">
                            <div class="stat-card-value">-</div>
                            <div class="stat-card-label">总课程数</div>
                        </div>
                        <div class="stat-card stat-card-clickable" id="stat-completed" data-filter="completed">
                            <div class="stat-card-value">-</div>
                            <div class="stat-card-label">已完成</div>
                        </div>
                        <div class="stat-card stat-card-clickable" id="stat-in-progress" data-filter="active">
                            <div class="stat-card-value">-</div>
                            <div class="stat-card-label">进行中</div>
                        </div>
                        <div class="stat-card" id="stat-avg-ability">
                            <div class="stat-card-value">-</div>
                            <div class="stat-card-label">平均能力</div>
                        </div>
                    </div>
                </div>

                <!-- 课程筛选弹窗 -->
                <div class="profile-modal-overlay" id="course-filter-modal" style="display:none;">
                    <div class="profile-modal-content">
                        <div class="profile-modal-header">
                            <h3 id="modal-title">课程列表</h3>
                            <button class="profile-modal-close" id="modal-close">×</button>
                        </div>
                        <div class="profile-modal-body" id="modal-course-list"></div>
                    </div>
                </div>

                <div class="profile-section">
                    <h3 class="section-title">📈 能力雷达对比</h3>
                    <div class="profile-charts" id="radar-chart-area"></div>
                </div>

                <div class="profile-section">
                    <h3 class="section-title">📊 学科能力对比</h3>
                    <div class="profile-charts" id="bar-chart-area"></div>
                </div>

                <div class="profile-section">
                    <h3 class="section-title">📦 课程归档管理</h3>
                    <div id="archived-courses"></div>
                </div>
            </div>
        `;

        try {
            const courses = await Store.getAllCourses();
            this._renderStats(courses);
            this._renderRadarChart(courses);
            this._renderBarChart(courses);
            this._renderArchivedCourses(courses);
            this._bindStatCardEvents(courses);
        } catch (err) {
            console.error('加载个人中心数据失败:', err);
        }
    },

    /** 绑定统计卡片点击事件 */
    _bindStatCardEvents(courses) {
        const modal = document.getElementById('course-filter-modal');
        const closeBtn = document.getElementById('modal-close');
        const modalTitle = document.getElementById('modal-title');
        const modalList = document.getElementById('modal-course-list');

        // 点击统计卡片
        document.querySelectorAll('.stat-card-clickable').forEach(card => {
            card.addEventListener('click', async () => {
                const filter = card.dataset.filter;
                let filteredCourses = courses;
                let title = '所有课程';

                if (filter === 'completed') {
                    filteredCourses = courses.filter(c => c.status === 'completed');
                    title = '已完成的课程';
                } else if (filter === 'active') {
                    filteredCourses = courses.filter(c => c.status === 'active');
                    title = '进行中的课程';
                }

                modalTitle.textContent = `${title} (${filteredCourses.length})`;
                
                // 分离排序控件和课程列表容器
                modalList.innerHTML = `
                    <div class="profile-filter-bar">
                        <div class="profile-filter-group">
                            <span class="profile-filter-label">排序:</span>
                            <div id="modal-sort-select-container" style="min-width:160px;"></div>
                        </div>
                    </div>
                    <div id="modal-course-list-content"></div>
                `;
                
                const courseListContent = document.getElementById('modal-course-list-content');
                
                if (filteredCourses.length === 0) {
                    courseListContent.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:var(--spacing-xl);">暂无课程</p>';
                } else {
                    // 渲染课程列表
                    const renderCourseList = (courses) => {
                        courseListContent.innerHTML = `
                            <div class="course-list-modal">
                                ${courses.map(c => `
                                    <div class="course-list-item" data-course-id="${c.id}">
                                        <div class="course-list-info">
                                            <div class="course-list-title">${c.title || '未命名课程'}</div>
                                            <div class="course-list-meta">
                                                <span class="course-status-badge status-${c.status}">${this._getStatusText(c.status)}</span>
                                                <span class="course-list-time">${this._formatTime(c.updatedAt)}</span>
                                            </div>
                                        </div>
                                        <div class="course-list-actions">
                                            <button class="course-action-btn course-material-btn" data-course-id="${c.id}" title="查看资料">📄</button>
                                            <button class="course-action-btn course-export-btn" data-course-id="${c.id}" title="导出课程">📥</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;

                        // 绑定课程点击事件
                        courseListContent.querySelectorAll('.course-list-item').forEach(item => {
                            item.addEventListener('click', (e) => {
                                if (e.target.closest('.course-action-btn')) return;
                                const courseId = item.dataset.courseId;
                                Router.navigate(`/learning/${courseId}`);
                                modal.style.display = 'none';
                            });
                        });

                        // 绑定查看资料按钮事件
                        courseListContent.querySelectorAll('.course-material-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const courseId = btn.dataset.courseId;
                                Router.navigate(`/knowledge/${courseId}`);
                                modal.style.display = 'none';
                            });
                        });

                        // 绑定导出课程按钮事件
                        courseListContent.querySelectorAll('.course-export-btn').forEach(btn => {
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const courseId = btn.dataset.courseId;
                                this._exportCourse(courseId, courses);
                            });
                        });
                    };

                    // 初始渲染
                    renderCourseList(filteredCourses);

                    // 渲染自定义下拉选择器（只渲染一次）
                    const sortItems = [
                        { value: 'updateTime-desc', label: '按修改时间（最新）' },
                        { value: 'updateTime-asc', label: '按修改时间（最早）' },
                        { value: 'title-asc', label: '按课程名（A-Z）' },
                        { value: 'title-desc', label: '按课程名（Z-A）' }
                    ];
                    
                    const sortContainer = document.getElementById('modal-sort-select-container');
                    CustomSelect.render(sortContainer, {
                        items: sortItems,
                        defaultValue: 'updateTime-desc',
                        className: 'profile-custom-select',
                        onChange: (value) => {
                            const sorted = this._sortCourses(filteredCourses, value);
                            renderCourseList(sorted);
                        }
                    });
                }

                modal.style.display = 'flex';
            });
        });

        // 关闭弹窗
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    },

    /** 获取状态文本 */
    _getStatusText(status) {
        const map = {
            'active': '学习中',
            'completed': '已完成',
            'archived': '已归档'
        };
        return map[status] || status;
    },

    /** 格式化时间 */
    _formatTime(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString('zh-CN');
    },

    /** 渲染统计数据 */
    _renderStats(courses) {
        const total = courses.length;
        const completed = courses.filter(c => c.status === 'completed').length;
        const active = courses.filter(c => c.status === 'active').length;

        // 平均能力分 = 已完成课程的rating平均值
        const completedWithRating = courses.filter(c => c.status === 'completed' && c.rating > 0);
        const avgAbility = completedWithRating.length > 0
            ? Math.round(completedWithRating.reduce((sum, c) => sum + c.rating, 0) / completedWithRating.length)
            : 0;

        document.querySelector('#stat-courses .stat-card-value').textContent = total;
        document.querySelector('#stat-completed .stat-card-value').textContent = completed;
        document.querySelector('#stat-in-progress .stat-card-value').textContent = active;
        document.querySelector('#stat-avg-ability .stat-card-value').textContent = avgAbility;
    },

    /** 渲染能力雷达对比图 */
    _renderRadarChart(courses) {
        const container = document.getElementById('radar-chart-area');
        const completedCourses = courses.filter(c => c.status === 'completed');

        if (completedCourses.length === 0) {
            container.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;">暂无已完成课程</p>';
            return;
        }

        const abilityKeys = ['critical', 'creative', 'systems', 'practical', 'metacognitive', 'connection'];
        const abilityNames = abilityKeys.map(k => ABILITY_DEFINITIONS[k]?.name || k);
        const abilitySums = {};
        const abilityCounts = {};
        abilityKeys.forEach(k => { abilitySums[k] = 0; abilityCounts[k] = 0; });

        completedCourses.forEach(course => {
            const mapping = course.abilityMapping || [];
            const abs = course.abilities || {};
            mapping.forEach(key => {
                if (abs[key] !== undefined && abs[key] > 0) {
                    abilitySums[key] += abs[key];
                    abilityCounts[key]++;
                }
            });
        });

        const values = abilityKeys.map(k =>
            abilityCounts[k] > 0 ? +(abilitySums[k] / abilityCounts[k]).toFixed(1) : 0
        );

        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '400px';

        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.style.width = '100%';

        const label = document.createElement('div');
        label.textContent = '平均能力评估';
        label.style.fontSize = '14px';
        label.style.color = 'var(--color-text-secondary)';
        label.style.marginBottom = '12px';
        label.style.fontWeight = '600';
        wrapper.appendChild(label);

        container.appendChild(wrapper);

        RadarChart.render(wrapper, {
            dimensions: abilityNames,
            values: values,
            max: 10,
            size: 400
        });
    },

    /** 渲染学科对比柱状图 */
    _renderBarChart(courses) {
        const container = document.getElementById('bar-chart-area');
        const completedCourses = courses.filter(c => c.status === 'completed');

        if (completedCourses.length === 0) {
            container.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;">暂无已完成课程</p>';
            return;
        }

        // 按学科分组，计算每学科已完成课程的rating平均分
        const subjectGroups = {};
        completedCourses.forEach(course => {
            const subject = course.subject || '其他';
            if (!subjectGroups[subject]) subjectGroups[subject] = [];
            subjectGroups[subject].push(course);
        });

        const labels = [];
        const values = [];
        for (const [subject, courseList] of Object.entries(subjectGroups)) {
            labels.push(subject);
            const ratedCourses = courseList.filter(c => c.rating > 0);
            const avgScore = ratedCourses.length > 0
                ? Math.round(ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length)
                : 0;
            values.push(avgScore);
        }

        BarChart.render(container, {
            labels,
            values,
            title: '各学科平均课程评分',
            width: 600,
            height: 350
        });
    },

    /** 渲染已归档课程 */
    _renderArchivedCourses(courses) {
        const container = document.getElementById('archived-courses');
        const archived = courses.filter(c => c.status === 'archived');

        if (archived.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>暂无已归档的课程</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="archived-list">
                ${archived.map(c => `
                    <div class="archived-item card">
                        <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div class="archived-title">${c.title || '未命名课程'}</div>
                                <div class="archived-time" style="font-size:12px;color:var(--color-text-muted);">
                                    归档于 ${CourseCard._formatTime ? CourseCard._formatTime(c.updatedAt) : new Date(c.updatedAt).toLocaleDateString('zh-CN')}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-secondary restore-btn" data-course-id="${c.id}">恢复</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // 绑定恢复按钮
        container.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const courseId = btn.dataset.courseId;
                await Store.updateCourseStatus(courseId, 'active');
                // 重新渲染
                const courses = await Store.getAllCourses();
                this._renderArchivedCourses(courses);
            });
        });
    },

    /** 排序课程 */
    _sortCourses(courses, sortType) {
        const [field, order] = sortType.split('-');
        // 创建副本避免修改原数组
        const sorted = [...courses];
        return sorted.sort((a, b) => {
            let result = 0;
            switch(field) {
                case 'updateTime':
                    // 时间排序：desc=最新(大的在前), asc=最早(小的在前)
                    // (b - a) > 0 表示b的时间戳更大
                    result = (b.updatedAt || 0) - (a.updatedAt || 0);
                    // desc 不需要反转，asc 需要反转
                    return order === 'desc' ? result : -result;
                case 'title':
                    // 标题排序：asc=A-Z(小的在前), desc=Z-A(大的在前)
                    // localeCompare > 0 表示 a > b
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    result = titleA.localeCompare(titleB, 'zh-CN');
                    // asc 不需要反转，desc 需要反转
                    return order === 'desc' ? -result : result;
            }
            return 0;
        });
    },

    /** 导出课程 */
    async _exportCourse(courseId, courses) {
        try {
            const course = courses.find(c => c.id === courseId);
            if (!course) {
                Dialog.toast('课程未找到', 'error');
                return;
            }

            const knowledgeGraph = await Store.getKnowledgeGraph(courseId);
            const debate = await Store.getDebate(courseId);
            const quiz = await Store.getQuiz(courseId);
            const material = await Store.getMaterial(courseId);
            const mentalModel = await Store.getMentalModel(courseId);

            const exportData = {
                version: '1.0',
                exportTime: new Date().toISOString(),
                course: {
                    ...course,
                    progress: { ...course.progress },
                    abilities: { ...course.abilities }
                },
                knowledgeGraph: knowledgeGraph || null,
                mentalModel: mentalModel || null,
                debate: debate || null,
                quiz: quiz || null,
                material: material || null
            };

            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${course.title || '课程'}_${new Date().toLocaleDateString('zh-CN')}.json`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            Dialog.toast('课程导出成功！', 'success');
        } catch (err) {
            console.error('导出课程失败:', err);
            Dialog.toast('导出课程失败：' + (err.message || '未知错误'), 'error');
        }
    }
};
