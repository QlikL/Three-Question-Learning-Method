# 设计方案：知识图谱节点AI详细信息

## 1. 节点信息面板改造

### 1.1 当前结构

```html
<div class="kg-info-panel">
    <h4 class="kg-info-title">节点名称</h4>
    <p class="kg-info-desc">简短描述</p>
</div>
```

### 1.2 新增结构

```html
<div class="kg-info-panel">
    <h4 class="kg-info-title">节点名称</h4>
    <p class="kg-info-desc">简短描述</p>
    <button class="btn btn-primary btn-sm" id="kg-node-detail-btn">
        🔍 详细信息
    </button>
</div>
```

## 2. 实现逻辑

### 2.1 修改 `_showNodeInfo(node)` 方法

在设置面板内容后，添加按钮事件绑定：

```javascript
_showNodeInfo(node) {
    // ... 现有逻辑 ...
    
    const btn = document.getElementById('kg-node-detail-btn');
    if (btn) {
        btn.onclick = () => {
            const courseTitle = this._courseTitle || '当前课程';
            const message = `请详细介绍"${node.label}"这个知识点，它属于"${courseTitle}"课程。请从以下几个方面展开：\n1. 核心概念和定义\n2. 关键原理和机制\n3. 实际应用场景\n4. 与其他知识点的关联`;
            AiChatWidget.openWithMessage(message);
        };
    }
}
```

### 2.2 传递课程标题

在 `render()` 方法中接收并存储 `courseTitle` 参数，以便在提示词中使用：

```javascript
render(container, graphData, courseTitle) {
    this._courseTitle = courseTitle || '';
    // ...
}
```

调用方传入课程标题：
```javascript
KnowledgeGraphRenderer.render(container, graphData, this._course.title);
```

## 3. 涉及文件

| 文件 | 修改内容 |
|------|----------|
| `js/components/knowledgeGraph.js` | 信息面板添加按钮 + 绑定点击事件 + 接收courseTitle参数 |
| `css/pages/learning.css` | `.kg-info-panel` 内按钮样式调整 |
| `js/pages/learningPage.js` | 调用render时传入课程标题 |
