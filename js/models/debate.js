/**
 * 学术分歧/争议点数据模型 Debate
 * 表示第二问"学术分歧挖掘"生成的争议点数据
 */
class Debate {
    /**
     * @param {Object} data - 争议点数据
     * @param {string} data.courseId - 所属课程ID
     * @param {Array} [data.topics] - 争议主题列表
     */
    constructor(data = {}) {
        this.courseId = data.courseId || '';
        this.disagreements = data.disagreements || null; // 新框架分歧数据
        this.topics = (data.topics || []).map(t => ({
            id: t.id || '',
            title: t.title || '',
            coreQuestion: t.coreQuestion || '', // 新增：核心争议问题
            sideA: {
                label: t.sideA?.label || '正方观点',
                strongestArgument: t.sideA?.strongestArgument || '', // 新增：最有力论据
                supportingScholars: t.sideA?.supportingScholars || [], // 新增：代表学者
                evidences: (t.sideA?.evidences || []).map(e => ({
                    source: e.source || '',
                    content: e.content || ''
                }))
            },
            sideB: {
                label: t.sideB?.label || '反方观点',
                strongestArgument: t.sideB?.strongestArgument || '', // 新增：最有力论据
                supportingScholars: t.sideB?.supportingScholars || [], // 新增：代表学者
                evidences: (t.sideB?.evidences || []).map(e => ({
                    source: e.source || '',
                    content: e.content || ''
                }))
            },
            frontierImplication: t.frontierImplication || '', // 新增：前沿启示
            conclusion: t.conclusion || ''
        }));
    }

    /** 获取当前活跃的争议主题 */
    getActiveTopic() {
        return this.topics.length > 0 ? this.topics[0] : null;
    }

    toJSON() {
        return {
            courseId: this.courseId,
            topics: this.topics
        };
    }
}
