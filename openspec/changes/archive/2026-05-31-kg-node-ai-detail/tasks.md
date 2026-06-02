# 实现任务清单

## 1. 修改知识图谱组件

- [x] 1.1 修改 `js/components/knowledgeGraph.js` 的 `render()` 方法，添加 `courseTitle` 参数并存储为 `this._courseTitle`
- [x] 1.2 修改 `_showNodeInfo(node)` 方法，在信息面板底部添加"🔍 详细信息"按钮
- [x] 1.3 绑定按钮点击事件：调用 `AiChatWidget.openWithMessage()` 发送包含节点名称和课程标题的提示词

## 2. 修改调用方

- [x] 2.1 修改 `js/pages/learningPage.js` 中所有 `KnowledgeGraphRenderer.render()` 调用，传入课程标题参数

## 3. 样式调整

- [x] 3.1 在 `css/pages/learning.css` 中添加 `.kg-detail-btn` 样式（margin-top、宽度100%）
