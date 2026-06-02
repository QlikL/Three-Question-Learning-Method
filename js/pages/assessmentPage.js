/**
 * 测评中心页面逻辑 AssessmentPage
 */
const AssessmentPage = {
    /**
     * 渲染测评中心
     * @param {HTMLElement} container
     * @param {string} courseId
     */
    async render(container, courseId) {
        // 移除首页的全宽样式，恢复正常布局
        const appContent = container.closest('.app-content');
        if (appContent) {
            appContent.classList.remove('home-content');
        }

        container.innerHTML = `
            <div class="page-container assessment-page">
                <div class="loading-overlay">
                    <span class="loading-spinner loading-spinner-lg"></span>
                    <span>正在加载测评...</span>
                </div>
            </div>
        `;

        try {
            // 尝试从缓存加载
            let quizData = null;
            const cached = await Store.getQuiz(courseId);
            if (cached) {
                quizData = this._normalizeQuizData(cached, courseId);
            } else {
                // 优先使用新框架的深度理解题生成
                if (typeof AiMock.mockGenerateDeepQuestions === 'function') {
                    quizData = await AiMock.mockGenerateDeepQuestions(courseId);
                } else {
                    quizData = await AiMock.mockGenerateQuiz(courseId);
                }
                // 添加courseId字段用于IndexedDB存储
                quizData.courseId = courseId;
                await Store.saveQuiz(quizData);
            }

            if (!quizData || !quizData.questions || quizData.questions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p>暂无测评题目</p>
                        <a href="#/home" class="btn btn-primary" style="margin-top:16px;">返回首页</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="page-container assessment-page">
                    <h2 style="margin-bottom:var(--spacing-lg);">📝 深度测评</h2>
                    <p style="color:var(--color-text-secondary);margin-bottom:var(--spacing-lg);">
                        基于布鲁姆认知层级生成的自测题，完成所有题目后生成测评报告。
                    </p>
                    <div id="quiz-container"></div>
                </div>
            `;

            QuizItem.renderList(
                document.getElementById('quiz-container'),
                quizData.questions,
                {
                    onComplete: (result) => {
                        AssessmentPage._onComplete(courseId, result);
                    }
                }
            );
        } catch (err) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <p>加载测评失败</p>
                </div>
            `;
        }
    },

    /** 测评完成回调 */
    async _onComplete(courseId, result) {
        try {
            const courseData = await Store.getCourse(courseId);
            if (courseData) {
                courseData.progress.phase3 = true;
                courseData.status = 'completed';
                courseData.updatedAt = Date.now();
                if (result && !courseData.rating) {
                    const base = 60;
                    const accuracyBonus = Math.round((result.correctCount / result.total) * 30);
                    courseData.rating = Math.min(100, base + accuracyBonus + 10);
                } else if (!courseData.rating) {
                    courseData.rating = 80;
                }
                await Store.saveCourse(new Course(courseData));
            }

            if (result) {
                Store.recordQuizAttempt(courseId, result.percent, result.correctCount, result.total);
            }
        } catch (err) {
            console.error('更新课程状态失败:', err);
        }
    },

    /** 规范化缓存的测评数据，修复旧格式字段名问题 */
    _normalizeQuizData(data, courseId) {
        if (!data || !data.questions) return data;
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const stripPrefix = (s) => typeof s === 'string' ? s.replace(/^[\s]*[A-Fa-f][\.\、\s]+/, '').trim() || s : s;
        const judgeAnswerMap = (a) => {
            const s = String(a).trim();
            if (s === 'A' || s === '对' || s === '正确' || s.toLowerCase() === 'true') return '对';
            if (s === 'B' || s === '错' || s === '错误' || s.toLowerCase() === 'false') return '错';
            return s;
        };
        let needsFix = false;
        data.questions = data.questions.map((q, i) => {
            if (!q.content && q.question) {
                needsFix = true;
                q.content = q.question;
            }
            if (q.options && q.options.length > 0 && typeof q.options[0] === 'string') {
                needsFix = true;
                q.options = q.options.map((opt, j) => ({ label: labels[j] || String(j), content: stripPrefix(opt) }));
            } else if (q.options && q.options.length > 0 && typeof q.options[0] === 'object') {
                q.options = q.options.map((opt) => ({ label: opt.label, content: stripPrefix(opt.content) }));
            }
            if (typeof q.answer === 'string') {
                needsFix = true;
                q.answer = [q.answer];
            }
            q.id = q.id || String(i + 1);
            q.type = (q.type === 'judge' || q.type === 'truefalse') ? 'judge' : 'single';
            q.level = q.level || 'understand';
            if (q.type === 'judge' && q.answer) {
                const fixed = q.answer.map(judgeAnswerMap);
                if (fixed.join('') !== q.answer.join('')) needsFix = true;
                q.answer = fixed;
            }
            return q;
        });
        if (needsFix) {
            data.courseId = courseId;
            Store.saveQuiz(data).catch(err => console.warn('规范化数据回写失败:', err));
        }
        return data;
    }
};
