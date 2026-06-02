/**
 * 心智模型展示组件 MentalModelList
 * 展示5个核心心智模型，支持展开/折叠交互
 */
const MentalModelList = {
    /** 当前心智模型数据 */
    _data: null,
    /** 已展开的心智模型ID集合 */
    _expandedSet: new Set(),
    /** 全部展开回调 */
    _onAllExpanded: null,
    /** 当前课程ID */
    _courseId: null,

    /**
     * 渲染心智模型列表
     * @param {HTMLElement} container
     * @param {Object} data - 心智模型数据 { mentalModels: [...] }
     * @param {Object} options - { onAllExpanded: Function, courseId: string }
     */
    render(container, data, options = {}) {
        this._data = data;
        this._expandedSet = new Set();
        this._onAllExpanded = options.onAllExpanded || null;
        this._courseId = options.courseId || null;

        if (!data || !data.mentalModels || data.mentalModels.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🧠</div>
                    <p>暂无心智模型数据</p>
                </div>
            `;
            return;
        }

        if (this._data.mentalModels.length > 0) {
            this._expandedSet.add(this._data.mentalModels[0].id);
        }
        this._renderContent(container);
    },

    /** 渲染心智模型内容 */
    _renderContent(container) {
        const models = this._data.mentalModels;

        container.innerHTML = `
            <div class="mental-models-container">
                <div class="mental-models-intro">
                    <p class="mental-models-intro-text">
                        以下5个核心心智模型是该领域专家共享的底层思维框架，掌握它们就等于掌握了该领域的"第一性原理"。
                    </p>
                </div>
                <div class="mental-models-list">
                    ${models.map((model, index) => this._renderModelCard(model, index)).join('')}
                </div>
            </div>
        `;

        this._bindEvents(container);
        this._checkAllExpanded();
        MathRenderer.renderElement(container);
    },

    /** 渲染单个心智模型卡片 */
    _renderModelCard(model, index) {
        const isFirst = index === 0;
        return `
            <div class="mental-model-card card ${isFirst ? 'expanded' : ''}">
                <div class="card-body">
                    <div class="mental-model-header" data-model-id="${model.id}">
                        <span class="mental-model-index">${index + 1}</span>
                        <div class="mental-model-header-info">
                            <h4 class="mental-model-name">${model.name}</h4>
                            <p class="mental-model-desc">${model.description}</p>
                        </div>
                        <span class="mental-model-toggle-icon ${isFirst ? 'rotated' : ''}">▼</span>
                    </div>
                    <div class="mental-model-detail">
                        <div class="mental-model-detail-inner">
                            <div class="mental-model-section">
                                <span class="mental-model-section-icon">💡</span>
                                <div class="mental-model-section-content">
                                    <div class="mental-model-section-label">第一性原理</div>
                                    <p class="mental-model-section-text">${model.principle}</p>
                                </div>
                                <button class="btn btn-ai-ask mm-ask-ai-btn" data-model-name="${model.name}" data-model-principle="${model.principle}">
                                    🤖 去问AI
                                </button>
                            </div>
                            <div class="mental-model-section">
                                <span class="mental-model-section-icon">🎯</span>
                                <div class="mental-model-section-content">
                                    <div class="mental-model-section-label">应用场景</div>
                                    <p class="mental-model-section-text">${model.application}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /** 绑定交互事件 */
    _bindEvents(container) {
        container.querySelectorAll('.mental-model-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.mental-model-card');
                if (!card) return;

                const toggleIcon = header.querySelector('.mental-model-toggle-icon');
                const modelId = header.dataset.modelId;
                const isExpanded = card.classList.contains('expanded');

                if (isExpanded) {
                    card.classList.remove('expanded');
                    toggleIcon.classList.remove('rotated');
                } else {
                    card.classList.add('expanded');
                    toggleIcon.classList.add('rotated');
                    if (modelId) {
                        this._expandedSet.add(modelId);
                        this._checkAllExpanded();
                    }
                }
            });
        });

        container.querySelectorAll('.mm-ask-ai-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const modelName = btn.dataset.modelName;
                const modelPrinciple = btn.dataset.modelPrinciple;
                const message = `请详细解释心智模型"${modelName}"的第一性原理："${modelPrinciple}"，并给出更多实际应用案例和深入分析。`;
                if (typeof AiChatWidget !== 'undefined') {
                    AiChatWidget.openWithMessage(message, this._courseId);
                }
            });
        });
    },

    /** 检查是否全部展开 */
    _checkAllExpanded() {
        if (!this._data || !this._data.mentalModels) return;
        const total = this._data.mentalModels.length;
        if (this._expandedSet.size >= total && this._onAllExpanded) {
            this._onAllExpanded();
        }
    },

    /** 获取已展开数量 */
    getExpandedCount() {
        return this._expandedSet.size;
    },

    /** 获取总数 */
    getTotalCount() {
        return this._data && this._data.mentalModels ? this._data.mentalModels.length : 0;
    }
};
