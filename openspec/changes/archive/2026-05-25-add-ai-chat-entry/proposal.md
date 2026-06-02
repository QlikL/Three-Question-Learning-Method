## Why

当前学习平台缺少即时AI辅助功能，学生在学习过程中遇到问题时需要跳出页面查找答案。为提升学习效率和用户体验，需要在除首页外的所有页面添加AI聊天入口，让用户能够随时向AI提问并获得学习相关的解答。

## What Changes

- **新增**：在除首页外的所有页面右下角添加悬浮AI聊天入口按钮
- **新增**：点击按钮弹出AI聊天窗口，支持多轮对话
- **新增**：聊天窗口集成阿里云百炼大模型（复用现有AI服务配置）
- **新增**：聊天窗口支持最小化、展开、关闭等操作
- **新增**：聊天记录本地存储，下次打开时恢复

## Capabilities

### New Capabilities
- `ai-chat-widget`: AI聊天悬浮组件，包括入口按钮、聊天窗口UI、对话交互逻辑
- `ai-chat-integration`: AI模型集成，包括消息发送、流式响应、错误处理、对话上下文管理

### Modified Capabilities
<!-- 无现有能力需要修改 -->

## Impact

- **新增文件**：
  - `js/components/aiChatWidget.js` - AI聊天组件逻辑
  - `css/components/aiChatWidget.css` - AI聊天组件样式
- **修改文件**：
  - `js/app.js` - 在所有页面渲染时初始化AI聊天组件（首页除外）
  - `index.html` - 引入新组件的CSS和JS文件
- **复用现有**：
  - `js/services/aiService.js` - 复用已有的百炼AI服务接口
  - `localStorage` - 存储聊天记录和窗口状态
- **不影响**：首页（按需求排除）、现有页面功能、数据模型
