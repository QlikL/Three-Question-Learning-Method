/**
 * 心智模型数据模型 MentalModel
 * 表示第一问"核心心智模型提取"生成的数据
 */
class MentalModel {
    /** @param {Object} data - 心智模型数据 */
    constructor(data = {}) {
        this.courseId = data.courseId || '';
        this.mentalModels = (data.mentalModels || []).map(m => ({
            id: m.id || '',
            name: m.name || '',
            description: m.description || '',
            principle: m.principle || '',
            application: m.application || ''
        }));
    }

    /** 获取所有心智模型 */
    getAll() {
        return this.mentalModels;
    }

    /** 获取指定ID的心智模型 */
    getById(id) {
        return this.mentalModels.find(m => m.id === id) || null;
    }

    toJSON() {
        return {
            courseId: this.courseId,
            mentalModels: this.mentalModels
        };
    }
}
