/**
 * 争议点对比面板 DebatePanel
 * 左右分栏展示争议双方观点，支持切换争议主题
 */
const DebatePanel = {
    /** 当前争议数据 */
    _debate: null,
    /** 当前选中主题索引 */
    _currentTopicIndex: 0,
    /** 已查看的主题索引集合 */
    _viewedTopics: new Set(),
    /** 全部查看回调 */
    _onAllViewed: null,
    /** 当前课程ID */
    _courseId: null,

    /**
     * 渲染争议点面板
     * @param {HTMLElement} container
     * @param {Object} debateData - 争议点数据
     * @param {Object} options - { onAllViewed: Function, courseId: string }
     */
    render(container, debateData, options = {}) {
        this._debate = debateData;
        this._currentTopicIndex = 0;
        this._viewedTopics = new Set();
        this._onAllViewed = options.onAllViewed || null;
        this._courseId = options.courseId || null;

        if (!debateData || !debateData.topics || debateData.topics.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">😓</div>
                    <p>暂无争议点数据</p>
                </div>
            `;
            return;
        }

        this._viewedTopics.add(0);
        this._checkAllViewed();
        this._renderContent(container);
    },

    /** 渲染争议内容 */
    _renderContent(container) {
        const topic = this._debate.topics[this._currentTopicIndex];
        if (!topic) return;

        container.innerHTML = `
            <div class="debate-container">
                <!-- 主题切换 -->
                <div class="debate-topics-bar">
                    ${this._debate.topics.map((t, i) => `
                        <button class="debate-topic-btn ${i === this._currentTopicIndex ? 'active' : ''}"
                                data-index="${i}">
                            ${t.title}
                        </button>
                    `).join('')}
                </div>

                <!-- 当前主题标题 -->
                <h3 class="debate-title">${topic.title}</h3>

                <!-- 核心争议问题 -->
                ${topic.coreQuestion ? `
                    <div class="debate-core-question">
                        <span class="debate-core-label">❓ 核心争议</span>
                        <span class="debate-core-text">${topic.coreQuestion}</span>
                    </div>
                ` : ''}

                <!-- 左右分栏 -->
                <div class="debate-columns">
                    <div class="debate-side debate-side-a">
                        <div class="debate-side-header">${topic.sideA.label}</div>
                        ${topic.sideA.strongestArgument ? `
                            <div class="debate-strong-argument">
                                <div class="argument-label">⚡ 最有力论据</div>
                                <div class="argument-content">${topic.sideA.strongestArgument}</div>
                            </div>
                        ` : ''}
                        ${topic.sideA.supportingScholars && topic.sideA.supportingScholars.length > 0 ? `
                            <div class="debate-scholars">
                                ${topic.sideA.supportingScholars.map(s => `<span class="scholar-tag">🏛️ ${s}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="debate-evidence-list">
                            ${topic.sideA.evidences.map(ev => `
                                <div class="debate-evidence">
                                    <div class="evidence-content">${ev.content}</div>
                                    <div class="evidence-source">📖 ${ev.source}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="debate-vs">VS</div>
                    <div class="debate-side debate-side-b">
                        <div class="debate-side-header">${topic.sideB.label}</div>
                        ${topic.sideB.strongestArgument ? `
                            <div class="debate-strong-argument">
                                <div class="argument-label">⚡ 最有力论据</div>
                                <div class="argument-content">${topic.sideB.strongestArgument}</div>
                            </div>
                        ` : ''}
                        ${topic.sideB.supportingScholars && topic.sideB.supportingScholars.length > 0 ? `
                            <div class="debate-scholars">
                                ${topic.sideB.supportingScholars.map(s => `<span class="scholar-tag">🏛️ ${s}</span>`).join('')}
                            </div>
                        ` : ''}
                        <div class="debate-evidence-list">
                            ${topic.sideB.evidences.map(ev => `
                                <div class="debate-evidence">
                                    <div class="evidence-content">${ev.content}</div>
                                    <div class="evidence-source">📖 ${ev.source}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <button class="btn debate-ask-ai-btn" data-topic-title="${topic.title}" data-side-a="${topic.sideA.label}" data-side-b="${topic.sideB.label}" data-core-question="${topic.coreQuestion || ''}">
                    🤖 去问AI：深入对比分析这个分歧
                </button>

                <!-- 前沿启示 -->
                ${topic.frontierImplication ? `
                    <div class="debate-frontier">
                        <div class="frontier-label">🔭 领域前沿启示</div>
                        <div class="frontier-content">${topic.frontierImplication}</div>
                    </div>
                ` : ''}

                <!-- 结论 -->
                ${topic.conclusion ? `
                    <div class="debate-conclusion">
                        <div class="conclusion-label">💡 AI 总结</div>
                        <div class="conclusion-content">${topic.conclusion}</div>
                    </div>
                ` : ''}
            </div>
        `;

        // 绑定主题切换事件
        container.querySelectorAll('.debate-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                this._currentTopicIndex = idx;
                this._viewedTopics.add(idx);
                this._checkAllViewed();
                this._renderContent(container);
            });
        });

        MathRenderer.renderElement(container);

        // 绑定"去问AI"按钮事件
        container.querySelectorAll('.debate-ask-ai-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const topicTitle = btn.dataset.topicTitle;
                const sideA = btn.dataset.sideA;
                const sideB = btn.dataset.sideB;
                const coreQuestion = btn.dataset.coreQuestion;
                const message = `请详细对比分析根本性分歧"${topicTitle}"中的两种观点："${sideA}" vs "${sideB}"${coreQuestion ? `，核心争议是：${coreQuestion}` : ''}，并给出你的分析、各自的优势和局限性，以及前沿研究动态。`;
                if (typeof AiChatWidget !== 'undefined') {
                    AiChatWidget.openWithMessage(message, this._courseId);
                }
            });
        });
    },

    /** 检查是否全部查看 */
    _checkAllViewed() {
        if (!this._debate || !this._debate.topics) return;
        const total = this._debate.topics.length;
        if (this._viewedTopics.size >= total && this._onAllViewed) {
            this._onAllViewed();
        }
    },

    /** 获取已查看数量 */
    getViewedCount() {
        return this._viewedTopics.size;
    },

    /** 获取总数 */
    getTotalCount() {
        return this._debate && this._debate.topics ? this._debate.topics.length : 0;
    }
};
