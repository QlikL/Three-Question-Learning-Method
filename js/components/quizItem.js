/**
 * 测评题目组件 QuizItem
 * 展示单选题/判断题，支持选择即显示答案解析
 */
const QuizItem = {
    /** 当前题目的回答记录 */
    _answers: {},

    /** HTML转义，防止特殊字符破坏布局 */
    _esc(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    /**
     * 渲染测评列表
     * @param {HTMLElement} container
     * @param {Array} questions - 题目数组
     * @param {Object} options - { onComplete }
     */
    renderList(container, questions, options = {}) {
        this._questions = questions;
        this._answers = {};
        this._onComplete = options.onComplete;

        if (!questions || questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>暂无测评题目</p>
                </div>
            `;
            return;
        }

        let html = '<div class="quiz-list"><div class="quiz-cards">';
        questions.forEach((q, i) => {
            html += this._renderQuizCard(q, i + 1);
        });
        html += '</div></div>';
        container.innerHTML = html;

        // 绑定答题事件
        this._bindQuizEvents(container);
    },

    /** 渲染单个题目卡片 */
    _renderQuizCard(question, index) {
        return `
            <div class="quiz-card card" data-quiz-id="${question.id}">
                <div class="card-body">
                    <div class="quiz-card-header">
                        <span class="quiz-question-number">${index}.</span>
                        <span class="quiz-type-badge ${this._getTypeBadgeClass(question.level || question.type)}">
                            ${question.level ? this._getLevelLabel(question.level) : this._getTypeLabel(question.type)}
                        </span>
                    </div>
                    <div class="quiz-question-text">${this._esc(question.content)}</div>
                    <div class="quiz-options" data-quiz-id="${question.id}">
                        ${question.type === 'judge'
                            ? this._renderJudgeOptions(question)
                            : this._renderSingleOptions(question)}
                    </div>
                    <div class="quiz-result-container" id="quiz-result-${question.id}">
                        <div class="quiz-result-inner">
                            <div class="quiz-result"></div>
                        </div>
                    </div>
                    <div class="quiz-explanation-container" id="quiz-explanation-${question.id}">
                        <div class="quiz-explanation-inner">
                            <div class="quiz-explanation">
                                <div class="explanation-label">📖 解析</div>
                                <div class="explanation-content">${this._esc(question.explanation)}</div>
                                ${question.expectedUnderstanding ? `
                                    <div class="explanation-intent">
                                        <span class="intent-label">🎯 出题意图</span>
                                        <span class="intent-content">${this._esc(question.expectedUnderstanding)}</span>
                                    </div>
                                ` : ''}
                                ${question.misconceptionHint ? `
                                    <div class="explanation-misconception">
                                        <span class="misconception-label">⚠️ 常见误解</span>
                                        <span class="misconception-content">${this._esc(question.misconceptionHint)}</span>
                                    </div>
                                ` : ''}
                                ${question.knowledgePoints ? `
                                    <div class="explanation-tags">
                                        ${question.knowledgePoints.map(kp => `<span class="badge badge-primary">${this._esc(kp)}</span>`).join('')}
                                    </div>
                                ` : ''}
                                <div class="ai-section">
                                    <button class="btn btn-ai-help quiz-ask-ai-btn" data-quiz-id="${question.id}">
                                        <span class="btn-ai-help-inner">🤖 追问AI：为什么我会错？</span>
                                    </button>
                                    <div class="explanation-ai-feedback" id="ai-feedback-${question.id}">
                                        <div class="ai-feedback-loading">正在为你深度解析<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
                                        <div class="ai-feedback-content" id="ai-feedback-content-${question.id}"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /** 渲染单选题选项 */
    _renderSingleOptions(question) {
        return question.options.map(opt => `
            <label class="quiz-option" data-quiz-id="${question.id}" data-value="${opt.label}">
                <input type="radio" name="q_${question.id}" value="${opt.label}">
                <span class="option-label">${opt.label}.</span>
                <span class="option-content">${this._esc(opt.content)}</span>
            </label>
        `).join('');
    },

    /** 渲染判断题选项 */
    _renderJudgeOptions(question) {
        return `
            <label class="quiz-option" data-quiz-id="${question.id}" data-value="对">
                <input type="radio" name="q_${question.id}" value="对">
                <span class="option-label">对</span>
            </label>
            <label class="quiz-option" data-quiz-id="${question.id}" data-value="错">
                <input type="radio" name="q_${question.id}" value="错">
                <span class="option-label">错</span>
            </label>
        `;
    },

    /** 绑定测评交互事件 */
    _bindQuizEvents(container) {
        // 点击选项即提交答案
        container.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                const qId = option.dataset.quizId;
                const value = option.dataset.value;
                // 检查是否已经作答过
                if (this._answers[qId]) return;
                // 选中radio
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                // 提交答案
                this._submitAnswer(qId, container, value);
            });
        });

        // 追问AI
        container.querySelectorAll('.quiz-ask-ai-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = btn.dataset.quizId;
                this._askAI(qId, container);
            });
        });
    },

    /** 提交答案并判断 */
    _submitAnswer(qId, container, userAnswer) {
        const question = this._questions.find(q => q.id === qId);
        if (!question) return;

        // 如果没有传入userAnswer，从radio获取
        if (!userAnswer) {
            const selected = container.querySelector(`input[name="q_${qId}"]:checked`);
            if (!selected) return;
            userAnswer = selected.value;
        }

        // 获取用户选择的选项内容（用于比较）
        let userAnswerContent = userAnswer;
        if (question.options) {
            let selectedOption;
            if (question.type === 'judge') {
                selectedOption = question.options.find(opt => opt.label === userAnswer || opt.content === userAnswer);
                if (!selectedOption) {
                    selectedOption = question.options.find(opt => opt.content === '正确' && userAnswer === '对')
                        || question.options.find(opt => opt.content === '错误' && userAnswer === '错');
                }
            } else {
                selectedOption = question.options.find(opt => opt.label === userAnswer);
            }
            if (selectedOption) {
                userAnswerContent = selectedOption.content;
            }
        }

        // 调试日志
        console.log('[Quiz] 答题:', {
            questionId: qId,
            userAnswer: userAnswer,
            userAnswerContent: userAnswerContent,
            correctAnswer: question.answer,
            answerType: typeof question.answer,
            isArray: Array.isArray(question.answer)
        });

        // 标准化答案格式进行比较（同时支持标签和内容两种格式）
        const normalizedUserAnswer = userAnswer.toString().trim().toUpperCase();
        const normalizedUserContent = userAnswerContent.toString().trim().toUpperCase();
        
        const checkAnswer = (answer) => {
            const normalizedAnswer = answer.toString().trim().toUpperCase();
            return normalizedAnswer === normalizedUserAnswer || normalizedAnswer === normalizedUserContent;
        };
        
        const isCorrect = Array.isArray(question.answer) 
            ? question.answer.some(checkAnswer)
            : checkAnswer(question.answer);
        
        console.log('[Quiz] 判断结果:', { isCorrect, normalizedUserAnswer, normalizedUserContent });

        // 记录答案
        this._answers[qId] = { selected: userAnswer, correct: isCorrect };

        // 显示结果（带动画效果）
        const resultContainer = document.getElementById('quiz-result-' + qId);
        if (resultContainer) {
            const resultEl = resultContainer.querySelector('.quiz-result');
            if (resultEl) {
                resultEl.className = 'quiz-result ' + (isCorrect ? 'result-correct' : 'result-wrong');
                if (isCorrect) {
                    resultEl.innerHTML = '✅ 回答正确！';
                } else {
                    const correctLabels = Array.isArray(question.answer) ? question.answer : [question.answer];
                    const correctDisplay = correctLabels.map(label => {
                        if (question.options) {
                            const opt = question.options.find(o => o.label === label || o.content === label);
                            if (opt) return question.type === 'judge' ? this._esc(opt.content) : `${opt.label}. ${this._esc(opt.content)}`;
                        }
                        return this._esc(label);
                    }).join('；');
                    resultEl.innerHTML = `❌ 回答错误。正确答案是：${correctDisplay}`;
                }
            }
            setTimeout(() => {
                resultContainer.classList.add('expanded');
            }, 50);
        }

        // 高亮正确/错误选项并禁用所有选项
        container.querySelectorAll(`.quiz-option[data-quiz-id="${qId}"]`).forEach(option => {
            option.style.pointerEvents = 'none';
            option.style.cursor = 'default';
            const optValue = option.dataset.value;
            const optLabel = option.querySelector('.option-label')?.textContent?.trim();
            const optContent = option.querySelector('.option-content')?.textContent?.trim();
            const isCorrectOption = question.answer.some(a => {
                const na = a.toString().trim().toUpperCase();
                return na === optLabel?.toUpperCase() || na === optContent?.toUpperCase() || na === optValue?.toUpperCase();
            });
            if (isCorrectOption) {
                option.classList.add('option-correct');
            }
        });

        // 标记用户选中的选项
        const selectedOption = container.querySelector(`.quiz-option[data-quiz-id="${qId}"][data-value="${userAnswer}"]`);
        if (selectedOption) {
            selectedOption.classList.add('option-selected');
            if (isCorrect) {
                selectedOption.classList.add('option-correct');
            } else {
                selectedOption.classList.add('option-wrong');
            }
        }

        // 自动显示解析（带动画效果）
        const explanation = document.getElementById('quiz-explanation-' + qId);
        if (explanation) {
            setTimeout(() => {
                explanation.classList.add('expanded');
            }, 100);
        }

        // 显示追问AI按钮（带动画效果）
        const askAiBtn = container.querySelector(`.quiz-ask-ai-btn[data-quiz-id="${qId}"]`);
        if (askAiBtn) {
            // 答错时显示"为什么我会错"，答对时显示"深入理解"
            const btnInner = askAiBtn.querySelector('.btn-ai-help-inner');
            if (btnInner) {
                btnInner.textContent = isCorrect 
                    ? '🤖 AI解析：深入理解' 
                    : '🤖 追问AI：为什么我会错？';
            }
            setTimeout(() => {
                askAiBtn.classList.add('expanded');
            }, 350);
        }

        // 检查是否所有题目都已作答
        this._checkAllAnswered();
    },

    /** 追问AI：获取个性化错误解释 */
    async _askAI(qId, container) {
        const question = this._questions.find(q => q.id === qId);
        if (!question) return;

        const userAnswer = this._answers[qId]?.selected || '';

        // 显示加载状态（带动画效果）
        const aiFeedback = document.getElementById('ai-feedback-' + qId);
        const askAiBtn = container.querySelector(`.quiz-ask-ai-btn[data-quiz-id="${qId}"]`);
        if (aiFeedback) {
            aiFeedback.classList.add('expanded');
            const loadingEl = aiFeedback.querySelector('.ai-feedback-loading');
            const contentEl = document.getElementById('ai-feedback-content-' + qId);
            if (loadingEl) loadingEl.style.display = 'block';
            if (contentEl) contentEl.innerHTML = '';
        }
        if (askAiBtn) {
            askAiBtn.disabled = true;
            const btnInner = askAiBtn.querySelector('.btn-ai-help-inner');
            if (btnInner) {
                btnInner.textContent = '🤖 AI 正在分析...';
            }
        }

        try {
            const isCorrect = this._answers[qId]?.correct || false;
            const options = question.options ? question.options.map(o => o.label + '. ' + o.content) : [];
            const correctLabels = Array.isArray(question.answer) ? question.answer : [question.answer];
            const correctDisplay = correctLabels.map(label => {
                if (question.options) {
                    const opt = question.options.find(o => o.label === label || o.content === label);
                    if (opt) return `${opt.label}. ${opt.content}`;
                }
                return label;
            }).join('；');
            let result;
            if (typeof AiMock !== 'undefined' && AiMock.mockExplainWrongAnswer) {
                result = await AiMock.mockExplainWrongAnswer({
                    question: question.content,
                    userAnswer: userAnswer,
                    correctAnswer: correctDisplay,
                    options: options,
                    isCorrect: isCorrect,
                    explanation: question.explanation || ''
                });
            }

            // 显示AI反馈
            if (aiFeedback) {
                const loadingEl = aiFeedback.querySelector('.ai-feedback-loading');
                const contentEl = document.getElementById('ai-feedback-content-' + qId);
                if (loadingEl) loadingEl.style.display = 'none';
                if (contentEl) contentEl.innerHTML = this._markdownToHtml(result) || '无法获取AI解释，请查看答案解析。';
                requestAnimationFrame(() => {
                    aiFeedback.classList.add('has-content');
                });
            }
        } catch (err) {
            console.error('追问AI失败:', err);
            if (aiFeedback) {
                const loadingEl = aiFeedback.querySelector('.ai-feedback-loading');
                const contentEl = document.getElementById('ai-feedback-content-' + qId);
                if (loadingEl) loadingEl.style.display = 'none';
                if (contentEl) contentEl.innerHTML = 'AI服务暂时不可用，请查看已有解析内容。';
                requestAnimationFrame(() => {
                    aiFeedback.classList.add('has-content');
                });
            }
        } finally {
            if (askAiBtn) {
                askAiBtn.disabled = true;
                askAiBtn.classList.add('fade-out');
                setTimeout(() => {
                    askAiBtn.classList.remove('expanded', 'fade-out');
                }, 300);
            }
        }
    },

    /** 检查是否所有题目都已提交 */
    _checkAllAnswered() {
        const answered = Object.keys(this._answers).length;
        if (answered === this._questions.length) {
            const correctCount = Object.values(this._answers).filter(a => a.correct).length;
            const total = this._questions.length;
            const percent = Math.round((correctCount / total) * 100);

            const levelStats = {};
            this._questions.forEach(q => {
                if (!levelStats[q.level]) levelStats[q.level] = { total: 0, correct: 0 };
                levelStats[q.level].total++;
                if (this._answers[q.id]?.correct) levelStats[q.level].correct++;
            });

            setTimeout(() => {
                this._showReport(correctCount, total, percent, levelStats);
            }, 500);
        }
    },

    /** 显示测评报告 */
    _showReport(correctCount, total, percent, levelStats) {
        const container = document.querySelector('.quiz-list');
        if (!container) return;

        const passed = correctCount >= 9;
        const levelLabels = { memory: '记忆', understand: '理解', apply: '应用', analyze: '分析', evaluate: '评价', create: '创造' };
        const wrongQuestions = this._questions.filter(q => !this._answers[q.id]?.correct);

        if (this._onComplete) {
            this._onComplete({ correctCount, total, percent });
        }

        const reportHtml = `
            <div class="quiz-report">
                <h3 class="report-title">📊 测评报告</h3>
                <div class="report-score">
                    <span class="report-score-value ${passed ? 'score-good' : 'score-need-work'}">${percent}%</span>
                    <span class="report-score-label">正确率</span>
                </div>
                ${!passed ? `
                    <div class="report-gate-hint">
                        <span class="gate-icon">⚠️</span>
                        <span>需要至少答对9题才算通过，当前正确 ${correctCount}/${total} 题</span>
                    </div>
                ` : ''}
                <div class="report-stats">
                    <div class="report-stat">
                        <span class="stat-value">${correctCount}/${total}</span>
                        <span class="stat-label">正确题数</span>
                    </div>
                    <div class="report-stat">
                        <span class="stat-value">${total - correctCount}</span>
                        <span class="stat-label">错题数</span>
                    </div>
                </div>
                <div class="report-levels">
                    <h4>认知层级分析</h4>
                    <div class="level-bars">
                        ${Object.entries(levelStats).map(([level, stats]) => `
                            <div class="level-bar-item">
                                <span class="level-bar-label">${levelLabels[level] || level}</span>
                                <div class="level-bar-track">
                                    <div class="level-bar-fill" style="width:${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%"></div>
                                </div>
                                <span class="level-bar-text">${stats.correct}/${stats.total}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${wrongQuestions.length > 0 ? `
                    <div class="report-wrong">
                        <h4>❌ 错题回顾</h4>
                        <div class="wrong-list">
                            ${wrongQuestions.map(q => `
                                <div class="wrong-item">
                                    <div class="wrong-question">${this._esc(q.content)}</div>
                                    <div class="wrong-answer">正确答案：${this._esc(q.answer.join('、'))}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="report-perfect">
                        🎉 全部答对！你对知识的掌握非常扎实！
                    </div>
                `}
                <div class="report-actions">
                    ${!passed ? `
                        <button class="btn btn-primary" onclick="QuizItem.retryQuiz()">🔄 重新测评</button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="Router.navigate('/home/courses')">返回我的课程</button>
                </div>
            </div>
        `;

        container.innerHTML = reportHtml;
    },

    /** 重新测评 */
    retryQuiz() {
        this._answers = {};
        const container = document.querySelector('.quiz-list');
        if (container && this._questions) {
            this.renderList(container, this._questions, { onComplete: this._onComplete });
        }
    },

    /** 获取认知层级标签 */
    _getLevelLabel(level) {
        const labels = {
            memory: '📚 记忆', understand: '🎯 理解', apply: '🛠️ 应用',
            analyze: '🔬 分析', evaluate: '✅ 评价', create: '🎨 创造'
        };
        return labels[level] || level;
    },

    /** 获取题目类型标签文字 */
    _getTypeLabel(type) {
        const labels = {
            judge: '📝 判断',
            single: '📋 单选',
            understand: '💡 理解',
            apply: '🔧 应用',
            analyze: '🔍 分析',
            evaluate: '⚖️ 评价',
            deep_understanding: '🧠 深度理解'
        };
        return labels[type] || '📋 单选';
    },

    /** 获取题目类型徽章样式类 */
    _getTypeBadgeClass(type) {
        const classes = {
            judge: 'type-judge',
            single: 'type-single',
            understand: 'type-understand',
            apply: 'type-apply',
            analyze: 'type-analyze',
            evaluate: 'type-evaluate',
            deep_understanding: 'type-deep',
            memory: 'type-memory',
            create: 'type-create'
        };
        return classes[type] || 'type-deep';
    },

    /** Markdown转HTML */
    _markdownToHtml(md) {
        if (!md) return '';
        
        const math = MathRenderer._extractMath(md);
        let html = math.text;
        
        // 处理代码块
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code>$2</code></pre>');
        
        // 处理行内代码
        html = html.replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>');
        
        // 处理标题
        html = html.replace(/^#### (.+)$/gm, '<h4 style="margin: 12px 0 6px; font-size: 1em;">$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3 style="margin: 12px 0 6px; font-size: 1.05em;">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 style="margin: 16px 0 8px; font-size: 1.1em; border-bottom: 1px solid #eee; padding-bottom: 4px;">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 style="margin: 16px 0 8px; font-size: 1.2em;">$1</h1>');
        
        // 处理粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // 处理链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #7C3AED; text-decoration: underline;">$1</a>');
        
        // 处理无序列表
        html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li style="margin: 3px 0; margin-left: 16px;">$1</li>');
        
        // 处理有序列表
        html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 3px 0; margin-left: 16px; list-style-type: decimal;">$1</li>');
        
        // 将连续的li标签包裹在ul中
        html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin: 6px 0; padding-left: 16px;">$1</ul>');
        html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');
        
        // 处理引用块
        html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left: 3px solid #7C3AED; padding-left: 10px; color: #666; margin: 8px 0;">$1</blockquote>');
        
        // 处理分隔线
        html = html.replace(/^---+$/gm, '<hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;">');
        
        // 处理段落（双换行）
        html = html.replace(/\n\n/g, '</p><p style="margin: 6px 0;">');
        
        // 处理单换行
        html = html.replace(/\n/g, '<br>');
        
        // 包裹在段落中
        if (!html.startsWith('<')) {
            html = '<p style="margin: 6px 0;">' + html + '</p>';
        }
        
        return MathRenderer._restoreMath(html, math.placeholders);
    }
};
