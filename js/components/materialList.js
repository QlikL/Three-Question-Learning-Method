/**
 * 资料列表组件 MaterialList
 * 展示复合知识库列表，按类型分类
 */
const MaterialList = {
    /** 当前课程ID */
    _courseId: null,

    /**
     * 渲染资料列表
     * @param {HTMLElement} container
     * @param {Object} materialData - 资料数据
     * @param {Object} options - { courseId: string }
     */
    render(container, materialData, options = {}) {
        this._currentData = materialData;
        this._courseId = options.courseId || materialData?.courseId || null;
        
        if (!materialData || !materialData.items || materialData.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <p>暂无学习资料</p>
                </div>
            `;
            return;
        }

        const aiSummaryItems = materialData.items.filter(m => m.type === 'ai-summary');
        // 兼容历史数据：根据 category 字段分类，无 category 时根据 format 推断
        const aiTextItems = materialData.items.filter(m => m.type === 'ai' && this._resolveCategory(m) === 'text');
        const aiVideoItems = materialData.items.filter(m => m.type === 'ai' && this._resolveCategory(m) === 'video');
        const uploadItems = materialData.items.filter(m => m.type === 'upload');

        container.innerHTML = `
            <div class="material-container">
                ${aiSummaryItems.length > 0 ? this._renderSection('📘 AI 总结文档', aiSummaryItems, 'ai-summary') : ''}
                ${aiTextItems.length > 0 ? this._renderSection('📄 外部文字资料', aiTextItems, 'text') : ''}
                ${aiVideoItems.length > 0 ? this._renderSection('🎬 学习视频', aiVideoItems, 'video') : ''}
                ${uploadItems.length > 0 ? this._renderSection('📎 用户上传资料', uploadItems, 'upload') : ''}
            </div>
            <div id="material-preview-modal" class="modal" style="display:none;">
                <div class="modal-content modal-lg">
                    <div class="modal-header">
                        <h3 id="preview-title" class="modal-title"></h3>
                        <button class="modal-close" onclick="MaterialList.closePreview()">&times;</button>
                    </div>
                    <div class="modal-body" id="preview-body"></div>
                </div>
            </div>
        `;
        
        this._bindEvents();
    },

    /**
     * 解析资料的 category（兼容历史数据）
     * @param {Object} item - 资料项
     * @returns {string} 'text' | 'video'
     */
    _resolveCategory(item) {
        if (item.category) return item.category;
        if (item.format === 'video') return 'video';
        return 'text';
    },
    
    /** 绑定点击事件 */
    _bindEvents() {
        const items = document.querySelectorAll('.material-item');
        items.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const itemId = item.dataset.id;
                const materialData = this._currentData?.items?.find(m => m.id === itemId);
                const title = item.querySelector('.material-title')?.textContent;
                const desc = item.querySelector('.material-meta')?.textContent;
                this.showPreview(title, desc, materialData);
            });
        });
    },
    
    /** 显示文档预览 */
    showPreview(title, desc, materialData) {
        const modal = document.getElementById('material-preview-modal');
        const titleEl = document.getElementById('preview-title');
        const bodyEl = document.getElementById('preview-body');
        
        if (!modal || !titleEl || !bodyEl) return;

        if (this._courseId && typeof Store !== 'undefined') {
            Store.recordMaterialRead(this._courseId, materialData?.type || 'unknown', materialData?.id);
        }

        titleEl.textContent = title || '文档预览';
        
        const hasUrl = materialData?.url;
        const isUpload = materialData?.type === 'upload';
        const isAiSummary = materialData?.type === 'ai-summary';
        const url = materialData?.url || '';
        const content = materialData?.content || '';
        
        if (isAiSummary) {
            bodyEl.innerHTML = `
                <div style="padding: var(--spacing-lg);">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
                        <span style="font-size: 32px;"> </span>
                        <div>
                            <h3 style="margin: 0;">${title}</h3>
                            <span class="badge" style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); color: #5B21B6; margin-top: 4px;">AI总结资料</span>
                        </div>
                    </div>
                    <div id="doc-preview-area" style="background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-sm); max-height: 400px; overflow-y: auto; overflow-x: hidden; line-height: 1.8; font-size: var(--font-size-sm); word-wrap: break-word; word-break: break-word; white-space: normal;">
                        ${this._markdownToHtml(content)}
                    </div>
                    <div style="display: flex; gap: var(--spacing-md); justify-content: center; margin-top: var(--spacing-lg);">
                        <button class="btn btn-primary" onclick="MaterialList.openDocInNewTab('${materialData?.id}')">
                             在新标签页中打开
                        </button>
                        <button class="btn btn-download" onclick="MaterialList.downloadAsDocx('${materialData?.id}')">
                            💾 下载
                        </button>
                        <button class="btn btn-secondary" onclick="MaterialList.closePreview()">
                            关闭
                        </button>
                    </div>
                </div>
            `;
        } else if (hasUrl) {
            bodyEl.innerHTML = `
                <div style="padding: var(--spacing-xl); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: var(--spacing-md);">🔗</div>
                    <h3 style="margin-bottom: var(--spacing-sm);">${title}</h3>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">${desc}</p>
                    <div style="background: var(--color-primary-bg); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg); border-left: 4px solid var(--color-primary);">
                        <p style="color: var(--color-primary); font-weight: 500; margin-bottom: var(--spacing-sm);">
                             这是一个外部学习资源
                        </p>
                        <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); word-break: break-all;">
                            ${url}
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-md); justify-content: center;">
                        <button class="btn btn-primary" onclick="window.open('${url}', '_blank')">
                            🔗 点击跳转到网站
                        </button>
                        <button class="btn btn-secondary" onclick="MaterialList.closePreview()">
                            关闭
                        </button>
                    </div>
                </div>
            `;
        } else if (isUpload) {
            const previewHtml = this._renderUploadPreview(materialData);
            bodyEl.innerHTML = `
                <div style="padding: var(--spacing-lg);">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
                        <span style="font-size: 32px;">📎</span>
                        <div>
                            <h3 style="margin: 0;">${title}</h3>
                            <span class="badge badge-primary" style="margin-top: 4px;">${materialData?.format?.toUpperCase() || '文件'}</span>
                        </div>
                    </div>
                    <div style="background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-sm); max-height: 400px; overflow-y: auto; overflow-x: hidden; line-height: 1.8; font-size: var(--font-size-sm);">
                        ${previewHtml}
                    </div>
                    <div style="display: flex; gap: var(--spacing-md); justify-content: center; margin-top: var(--spacing-lg);">
                        <button class="btn btn-danger" onclick="MaterialList.deleteMaterial('${materialData?.id}')">
                            🗑️ 删除
                        </button>
                        <button class="btn btn-download" onclick="MaterialList.downloadFile('${title}', '${content}')">
                            💾 下载文件
                        </button>
                        <button class="btn btn-secondary" onclick="MaterialList.closePreview()">
                            关闭
                        </button>
                    </div>
                </div>
            `;
        } else {
            bodyEl.innerHTML = `
                <div style="padding: var(--spacing-xl); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: var(--spacing-md);">📚</div>
                    <h3 style="margin-bottom: var(--spacing-sm);">${title}</h3>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-lg);">${desc}</p>
                    <div style="background: var(--color-bg-subtle); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                        <p style="color: var(--color-text-secondary);">
                            来源：${materialData?.source || '未知'}
                        </p>
                    </div>
                    <button class="btn btn-primary" onclick="MaterialList.closePreview()">
                        关闭
                    </button>
                </div>
            `;
        }
        modal.style.display = 'flex';
    },

    /** 在新标签页中打开AI总结文档 */
    openDocInNewTab(materialId) {
        const item = this._currentData?.items?.find(m => m.id === materialId);
        if (!item || !item.content) {
            Dialog.toast('文档内容为空', 'warning');
            return;
        }

        const htmlContent = this._markdownToHtml(item.content);
        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>${item.title || 'AI总结文档'}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; font-size: 14px; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        h1 { font-size: 24px; color: #1a1a1a; border-bottom: 2px solid #7C3AED; padding-bottom: 10px; }
        h2 { font-size: 20px; color: #333; margin-top: 30px; }
        h3 { font-size: 16px; color: #555; margin-top: 20px; }
        ul, ol { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 6px; }
        p { margin: 10px 0; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .meta { color: #888; font-size: 12px; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${item.title || 'AI总结文档'}</h1>
        <div class="meta">来源：${item.source || 'AI 生成'} | 生成时间：${new Date(item.uploadTime).toLocaleString('zh-CN')}</div>
    </div>
    ${htmlContent}
</body>
</html>`;

        const blob = new Blob(['\ufeff' + fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    },

    /** 下载文档文件 */
    downloadAsDocx(materialId) {
        const item = this._currentData?.items?.find(m => m.id === materialId);
        if (!item || !item.content) {
            Dialog.toast('文档内容为空，无法下载', 'warning');
            return;
        }

        const htmlContent = this._markdownToHtml(item.content);
        const courseTitle = this._currentData?.courseTitle || '课程';
        const filename = `${courseTitle}_AI总结.html`;

        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <title>${item.title || 'AI总结文档'}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; font-size: 14px; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; word-wrap: break-word; word-break: break-word; white-space: normal; overflow-x: hidden; }
        h1 { font-size: 24px; color: #1a1a1a; border-bottom: 2px solid #7C3AED; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 20px; color: #333; margin-top: 30px; margin-bottom: 15px; }
        h3 { font-size: 16px; color: #555; margin-top: 20px; margin-bottom: 10px; }
        ul, ol { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 6px; }
        p { margin: 10px 0; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .header h1 { border: none; margin: 0; }
        .meta { color: #888; font-size: 12px; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${item.title || 'AI总结文档'}</h1>
        <div class="meta">来源：${item.source || 'AI 生成'} | 生成时间：${new Date(item.uploadTime).toLocaleString('zh-CN')}</div>
    </div>
    ${htmlContent}
</body>
</html>`;

        const blob = new Blob(['\ufeff' + fullHtml], {
            type: 'text/html;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    
    /** 关闭预览 */
    closePreview() {
        const modal = document.getElementById('material-preview-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /** 下载文件（Base64转Blob） */
    downloadFile(filename, base64Content) {
        try {
            const byteString = atob(base64Content.split(',')[1]);
            const mimeString = base64Content.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error('下载失败:', err);
            Dialog.toast('文件下载失败：' + err.message, 'error');
        }
    },

    /** 删除用户上传资料 */
    async deleteMaterial(materialId) {
        const item = this._currentData?.items?.find(m => m.id === materialId);
        const fileName = item?.title || '该资料';
        const confirmed = await Dialog.confirm(`确定要删除资料「${fileName}」吗？删除后不可恢复。`);
        if (!confirmed) return;

        this._currentData.items = this._currentData.items.filter(m => m.id !== materialId);
        Store.saveMaterial(this._currentData);
        this.closePreview();

        const container = document.getElementById('materials-container');
        if (container) this.render(container, this._currentData);
        Dialog.toast('资料已删除', 'success');
    },

    /** 渲染用户上传文件预览 */
    _renderUploadPreview(materialData) {
        if (!materialData?.content) {
            return `<p style="text-align:center;color:var(--color-text-muted);padding:var(--spacing-xl);">文件内容为空，无法预览</p>`;
        }

        const format = (materialData.format || '').toLowerCase();

        try {
            if (format === 'text' || format === 'txt') {
                const base64 = materialData.content;
                const dataPart = base64.split(',')[1] || '';
                const textContent = decodeURIComponent(escape(atob(dataPart)));
                return `<pre style="white-space:pre-wrap;word-break:break-word;font-family:'Courier New',monospace;font-size:13px;line-height:1.7;margin:0;padding:var(--spacing-md);">${textContent}</pre>`;
            }

            if (format === 'markdown' || format === 'md') {
                const base64 = materialData.content;
                const dataPart = base64.split(',')[1] || '';
                const textContent = decodeURIComponent(escape(atob(dataPart)));
                const htmlContent = this._markdownToHtml(textContent);
                const id = 'md-open-' + Date.now();
                setTimeout(() => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const fullHtml = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${materialData.title || 'Markdown文档'}</title><style>*{box-sizing:border-box}body{font-family:'Microsoft YaHei','PingFang SC',sans-serif;font-size:14px;line-height:1.8;padding:40px;max-width:800px;margin:0 auto;color:#333}h1{font-size:24px;border-bottom:2px solid #7C3AED;padding-bottom:10px}h2{font-size:20px;margin-top:30px}h3{font-size:16px;color:#555;margin-top:20px}ul,ol{margin-left:20px;margin-bottom:15px}li{margin-bottom:6px}p{margin:10px 0}pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:.9em}</style></head><body>${htmlContent}</body></html>`;
                            const blob = new Blob(['\ufeff' + fullHtml], { type: 'text/html;charset=utf-8' });
                            window.open(URL.createObjectURL(blob), '_blank');
                        });
                    }
                }, 100);
                return `<div style="margin-bottom:var(--spacing-md);text-align:right;"><button id="${id}" class="btn btn-primary" style="font-size:12px;padding:6px 16px;"> 在新标签页中打开</button></div>${htmlContent}`;
            }

            if (format === 'pdf') {
                const id = 'pdf-open-' + Date.now();
                setTimeout(() => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            try {
                                const base64 = materialData.content;
                                const parts = base64.split(',');
                                const byteString = atob(parts[1]);
                                const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
                                const ab = new ArrayBuffer(byteString.length);
                                const ia = new Uint8Array(ab);
                                for (let i = 0; i < byteString.length; i++) {
                                    ia[i] = byteString.charCodeAt(i);
                                }
                                const blob = new Blob([ab], { type: mimeType });
                                const pdfUrl = URL.createObjectURL(blob);
                                const title = (materialData.title || 'PDF文档').replace(/'/g, "\\'");
                                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:none}</style></head><body><iframe src="${pdfUrl}"></iframe></body></html>`;
                                const blob2 = new Blob([html], { type: 'text/html;charset=utf-8' });
                                window.open(URL.createObjectURL(blob2), '_blank');
                            } catch (e) {
                                console.error('打开PDF失败:', e);
                                Dialog.toast('打开PDF失败，请尝试下载后查看', 'error');
                            }
                        });
                    }
                }, 100);
                return `
                    <div style="text-align:center;padding:var(--spacing-xl);">
                        <div style="font-size:48px;margin-bottom:var(--spacing-md);">📕</div>
                        <h4 style="margin-bottom:var(--spacing-sm);">${materialData.title}</h4>
                        <p style="color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                            格式：PDF<br>
                            大小：${this._formatSize(materialData.size)}<br>
                            上传时间：${new Date(materialData.uploadTime).toLocaleString('zh-CN')}
                        </p>
                        <button id="${id}" class="btn btn-primary" style="margin-top:var(--spacing-sm);">
                             在新标签页中打开
                        </button>
                    </div>
                `;
            }

            if (format === 'word' || format === 'doc' || format === 'docx') {
                return `
                    <div style="text-align:center;padding:var(--spacing-xl);">
                        <div style="font-size:48px;margin-bottom:var(--spacing-md);">📘</div>
                        <h4 style="margin-bottom:var(--spacing-sm);">${materialData.title}</h4>
                        <p style="color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                            格式：Word 文档<br>
                            大小：${this._formatSize(materialData.size)}<br>
                            上传时间：${new Date(materialData.uploadTime).toLocaleString('zh-CN')}
                        </p>
                        <div style="background:var(--color-primary-bg);padding:var(--spacing-md);border-radius:var(--radius-md);border-left:4px solid var(--color-primary);">
                            <p style="color:var(--color-primary);font-weight:500;margin:0;">Word 文档请下载后查看</p>
                        </div>
                    </div>
                `;
            }

            return `<div style="text-align:center;padding:var(--spacing-xl);">
                <div style="font-size:48px;margin-bottom:var(--spacing-md);">📄</div>
                <h4 style="margin-bottom:var(--spacing-sm);">${materialData.title}</h4>
                <p style="color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                    格式：${format || '未知'}<br>
                    大小：${this._formatSize(materialData.size)}
                </p>
                <p style="color:var(--color-text-muted);">暂不支持预览此格式，请下载后查看</p>
            </div>`;
        } catch (e) {
            console.error('文件预览失败:', e);
            return `<p style="text-align:center;color:var(--color-text-muted);padding:var(--spacing-xl);">文件预览失败，请下载后查看</p>`;
        }
    },

    /** 渲染分类区块 */
    _renderSection(title, items, sectionType) {
        if (items.length === 0) return '';

        return `
            <div class="material-section" data-section="${sectionType || ''}">
                <h4 class="material-section-title">${title} <span class="material-count">${items.length} 个资料</span></h4>
                <div class="material-list">
                    ${items.map(item => this._renderItem(item)).join('')}
                </div>
            </div>
        `;
    },

    /** 渲染单个资料卡片 */
    _renderItem(item) {
        const isAiSummary = item.type === 'ai-summary';
        const isOnline = item.type === 'ai' && item.url;
        const isVideo = item.format === 'video';
        const isTextResource = item.type === 'ai' && this._resolveCategory(item) === 'text';
        const isUpload = item.type === 'upload';
        let iconHtml, iconBg;
        
        if (isAiSummary) {
            iconHtml = '<span style="font-size:22px;">📘</span>';
            iconBg = 'background: linear-gradient(135deg, #EDE9FE, #DDD6FE);';
        } else if (isVideo) {
            iconHtml = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5z" fill="#1D4ED8"/></svg>';
            iconBg = 'background: linear-gradient(135deg, #DBEAFE, #BFDBFE);';
        } else if (isTextResource) {
            iconHtml = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            iconBg = 'background: linear-gradient(135deg, #FEF3C7, #FDE68A);';
        } else if (item.format === 'pdf') {
            iconHtml = '<span style="color:#DC2626;font-size:13px;font-weight:700;line-height:1;">PDF</span>';
            iconBg = 'background: linear-gradient(135deg, #FEE2E2, #FECACA);';
        } else if (item.format === 'word') {
            iconHtml = '<span style="color:#2563EB;font-size:13px;font-weight:700;line-height:1;">DOC</span>';
            iconBg = 'background: linear-gradient(135deg, #DBEAFE, #BFDBFE);';
        } else if (item.format === 'markdown') {
            iconHtml = '<span style="color:#059669;font-size:13px;font-weight:700;line-height:1;">MD</span>';
            iconBg = 'background: linear-gradient(135deg, #D1FAE5, #A7F3D0);';
        } else if (isUpload) {
            iconHtml = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            iconBg = 'background: linear-gradient(135deg, #F3E8FF, #E9D5FF);';
        } else if (isOnline) {
            iconHtml = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            iconBg = 'background: linear-gradient(135deg, #FEF3C7, #FDE68A);';
        } else {
            iconHtml = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            iconBg = 'background: linear-gradient(135deg, #F1F5F9, #E2E8F0);';
        }
        
        const tagHtml = item.tags.map(t => {
            if (t === 'AI总结资料') {
                return `<span class="badge" style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); color: #5B21B6;">${t}</span>`;
            }
            return `<span class="badge badge-primary">${t}</span>`;
        }).join('');

        const sizeHtml = (isOnline && !isAiSummary) ? '' : `<span> ${this._formatSize(item.size)}</span>`;

        return `
            <div class="material-item" data-id="${item.id}">
                <div class="material-icon" style="${iconBg}">${iconHtml}</div>
                <div class="material-info">
                    <div class="material-title" title="${item.title}">${item.title}</div>
                    <div class="material-meta">
                        <span>👤 ${item.source}</span>
                        ${sizeHtml}
                    </div>
                    <div class="material-tags">${tagHtml}</div>
                </div>
            </div>
        `;
    },

    /** Markdown转HTML - 完整渲染器 */
    _markdownToHtml(md) {
        if (!md) return '';
        
        const math = MathRenderer._extractMath(md);
        let html = math.text;
        
        // 处理代码块
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin: 8px 0; white-space: pre-wrap; word-wrap: break-word; word-break: break-all; overflow-x: hidden;"><code>$2</code></pre>');
        
        // 处理行内代码
        html = html.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; word-break: break-all;">$1</code>');
        
        // 处理标题
        html = html.replace(/^#### (.+)$/gm, '<h4 style="margin: 12px 0 6px; font-size: 1em; word-break: break-word;">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin: 14px 0 8px; font-size: 1.05em; word-break: break-word;">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin: 16px 0 10px; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 6px; word-break: break-word;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="margin: 18px 0 12px; font-size: 1.2em; word-break: break-word;">$1</h1>');
        
        // 处理粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // 处理链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #7C3AED; word-break: break-all;">$1</a>');
        
        // 处理无序列表
        html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li style="margin: 4px 0; margin-left: 20px; word-break: break-word;">$1</li>');
        
        // 处理有序列表
        html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 4px 0; margin-left: 20px; list-style-type: decimal; word-break: break-word;">$1</li>');
        
        // 将连续的li标签包裹在ul中
        html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>');
        html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');
        
        // 处理引用块
        html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left: 3px solid #7C3AED; padding-left: 12px; color: #666; margin: 10px 0; word-break: break-word;">$1</blockquote>');
        
        // 处理分隔线
        html = html.replace(/^---+$/gm, '<hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">');
        
        // 处理段落（双换行）
        html = html.replace(/\n\n/g, '</p><p style="margin: 10px 0; word-break: break-word;">');
        
        // 处理单换行
        html = html.replace(/\n/g, '<br>');
        
        // 包裹在段落中
        if (!html.startsWith('<')) {
            html = '<p style="margin: 10px 0; word-break: break-word;">' + html + '</p>';
        }
        
        return MathRenderer._restoreMath(html, math.placeholders);
    },

    /** 格式化文件大小 */
    _formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
};
