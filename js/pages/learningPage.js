/**
 * 学习空间页面逻辑 LearningPage
 * 三问学习流程：知识图谱 → 争议点 → 测评
 */
const LearningPage = {
    /** 当前课程ID */
    _courseId: null,
    /** 当前课程数据 */
    _course: null,
    /** 当前阶段索引 0=第一问 1=第二问 2=第三问 */
    _currentPhase: 0,

    /** 阶段名称 */
    PHASES: [
        { key: 'phase1', title: '第一问', subtitle: '5个核心心智模型', icon: '🧠' },
        { key: 'phase2', title: '第二问', subtitle: '3个根本性分歧', icon: '⚔️' },
        { key: 'phase3', title: '第三问', subtitle: '10道深度理解题', icon: '🎯' }
    ],

    /**
     * 渲染学习空间
     * @param {HTMLElement} container
     * @param {string} courseId
     */
    async render(container, courseId) {
        this._courseId = courseId;

        // 移除首页的全宽样式，恢复正常布局
        const appContent = container.closest('.app-content');
        if (appContent) {
            appContent.classList.remove('home-content');
        }

        // 加载课程数据
        const courseData = await Store.getCourse(courseId);
        if (!courseData) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❓</div>
                    <p>课程未找到</p>
                    <a href="#/home" class="btn btn-primary" style="margin-top:16px;">返回首页</a>
                </div>
            `;
            return;
        }

        this._course = new Course(courseData);

        // 确定当前阶段
        if (!this._course.progress.phase1) this._currentPhase = 0;
        else if (!this._course.progress.phase2) this._currentPhase = 1;
        else if (!this._course.progress.phase3) this._currentPhase = 2;
        else this._currentPhase = 2;

        this._renderLayout(container);
        await this._renderPhaseContent();
        this._startBackgroundGeneration();
    },

    /** 渲染页面布局 */
    _renderLayout(container) {
        container.innerHTML = `
            <div class="page-container learning-page">
                <div class="learning-page-header">
                    <h2 class="learning-page-title">
                        ${this._course.title || '未命名课程'}
                    </h2>
                    <div class="learning-page-actions">
                        <button class="btn btn-secondary knowledge-repo-btn" onclick="Router.navigate('/knowledge/${this._courseId}')">
                            📄 查看资料
                        </button>
                        <button class="btn btn-secondary assessment-btn" onclick="AssessmentDialog.show('${this._courseId}')">
                            📊 课程学习评估
                        </button>
                    </div>
                </div>

                <!-- 三问导航 -->
                <div class="learning-nav" id="learning-nav"></div>

                <!-- 学习内容区 -->
                <div class="learning-content" id="learning-content">
                    <div class="learning-content-header">
                        <h3 class="learning-content-title" id="phase-title"></h3>
                        <div id="phase-actions"></div>
                    </div>
                    <div class="learning-content-body" id="phase-body"></div>
                </div>

                <!-- 资料区已迁移到独立的知识库页面 -->
                <!-- <div class="learning-content" style="margin-top:var(--spacing-lg);">
                    <div class="learning-content-header">
                        <h3 class="learning-content-title">📄 复合知识库</h3>
                    </div>
                    <div class="learning-content-body" id="materials-body"></div>
                </div> -->
            </div>
        `;

        this._renderNav();
    },

    /** 后台预生成后续阶段内容 */
    async _startBackgroundGeneration() {
        const topic = this._course.title || this._course.query || '';
        if (!topic || !AiService.API_KEY) return;

        console.log('[后台预生成] 开始...');

        const tasks = [];

        if (!this._course.progress.phase2) {
            tasks.push(this._bgGeneratePhase2(topic));
        }
        if (!this._course.progress.phase3) {
            tasks.push(this._bgGeneratePhase3(topic));
        }
        tasks.push(this._bgGenerateMaterials(topic));

        try {
            await Promise.allSettled(tasks);
            console.log('[后台预生成] 全部完成');
        } catch (e) {
            console.warn('[后台预生成] 部分失败:', e);
        }
    },

    /** 后台生成第二问 */
    async _bgGeneratePhase2(topic) {
        try {
            let debateData = await Store.getDebate(this._courseId);
            if (debateData) return;
            console.log('[后台预生成] 生成第二问...');
            debateData = await AiMock.mockIdentifyDisagreements(this._courseId);
            debateData.courseId = this._courseId;
            await Store.saveDebate(debateData);
            console.log('[后台预生成] 第二问完成');
        } catch (e) {
            console.warn('[后台预生成] 第二问失败:', e);
        }
    },

    /** 后台生成第三问 */
    async _bgGeneratePhase3(topic) {
        try {
            let quizData = await Store.getQuiz(this._courseId);
            if (quizData) return;
            console.log('[后台预生成] 生成第三问...');
            if (typeof AiMock.mockGenerateDeepQuestions === 'function') {
                quizData = await AiMock.mockGenerateDeepQuestions(this._courseId);
            } else {
                quizData = await AiMock.mockGenerateQuiz(this._courseId);
            }
            quizData.courseId = this._courseId;
            await Store.saveQuiz(quizData);
            console.log('[后台预生成] 第三问完成');
        } catch (e) {
            console.warn('[后台预生成] 第三问失败:', e);
        }
    },

    /** 后台生成知识库资料 */
    async _bgGenerateMaterials(topic) {
        try {
            let materialData = await Store.getMaterial(this._courseId);
            if (materialData) return;
            console.log('[后台预生成] 生成知识库...');
            materialData = await AiMock.mockGenerateMaterials(this._courseId, topic);
            materialData.courseId = this._courseId;
            await Store.saveMaterial(materialData);
            console.log('[后台预生成] 知识库完成');
        } catch (e) {
            console.warn('[后台预生成] 知识库失败:', e);
        }
    },

    /** 渲染三问导航 */
    _renderNav() {
        const nav = document.getElementById('learning-nav');
        nav.innerHTML = this.PHASES.map((phase, i) => {
            const done = this._course.progress[phase.key];
            const isActive = i === this._currentPhase;
            const clickable = done || i === this._currentPhase;
            return `
                <button class="learning-nav-btn ${isActive ? 'active' : ''} ${done ? 'completed' : ''}"
                        data-phase="${i}" ${clickable ? '' : 'disabled'}>
                    ${phase.icon} ${phase.title}
                    ${done ? ' ✓' : ''}
                    <span class="nav-step">${phase.subtitle}</span>
                </button>
            `;
        }).join('');

        nav.querySelectorAll('.learning-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.phase);
                if (idx === this._currentPhase) return;
                
                const targetPhase = this.PHASES[idx];
                if (this._course.progress[targetPhase.key]) {
                    this._currentPhase = idx;
                    this._renderNav();
                    this._renderPhaseContent();
                }
            });
        });
    },

    /** 加载资料区 */
    async _loadMaterials() {
        try {
            const materialBody = document.getElementById('materials-body');
            if (!materialBody) return;

            let materialData = await Store.getMaterial(this._courseId);
            if (!materialData) {
                // 使用AI生成资料推荐
                const topic = this._course?.title || this._course?.query || '';
                materialData = await AiMock.mockGenerateMaterials(this._courseId, topic);
                // 添加courseId字段用于IndexedDB存储
                materialData.courseId = this._courseId;
                await Store.saveMaterial(materialData);
            }

            MaterialList.render(materialBody, materialData);
        } catch (err) {
            console.error('加载资料失败:', err);
            // 降级到模拟数据
            const materialBody = document.getElementById('materials-body');
            if (materialBody) {
                const mockData = DataMock.getSampleMaterials(this._courseId);
                MaterialList.render(materialBody, mockData);
            }
        }
    },

    /** 渲染当前阶段内容 */
    async _renderPhaseContent() {
        const phase = this.PHASES[this._currentPhase];
        document.getElementById('phase-title').textContent = phase.icon + ' ' + phase.title + '：' + phase.subtitle;

        const body = document.getElementById('phase-body');
        const actions = document.getElementById('phase-actions');

        // 清除操作按钮区域
        actions.innerHTML = '';

        switch (this._currentPhase) {
            case 0:
                await this._renderPhase1(body, actions);
                break;
            case 1:
                await this._renderPhase2(body, actions);
                break;
            case 2:
                await this._renderPhase3(body, actions);
                break;
        }
    },

    /** 第一问：知识图谱为主 + 心智模型为辅 */
    async _renderPhase1(body, actions) {
        body.innerHTML = `<div class="loading-overlay">
            <span class="loading-spinner loading-spinner-lg"></span>
            <span>正在加载知识图谱...</span>
        </div>`;

        try {
            console.log('开始加载知识图谱...');
            // 第一阶段：加载并渲染知识图谱（主内容）
            let kgData = await Store.getKnowledgeGraph(this._courseId);
            if (!kgData || !kgData.nodes) {
                console.log('缓存中没有知识图谱，调用AI生成...');
                kgData = await AiMock.mockGenerateGraph(this._courseId);
                kgData.courseId = this._courseId;
                await Store.saveKnowledgeGraph(kgData);
            }

            // 第二阶段：加载心智模型（补充信息，独立key存储避免与知识图谱冲突）
            let mmData = null;
            if (typeof AiMock.mockExtractMentalModels === 'function') {
                try {
                    mmData = await Store.getMentalModel(this._courseId);
                    if (mmData && mmData.mentalModels) {
                        console.log('缓存中找到心智模型数据');
                    } else {
                        console.log('缓存中没有心智模型，调用AI生成...');
                        mmData = await AiMock.mockExtractMentalModels(this._courseId);
                        mmData.courseId = this._courseId;
                        await Store.saveMentalModel(mmData);
                    }
                } catch (mmErr) {
                    console.warn('加载心智模型失败（不影响主内容）:', mmErr);
                    mmData = null;
                }
            }

            body.innerHTML = '';

            // 主内容区域：知识图谱
            body.innerHTML = `
                <div class="phase1-knowledge-graph">
                    <div class="learning-content-header" style="margin-bottom:var(--spacing-md);">
                        <h3 class="learning-content-title">🌐 知识图谱</h3>
                    </div>
                    <div id="kg-body"></div>
                </div>
            `;

            const kgBody = document.getElementById('kg-body');
            if (typeof KnowledgeGraphRenderer.render !== 'function') {
                throw new Error('KnowledgeGraphRenderer组件未正确加载，请刷新页面（Ctrl+F5）');
            }
            KnowledgeGraphRenderer.render(kgBody, kgData, this._course.title);

            // 补充区域：心智模型（以卡片形式在下方展示）
            if (mmData && mmData.mentalModels && mmData.mentalModels.length > 0 && typeof MentalModelList !== 'undefined') {
                const mmSection = document.createElement('div');
                mmSection.className = 'phase1-mental-models';
                mmSection.style.marginTop = 'var(--spacing-xl)';
                mmSection.innerHTML = '<div class="learning-content-header"><h3 class="learning-content-title">🧠 核心心智模型参考</h3></div><div id="mm-body"></div>';
                body.appendChild(mmSection);
                const mmBody = document.getElementById('mm-body');
                MentalModelList.render(mmBody, mmData, {
                    courseId: this._courseId,
                    onAllExpanded: () => {
                        this._phase1GatePassed = true;
                        this._markPhaseComplete('phase1');
                        this._updatePhase1Actions();
                    }
                });
            }

            this._phase1GatePassed = this._course.progress.phase1;
            this._updatePhase1Actions();
        } catch (err) {
            console.error('加载第一问内容失败:', err);
            // 尝试纯知识图谱降级
            try {
                let kgData = await Store.getKnowledgeGraph(this._courseId);
                if (!kgData || !kgData.nodes) {
                    kgData = await AiMock.mockGenerateGraph(this._courseId);
                    kgData.courseId = this._courseId;
                    await Store.saveKnowledgeGraph(kgData);
                }
                body.innerHTML = '';
                if (typeof KnowledgeGraphRenderer.render === 'function') {
                    const kgBody = document.createElement('div');
                    body.appendChild(kgBody);
                    KnowledgeGraphRenderer.render(kgBody, kgData, this._course.title);
                }

                this._phase1GatePassed = this._course.progress.phase1;
                this._updatePhase1Actions();
            } catch (fallbackErr) {
                console.error('降级加载知识图谱也失败:', fallbackErr);
                body.innerHTML = `<div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <p>加载知识图谱失败</p>
                    <button class="btn btn-secondary" style="margin-top:16px;" onclick="LearningPage.render(document.querySelector('.app-content'), '${this._courseId}')">重试</button>
                </div>`;
            }
        }
    },

    /** 旧版第一问：知识图谱（降级） */
    async _renderLegacyPhase1(body, actions) {
        body.innerHTML = `<div class="loading-overlay">
            <span class="loading-spinner loading-spinner-lg"></span>
            <span>正在加载知识图谱...</span>
        </div>`;

        try {
            let kgData = await Store.getKnowledgeGraph(this._courseId);
            if (!kgData || !kgData.nodes) {
                kgData = await AiMock.mockGenerateGraph(this._courseId);
                kgData.courseId = this._courseId;
                await Store.saveKnowledgeGraph(kgData);
            }

            body.innerHTML = '';
            KnowledgeGraphRenderer.render(body, kgData, this._course.title);

            this._phase1GatePassed = this._course.progress.phase1;
            this._updatePhase1Actions();
        } catch (err) {
            console.error('加载知识图谱失败:', err);
            body.innerHTML = `<div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p>加载知识图谱失败</p>
                <button class="btn btn-secondary" style="margin-top:16px;" onclick="LearningPage.render(document.querySelector('.app-content'), '${this._courseId}')">重试</button>
            </div>`;
        }
    },

    /** 更新第一问操作按钮 */
    _updatePhase1Actions() {
        const actions = document.getElementById('phase-actions');
        if (!actions) return;

        if (this._phase1GatePassed) {
            actions.innerHTML = `
                <button class="btn btn-primary" onclick="LearningPage._goToNextPhase()">
                    进入第二问 →
                </button>
            `;
        } else {
            actions.innerHTML = `
                <button class="btn btn-primary" disabled>进入第二问 →</button>
            `;
        }
    },

    /** 第二问：争议点 */
    async _renderPhase2(body, actions) {
        body.innerHTML = `<div class="loading-overlay">
            <span class="loading-spinner loading-spinner-lg"></span>
            <span>正在挖掘根本性分歧...</span>
        </div>`;

        try {
            // 优先使用新框架方法
            let debateData = await Store.getDebate(this._courseId);
            
            if (!debateData) {
                if (typeof AiMock.mockIdentifyDisagreements === 'function') {
                    debateData = await AiMock.mockIdentifyDisagreements(this._courseId);
                } else {
                    debateData = await AiMock.mockMineDebates(this._courseId);
                }
                debateData.courseId = this._courseId;
                await Store.saveDebate(debateData);
            }

            body.innerHTML = '';
            DebatePanel.render(body, debateData, {
                courseId: this._courseId,
                onAllViewed: () => {
                    this._phase2GatePassed = true;
                    this._markPhaseComplete('phase2');
                    this._updatePhase2Actions();
                }
            });

            this._phase2GatePassed = this._course.progress.phase2;
            this._updatePhase2Actions();
        } catch (err) {
            body.innerHTML = `<div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p>加载争议点失败</p>
            </div>`;
        }
    },

    /** 更新第二问操作按钮 */
    _updatePhase2Actions() {
        const actions = document.getElementById('phase-actions');
        if (!actions) return;

        if (this._phase2GatePassed) {
            actions.innerHTML = `
                <button class="btn btn-primary" onclick="LearningPage._goToNextPhase()">
                    进入第三问 →
                </button>
            `;
        } else {
            actions.innerHTML = `
                <button class="btn btn-primary" disabled>进入第三问 →</button>
            `;
        }
    },

    /** 第三问：测评 */
    async _renderPhase3(body, actions) {
        body.innerHTML = `<div class="loading-overlay">
            <span class="loading-spinner loading-spinner-lg"></span>
            <span>正在生成深度理解测试题...</span>
        </div>`;

        try {
            let quizData = await Store.getQuiz(this._courseId);
            
            if (!quizData) {
                if (typeof AiMock.mockGenerateDeepQuestions === 'function') {
                    quizData = await AiMock.mockGenerateDeepQuestions(this._courseId);
                } else {
                    quizData = await AiMock.mockGenerateQuiz(this._courseId);
                }
                quizData.courseId = this._courseId;
                await Store.saveQuiz(quizData);
            } else {
                this._normalizeQuizData(quizData);
            }

            body.innerHTML = '';
            if (typeof QuizItem !== 'undefined') {
                QuizItem.renderList(body, quizData.questions, {
                    onComplete: (result) => this._onQuizComplete(result)
                });
            }
        } catch (err) {
            body.innerHTML = `<div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p>加载测评题目失败</p>
            </div>`;
        }
    },

    /** 跳转到下一阶段 */
    _goToNextPhase() {
        if (this._currentPhase < 2) {
            this._currentPhase++;
            this._renderNav();
            this._renderPhaseContent();
        }
    },

    /** 标记阶段完成 */
    async _markPhaseComplete(phaseKey) {
        this._course.progress[phaseKey] = true;
        await Store.saveCourse(this._course);
        this._renderNav();
    },

    /** 测评完成回调（正确率≥90%时触发） */
    async _onQuizComplete(result) {
        if (!this._course.progress.phase3) {
            await this._markPhaseComplete('phase3');
        }

        this._course.status = 'completed';
        this._course.updatedAt = Date.now();

        if (result) {
            const base = 60;
            const accuracyBonus = Math.round((result.correctCount / result.total) * 30);
            const levelBonus = 10;
            this._course.rating = Math.min(100, base + accuracyBonus + levelBonus);
            Store.recordQuizAttempt(this._courseId, result.percent, result.correctCount, result.total);
        } else if (!this._course.rating) {
            this._course.rating = 80;
        }

        await Store.saveCourse(this._course);
    },

    /** 规范化缓存的测评数据，修复旧格式字段名问题 */
    _normalizeQuizData(data) {
        if (!data || !data.questions) return;
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const stripPrefix = (s) => typeof s === 'string' ? s.replace(/^[\s]*[A-Fa-f][\.\、\s]+/, '').trim() || s : s;
        const judgeAnswerMap = (a) => {
            const s = String(a).trim();
            if (s === 'A' || s === '对' || s === '正确' || s.toLowerCase() === 'true') return '对';
            if (s === 'B' || s === '错' || s === '错误' || s.toLowerCase() === 'false') return '错';
            return s;
        };
        data.questions.forEach(q => {
            if (!q.content && q.question) {
                q.content = q.question;
            }
            if (q.options && q.options.length > 0 && typeof q.options[0] === 'string') {
                q.options = q.options.map((opt, j) => ({ label: labels[j] || String(j), content: stripPrefix(opt) }));
            } else if (q.options && q.options.length > 0 && typeof q.options[0] === 'object') {
                q.options = q.options.map((opt) => ({ label: opt.label, content: stripPrefix(opt.content) }));
            }
            if (typeof q.answer === 'string') {
                q.answer = [q.answer];
            }
            q.id = q.id || '1';
            q.type = (q.type === 'judge' || q.type === 'truefalse') ? 'judge' : 'single';
            q.level = q.level || 'understand';
            if (q.type === 'judge' && q.answer) {
                q.answer = q.answer.map(judgeAnswerMap);
            }
        });
    },
};
