## 1. 数据收集基础设施

- [x] 1.1 修改 `js/store.js` 添加评估数据存储方法
- [x] 1.2 创建评估数据收集模块 `js/services/assessmentDataService.js`
- [x] 1.3 在 `js/components/aiChatWidget.js` 中添加AI咨询次数记录功能
- [x] 1.4 在 `js/pages/knowledgeRepositoryPage.js` 中添加资料阅读和上传记录功能

## 2. AI评估服务实现

- [x] 2.1 扩展 `js/services/aiService.js` 添加课程评估功能
- [x] 2.2 设计评估提示词模板，生成约500字的学习情况总结
- [x] 2.3 实现评估数据聚合逻辑，收集五个维度的学习数据

## 3. 评估结果展示组件

- [x] 3.1 创建评估结果弹窗组件 `js/components/assessmentDialog.js`
- [x] 3.2 设计评估结果展示界面，包括优点、不足、需要提升的知识点
- [x] 3.3 添加评估结果样式 `css/components/assessmentDialog.css`

## 4. UI集成

- [x] 4.1 修改 `js/pages/learningPage.js` 在"查看资料"按钮右侧添加"课程学习评估"按钮
- [x] 4.2 绑定评估按钮点击事件，触发评估数据收集和AI评估
- [x] 4.3 集成评估结果弹窗组件，展示AI生成的评估报告

## 5. 测试与优化

- [x] 5.1 测试数据收集功能，确保五个维度数据正确记录
- [x] 5.2 测试AI评估功能，确保生成约500字的评估报告
- [x] 5.3 测试评估结果展示，确保弹窗正常显示和关闭
- [x] 5.4 优化性能，确保评估功能不影响现有学习流程
