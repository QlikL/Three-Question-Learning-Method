/**
 * 知识库页面 KnowledgeRepositoryPage
 * 独立展示课程的AI生成资料和用户上传资料，支持文件上传功能
 */
const KnowledgeRepositoryPage = {
    /** 当前课程ID */
    _courseId: null,
    /** 当前课程数据 */
    _course: null,
    /** 资料数据 */
    _materialData: null,

    /**
     * 渲染知识库页面
     * @param {HTMLElement} container - 页面容器
     * @param {string} courseId - 课程ID
     */
    async render(container, courseId) {
        this._courseId = courseId;

        // 移除首页的全宽样式
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

        // 渲染页面布局
        this._renderLayout(container);

        // 加载资料数据
        await this._loadMaterials();

        // 绑定上传事件
        this._bindUploadEvents();

        // 检测是否需要自动打开上传
        if (Router.currentParams?.upload === 'true') {
            setTimeout(() => {
                document.getElementById('file-input')?.click();
            }, 500);
        }
    },

    /** 渲染页面布局 */
    _renderLayout(container) {
        container.innerHTML = `
            <div class="page-container knowledge-repository-page">
                <!-- 顶部导航栏 -->
                <div class="repo-header">
                    <div class="repo-breadcrumb">
                        <a href="#/home" class="breadcrumb-link">🏠 首页</a>
                        <span class="breadcrumb-separator">/</span>
                        <a href="#/learning/${this._courseId}" class="breadcrumb-link">📖 学习空间</a>
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-current">📚 知识库</span>
                    </div>
                    <h2 class="repo-title">${this._course.title || '未命名课程'} - 知识库</h2>
                </div>

                <!-- 资料列表区域 -->
                <div class="repo-content">
                    <div class="loading-overlay" id="materials-loading">
                        <span class="loading-spinner loading-spinner-lg"></span>
                        <span id="loading-text">正在加载资料...</span>
                    </div>
                    <div id="materials-container" style="display:none;"></div>
                    <div class="empty-state" id="materials-empty" style="display:none;">
                        <div class="empty-state-icon">📭</div>
                        <p>暂无学习资料</p>
                        <p style="font-size:14px;color:var(--color-text-muted);margin-top:8px;">
                            AI会自动生成补充资料，您也可以上传本地文件
                        </p>
                    </div>
                </div>

                <!-- 上传区域 -->
                <div class="upload-section">
                    <div class="upload-area" id="upload-area">
                        <input type="file" id="file-input" accept=".pdf,.doc,.docx,.txt,.md" hidden>
                        <div class="upload-icon">📤</div>
                        <div class="upload-text">拖拽文件到此处，或点击选择文件</div>
                        <div class="upload-hint">支持 pdf、doc、docx、txt、md 格式，单个文件不超过 20MB</div>
                    </div>
                    <div class="upload-progress" id="upload-progress" style="display:none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill" style="width:0%"></div>
                        </div>
                        <span class="progress-text" id="progress-text">0%</span>
                    </div>
                </div>
            </div>
        `;
    },

    /** 加载资料数据 */
    async _loadMaterials() {
        const loadingTexts = ['正在加载资料...', '内容较多，请耐心等待...', 'AI正在生成总结文档...'];
        let textIndex = 0;
        const loadingTextEl = document.getElementById('loading-text');
        const textTimer = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length;
            if (loadingTextEl) loadingTextEl.textContent = loadingTexts[textIndex];
        }, 3000);

        try {
            let materialData = await Store.getMaterial(this._courseId);
            
            if (!materialData) {
                // 使用AI生成资料推荐
                const topic = this._course?.title || this._course?.query || '';
                materialData = await AiMock.mockGenerateMaterials(this._courseId, topic);
                // 添加courseId字段用于IndexedDB存储
                materialData.courseId = this._courseId;
                materialData.courseTitle = this._course.title || '课程';
                await Store.saveMaterial(materialData);
            }

            if (!materialData.courseTitle) {
                materialData.courseTitle = this._course.title || '课程';
            }

            this._materialData = materialData;

            // 隐藏加载动画，显示资料列表
            clearInterval(textTimer);
            document.getElementById('materials-loading').style.display = 'none';
            const container = document.getElementById('materials-container');
            container.style.display = 'block';

            MaterialList.render(container, materialData, { courseId: this._courseId });
        } catch (err) {
            console.error('加载资料失败:', err);
            // 降级到模拟数据
            clearInterval(textTimer);
            document.getElementById('materials-loading').style.display = 'none';
            const topic = this._course?.title || this._course?.query || '';
            const mockData = DataMock.getSampleMaterials(this._courseId, topic);
            this._materialData = mockData;
            
            const container = document.getElementById('materials-container');
            container.style.display = 'block';
            MaterialList.render(container, mockData, { courseId: this._courseId });
        }
    },

    /** 绑定上传事件 */
    _bindUploadEvents() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        if (!uploadArea || !fileInput) return;

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择事件
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this._handleFileUpload(file);
            }
            // 清空input，允许重复选择同一文件
            fileInput.value = '';
        });

        // 拖拽事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this._handleFileUpload(files[0]);
            }
        });
    },

    /** 处理文件上传 */
    async _handleFileUpload(file) {
        // 验证文件格式
        const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/markdown'];
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md'];
        
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension && !allowedTypes.includes(file.type)) {
            Dialog.toast('仅支持pdf、doc、docx、txt、md格式的文件', 'warning');
            return;
        }

        // 验证文件大小（20MB）
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            Dialog.toast('文件大小不能超过20MB', 'warning');
            return;
        }

        // 显示上传进度
        const progressDiv = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressDiv.style.display = 'flex';
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        try {
            // 读取文件内容为Base64
            const base64 = await this._readFileAsBase64(file, (progress) => {
                progressFill.style.width = progress + '%';
                progressText.textContent = progress + '%';
            });

            // 创建资料对象
            const materialItem = {
                id: 'upload_' + Date.now(),
                title: file.name,
                type: 'upload',
                format: this._getFileFormat(file.name),
                source: '用户上传',
                size: file.size,
                uploadTime: Date.now(),
                content: base64,
                tags: ['上传']
            };

            // 添加到资料列表
            if (!this._materialData.items) {
                this._materialData.items = [];
            }
            this._materialData.items.push(materialItem);

            // 保存到IndexedDB
            this._materialData.courseId = this._courseId;
            await Store.saveMaterial(this._materialData);

            // 记录资料上传活动
            Store.recordMaterialUpload(this._courseId, this._getFileFormat(file.name));

            // 重新渲染资料列表
            const container = document.getElementById('materials-container');
            MaterialList.render(container, this._materialData, { courseId: this._courseId });

            // 隐藏进度条
            setTimeout(() => {
                progressDiv.style.display = 'none';
            }, 1000);

            // 显示成功提示
            Dialog.toast('文件上传成功！', 'success');
        } catch (err) {
            console.error('文件上传失败:', err);
            progressDiv.style.display = 'none';
            Dialog.toast('文件上传失败：' + (err.message || '未知错误'), 'error');
        }
    },

    /** 读取文件为Base64 */
    _readFileAsBase64(file, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    onProgress(progress);
                }
            };

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (e) => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsDataURL(file);
        });
    },

    /** 获取文件格式 */
    _getFileFormat(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const formatMap = {
            'pdf': 'pdf',
            'doc': 'word',
            'docx': 'word',
            'txt': 'text',
            'md': 'markdown'
        };
        return formatMap[ext] || 'unknown';
    }
};
