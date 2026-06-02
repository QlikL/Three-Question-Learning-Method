/**
 * 应用入口 App
 * 初始化路由、加载数据、启动应用
 */
(async function () {
    'use strict';

    const contentEl = document.getElementById('app-content');

    // 初始化 IndexedDB
    try {
        await Store.openDB();
        console.log('数据库初始化成功');
    } catch (err) {
        console.error('数据库初始化失败:', err);
    }

    // ========== 恢复主题设置 ==========
    const savedTheme = Store.getTheme();
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // ========== 恢复AI配置 ==========
    const settings = Store.getSettings();
    if (settings.aiApiKey) {
        AiService.API_KEY = settings.aiApiKey;
    }
    if (settings.aiModel) {
        AiService.MODEL_NAME = settings.aiModel;
    }
    if (settings.aiProvider) {
        AiService.PROVIDER = settings.aiProvider;
        if (settings.aiProvider === 'custom' && settings.aiEndpoint) {
            AiService.API_ENDPOINT = settings.aiEndpoint;
        } else {
            AiService.API_ENDPOINT = '';
        }
    }

    // ========== 注册路由 ==========

    // 首页
    Router.register('/home', (container, params) => {
        // 为首页添加特殊类名，允许全宽
        const appContent = container.closest('.app-content');
        if (appContent) {
            appContent.classList.add('home-content');
        }
        HomePage.render(container, { showCourses: false });

        if (!AiService.API_KEY) {
            setTimeout(() => Dialog.toast('首次使用先配置AI模型哦', 'info'), 500);
        }
    });

    // 我的课程页面
    Router.register('/home/courses', (container, params) => {
        // 移除首页特殊类名
        const appContent = container.closest('.app-content');
        if (appContent) {
            appContent.classList.remove('home-content');
        }
        HomePage.render(container, { showCourses: true });
    });

    // 学习空间 /learning/:courseId
    Router.register('/learning/:courseId', (container, params) => {
        LearningPage.render(container, params.courseId);
    });

    // 知识库 /knowledge/:courseId
    Router.register('/knowledge/:courseId', (container, params) => {
        KnowledgeRepositoryPage.render(container, params.courseId);
    });

    // 测评中心 /assessment/:courseId
    Router.register('/assessment/:courseId', (container, params) => {
        AssessmentPage.render(container, params.courseId);
    });

    // 个人中心
    Router.register('/profile', (container, params) => {
        ProfilePage.render(container);
    });

    // 设置页面
    Router.register('/settings', (container, params) => {
        SettingsPage.render(container);
    });

    // 启动路由
    Router.init(contentEl);

    // 初始化AI聊天组件（除首页外）
    if (typeof AiChatWidget !== 'undefined') {
        AiChatWidget.init();
    }
})();
