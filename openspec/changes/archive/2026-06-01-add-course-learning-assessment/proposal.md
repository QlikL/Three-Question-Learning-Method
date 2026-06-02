## Why

当前系统缺乏对用户课程学习效果的综合评估功能。用户完成课程学习后，无法获得关于自己学习情况的系统性反馈，包括学习进度、知识掌握程度、学习习惯等方面的分析。添加"课程学习评估"功能可以帮助用户了解自己的学习情况，发现优点和不足，明确需要提升的知识点，从而优化学习策略。

## What Changes

- 在每门课程学习页面的"查看资料"按钮右侧添加"课程学习评估"按钮
- 创建课程学习评估数据收集机制，收集以下五个维度的数据：
  1. 用户点击"去问AI"按钮的次数
  2. 课程学习进度（三个阶段的完成情况）
  3. 第三问题目答对情况和测验次数
  4. 阅读知识库中的资料情况
  5. 用户上传资料的情况
- 创建AI评估服务，基于收集的数据生成约500字的学习情况总结
- 创建评估结果弹窗组件，展示AI生成的评估报告

## Capabilities

### New Capabilities
- `course-learning-assessment`: 课程学习评估功能，包括数据收集、AI评估和结果展示

### Modified Capabilities
- `ai-chat-widget`: 需要记录用户点击"去问AI"按钮的次数
- `knowledge-repository-page`: 需要记录用户阅读资料和上传资料的情况

## Impact

- 需要修改 `js/pages/learningPage.js` 添加评估按钮
- 需要创建新的评估数据收集模块
- 需要修改 `js/components/aiChatWidget.js` 记录AI咨询次数
- 需要修改 `js/pages/knowledgeRepositoryPage.js` 记录资料阅读和上传情况
- 需要创建新的AI评估服务或扩展现有AI服务
- 需要创建新的评估结果弹窗组件
- 需要修改 `js/store.js` 添加评估数据的存储支持
