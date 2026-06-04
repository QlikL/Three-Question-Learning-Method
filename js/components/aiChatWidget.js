/**
 * AI聊天悬浮组件 AiChatWidget
 * 在除首页外的所有页面右下角显示AI聊天入口
 */
const AiChatWidget = {
    // 组件状态
    _isOpen: false,
    _isMinimized: false,
    _messages: [],
    _isLoading: false,
    _elements: {},
    _initialized: false,  // 标记是否已初始化

    /**
     * 初始化组件
     */
    init() {
        // 检查是否在首页
        if (this._isHomePage()) {
            // 如果在首页，隐藏已存在的按钮和窗口
            this._hideComponents();
            return;
        }

        // 如果已初始化，只需显示组件
        if (this._initialized) {
            this._showComponents();
            return;
        }

        // 首次初始化
        this._initialized = true;

        // 加载历史消息
        this._loadMessages();

        // 创建UI
        this._createFloatingButton();
        this._createChatWindow();

        // 恢复上次窗口状态
        this._restoreWindowState();
    },

    /**
     * 检查是否在首页
     */
    _isHomePage() {
        const hash = window.location.hash;
        // 只在纯首页（#/home）不显示，#/home/courses 需要显示
        return hash === '#/home' ||
               hash === '' || 
               hash === '#/';
    },

    /**
     * 隐藏组件（在首页时调用）
     */
    _hideComponents() {
        if (this._elements.floatButton) {
            this._elements.floatButton.style.display = 'none';
        }
        if (this._elements.chatWindow) {
            this._elements.chatWindow.style.display = 'none';
        }
    },

    /**
     * 显示组件（在非首页时调用）
     */
    _showComponents() {
        if (this._elements.floatButton && !this._isOpen) {
            this._elements.floatButton.style.display = 'flex';
        }
        if (this._elements.chatWindow && this._isOpen) {
            this._elements.chatWindow.style.display = 'flex';
            this._elements.chatWindow.classList.remove('closed');
        }
    },

    /**
     * 创建悬浮按钮
     */
    _createFloatingButton() {
        const button = document.createElement('button');
        button.className = 'ai-chat-float-btn';
        button.innerHTML = '<span class="iconfont">&#xe692;</span>';
        button.title = 'AI学习助手';
        
        button.addEventListener('click', () => {
            this.toggleChat();
        });

        document.body.appendChild(button);
        this._elements.floatButton = button;
    },

    /**
     * 创建聊天窗口
     */
    _createChatWindow() {
        const window = document.createElement('div');
        window.className = 'ai-chat-window';
        window.style.display = 'none';

        window.innerHTML = `
            <div class="ai-chat-header">
                <span class="ai-chat-title"><span class="iconfont ai-chat-icon">&#xe692;</span> AI学习助手</span>
                <div class="ai-chat-header-actions">
                    <button class="ai-chat-new-chat-btn" id="ai-chat-new-chat-btn" title="新开对话">＋</button>
                    <button class="ai-chat-close-btn" title="关闭">×</button>
                </div>
            </div>
            <div class="ai-chat-messages" id="ai-chat-messages">
                <div class="ai-chat-welcome">
                    <div class="ai-chat-welcome-icon"></div>
                    <p>你好！我是AI学习助手</p>
                    <p class="ai-chat-welcome-hint">有什么问题可以帮助你？</p>
                </div>
            </div>
            <div class="ai-chat-input-area">
                <div class="ai-chat-input-wrapper">
                    <input 
                        type="text" 
                        class="ai-chat-input" 
                        id="ai-chat-input"
                        placeholder="输入你的问题..."
                        maxlength="1000"
                    />
                    <button class="ai-chat-send-btn" id="ai-chat-send-btn" title="发送">
                        ➤
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(window);
        this._elements.chatWindow = window;

        // 绑定事件
        this._bindEvents();

        // 渲染历史消息
        this._renderMessages();
    },

    /**
     * 绑定事件
     */
    _bindEvents() {
        // 关闭按钮（点击关闭窗口）
        const closeBtn = this._elements.chatWindow.querySelector('.ai-chat-close-btn');
        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // 发送按钮
        const sendBtn = document.getElementById('ai-chat-send-btn');
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // 输入框Enter键
        const input = document.getElementById('ai-chat-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 开启新对话按钮（在头部）
        const newChatBtn = document.getElementById('ai-chat-new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                this.startNewChat();
            });
        }
    },

    /**
     * 切换聊天窗口显示/隐藏
     */
    toggleChat() {
        if (this._isOpen) {
            this.minimize();
        } else {
            this.open();
        }
    },

    /**
     * 打开聊天窗口（从按钮位置平滑展开）
     */
    open() {
        this._isOpen = true;
        this._isMinimized = false;
        
        const window = this._elements.chatWindow;
        const button = this._elements.floatButton;
        
        // 先显示窗口，但处于关闭态（缩在右下角）
        window.style.display = 'flex';
        window.classList.add('closed');
        button.style.display = 'none';
        
        // 强制回流后移除 closed 类，触发展开动画
        void window.offsetHeight;
        window.classList.remove('closed');
        
        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('ai-chat-input');
            if (input) input.focus();
        }, 350);

        // 保存窗口状态
        this._saveWindowState();
    },

    /**
     * 关闭聊天窗口（缩小回按钮位置）
     */
    minimize() {
        this._isOpen = false;
        this._isMinimized = true;
        
        const window = this._elements.chatWindow;
        const button = this._elements.floatButton;
        
        // 先显示按钮
        button.style.display = 'flex';
        
        // 添加 closed 类触发收缩动画
        window.classList.add('closed');
        
        // 动画结束后隐藏窗口 DOM
        const onTransitionEnd = () => {
            window.style.display = 'none';
            window.removeEventListener('transitionend', onTransitionEnd);
        };
        window.addEventListener('transitionend', onTransitionEnd);

        // 保存窗口状态
        this._saveWindowState();
    },

    /**
     * 关闭聊天窗口（仅隐藏，不清除会话）
     */
    close() {
        // 只隐藏窗口，不清空消息
        this.minimize();
    },

    /**
     * 发送消息
     */
    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        // 空消息拦截
        if (!message) {
            input.focus();
            return;
        }

        // 防抖：请求进行中禁用
        if (this._isLoading) {
            return;
        }

        // 添加用户消息
        this._addMessage('user', message);
        input.value = '';

        // 调用AI服务
        await this._callAI();
    },

    /**
     * 调用AI服务
     */
    async _callAI() {
        this._isLoading = true;
        this._updateInputState();

        // 显示加载状态
        this._showLoading();

        try {
            // 准备对话历史（最多20条）
            const contextMessages = this._messages.slice(-20);

            // 调用AI服务
            const response = await AiService.callAI(contextMessages, {
                temperature: 0.7,
                max_tokens: 2000
            });

            // 隐藏加载状态
            this._hideLoading();

            // 添加AI回复
            this._addMessage('assistant', response);

        } catch (error) {
            console.error('AI调用失败:', error);
            this._hideLoading();
            this._showError(error.message);
        } finally {
            this._isLoading = false;
            this._updateInputState();
        }
    },

    /**
     * 添加消息
     */
    _addMessage(role, content) {
        const message = {
            role,
            content,
            timestamp: Date.now()
        };

        this._messages.push(message);

        // 限制消息数量（最多50条）
        if (this._messages.length > 50) {
            this._messages = this._messages.slice(-50);
        }

        // 保存到localStorage
        this._saveMessages();

        // 渲染消息
        this._renderMessages();
    },

    /**
     * 渲染消息列表
     */
    _renderMessages() {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        if (this._messages.length === 0) {
            // 显示欢迎界面
            container.innerHTML = `
                <div class="ai-chat-welcome">
                    <div class="ai-chat-welcome-icon iconfont ai-chat-icon">&#xe692;</div>
                    <p>你好！我是AI学习助手</p>
                    <p class="ai-chat-welcome-hint">有什么问题可以帮助你？</p>
                </div>
            `;
            return;
        }

        // 渲染消息列表
        container.innerHTML = this._messages.map(msg => {
            const isUser = msg.role === 'user';
            const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="ai-chat-message ${isUser ? 'user' : 'assistant'}">
                    <div class="ai-chat-message-content">
                        <div class="ai-chat-message-text">${isUser ? this._escapeHtml(msg.content) : this._markdownToHtml(msg.content)}</div>
                        <div class="ai-chat-message-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 自动滚动到底部
        container.scrollTop = container.scrollHeight;
    },

    /**
     * 显示加载状态
     */
    _showLoading() {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-chat-message assistant loading';
        loadingDiv.id = 'ai-chat-loading';
        loadingDiv.innerHTML = `
            <div class="ai-chat-message-content">
                <div class="ai-chat-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="ai-chat-loading-text">AI正在思考...</div>
            </div>
        `;

        container.appendChild(loadingDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * 隐藏加载状态
     */
    _hideLoading() {
        const loading = document.getElementById('ai-chat-loading');
        if (loading) {
            loading.remove();
        }
    },

    /**
     * 显示错误
     */
    _showError(message) {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'ai-chat-message assistant error';
        errorDiv.innerHTML = `
            <div class="ai-chat-message-content">
                <div class="ai-chat-error-text">❌ ${this._escapeHtml(message)}</div>
                <button class="ai-chat-retry-btn" onclick="AiChatWidget.retryLastMessage()">
                     重试
                </button>
            </div>
        `;

        container.appendChild(errorDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * 重试上一条消息
     */
    retryLastMessage() {
        // 移除错误消息
        const errorDiv = document.querySelector('.ai-chat-message.error');
        if (errorDiv) {
            errorDiv.remove();
        }

        // 重新调用AI
        this._callAI();
    },

    /**
     * 开启新对话（清除当前对话）
     */
    async startNewChat() {
        if (this._messages.length === 0) {
            return;
        }

        const confirmed = await Dialog.confirm('确定要开启新对话吗？当前对话记录将被清空。');
        if (!confirmed) {
            return;
        }

        this._messages = [];
        this._saveMessages();
        this._renderMessages();
    },

    /**
     * 更新输入框状态
     */
    _updateInputState() {
        const input = document.getElementById('ai-chat-input');
        const sendBtn = document.getElementById('ai-chat-send-btn');

        if (!input || !sendBtn) return;

        input.disabled = this._isLoading;
        sendBtn.disabled = this._isLoading;

        if (this._isLoading) {
            sendBtn.classList.add('disabled');
        } else {
            sendBtn.classList.remove('disabled');
        }
    },

    /**
     * 保存消息到localStorage
     */
    _saveMessages() {
        try {
            const data = {
                messages: this._messages,
                lastUpdated: Date.now()
            };
            localStorage.setItem('ai_chat_messages', JSON.stringify(data));
        } catch (error) {
            console.error('保存聊天记录失败:', error);
        }
    },

    /**
     * 从localStorage加载消息
     */
    _loadMessages() {
        try {
            const data = localStorage.getItem('ai_chat_messages');
            if (data) {
                const parsed = JSON.parse(data);
                this._messages = parsed.messages || [];
            }
        } catch (error) {
            console.error('加载聊天记录失败:', error);
            this._messages = [];
        }
    },

    /**
     * 保存窗口状态
     */
    _saveWindowState() {
        try {
            const state = {
                isOpen: this._isOpen,
                isMinimized: this._isMinimized
            };
            localStorage.setItem('ai_chat_window_state', JSON.stringify(state));
        } catch (error) {
            console.error('保存窗口状态失败:', error);
        }
    },

    /**
     * 恢复窗口状态
     */
    _restoreWindowState() {
        try {
            const data = localStorage.getItem('ai_chat_window_state');
            if (data) {
                const state = JSON.parse(data);
                if (state.isOpen && !state.isMinimized) {
                    this.open();
                }
            }
        } catch (error) {
            console.error('恢复窗口状态失败:', error);
        }
    },

    /**
     * HTML转义
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Markdown转HTML - AI消息渲染
     */
    _markdownToHtml(md) {
        if (!md) return '';
        
        const math = MathRenderer._extractMath(md);
        let html = this._escapeHtml(math.text);
        
        // 处理代码块
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code>$2</code></pre>');
        
        // 处理行内代码
        html = html.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>');
        
        // 处理标题
        html = html.replace(/^#### (.+)$/gm, '<h4 style="margin: 16px 0 8px; font-size: 1em;">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin: 16px 0 8px; font-size: 1.1em;">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 10px; font-size: 1.2em; border-bottom: 1px solid #eee; padding-bottom: 6px;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="margin: 20px 0 10px; font-size: 1.3em;">$1</h1>');
        
        // 处理粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // 处理链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #7C3AED; text-decoration: underline;">$1</a>');
        
        // 处理无序列表
        html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li style="margin: 4px 0; margin-left: 20px;">$1</li>');
        
        // 处理有序列表
        html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 4px 0; margin-left: 20px; list-style-type: decimal;">$1</li>');
        
        // 将连续的li标签包裹在ul中
        html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>');
        html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');
        
        // 处理引用块
        html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote style="border-left: 3px solid #7C3AED; padding-left: 12px; color: #666; margin: 10px 0;">$1</blockquote>');
        
        // 处理分隔线
        html = html.replace(/^---+$/gm, '<hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">');
        
        // 处理段落（双换行）
        html = html.replace(/\n\n/g, '</p><p style="margin: 8px 0;">');
        
        // 处理单换行
        html = html.replace(/\n/g, '<br>');
        
        // 包裹在段落中
        if (!html.startsWith('<')) {
            html = '<p style="margin: 8px 0;">' + html + '</p>';
        }
        
        return MathRenderer._restoreMath(html, math.placeholders);
    },

    /**
     * 打开聊天窗口并自动发送消息
     * @param {string} message - 要自动发送的问题
     * @param {string} [courseId] - 课程ID，用于记录AI咨询次数
     */
    openWithMessage(message, courseId) {
        if (!this._initialized) {
            this.init();
        }

        if (courseId && typeof Store !== 'undefined') {
            Store.recordAiConsultation(courseId, message);
        }

        if (!this._isOpen) {
            this.open();
            setTimeout(() => {
                this._sendDirectMessage(message);
            }, 400);
        } else {
            this._sendDirectMessage(message);
        }
    },

    /**
     * 直接发送消息（不从输入框读取）
     * @param {string} message
     */
    async _sendDirectMessage(message) {
        if (!message || this._isLoading) return;

        this._addMessage('user', message);
        await this._callAI();
    }
};
