/**
 * 知识图谱数据模型 KnowledgeGraph
 * 表示第一问"核心心智模型提取"生成的知识图谱
 */
class KnowledgeGraph {
    /**
     * @param {Object} data - 知识图谱数据
     * @param {string} data.courseId - 所属课程ID
     * @param {Array} [data.nodes] - 知识节点列表
     * @param {Array} [data.edges] - 连接边列表
     */
    constructor(data = {}) {
        this.courseId = data.courseId || '';
        this.nodes = (data.nodes || []).map(n => ({
            id: n.id || '',
            label: n.label || '',
            type: n.type || 'concept',       // concept | theory | method | example
            description: n.description || '',
            depth: n.depth || 0               // 层级深度
        }));
        this.edges = (data.edges || []).map(e => ({
            source: e.source || '',
            target: e.target || '',
            relation: e.relation || 'related' // 关系类型
        }));
    }

    /** 获取根节点（深度为0的节点） */
    getRootNodes() {
        return this.nodes.filter(n => n.depth === 0);
    }

    /** 获取某个节点的子节点 */
    getChildren(nodeId) {
        const childIds = this.edges
            .filter(e => e.source === nodeId)
            .map(e => e.target);
        return this.nodes.filter(n => childIds.includes(n.id));
    }

    toJSON() {
        return {
            courseId: this.courseId,
            nodes: this.nodes,
            edges: this.edges
        };
    }
}
