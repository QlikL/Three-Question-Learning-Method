/**
 * 课程学习评估弹窗组件 AssessmentDialog
 * 展示AI生成的学习评估报告
 */
const AssessmentDialog = {
    /** 当前弹窗元素 */
    _modal: null,
    /** 是否正在加载 */
    _isLoading: false,

    /**
     * 显示评估弹窗
     * @param {string} courseId - 课程ID
     */
    async show(courseId) {
        if (this._isLoading) return;
        this._isLoading = true;

        this._createModal();
        this._showLoading();

        try {
            const assessmentData = await AssessmentDataService.collectAssessmentData(courseId);
            const report = await AiService.generateAssessmentReport(assessmentData);
            this._showReport(report, assessmentData);
        } catch (err) {
            console.error('评估报告生成失败:', err);
            this._showError('评估报告生成失败，请稍后重试。');
        } finally {
            this._isLoading = false;
        }
    },

    /** 创建弹窗DOM */
    _createModal() {
        if (this._modal) {
            this._modal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'assessment-modal';
        modal.innerHTML = `
            <div class="assessment-modal-overlay"></div>
            <div class="assessment-modal-content">
                <div class="assessment-modal-header">
                    <h3 class="assessment-modal-title">📊 课程学习评估</h3>
                    <button class="assessment-modal-close" title="关闭">&times;</button>
                </div>
                <div class="assessment-modal-body" id="assessment-modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);
        this._modal = modal;

        const closeBtn = modal.querySelector('.assessment-modal-close');
        closeBtn.addEventListener('click', () => this.close());

        const overlay = modal.querySelector('.assessment-modal-overlay');
        overlay.addEventListener('click', () => this.close());
    },

    /** 显示加载状态 */
    _showLoading() {
        const body = document.getElementById('assessment-modal-body');
        if (!body) return;

        body.innerHTML = `
            <div class="assessment-loading">
                <div class="assessment-loading-spinner"></div>
                <p class="assessment-loading-text">AI正在分析您的学习数据...</p>
                <p class="assessment-loading-hint">这可能需要几秒钟，请耐心等待</p>
            </div>
        `;
    },

    /** 显示评估报告 */
    _showReport(report, data) {
        const body = document.getElementById('assessment-modal-body');
        if (!body) return;

        const formattedReport = this._formatReport(report);

        body.innerHTML = `
            <div class="assessment-report">
                <div class="assessment-report-header">
                    <div class="assessment-course-title">${data.courseTitle}</div>
                    <div class="assessment-stats">
                        <div class="assessment-stat">
                            <span class="stat-icon">📚</span>
                            <span class="stat-label">学习进度</span>
                            <span class="stat-value">${data.dimensions.learningProgress.percentage}%</span>
                        </div>
                        <div class="assessment-stat">
                            <span class="stat-icon">🎯</span>
                            <span class="stat-label">测验正确率</span>
                            <span class="stat-value">${data.dimensions.quizPerformance.accuracy}%</span>
                        </div>
                        <div class="assessment-stat">
                            <span class="stat-icon">🤖</span>
                            <span class="stat-label">AI咨询</span>
                            <span class="stat-value">${data.dimensions.aiConsultation.count}次</span>
                        </div>
                        <div class="assessment-stat">
                            <span class="stat-icon">📖</span>
                            <span class="stat-label">阅读资料</span>
                            <span class="stat-value">${data.dimensions.materialReading.readCount}份</span>
                        </div>
                    </div>
                </div>
                <div class="assessment-report-content">
                    ${formattedReport}
                </div>
                <div class="assessment-report-footer">
                    <div class="assessment-engagement">
                        <span class="engagement-label">参与度等级：</span>
                        <span class="engagement-value engagement-${this._getEngagementClass(data.summary.engagementLevel)}">${data.summary.engagementLevel}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /** 显示错误信息 */
    _showError(message) {
        const body = document.getElementById('assessment-modal-body');
        if (!body) return;

        body.innerHTML = `
            <div class="assessment-error">
                <div class="assessment-error-icon">😔</div>
                <p class="assessment-error-text">${message}</p>
                <button class="btn btn-primary" onclick="AssessmentDialog.close()">关闭</button>
            </div>
        `;
    },

    /** 格式化报告内容 */
    _formatReport(report) {
        if (!report) return '<p>暂无评估数据</p>';

        const math = MathRenderer._extractMath(report);
        let html = math.text;
        
        html = html.replace(/#{1,6}\s*/g, '');
        
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        html = html.replace(/【([^】]+)】/g, '<h4 class="assessment-section-title">$1</h4>');
        
        html = html.replace(/\n/g, '<br>');
        
        html = html.replace(/- ([^<]+)/g, '<div class="assessment-item">• $1</div>');
        
        html = html.replace(/(\d+)\. ([^<]+)/g, '<div class="assessment-item">$1. $2</div>');

        return MathRenderer._restoreMath(html, math.placeholders);
    },

    /** 获取参与度等级样式类 */
    _getEngagementClass(level) {
        const classMap = {
            '非常高': 'very-high',
            '高': 'high',
            '中等': 'medium',
            '低': 'low',
            '未开始': 'none'
        };
        return classMap[level] || 'medium';
    },

    /** 关闭弹窗 */
    close() {
        if (this._modal) {
            this._modal.remove();
            this._modal = null;
        }
    }
};
