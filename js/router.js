/**
 * Hash路由管理器 Router
 * 监听 hashchange 事件，解析路径与参数，渲染对应页面
 */
const Router = {
    /** 路由表：path -> 处理函数 */
    _routes: {},

    /** 默认路由 */
    _defaultRoute: '/home',

    /** 当前页面容器 */
    _container: null,

    /** 当前路径参数 */
    currentParams: {},

    /**
     * 初始化路由
     * @param {HTMLElement} container - 页面渲染容器
     */
    init(container) {
        this._container = container;

        // 监听 hash 变化
        window.addEventListener('hashchange', () => this._handleRoute());

        // 页面加载时处理初始 hash
        if (location.hash) {
            this._handleRoute();
        } else {
            // 无 hash 时跳转到默认路由
            location.hash = '#' + this._defaultRoute;
        }
    },

    /**
     * 注册路由
     * @param {string} path - 路由路径，如 '/home'
     * @param {Function} handler - 处理函数，接收 (container, params)
     */
    register(path, handler) {
        this._routes[path] = handler;
    },

    /**
     * 解析当前 hash 为路由路径和参数
     * @returns {{ path: string, params: Object }}
     */
    _parseHash() {
        let hash = location.hash.replace(/^#/, '') || this._defaultRoute;
        const params = {};

        // 提取查询参数
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
            const queryString = hash.substring(queryIndex + 1);
            hash = hash.substring(0, queryIndex);
            queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }

        const parts = hash.split('/').filter(Boolean);

        // 遍历路由表匹配动态路径
        for (const routePath in this._routes) {
            const routeParts = routePath.split('/').filter(Boolean);
            if (routeParts.length !== parts.length) continue;

            let match = true;
            const extractedParams = { ...params };

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    extractedParams[routeParts[i].slice(1)] = parts[i];
                } else if (routeParts[i] !== parts[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { path: routePath, params: extractedParams };
            }
        }

        return { path: this._defaultRoute, params };
    },

    /** 处理当前路由 */
    _handleRoute() {
        const { path, params } = this._parseHash();
        this.currentParams = params;

        const handler = this._routes[path];

        if (handler) {
            // 更新导航高亮
            this._updateNavActive(path);
            // 渲染页面
            handler(this._container, params);
            
            // 路由切换后重新初始化AI聊天组件
            if (typeof AiChatWidget !== 'undefined') {
                // 延迟执行，确保DOM已渲染
                setTimeout(() => {
                    AiChatWidget.init();
                }, 100);
            }
        } else {
            console.warn('未找到路由:', path);
            location.hash = '#' + this._defaultRoute;
        }
    },

    /** 更新导航栏高亮状态 */
    _updateNavActive(path) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const route = item.dataset.route;
            // 精确匹配路由，不使用 startsWith
            item.classList.toggle('active', route === path);
        });
    },

    /**
     * 导航到指定路径
     * @param {string} path - 如 '/learning/course_xxx'
     */
    navigate(path) {
        location.hash = '#' + path;
    }
};
