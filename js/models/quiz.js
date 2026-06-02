/**
 * 测评题目数据模型 Quiz
 * 表示第三问"深度测评生成"的自测题数据
 */
class Quiz {
    /**
     * @param {Object} data - 测评数据
     * @param {string} data.courseId - 所属课程ID
     * @param {Array} [data.questions] - 题目列表
     */
    constructor(data = {}) {
        this.courseId = data.courseId || '';
        this.questions = (data.questions || []).map(q => ({
            id: q.id || '',
            type: q.type || 'single',        // single | judge
            level: q.level || 'memory',       // memory | understand | apply | analyze | evaluate | create
            content: q.content || '',
            options: (q.options || []).map(o => ({
                label: o.label || '',
                content: o.content || ''
            })),
            answer: q.answer || [],
            explanation: q.explanation || '',
            expectedUnderstanding: q.expectedUnderstanding || '', // 新增：出题意图（深度理解题）
            misconceptionHint: q.misconceptionHint || '',       // 新增：常见误解提示
            knowledgePoints: q.knowledgePoints || []
        }));
    }

    /** 按认知层级过滤题目 */
    getByLevel(level) {
        return this.questions.filter(q => q.level === level);
    }

    /** 获取所有认知层级 */
    getLevels() {
        return [...new Set(this.questions.map(q => q.level))];
    }

    toJSON() {
        return {
            courseId: this.courseId,
            questions: this.questions
        };
    }
}
