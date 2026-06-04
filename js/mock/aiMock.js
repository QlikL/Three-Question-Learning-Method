/**
 * AI 接口层
 * 自动检测是否配置了真实的AI服务，未配置时使用模拟数据
 */
const AiMock = {
    /**
     * 检测是否使用真实AI服务
     * @returns {boolean}
     */
    _useRealAI() {
        return typeof AiService !== 'undefined' && !!AiService.API_KEY;
    },

    /* ==================== 核心三问框架新方法 ==================== */

    /**
     * 提取5个核心心智模型（第一问）
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 心智模型数据
     */
    async mockExtractMentalModels(courseId) {
        if (this._useRealAI()) {
            try {
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                return await AiService.extractMentalModels(topic);
            } catch (error) {
                console.warn('心智模型AI调用失败，降级到模拟数据:', error);
            }
        }

        return new Promise((resolve) => {
            const delay = 1000 + Math.random() * 1000;
            setTimeout(() => {
                resolve(DataMock.getSampleMentalModels(courseId));
            }, delay);
        });
    },

    /**
     * 定位3个根本性分歧（第二问）
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 分歧数据
     */
    async mockIdentifyDisagreements(courseId) {
        if (this._useRealAI()) {
            try {
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                console.log(`[AI] 正在定位"${topic}"的根本性分歧...`);
                const result = await AiService.identifyDisagreements(topic);
                
                // 验证AI返回的数据
                if (result && result.disagreements && result.disagreements.length > 0) {
                    console.log(`[AI] 成功获取${result.disagreements.length}个根本性分歧`);
                    return this._convertDisagreementsToTopics(result, courseId);
                } else {
                    console.warn('[AI] 返回的分歧数据为空，使用模拟数据');
                }
            } catch (error) {
                console.error('[AI] 分歧定位失败:', error.message);
            }
        } else {
            console.log('[Mock] 未配置AI服务，使用模拟分歧数据');
        }

        console.log('[Mock] 使用模拟分歧数据');
        return new Promise((resolve) => {
            const delay = 1200 + Math.random() * 800;
            setTimeout(() => {
                resolve(DataMock.getSampleDebates(courseId));
            }, delay);
        });
    },

    /** 将新框架分歧格式转换为 DebatePanel 兼容格式 */
    _convertDisagreementsToTopics(data, courseId) {
        if (!data || !data.disagreements || data.disagreements.length === 0) {
            return DataMock.getSampleDebates(courseId);
        }
        return {
            courseId: courseId,
            topics: data.disagreements.map(d => ({
                id: d.id,
                title: d.title,
                coreQuestion: d.coreQuestion,
                sideA: {
                    label: d.sideA?.label || '正方',
                    strongestArgument: d.sideA?.strongestArgument || '',
                    supportingScholars: d.sideA?.supportingScholars || [],
                    evidences: this._extractEvidences(d.sideA)
                },
                sideB: {
                    label: d.sideB?.label || '反方',
                    strongestArgument: d.sideB?.strongestArgument || '',
                    supportingScholars: d.sideB?.supportingScholars || [],
                    evidences: this._extractEvidences(d.sideB)
                },
                frontierImplication: d.frontierImplication || '',
                conclusion: ''
            }))
        };
    },

    /** 提取证据列表，如果AI没有返回则生成默认证据 */
    _extractEvidences(side) {
        if (!side) return [];
        // 如果AI返回了evidences数组，直接使用
        if (side.evidences && Array.isArray(side.evidences) && side.evidences.length > 0) {
            return side.evidences.map(ev => ({
                source: ev.source || '学术研究',
                content: ev.content || ''
            }));
        }
        // 如果没有evidences但有strongestArgument，生成一个证据
        if (side.strongestArgument) {
            return [{ source: 'AI分析', content: side.strongestArgument }];
        }
        return [];
    },

    /**
     * 生成10道深度理解题（第三问）
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 深度理解题数据
     */
    async mockGenerateDeepQuestions(courseId) {
        if (this._useRealAI()) {
            try {
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                console.log(`[AI] 正在生成"${topic}"的深度理解题...`);
                const result = await AiService.generateDeepQuestions(topic);
                
                // 验证并转换AI返回的数据
                if (result && result.questions && result.questions.length > 0) {
                    console.log(`[AI] 成功获取${result.questions.length}道深度理解题`);
                    return this._convertQuestionsToQuizFormat(result, courseId);
                } else {
                    console.warn('[AI] 返回的题目数据为空，使用模拟数据');
                }
            } catch (error) {
                console.error('[AI] 深度理解题生成失败:', error.message);
            }
        } else {
            console.log('[Mock] 未配置AI服务，使用模拟测评数据');
        }

        console.log('[Mock] 使用模拟测评数据');
        return new Promise((resolve) => {
            const delay = 1500 + Math.random() * 1000;
            setTimeout(() => {
                resolve(DataMock.getSampleQuiz(courseId));
            }, delay);
        });
    },

    /** 将AI返回的深度理解题格式转换为 QuizItem 兼容格式 */
    _convertQuestionsToQuizFormat(data, courseId) {
        if (!data || !data.questions || data.questions.length === 0) {
            return DataMock.getSampleQuiz(courseId);
        }
        const defaultLevels = ['understand', 'understand', 'apply', 'apply', 'analyze', 'analyze', 'evaluate', 'evaluate', 'evaluate', 'create'];
        return {
            courseId: courseId,
            questions: data.questions.map((q, index) => {
                let type = 'single';
                if (q.type === 'judge' || q.type === 'truefalse') {
                    type = 'judge';
                }
                let options = this._convertOptions(q.options);
                let answer = Array.isArray(q.answer) ? q.answer : [q.answer];
                answer = this._normalizeAnswer(answer, options, type);
                if (type !== 'judge' && options.length > 2) {
                    const shuffled = this._shuffleOptions(options, answer);
                    options = shuffled.options;
                    answer = shuffled.answer;
                }
                return {
                    id: q.id || String(index + 1),
                    type: type,
                    level: q.level || defaultLevels[index % defaultLevels.length],
                    content: q.question || q.content || '',
                    options: options,
                    answer: answer,
                    explanation: q.explanation || '',
                    expectedUnderstanding: q.expectedUnderstanding || '',
                    misconceptionHint: q.misconceptionHint || '',
                    knowledgePoints: q.knowledgePoints || []
                };
            })
        };
    },

    /** 标准化答案：拆分合并答案，映射内容到选项标签 */
    _normalizeAnswer(answer, options, type) {
        if (type === 'judge') {
            return answer.map(item => {
                const s = String(item).trim();
                if (s === '对' || s === 'A' || s === '正确' || s.toLowerCase() === 'true') return '对';
                if (s === '错' || s === 'B' || s === '错误' || s.toLowerCase() === 'false') return '错';
                return s;
            });
        }
        const result = [];
        answer.forEach(item => {
            if (typeof item === 'string' && item.includes(',') && !options.find(o => o.content === item)) {
                item.split(',').forEach(part => {
                    const trimmed = part.trim();
                    const opt = options.find(o => o.content === trimmed || o.label === trimmed);
                    result.push(opt ? opt.label : trimmed);
                });
            } else {
                const opt = options.find(o => o.content === item || o.label === item);
                result.push(opt ? opt.label : item);
            }
        });
        return [...new Set(result)];
    },

    /** 打乱选项顺序并更新答案标签 */
    _shuffleOptions(options, answer) {
        const correctContents = answer.map(label => {
            const opt = options.find(o => o.label === label || o.content === label);
            return opt ? opt.content : label;
        });
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const newOptions = shuffled.map((opt, i) => ({ label: labels[i], content: opt.content }));
        const newAnswer = correctContents.map(content => {
            const opt = newOptions.find(o => o.content === content);
            return opt ? opt.label : content;
        });
        return { options: newOptions, answer: newAnswer };
    },

    /** 转换选项格式 */
    _convertOptions(options) {
        if (!options || !Array.isArray(options)) return [];
        if (options.length > 0 && typeof options[0] === 'object') return options;
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        return options.map((opt, i) => ({
            label: labels[i] || String(i),
            content: opt.replace(/^[\s]*[A-Fa-f][\.\、\s]+/, '').trim() || opt
        }));
    },

    /**
     * 追问AI：解释答案
     * @param {Object} params - { question, userAnswer, correctAnswer, options, isCorrect, explanation }
     * @returns {Promise<string>} 解释内容
     */
    async mockExplainWrongAnswer(params) {
        if (this._useRealAI()) {
            try {
                return await AiService.explainWrongAnswer(params);
            } catch (error) {
                console.warn('追问AI调用失败:', error);
            }
        }

        return new Promise((resolve) => {
            const delay = 500 + Math.random() * 500;
            setTimeout(() => {
                if (params.isCorrect) {
                    resolve(`✅ 你的选择（${params.userAnswer}）是正确的！${params.explanation || '这道题考察的是对概念的深层理解，你的掌握很扎实。建议继续保持这种理解深度，尝试将这个知识点与实际应用场景联系起来。'}`);
                } else {
                    resolve(`你的选择（${params.userAnswer}）不完全正确。正确答案是：${params.correctAnswer}。${params.explanation || '这道题考察的是深层理解而非事实记忆，建议重新思考题目中概念之间的逻辑关系。'}如果仍有疑问，建议查阅相关教材或资料。`);
                }
            }, delay);
        });
    },

    /* ==================== 旧方法（保留） ==================== */

    /**
     * 根据用户提问生成课程信息
     * @param {string} query - 用户提问内容
     * @returns {Promise<Object>} 课程数据
     */
    async mockGenerateCourse(query) {
        // 如果配置了真实AI，使用真实API
        if (this._useRealAI()) {
            try {
                return await AiService.generateCourse(query);
            } catch (error) {
                console.warn('AI服务调用失败，降级到模拟数据:', error);
            }
        }

        // 降级到模拟数据
        return new Promise((resolve) => {
            const delay = 1500 + Math.random() * 1000;
            setTimeout(() => {
                const title = this._extractTitle(query);
                const abilities = {
                    critical: +(Math.random() * 3 + 4).toFixed(1),
                    creative: +(Math.random() * 3 + 3).toFixed(1),
                    systems: +(Math.random() * 3 + 5).toFixed(1),
                    practical: +(Math.random() * 3 + 4).toFixed(1),
                    metacognitive: +(Math.random() * 2 + 3).toFixed(1),
                    connection: +(Math.random() * 3 + 3).toFixed(1)
                };
                const abilityMapping = Object.entries(abilities)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([k]) => k);
                resolve({
                    title,
                    subject: '其他',
                    rating: Math.floor(Math.random() * 20) + 60,
                    abilityMapping,
                    progress: { phase1: false, phase2: false, phase3: false },
                    abilities
                });
            }, delay);
        });
    },

    /**
     * 模拟：生成知识图谱
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 知识图谱数据
     */
    async mockGenerateGraph(courseId) {
        // 如果配置了真实AI，使用真实API
        if (this._useRealAI()) {
            try {
                // 获取课程标题作为主题
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                return await AiService.generateKnowledgeGraph(topic);
            } catch (error) {
                console.warn('知识图谱AI调用失败，降级到模拟数据:', error);
            }
        }

        // 降级到模拟数据
        return new Promise((resolve) => {
            const delay = 1000 + Math.random() * 1000;
            setTimeout(() => {
                resolve(DataMock.getSampleKnowledgeGraph(courseId));
            }, delay);
        });
    },

    /**
     * 模拟：挖掘学术分歧/争议点
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 争议点数据
     */
    async mockMineDebates(courseId) {
        // 如果配置了真实AI，使用真实API
        if (this._useRealAI()) {
            try {
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                return await AiService.mineDebates(topic);
            } catch (error) {
                console.warn('争议点挖掘AI调用失败，降级到模拟数据:', error);
            }
        }

        // 降级到模拟数据
        return new Promise((resolve) => {
            const delay = 1200 + Math.random() * 800;
            setTimeout(() => {
                resolve(DataMock.getSampleDebates(courseId));
            }, delay);
        });
    },

    /**
     * 模拟：生成测评题
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 测评数据
     */
    async mockGenerateQuiz(courseId) {
        // 如果配置了真实AI，使用真实API
        if (this._useRealAI()) {
            try {
                const course = await Store.getCourse(courseId);
                const topic = course ? (course.title || course.query || '未知主题') : '未知主题';
                const result = await AiService.generateQuiz(topic);
                if (result && result.questions && result.questions.length > 0) {
                    return this._convertQuestionsToQuizFormat(result, courseId);
                }
                return result;
            } catch (error) {
                console.warn('测评题AI调用失败，降级到模拟数据:', error);
            }
        }

        // 降级到模拟数据
        return new Promise((resolve) => {
            const delay = 1500 + Math.random() * 1000;
            setTimeout(() => {
                resolve(DataMock.getSampleQuiz(courseId));
            }, delay);
        });
    },

    /**
     * 模拟：生成学习资料推荐
     * @param {string} courseId - 课程ID
     * @param {string} [topicHint] - 课程主题（可选，避免 Store 查询错误）
     * @returns {Promise<Object>} 资料数据
     */
    async mockGenerateMaterials(courseId, topicHint) {
        let baseData;
        let topic = topicHint;

        if (!topic) {
            const course = await Store.getCourse(courseId);
            topic = course ? (course.title || course.query || '未知主题') : '未知主题';
        }

        if (this._useRealAI()) {
            try {
                baseData = await AiService.generateMaterials(topic);
                if (!baseData.items) baseData.items = [];
            } catch (error) {
                console.warn('资料推荐AI调用失败，降级到模拟数据:', error);
                baseData = DataMock.getSampleMaterials(courseId, topic);
            }
        } else {
            baseData = DataMock.getSampleMaterials(courseId, topic);
        }

        const summaryDocs = await this._generateSummaryDocuments(courseId, topic);
        baseData.items = [...summaryDocs, ...(baseData.items || [])];
        baseData.courseId = courseId;
        return baseData;
    },

    /**
     * 生成AI总结文档
     * @param {string} courseId - 课程ID
     * @param {string} [topicHint] - 课程主题（可选，避免 Store 查询错误）
     * @returns {Promise<Array>} AI总结文档列表
     */
    async _generateSummaryDocuments(courseId, topicHint) {
        let topic = topicHint;
        if (!topic) {
            const course = await Store.getCourse(courseId);
            topic = course ? (course.title || course.query || '未知主题') : '未知主题';
        }

        if (this._useRealAI()) {
            try {
                console.log('[AI] 正在生成课程总结文档...');
                const summaryContent = await this._generateAISummary(topic, '核心知识总结');
                const keyPointsContent = await this._generateAISummary(topic, '重点难点解析');
                return [
                    {
                        id: 'ai_summary_' + Date.now(),
                        title: `${topic} - 核心知识总结`,
                        type: 'ai-summary',
                        format: 'docx',
                        source: 'AI 生成',
                        tags: ['AI总结资料'],
                        content: summaryContent,
                        size: null,
                        uploadTime: Date.now(),
                        url: null
                    },
                    {
                        id: 'ai_summary_' + (Date.now() + 1),
                        title: `${topic} - 重点难点解析`,
                        type: 'ai-summary',
                        format: 'docx',
                        source: 'AI 生成',
                        tags: ['AI总结资料'],
                        content: keyPointsContent,
                        size: null,
                        uploadTime: Date.now() - 1800000,
                        url: null
                    }
                ];
            } catch (error) {
                console.warn('[AI] 总结文档生成失败，使用模板数据:', error);
            }
        }

        return [
            {
                id: 'ai_summary_' + Date.now(),
                title: `${topic} - 核心知识总结`,
                type: 'ai-summary',
                format: 'docx',
                source: 'AI 生成',
                tags: ['AI总结资料'],
                content: this._generateSummaryContent(topic),
                size: null,
                uploadTime: Date.now(),
                url: null
            },
            {
                id: 'ai_summary_' + (Date.now() + 1),
                title: `${topic} - 重点难点解析`,
                type: 'ai-summary',
                format: 'docx',
                source: 'AI 生成',
                tags: ['AI总结资料'],
                content: this._generateKeyPointsContent(topic),
                size: null,
                uploadTime: Date.now() - 1800000,
                url: null
            }
        ];
    },

    /**
     * 调用真实AI生成总结文档内容
     * @private
     */
    async _generateAISummary(topic, type) {
        const prompt = type === '核心知识总结'
            ? `你是一个学科总结专家。请为"${topic}"这个学习主题撰写一份结构化的核心知识总结文档。

要求：
- 使用Markdown格式
- 包含：概念定义、核心要点（5-8个）、关键概念解析（每个概念详细展开）、常见误区（详细分析）、学习路径建议、总结
- 内容要具体、有深度，有实际案例和应用场景
- 每个章节都要详细展开，不要简略带过
- 总字数在3000-5000字之间
- 直接返回Markdown内容，不要返回JSON`
            : `你是一个学科教学专家。请为"${topic}"这个学习主题撰写一份重点难点解析文档。

要求：
- 使用Markdown格式
- 包含：重点内容梳理（高频考点，每个考点详细解释）、难点突破（5个难点及突破方法，每个难点要有具体案例）、易错点分析、学习建议
- 每个难点要给出详细的解释、具体案例和突破方法
- 内容要实用，能帮助学习者真正理解
- 总字数在3000-5000字之间
- 直接返回Markdown内容，不要返回JSON`;

        const response = await AiService.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.7, max_tokens: 8000 });

        return response;
    },

    /**
     * 生成核心知识总结内容
     * @private
     */
    _generateSummaryContent(topic) {
        return `# ${topic} - 核心知识总结

## 一、概念定义

${topic}是一个重要的学科领域，其核心在于理解基本概念、原理和应用方法。本总结旨在帮助学习者建立系统化的知识框架。

## 二、核心要点

### 2.1 基本原理
- 理解${topic}的基本原理是掌握该领域的第一步
- 核心概念之间的关联构成了知识体系的骨架
- 实践应用是检验理解深度的最佳方式

### 2.2 关键概念
- 概念A：基础性概念，是后续学习的基石
- 概念B：进阶概念，需要在理解概念A的基础上学习
- 概念C：应用性概念，连接理论与实践的桥梁

### 2.3 常见误区
- 误区一：将相关性等同于因果性
- 误区二：忽视边界条件和适用范围
- 误区三：过度简化复杂问题

## 三、学习路径建议

1. 先掌握基础概念和术语
2. 理解核心原理和机制
3. 通过案例学习应用方法
4. 尝试综合运用解决实际问题

## 四、总结

${topic}的学习需要循序渐进，从基础到进阶，从理论到实践。建议学习者在理解核心概念的基础上，多做练习和思考，逐步建立自己的知识体系。`;
    },

    /**
     * 生成重点难点解析内容
     * @private
     */
    _generateKeyPointsContent(topic) {
        return `# ${topic} - 重点难点解析

## 一、重点内容梳理

### 1.1 高频考点
- 核心概念的准确定义和区分
- 原理机制的理解和应用
- 典型场景下的最佳实践

### 1.2 知识关联图
各知识点之间存在密切的逻辑关系：
- 基础概念 → 进阶概念 → 综合应用
- 理论学习 → 案例分析 → 实践验证

## 二、难点突破

### 2.1 难点一：概念辨析
很多学习者容易混淆相似概念。关键在于：
- 明确每个概念的定义边界
- 通过对比表格区分异同
- 结合具体例子加深理解

### 2.2 难点二：原理应用
从理论到实践的转化是最大的挑战：
- 先理解"为什么"再学习"怎么做"
- 从简单场景开始逐步增加复杂度
- 多做逆向练习，从结果反推原因

### 2.3 难点三：综合分析
面对复杂问题时的分析能力：
- 学会拆解问题为子问题
- 识别问题中的关键变量
- 建立系统化的分析框架

## 三、学习建议

1. 对于重点内容，建议制作思维导图梳理知识结构
2. 对于难点内容，建议通过反复练习和讨论加深理解
3. 定期回顾和自测，及时发现薄弱环节`;
    },

    /**
     * 从提问中提取标题关键词
     * @private
     * @param {string} query
     * @returns {string}
     */
    _extractTitle(query) {
        // 去除常见疑问词，保留完整标题
        const cleaned = query
            .replace(/如何|怎么|怎样|什么是|哪些|什么|吗/g, '')
            .trim();
        return cleaned || '自定义课程';
    }
};
