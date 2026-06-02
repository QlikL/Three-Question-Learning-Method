/**
 * 学习资料数据模型 Material
 * 表示课程关联的AI补充或用户上传的资料
 */
class Material {
    /**
     * @param {Object} data - 资料数据
     * @param {string} data.courseId - 所属课程ID
     * @param {Array} [data.items] - 资料列表
     */
    constructor(data = {}) {
        this.courseId = data.courseId || '';
        this.items = (data.items || []).map(m => ({
            id: m.id || '',
            title: m.title || '',
            type: m.type || 'ai',            // 'ai' | 'upload'
            format: m.format || 'markdown',   // 'pdf' | 'word' | 'markdown'
            source: m.source || '',
            size: m.size || 0,
            uploadTime: m.uploadTime || Date.now(),
            tags: m.tags || []
        }));
    }

    /** 按类型筛选 */
    getByType(type) {
        return this.items.filter(m => m.type === type);
    }

    /** 按标签搜索 */
    searchByTag(tag) {
        return this.items.filter(m => m.tags.includes(tag));
    }

    toJSON() {
        return {
            courseId: this.courseId,
            items: this.items
        };
    }
}
