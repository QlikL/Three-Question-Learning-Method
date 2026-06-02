/**
 * 课程数据模型 Course
 * 表示一个由用户提问触发生成的学习课程
 */
class Course {
    /**
     * @param {Object} data - 课程数据
     * @param {string} data.id - 唯一标识
     * @param {string} data.title - 课程标题/学科名称
     * @param {string} data.query - 用户原始提问
     * @param {number} [data.createdAt] - 创建时间戳
     * @param {number} [data.updatedAt] - 最近学习时间戳
     * @param {'active'|'completed'|'archived'} [data.status='active'] - 课程状态
     * @param {Object} [data.progress] - 三问进度
     * @param {Object} [data.abilities] - 六维能力得分 (0-10)
     * @param {string} [data.subject] - 学科分类
     * @param {number} [data.rating] - 课程评分 (0-100)
     * @param {string[]} [data.abilityMapping] - 课程体现的能力维度ID列表
     */
    constructor(data = {}) {
        this.id = data.id || this._generateId();
        this.title = data.title || '';
        this.query = data.query || '';
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.status = data.status || 'active';
        this.progress = {
            phase1: data.progress?.phase1 || false,
            phase2: data.progress?.phase2 || false,
            phase3: data.progress?.phase3 || false
        };
        this.subject = data.subject || '未分类';
        this.rating = data.rating || 0;
        this.abilityMapping = data.abilityMapping || [];
        this.abilities = Course.migrateAbilities(data.abilities);
    }

    /** 迁移旧3维abilities为6维 */
    static migrateAbilities(old) {
        if (!old) {
            return { critical: 0, creative: 0, systems: 0, practical: 0, metacognitive: 0, connection: 0 };
        }
        if (old.critical !== undefined && old.creative !== undefined && old.systems !== undefined) {
            return {
                critical: old.critical || 0,
                creative: old.creative || 0,
                systems: old.systems || 0,
                practical: old.practical || 0,
                metacognitive: old.metacognitive || 0,
                connection: old.connection || 0
            };
        }
        return {
            critical: old.critical || 0,
            creative: 0,
            systems: old.concept || 0,
            practical: old.practice || 0,
            metacognitive: 0,
            connection: 0
        };
    }

    /** 获取整体进度百分比 */
    getProgressPercent() {
        const completed = [this.progress.phase1, this.progress.phase2, this.progress.phase3]
            .filter(Boolean).length;
        return Math.round((completed / 3) * 100);
    }

    /** 检查课程是否已完成 */
    isCompleted() {
        return this.progress.phase1 && this.progress.phase2 && this.progress.phase3;
    }

    /** 生成简单唯一ID */
    _generateId() {
        return 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    /** 序列化为可存储的纯对象 */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            query: this.query,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            subject: this.subject,
            rating: this.rating,
            abilityMapping: [...this.abilityMapping],
            progress: { ...this.progress },
            abilities: { ...this.abilities }
        };
    }
}

/** 预定义学科列表 */
const SUBJECTS = [
    '计算机科学', '数学', '物理学', '化学', '生物学',
    '历史学', '文学', '语言学', '哲学', '经济学',
    '心理学', '艺术学', '工程学', '医学', '法学',
    '教育学', '社会学', '其他'
];

/** 六维能力定义 */
const ABILITY_DEFINITIONS = {
    critical: { name: '批判思维', icon: '🔍', desc: '质疑假设、评估证据、识别逻辑谬误' },
    creative: { name: '创新创造', icon: '💡', desc: '产生新想法、建立跨域连接、发散思维' },
    systems: { name: '系统思维', icon: '🔄', desc: '理解整体性、识别因果关系、把握反馈回路' },
    practical: { name: '实践应用', icon: '🛠️', desc: '将理论转化为行动、解决实际问题' },
    metacognitive: { name: '元认知', icon: '🪞', desc: '自我反思、监控学习过程、调节策略' },
    connection: { name: '知识关联', icon: '🔗', desc: '跨学科连接、建立知识网络、迁移能力' }
};
