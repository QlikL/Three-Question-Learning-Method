## 1. AiChatWidget 扩展

- [x] 1.1 在 `js/components/aiChatWidget.js` 中添加 `openWithMessage(message)` 公共方法，实现打开聊天窗口并自动发送消息的功能
- [x] 1.2 处理聊天窗口已展开时直接发送消息的场景，避免重复展开

## 2. 知识图谱布局优化

- [x] 2.1 在 `js/components/knowledgeGraph.js` 的 `_layoutNodes` 方法中改进力导向布局算法，增大同层级节点间距和跨层级最小距离
- [x] 2.2 增强 `_adjustOverlappingNodes` 方法为多轮迭代（最多5轮），确保所有节点不重叠
- [x] 2.3 添加连线交叉检测逻辑，在初始布局后通过微调节点位置减少连线交叉
- [x] 2.4 增大Canvas默认尺寸，为节点布局提供更多空间

## 3. 心智模型"去问AI"按钮

- [x] 3.1 在 `js/components/mentalModelList.js` 的 `_renderModelCard` 方法中，在"第一性原理"模块右侧空白位置添加"去问AI"按钮
- [x] 3.2 绑定"去问AI"按钮点击事件，构造包含模型名称和第一性原理内容的问题，调用 `AiChatWidget.openWithMessage()` 发送
- [x] 3.3 在 `css/components.css` 或相关CSS文件中添加"去问AI"按钮的样式（inline布局，不破坏现有结构）

## 4. 根本性分歧"去问AI"按钮

- [x] 4.1 在 `js/components/debatePanel.js` 的 `_renderContent` 方法中，在左右分栏下方、"🔭 领域前沿启示"上方添加"去问AI"按钮
- [x] 4.2 绑定"去问AI"按钮点击事件，构造包含分歧标题、双方立场和核心争议的问题，调用 `AiChatWidget.openWithMessage()` 发送
- [x] 4.3 在 `css/pages/learning.css` 中添加根本性分歧"去问AI"按钮的样式（居中显示，宽度适配）

## 5. 第一问门控 - 心智模型展开监测

- [x] 5.1 在 `js/components/mentalModelList.js` 中添加 `_expandedSet` Set数据结构追踪已展开的心智模型ID
- [x] 5.2 在展开/折叠事件中更新 `_expandedSet`，当所有5个模型都展开时通过回调通知 `LearningPage`
- [x] 5.3 在 `js/pages/learningPage.js` 的 `_renderPhase1` 方法中，初始化时禁用"进入第二问"按钮，显示展开进度提示
- [x] 5.4 接收心智模型展开完成回调后，启用"进入第二问"按钮并更新提示文案

## 6. 第二问门控 - 根本性分歧查看监测

- [x] 6.1 在 `js/components/debatePanel.js` 中添加 `_viewedTopics` Set数据结构追踪已查看的分歧索引
- [x] 6.2 在主题切换事件中更新 `_viewedTopics`，初始显示的主题自动标记为已查看
- [x] 6.3 当全部3个分歧都查看后通过回调通知 `LearningPage`
- [x] 6.4 在 `js/pages/learningPage.js` 的 `_renderPhase2` 方法中，初始化时禁用"进入第三问"按钮，显示查看进度提示
- [x] 6.5 接收分歧查看完成回调后，启用"进入第三问"按钮并更新提示文案

## 7. 第三问门控 - 答题正确率判定

- [x] 7.1 在 `js/components/quizItem.js` 的 `_submitAnswer` 方法中，当全部10题都已作答时计算正确题数
- [x] 7.2 正确题数≥9时触发 `onComplete` 回调，正确题数<9时显示未通过提示和"重新测评"按钮
- [x] 7.3 实现"重新测评"功能：清空 `_answers` 记录，重新渲染题目列表
- [x] 7.4 在 `js/pages/learningPage.js` 的 `_onQuizComplete` 方法中保持现有的课程完成逻辑

## 8. 阶段导航门控与样式

- [x] 8.1 在 `js/pages/learningPage.js` 的 `_renderNav` 方法中，根据门控状态禁用后续阶段的导航按钮
- [x] 8.2 在 `css/pages/learning.css` 中添加门控提示样式（禁用按钮样式、进度提示文案样式、"去问AI"按钮样式）
- [x] 8.3 整体测试三问流程：第一问展开全部心智模型→第二问查看全部分歧→第三问答对≥9题→课程完成
