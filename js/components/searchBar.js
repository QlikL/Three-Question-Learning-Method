/**
 * 搜索框组件 SearchBar
 * 输入问题、点击搜索/回车触发课程创建
 * 状态: idle | loading | done
 */
const SearchBar = {
    /**
     * 渲染搜索框
     * @param {HTMLElement} container - 容器元素
     * @param {Function} onCourseCreate - 课程创建回调
     */
    render(container, onCourseCreate) {
        container.innerHTML = `
            <div class="search-bar" id="search-bar">
                <div class="search-icon">🔍</div>
                <input
                    type="text"
                    class="search-input"
                    id="search-input"
                    placeholder="输入你想学习的问题"
                    autofocus
                />
                <button class="search-btn btn btn-primary" id="search-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="search-loading" id="search-loading" style="display:none;">
                    <span class="loading-spinner"></span>
                    <span class="search-loading-text">正在为你生成专属课程...</span>
                </div>
            </div>
        `;

        this._bindEvents(onCourseCreate);
    },

    /** 绑定事件 */
    _bindEvents(onCourseCreate) {
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');

        const triggerSearch = () => {
            const query = input.value.trim();
            if (query) {
                this._startLoading();
                onCourseCreate(query);
            }
        };

        btn.addEventListener('click', triggerSearch);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    },

    /** 开始加载状态 */
    _startLoading() {
        const bar = document.getElementById('search-bar');
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');
        const loading = document.getElementById('search-loading');

        bar.classList.add('loading');
        input.disabled = true;
        btn.style.display = 'none';
        loading.style.display = 'flex';
    },

    /** 结束加载状态 */
    stopLoading() {
        const bar = document.getElementById('search-bar');
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');
        const loading = document.getElementById('search-loading');

        if (!bar) return;
        bar.classList.remove('loading');
        input.disabled = false;
        input.value = '';
        btn.style.display = '';
        loading.style.display = 'none';
        input.focus();
    },

    /** 显示错误状态 */
    showError(message) {
        const loadingText = document.querySelector('.search-loading-text');
        if (loadingText) {
            loadingText.textContent = message || '创建失败，请重试';
            loadingText.style.color = 'var(--color-danger)';
        }
        setTimeout(() => this.stopLoading(), 1500);
    }
};
