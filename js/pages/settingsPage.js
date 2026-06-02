/**
 * 设置页面逻辑 SettingsPage
 * AI模型配置、主题切换、学习偏好、数据管理、关于帮助
 */
const SettingsPage = {
    _currentProvider: '',
    _currentModel: '',

    async render(container) {
        const appContent = container.closest('.app-content');
        if (appContent) appContent.classList.remove('home-content');

        const settings = Store.getSettings();
        this._currentProvider = settings.aiProvider || '';
        this._currentModel = settings.aiModel || '';

        container.innerHTML = `
            <div class="page-container settings-page">
                <div class="settings-header">
                    <button class="btn btn-secondary settings-back-btn" onclick="Router.navigate('/profile')">← 返回个人中心</button>
                    <h2 class="settings-title">⚙ 设置</h2>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <div class="settings-section-header">
                            <h3 class="settings-section-title">🤖 AI 模型配置</h3>
                            <button class="btn btn-secondary" id="saved-models-btn">📋 已保存模型</button>
                        </div>
                        <div class="settings-card">
                            <div class="settings-item">
                                <label class="settings-label">AI 服务商</label>
                                <div id="settings-ai-provider-container"></div>
                            </div>
                            <div class="settings-item">
                                <label class="settings-label">API Key</label>
                                <input type="password" class="settings-input" id="settings-api-key" placeholder="请输入 API Key" value="${settings.aiApiKey ? '••••••••••••••••' : ''}">
                            </div>
                            <div class="settings-item" id="settings-endpoint-item" style="display: ${settings.aiProvider === 'custom' ? 'flex' : 'none'}">
                                <label class="settings-label">API 端点</label>
                                <input type="text" class="settings-input" id="settings-api-endpoint" placeholder="https://api.example.com/v1/chat/completions" value="${settings.aiEndpoint || ''}">
                            </div>
                            <div class="settings-item">
                                <label class="settings-label">AI 模型</label>
                                <div id="settings-ai-model-container"></div>
                            </div>
                            <button class="btn btn-primary settings-save-config-btn" id="save-config-btn">💾 保存配置</button>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3 class="settings-section-title">🎨 主题设置</h3>
                        <div class="settings-card">
                            <div class="settings-item">
                                <label class="settings-label">界面主题</label>
                                <div class="theme-toggle-group">
                                    <button class="theme-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">☀️ 浅色模式</button>
                                    <button class="theme-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">🌙 深色模式</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3 class="settings-section-title">📚 学习偏好</h3>
                        <div class="settings-card">
                            <div class="settings-item">
                                <label class="settings-label">测验难度</label>
                                <div class="difficulty-select-group">
                                    <button class="difficulty-btn ${settings.quizDifficulty === 'easy' ? 'active' : ''}" data-difficulty="easy">简单</button>
                                    <button class="difficulty-btn ${settings.quizDifficulty === 'medium' ? 'active' : ''}" data-difficulty="medium">中等</button>
                                    <button class="difficulty-btn ${settings.quizDifficulty === 'hard' ? 'active' : ''}" data-difficulty="hard">困难</button>
                                </div>
                                <p class="settings-hint">设置测验题目的默认难度级别</p>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3 class="settings-section-title">💾 数据管理</h3>
                        <div class="settings-card">
                            <div class="settings-item">
                                <label class="settings-label">课程数据</label>
                                <div class="settings-btn-group">
                                    <button class="btn btn-secondary" id="export-all-btn">📦 导出所有课程</button>
                                    <button class="btn btn-secondary" id="import-courses-btn">📥 导入所有课程</button>
                                </div>
                            </div>
                            <div class="settings-item settings-item-danger">
                                <label class="settings-label">危险操作</label>
                                <button class="btn btn-danger" id="clear-data-btn">🗑️ 清除所有学习数据</button>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3 class="settings-section-title">ℹ️ 关于与帮助</h3>
                        <div class="settings-card">
                            <div class="settings-item">
                                <label class="settings-label">版本信息</label>
                                <div class="settings-info">
                                    <p>三问高效学习系统 v1.0.0</p>
                                    <p class="settings-hint">基于 AI 的智能学习平台</p>
                                </div>
                            </div>
                            <div class="settings-item">
                                <label class="settings-label">使用帮助</label>
                                <div class="settings-help-content">
                                    <p>1. 在首页输入学习主题，系统会自动生成课程</p>
                                    <p>2. 按照"三问"流程学习：心智模型 → 争议点 → 深度测验</p>
                                    <p>3. 使用 AI 助手解答学习中的疑问</p>
                                    <p>4. 在知识库中查看和管理学习资料</p>
                                </div>
                            </div>
                            <div class="settings-item">
                                <label class="settings-label">反馈与建议</label>
                                <div class="settings-info">
                                    <p>如有问题或建议，请通过 GitHub 提交 Issue</p>
                                    <a href="https://github.com/QlikL/Three-Question-Learning-Method/issues" target="_blank" class="btn btn-secondary">📝 提交反馈</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="settings-modal-overlay" id="saved-models-modal" style="display:none;">
                <div class="settings-modal-content">
                    <div class="settings-modal-header">
                        <h3>📋 已保存模型</h3>
                        <button class="settings-modal-close" id="saved-models-close">×</button>
                    </div>
                    <div class="settings-modal-body" id="saved-models-list"></div>
                </div>
            </div>
        `;

        this._initCustomSelects(settings);
        this._bindEvents();
    },

    /** 初始化自定义下拉选择器 */
    _initCustomSelects(settings) {
        const providers = [
            { value: 'dashscope', label: '阿里云百炼（通义千问）' },
            { value: 'baidu', label: '百度文心一言' },
            { value: 'spark', label: '讯飞星火' },
            { value: 'zhipu', label: '智谱AI（ChatGLM）' },
            { value: 'tencent', label: '腾讯混元' },
            { value: 'moonshot', label: '月之暗面 Kimi' },
            { value: 'deepseek', label: 'DeepSeek' },
            { value: 'custom', label: '自定义（OpenAI兼容）' }
        ];

        const providerContainer = document.getElementById('settings-ai-provider-container');
        if (providerContainer) {
            const defaultProvider = this._currentProvider || providers[0].value;
            this._currentProvider = defaultProvider;
            CustomSelect.render(providerContainer, {
                items: providers,
                defaultValue: defaultProvider,
                onChange: (value) => this._onProviderChange(value)
            });
        }

        const currentProvider = this._currentProvider || 'dashscope';
        this._renderModelSelect(currentProvider, this._currentModel);
    },

    /** 渲染模型下拉选择器 */
    _renderModelSelect(provider, currentModel) {
        const modelContainer = document.getElementById('settings-ai-model-container');
        if (!modelContainer) return;

        if (provider === 'custom') {
            this._renderModelInput(modelContainer, currentModel);
            return;
        }

        const items = this._getModelItems(provider);
        const isCustomModel = currentModel && !items.find(i => i.value === currentModel && i.value !== '__custom_model__');

        if (isCustomModel || currentModel === '__custom_model__') {
            this._renderModelInput(modelContainer, currentModel === '__custom_model__' ? '' : currentModel);
            return;
        }

        const defaultValue = items.find(i => i.value === currentModel) ? currentModel : (items[0]?.value || '');

        CustomSelect.render(modelContainer, {
            items: items,
            defaultValue: defaultValue,
            onChange: (value) => {
                if (value === '__custom_model__') {
                    this._renderModelInput(modelContainer, '');
                } else {
                    this._currentModel = value;
                }
            }
        });
    },

    /** 渲染模型手动输入框 */
    _renderModelInput(modelContainer, value) {
        modelContainer.innerHTML = `<input type="text" class="settings-input" id="settings-custom-model" placeholder="请输入模型名称" value="${value || ''}">`;
        const input = document.getElementById('settings-custom-model');
        if (input) {
            input.addEventListener('input', () => {
                this._currentModel = input.value.trim();
            });
        }
    },

    /** 服务商切换回调（仅更新页面状态，不保存） */
    _onProviderChange(provider) {
        this._currentProvider = provider;

        const items = this._getModelItems(provider);
        const firstModel = items[0]?.value || '';
        this._currentModel = firstModel;
        this._renderModelSelect(provider, firstModel);

        const endpointItem = document.getElementById('settings-endpoint-item');
        if (endpointItem) endpointItem.style.display = provider === 'custom' ? 'flex' : 'none';

        const apiKeyInput = document.getElementById('settings-api-key');
        if (apiKeyInput) apiKeyInput.value = '';

        const endpointInput = document.getElementById('settings-api-endpoint');
        if (endpointInput) endpointInput.value = '';
    },

    /** 获取模型选项列表 */
    _getModelItems(provider) {
        const otherItem = { value: '__custom_model__', label: '其他模型（手动输入）' };
        const models = {
            dashscope: [
                { value: 'qwen3.7-max', label: 'qwen3.7-max（旗舰）' },
                { value: 'qwen3.6-plus', label: 'qwen3.6-plus（均衡推荐）' },
                { value: 'qwen-turbo', label: 'qwen-turbo（速度快）' },
                { value: 'qwen-plus', label: 'qwen-plus（经典均衡）' },
                { value: 'qwen-max', label: 'qwen-max（经典旗舰）' },
                { value: 'qwen-long', label: 'qwen-long（长文本）' },
                { value: 'qwen-coder-turbo', label: 'qwen-coder-turbo（代码）' },
                otherItem
            ],
            baidu: [
                { value: 'ernie-4.5-8k-preview', label: 'ERNIE 4.5（旗舰）' },
                { value: 'ernie-4.0-8k', label: 'ERNIE 4.0（高性能）' },
                { value: 'ernie-4.0-turbo-8k', label: 'ERNIE 4.0 Turbo（均衡推荐）' },
                { value: 'ernie-3.5-8k', label: 'ERNIE 3.5（经典）' },
                { value: 'ernie-speed-128k', label: 'ERNIE Speed（速度快）' },
                { value: 'ernie-lite-8k', label: 'ERNIE Lite（轻量）' },
                otherItem
            ],
            spark: [
                { value: 'spark4.0-ultra', label: 'Spark 4.0 Ultra（旗舰）' },
                { value: 'spark-max', label: 'Spark Max（高性能）' },
                { value: 'spark-pro', label: 'Spark Pro（均衡推荐）' },
                { value: 'spark-lite', label: 'Spark Lite（速度快）' },
                otherItem
            ],
            zhipu: [
                { value: 'glm-4-plus', label: 'GLM-4-Plus（旗舰）' },
                { value: 'glm-4', label: 'GLM-4（均衡推荐）' },
                { value: 'glm-4-flash', label: 'GLM-4-Flash（速度快）' },
                { value: 'glm-4-air', label: 'GLM-4-Air（轻量）' },
                { value: 'glm-3-turbo', label: 'GLM-3-Turbo（经典）' },
                otherItem
            ],
            tencent: [
                { value: 'hunyuan-2.0-thinking-20251109', label: 'HY 2.0 Think（旗舰推理）' },
                { value: 'hunyuan-2.0-instruct-20251111', label: 'HY 2.0 Instruct（均衡推荐）' },
                { value: 'hunyuan-turbos-latest', label: 'HY TurboS（速度快）' },
                { value: 'hunyuan-t1-latest', label: 'HY T1（推理模型）' },
                { value: 'hunyuan-lite', label: 'HY Lite（轻量）' },
                otherItem
            ],
            moonshot: [
                { value: 'moonshot-v1-128k', label: 'Kimi 128K（长文本）' },
                { value: 'moonshot-v1-32k', label: 'Kimi 32K（均衡推荐）' },
                { value: 'moonshot-v1-8k', label: 'Kimi 8K（速度快）' },
                otherItem
            ],
            deepseek: [
                { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro（旗舰）' },
                { value: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash（均衡推荐）' },
                { value: 'deepseek-chat', label: 'DeepSeek Chat（经典通用）' },
                { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner（推理）' },
                otherItem
            ],
            custom: []
        };
        return models[provider] || [];
    },

    /** 绑定事件 */
    _bindEvents() {
        // 保存配置（统一保存 API Key、端点、服务商、模型）
        const saveConfigBtn = document.getElementById('save-config-btn');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('settings-api-key');
                const endpointInput = document.getElementById('settings-api-endpoint');
                const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
                const endpoint = endpointInput ? endpointInput.value.trim() : '';

                const updates = {};
                if (apiKey && apiKey !== '••••••••••••••••') {
                    AiService.API_KEY = apiKey;
                    updates.aiApiKey = apiKey;
                    apiKeyInput.value = '••••••••••••••••';
                } else if (!apiKey) {
                    AiService.API_KEY = '';
                    updates.aiApiKey = '';
                }

                updates.aiProvider = this._currentProvider;
                updates.aiModel = this._currentModel;
                AiService.PROVIDER = this._currentProvider;
                AiService.MODEL_NAME = this._currentModel;

                if (this._currentProvider === 'custom') {
                    let finalEndpoint = endpoint;
                    if (finalEndpoint && !finalEndpoint.endsWith('/chat/completions')) {
                        finalEndpoint = finalEndpoint.replace(/\/+$/, '') + '/chat/completions';
                        endpointInput.value = finalEndpoint;
                    }
                    AiService.API_ENDPOINT = finalEndpoint;
                    updates.aiEndpoint = finalEndpoint;
                } else {
                    AiService.API_ENDPOINT = '';
                    updates.aiEndpoint = '';
                }

                Store.saveSettings(updates);
                this._saveCurrentModelConfig();
                Dialog.toast('AI 配置已保存', 'success');
            });
        }

        // 主题切换
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                Store.saveTheme(theme);
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Dialog.toast(`已切换到${theme === 'dark' ? '深色' : '浅色'}模式`, 'success');
            });
        });

        // 测验难度切换
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                Store.saveQuizDifficulty(difficulty);
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const names = { easy: '简单', medium: '中等', hard: '困难' };
                Dialog.toast(`测验难度已设置为: ${names[difficulty]}`, 'success');
            });
        });

        // 导出所有课程
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportAllBtn) exportAllBtn.addEventListener('click', async () => await this._exportAllCourses());

        // 导入课程
        const importBtn = document.getElementById('import-courses-btn');
        if (importBtn) importBtn.addEventListener('click', () => this._importCourses());

        // 清除数据
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', async () => {
                const confirmed = await Dialog.confirm('确定要清除所有学习数据吗？此操作不可恢复！');
                if (confirmed) {
                    await Store.clearAllLearningData();
                    Dialog.toast('所有学习数据已清除', 'success');
                }
            });
        }

        // 已保存模型按钮
        const savedModelsBtn = document.getElementById('saved-models-btn');
        if (savedModelsBtn) savedModelsBtn.addEventListener('click', () => this._showSavedModels());

        // 已保存模型弹窗关闭
        const closeBtn = document.getElementById('saved-models-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this._hideSavedModels());

        const modal = document.getElementById('saved-models-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this._hideSavedModels();
            });
        }
    },

    /** 保存当前模型配置到已保存列表 */
    _saveCurrentModelConfig() {
        const settings = Store.getSettings();
        const saved = settings.savedModels || [];
        const exists = saved.findIndex(m => m.provider === this._currentProvider && m.model === this._currentModel);
        const providerNames = { dashscope: '阿里云百炼', baidu: '百度文心一言', spark: '讯飞星火', zhipu: '智谱AI', tencent: '腾讯混元', moonshot: '月之暗面', deepseek: 'DeepSeek', custom: '自定义' };

        const entry = {
            provider: this._currentProvider,
            providerName: providerNames[this._currentProvider] || this._currentProvider,
            model: this._currentModel,
            label: this._getModelLabel(this._currentProvider, this._currentModel),
            apiKey: settings.aiApiKey || '',
            endpoint: settings.aiEndpoint || '',
            savedAt: Date.now()
        };

        if (exists >= 0) {
            saved[exists] = entry;
        } else {
            saved.push(entry);
        }
        Store.saveSettings({ savedModels: saved });
    },

    /** 获取模型显示名称 */
    _getModelLabel(provider, model) {
        const items = this._getModelItems(provider);
        const found = items.find(i => i.value === model);
        return found ? found.label : model;
    },

    /** 显示已保存模型弹窗 */
    _showSavedModels() {
        const modal = document.getElementById('saved-models-modal');
        const list = document.getElementById('saved-models-list');
        if (!modal || !list) return;

        const settings = Store.getSettings();
        const saved = settings.savedModels || [];
        const activeProvider = settings.aiProvider || '';
        const activeModel = settings.aiModel || '';

        if (saved.length === 0) {
            list.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:var(--spacing-lg);">暂无已保存的模型配置</p>';
        } else {
            list.innerHTML = `
                <div class="saved-models-grid">
                    ${saved.map((m, i) => {
                        const isCurrent = m.provider === activeProvider && m.model === activeModel;
                        return `
                        <div class="saved-model-card ${isCurrent ? 'saved-model-current' : ''}">
                            <div class="saved-model-info">
                                <div class="saved-model-provider">${m.providerName}</div>
                                <div class="saved-model-name">${m.label}</div>
                            </div>
                            <div class="saved-model-actions">
                                ${isCurrent
                                    ? '<span class="saved-model-current-tag">当前使用</span>'
                                    : `<button class="btn btn-primary btn-sm saved-model-switch-btn" data-index="${i}">切换</button>
                                       <button class="btn btn-secondary btn-sm saved-model-delete-btn" data-index="${i}">删除</button>`
                                }
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            `;

            list.querySelectorAll('.saved-model-switch-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index);
                    const model = saved[idx];
                    this._switchToModel(model);
                });
            });

            list.querySelectorAll('.saved-model-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index);
                    saved.splice(idx, 1);
                    Store.saveSettings({ savedModels: saved });
                    this._showSavedModels();
                    Dialog.toast('已删除模型配置', 'success');
                });
            });
        }

        modal.style.display = 'flex';
    },

    /** 隐藏已保存模型弹窗 */
    _hideSavedModels() {
        const modal = document.getElementById('saved-models-modal');
        if (modal) modal.style.display = 'none';
    },

    /** 切换到指定模型 */
    _switchToModel(modelConfig) {
        this._currentProvider = modelConfig.provider;
        this._currentModel = modelConfig.model;

        const updates = {
            aiProvider: modelConfig.provider,
            aiModel: modelConfig.model
        };

        if (modelConfig.apiKey) {
            AiService.API_KEY = modelConfig.apiKey;
            updates.aiApiKey = modelConfig.apiKey;
        }

        if (modelConfig.provider === 'custom' && modelConfig.endpoint) {
            AiService.API_ENDPOINT = modelConfig.endpoint;
            updates.aiEndpoint = modelConfig.endpoint;
        } else {
            AiService.API_ENDPOINT = '';
            updates.aiEndpoint = '';
        }

        Store.saveSettings(updates);

        AiService.PROVIDER = modelConfig.provider;
        AiService.MODEL_NAME = modelConfig.model;

        this._initCustomSelects(Store.getSettings());
        this._hideSavedModels();

        const endpointItem = document.getElementById('settings-endpoint-item');
        if (endpointItem) endpointItem.style.display = modelConfig.provider === 'custom' ? 'flex' : 'none';

        Dialog.toast(`已切换到 ${modelConfig.providerName} - ${modelConfig.label}`, 'success');
    },

    /** 导出所有课程 */
    async _exportAllCourses() {
        try {
            const courses = await Store.getAllCourses();
            if (courses.length === 0) {
                Dialog.toast('暂无课程数据可导出', 'warning');
                return;
            }
            const exportData = { version: '1.0', exportTime: new Date().toISOString(), courses: [] };
            for (const course of courses) {
                const knowledgeGraph = await Store.getKnowledgeGraph(course.id);
                const debate = await Store.getDebate(course.id);
                const quiz = await Store.getQuiz(course.id);
                const material = await Store.getMaterial(course.id);
                const mentalModel = await Store.getMentalModel(course.id);
                exportData.courses.push({
                    course: { ...course },
                    knowledgeGraph: knowledgeGraph || null,
                    mentalModel: mentalModel || null,
                    debate: debate || null,
                    quiz: quiz || null,
                    material: material || null
                });
            }
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `三问学习_全部课程_${new Date().toLocaleDateString('zh-CN')}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            Dialog.toast(`成功导出 ${courses.length} 门课程`, 'success');
        } catch (err) {
            console.error('导出课程失败:', err);
            Dialog.toast('导出课程失败：' + (err.message || '未知错误'), 'error');
        }
    },

    /** 导入课程 */
    _importCourses() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (!data.version || !data.courses) {
                    Dialog.toast('文件格式错误：不是有效的课程备份文件', 'error');
                    return;
                }
                let importCount = 0;
                for (const item of data.courses) {
                    if (!item.course) continue;
                    const course = new Course(item.course);
                    await Store.saveCourse(course);
                    if (item.knowledgeGraph) { item.knowledgeGraph.courseId = course.id; await Store.saveKnowledgeGraph(item.knowledgeGraph); }
                    if (item.mentalModel) { item.mentalModel.courseId = course.id; await Store.saveMentalModel(item.mentalModel); }
                    if (item.debate) { item.debate.courseId = course.id; await Store.saveDebate(item.debate); }
                    if (item.quiz) { item.quiz.courseId = course.id; await Store.saveQuiz(item.quiz); }
                    if (item.material) { item.material.courseId = course.id; await Store.saveMaterial(item.material); }
                    importCount++;
                }
                Dialog.toast(`成功导入 ${importCount} 门课程`, 'success');
            } catch (err) {
                console.error('导入课程失败:', err);
                if (err instanceof SyntaxError) Dialog.toast('文件格式错误：不是有效的JSON文件', 'error');
                else Dialog.toast('导入失败：' + err.message, 'error');
            }
        };
        input.click();
    }
};
