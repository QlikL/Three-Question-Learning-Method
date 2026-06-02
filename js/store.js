/**
 * 数据管理模块 Store
 * 负责 IndexedDB 和 localStorage 的封装操作
 * IndexedDB 存储课程结构化数据，localStorage 存储用户偏好
 */
const Store = {
    /** 数据库名称 */
    DB_NAME: 'ThreeQuestionDB',
    /** 数据库版本 */
    DB_VERSION: 2,
    /** 数据库实例 */
    _db: null,

    /* ==================== IndexedDB 操作 ==================== */

    /**
     * 初始化对象仓库
     * @param {IDBDatabase} db
     */
    _initStores(db) {
        const storeDefs = [
            ['courses', 'id'],
            ['knowledgeGraphs', 'courseId'],
            ['debates', 'courseId'],
            ['quizzes', 'courseId'],
            ['materials', 'courseId'],
        ];
        for (const [name, keyPath] of storeDefs) {
            if (!db.objectStoreNames.contains(name)) {
                db.createObjectStore(name, { keyPath });
            }
        }
    },

    /**
     * 以指定版本打开数据库
     * @param {number} version
     * @returns {Promise<IDBDatabase>}
     */
    _openWithVersion(version) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, version);

            request.onupgradeneeded = (event) => {
                this._initStores(event.target.result);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    /**
     * 打开/初始化 IndexedDB 数据库
     * 自动处理版本不匹配：若本地版本低于浏览器已有版本，自动升级
     * @returns {Promise<IDBDatabase>}
     */
    async openDB() {
        if (this._db) return this._db;

        try {
            const db = await this._openWithVersion(this.DB_VERSION);
            this._db = db;
            return db;
        } catch (err) {
            if (err.name === 'VersionError') {
                console.warn('数据库版本不匹配，正在自动适配:', err.message);
                const latestDb = await this._openWithVersion(undefined);
                const actualVersion = latestDb.version;
                latestDb.close();
                this.DB_VERSION = actualVersion + 1;
                const db = await this._openWithVersion(this.DB_VERSION);
                this._db = db;
                return db;
            }
            console.error('IndexedDB 打开失败:', err);
            throw err;
        }
    },

    /**
     * 通用方法：向对象仓库写入数据
     * @param {string} storeName - 对象仓库名称
     * @param {Object} data - 要存储的数据
     * @returns {Promise<void>}
     */
    async _put(storeName, data) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.put(data);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * 通用方法：从对象仓库读取数据
     * @param {string} storeName - 对象仓库名称
     * @param {string} key - 主键值
     * @returns {Promise<Object|null>}
     */
    async _get(storeName, key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * 通用方法：获取对象仓库所有数据
     * @param {string} storeName
     * @returns {Promise<Array>}
     */
    async _getAll(storeName) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * 通用方法：删除对象仓库中的数据
     * @param {string} storeName
     * @param {string} key
     * @returns {Promise<void>}
     */
    async _delete(storeName, key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    },

    /* ==================== 课程操作 ==================== */

    /** 保存课程 */
    async saveCourse(course) {
        await this._put('courses', course.toJSON());
    },

    /** 获取所有课程 */
    async getAllCourses() {
        return await this._getAll('courses');
    },

    /** 获取单个课程 */
    async getCourse(id) {
        return await this._get('courses', id);
    },

    /** 删除课程 */
    async deleteCourse(id) {
        await this._delete('courses', id);
        // 同时删除关联数据
        await this._delete('knowledgeGraphs', id);
        await this._delete('knowledgeGraphs', 'mm_' + id);
        await this._delete('debates', id);
        await this._delete('quizzes', id);
        await this._delete('materials', id);
    },

    /** 更新课程状态 */
    async updateCourseStatus(id, status) {
        const course = await this.getCourse(id);
        if (course) {
            course.status = status;
            course.updatedAt = Date.now();
            await this._put('courses', course);
        }
    },

    /* ==================== 知识图谱操作 ==================== */

    /** 保存知识图谱 */
    async saveKnowledgeGraph(data) {
        await this._put('knowledgeGraphs', data);
    },

    /** 获取知识图谱 */
    async getKnowledgeGraph(courseId) {
        return await this._get('knowledgeGraphs', courseId);
    },

    /* ==================== 心智模型操作（独立key，避免与知识图谱冲突） ==================== */

    /** 保存心智模型 */
    async saveMentalModel(data) {
        // 使用 mm_ 前缀区分，避免与知识图谱的 courseId key 冲突
        const key = 'mm_' + (data.courseId || '');
        await this._put('knowledgeGraphs', { courseId: key, mentalModels: data.mentalModels || [] });
    },

    /** 获取心智模型 */
    async getMentalModel(courseId) {
        return await this._get('knowledgeGraphs', 'mm_' + courseId);
    },

    /* ==================== 争议点操作 ==================== */

    /** 保存争议点 */
    async saveDebate(data) {
        await this._put('debates', data);
    },

    /** 获取争议点 */
    async getDebate(courseId) {
        return await this._get('debates', courseId);
    },

    /* ==================== 测评操作 ==================== */

    /** 保存测评 */
    async saveQuiz(data) {
        await this._put('quizzes', data);
    },

    /** 获取测评 */
    async getQuiz(courseId) {
        return await this._get('quizzes', courseId);
    },

    /* ==================== 资料操作 ==================== */

    /** 保存资料 */
    async saveMaterial(data) {
        await this._put('materials', data);
    },

    /** 获取资料 */
    async getMaterial(courseId) {
        return await this._get('materials', courseId);
    },

    /* ==================== localStorage 操作 ==================== */

    /** 获取用户偏好设置 */
    getPreference(key, defaultValue = null) {
        try {
            const value = localStorage.getItem('pref_' + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    /** 保存用户偏好设置 */
    setPreference(key, value) {
        localStorage.setItem('pref_' + key, JSON.stringify(value));
    },

    /* ==================== 评估数据操作 ==================== */

    /** 获取课程的AI咨询数据 */
    getAiConsultationData(courseId) {
        try {
            const value = localStorage.getItem('ai_consultation_data_' + courseId);
            if (value) {
                const data = JSON.parse(value);
                if (Array.isArray(data)) return { topics: data, count: data.length };
            }
            const oldCount = localStorage.getItem('ai_consultation_count_' + courseId);
            if (oldCount) {
                return { topics: [], count: parseInt(oldCount, 10) };
            }
            return { topics: [], count: 0 };
        } catch {
            return { topics: [], count: 0 };
        }
    },

    /** 获取课程的AI咨询次数（兼容旧接口） */
    getAiConsultationCount(courseId) {
        return this.getAiConsultationData(courseId).count;
    },

    /** 记录AI咨询，同一知识点只计一次 */
    recordAiConsultation(courseId, topic) {
        const data = this.getAiConsultationData(courseId);
        const normalized = (topic || '').trim().toLowerCase().slice(0, 50);
        if (!data.topics.includes(normalized)) {
            data.topics.push(normalized);
            localStorage.setItem('ai_consultation_data_' + courseId, JSON.stringify(data.topics));
        }
        return data.topics.length;
    },

    /** 获取课程的资料活动数据 */
    getMaterialActivity(courseId) {
        try {
            const value = localStorage.getItem('material_activity_' + courseId);
            if (!value) return { readCount: 0, readTypes: [], readItems: [], uploadCount: 0, uploadTypes: [] };
            const data = JSON.parse(value);
            if (!data.readItems) data.readItems = [];
            return data;
        } catch {
            return { readCount: 0, readTypes: [], readItems: [], uploadCount: 0, uploadTypes: [] };
        }
    },

    /** 记录资料阅读（同一资料只计一次） */
    recordMaterialRead(courseId, materialType, materialId) {
        const activity = this.getMaterialActivity(courseId);
        if (materialId && activity.readItems.includes(materialId)) {
            return activity;
        }
        activity.readCount += 1;
        if (materialType && !activity.readTypes.includes(materialType)) {
            activity.readTypes.push(materialType);
        }
        if (materialId) {
            activity.readItems.push(materialId);
        }
        localStorage.setItem('material_activity_' + courseId, JSON.stringify(activity));
        return activity;
    },

    /** 记录资料上传 */
    recordMaterialUpload(courseId, materialType) {
        const activity = this.getMaterialActivity(courseId);
        activity.uploadCount += 1;
        if (!activity.uploadTypes.includes(materialType)) {
            activity.uploadTypes.push(materialType);
        }
        localStorage.setItem('material_activity_' + courseId, JSON.stringify(activity));
        return activity;
    },

    /** 获取课程测验历史 */
    getQuizHistory(courseId) {
        try {
            const value = localStorage.getItem('quiz_history_' + courseId);
            return value ? JSON.parse(value) : [];
        } catch {
            return [];
        }
    },

    /** 记录一次测验结果 */
    recordQuizAttempt(courseId, accuracy, correctCount, totalQuestions) {
        const history = this.getQuizHistory(courseId);
        history.push({
            accuracy,
            correctCount,
            totalQuestions,
            timestamp: Date.now()
        });
        localStorage.setItem('quiz_history_' + courseId, JSON.stringify(history));
        return history;
    },

    /** 获取课程的评估数据 */
    async getAssessmentData(courseId) {
        const course = await this.getCourse(courseId);
        const quiz = await this.getQuiz(courseId);
        const material = await this.getMaterial(courseId);
        const aiData = this.getAiConsultationData(courseId);
        const materialActivity = this.getMaterialActivity(courseId);
        const quizHistory = this.getQuizHistory(courseId);

        return {
            courseId,
            courseTitle: course?.title || '未知课程',
            progress: course?.progress || { phase1: false, phase2: false, phase3: false },
            quizData: quiz || null,
            quizHistory,
            materialData: material || null,
            aiConsultationCount: aiData.count,
            materialActivity
        };
    },

    /* ==================== 设置数据操作 ==================== */

    /** 获取设置数据 */
    getSettings() {
        try {
            const value = localStorage.getItem('app_settings');
            const defaults = {
                theme: 'light',
                quizDifficulty: 'medium',
                aiProvider: '',
                aiModel: '',
                aiApiKey: '',
                aiEndpoint: '',
                savedModels: []
            };
            return value ? { ...defaults, ...JSON.parse(value) } : defaults;
        } catch {
            return {
                theme: 'light',
                quizDifficulty: 'medium',
                aiProvider: '',
                aiModel: '',
                aiApiKey: '',
                aiEndpoint: '',
                savedModels: []
            };
        }
    },

    /** 保存设置数据 */
    saveSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem('app_settings', JSON.stringify(updated));
        return updated;
    },

    /** 获取主题设置 */
    getTheme() {
        return this.getSettings().theme || 'light';
    },

    /** 保存主题设置 */
    saveTheme(theme) {
        return this.saveSettings({ theme });
    },

    /** 获取测验难度设置 */
    getQuizDifficulty() {
        return this.getSettings().quizDifficulty || 'medium';
    },

    /** 保存测验难度设置 */
    saveQuizDifficulty(difficulty) {
        return this.saveSettings({ quizDifficulty: difficulty });
    },

    /** 获取 AI 模型设置 */
    getAiModel() {
        return this.getSettings().aiModel || 'qwen3.6-plus';
    },

    /** 保存 AI 模型设置 */
    saveAiModel(model) {
        return this.saveSettings({ aiModel: model });
    },

    /** 清除所有学习数据 */
    async clearAllLearningData() {
        const db = await this.openDB();
        const tx = db.transaction(['courses', 'knowledgeGraphs', 'debates', 'quizzes', 'materials'], 'readwrite');
        
        tx.objectStore('courses').clear();
        tx.objectStore('knowledgeGraphs').clear();
        tx.objectStore('debates').clear();
        tx.objectStore('quizzes').clear();
        tx.objectStore('materials').clear();

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }
};
