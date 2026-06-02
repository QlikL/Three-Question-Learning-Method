## Context

当前项目使用纯前端架构（HTML/CSS/JavaScript），所有数据存储在IndexedDB和localStorage中。已有完善的AI服务集成（aiService.js），使用阿里云百炼大模型（qwen3-8b）。项目采用组件化架构，每个页面有独立的JS和CSS文件。

**约束条件**：
- 纯前端实现，无后端服务
- 复用现有AI服务接口
- 除首页外的所有页面都需要添加
- 聊天记录需要本地持久化
- 不影响现有功能

## Goals / Non-Goals

**Goals:**
- 在所有非首页页面（学习空间、知识库、测评中心、个人中心）右下角显示悬浮聊天按钮
- 点击按钮弹出聊天窗口，支持多轮对话
- 聊天窗口可最小化/展开/关闭
- 聊天记录本地保存，刷新页面后恢复
- 使用现有aiService.js接口调用大模型
- 流畅的用户体验（加载动画、错误提示、自动滚动）

**Non-Goals:**
- 不在首页显示聊天入口（按需求）
- 不实现文件上传功能（后续可扩展）
- 不实现对话分享功能
- 不实现对话历史列表（仅保存当前会话）

## Decisions

### 1. 组件架构设计
**决策**：创建独立的AiChatWidget组件对象，封装所有聊天逻辑

**理由**：
- 与现有组件模式一致（HomePage, LearningPage等）
- 便于在不同页面复用
- 状态管理清晰

**替代方案**：
- 方案A：在每个页面单独实现 → 代码重复，维护困难
- 方案B：全局单例模式 → 当前方案就是全局单例，可行

### 2. 聊天窗口UI实现方式
**决策**：使用固定定位的悬浮窗口，通过DOM操作直接创建

**理由**：
- 无需依赖第三方库
- 性能开销小
- 完全控制样式和交互

**替代方案**：
- 方案A：使用模态框组件 → 太重，不适合悬浮聊天
- 方案B：使用Shadow DOM → 过度设计，样式隔离反而麻烦

### 3. 聊天记录存储方案
**决策**：使用localStorage存储当前会话，key为`ai_chat_messages`

**理由**：
- 聊天数据量不大（文本为主）
- localStorage API简单
- 无需IndexedDB的复杂查询

**数据格式**：
```json
{
  "messages": [
    {"role": "user", "content": "你好", "timestamp": 1234567890},
    {"role": "assistant", "content": "你好！有什么可以帮助你的？", "timestamp": 1234567891}
  ],
  "lastUpdated": 1234567891
}
```

### 4. AI调用策略
**决策**：复用aiService.js的callAI方法，传递完整的对话历史

**理由**：
- 保持对话上下文连贯性
- 复用已有配置和错误处理
- 简化实现

**实现细节**：
- 每次发送消息时，将完整messages数组传给aiService.callAI()
- 设置temperature为0.7（平衡创造性和准确性）
- 最大token数设置为2000

### 5. 页面过滤策略
**决策**：在AiChatWidget.init()中检查当前路由，如果是首页则不渲染

**理由**：
- 简单直接
- 路由信息可从window.location.hash获取
- 不影响其他页面的渲染逻辑

**实现**：
```javascript
const isHomePage = window.location.hash === '#/home' || 
                   window.location.hash === '#/home/courses' ||
                   window.location.hash === '' || 
                   window.location.hash === '#/';
if (isHomePage) return;
```

### 6. 流式响应vs非流式响应
**决策**：使用非流式响应（等待完整响应后显示）

**理由**：
- 现有aiService.js已支持
- 实现简单
- 对于问答场景足够

**未来优化**：可升级为流式响应，提升用户体验

## Risks / Trade-offs

### 风险1：localStorage容量限制
**风险**：localStorage通常限制5MB，长对话可能超出
**缓解**：
- 限制保存最近50条消息
- 定期清理旧消息
- 大文本截断保存

### 风险2：API调用成本
**风险**：频繁调用AI模型可能产生费用
**缓解**：
- 添加消息发送频率限制（防抖）
- 提供"清除对话"按钮
- 在UI中提示API使用状态

### 风险3：长对话上下文超限
**风险**：对话过长时，完整传递历史可能超出模型上下文窗口
**缓解**：
- 最多传递最近20条消息作为上下文
- 超出部分自动截断
- 在UI中提示"上下文已更新"

### 风险4：页面性能影响
**风险**：悬浮组件可能影响页面性能
**缓解**：
- 组件仅在需要时创建DOM
- 使用CSS transform而非top/left定位（GPU加速）
- 最小化时隐藏聊天内容区域

### Trade-off：非流式响应
**取舍**：牺牲即时反馈，换取实现简单性
**影响**：用户需要等待完整响应才能看到内容
**未来改进**：后续可升级为流式渲染

## Migration Plan

### 部署步骤
1. 创建aiChatWidget.js和aiChatWidget.css
2. 在index.html中引入新文件
3. 在app.js的路由初始化后调用AiChatWidget.init()
4. 测试所有非首页页面的聊天功能
5. 验证localStorage持久化
6. 上线部署

### 回滚策略
- 在index.html中注释掉新引入的CSS和JS
- 在app.js中注释掉AiChatWidget.init()调用
- 清除localStorage中的ai_chat_messages键
- 页面功能完全不受影响

## Open Questions

1. **是否需要添加系统提示词？**
   - 当前方案：不添加，由用户自由提问
   - 建议：后续可添加角色设定（如"你是三问学习平台的AI助手"）

2. **是否需要支持Markdown渲染？**
   - 当前方案：纯文本显示
   - 建议：后续可引入markdown-it库渲染AI回复

3. **对话历史是否需要跨设备同步？**
   - 当前方案：仅本地存储
   - 未来：可考虑使用IndexedDB+后端API实现同步
