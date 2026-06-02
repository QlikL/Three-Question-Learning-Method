## ADDED Requirements

### Requirement: AI消息发送
系统SHALL将用户输入的消息发送到阿里云百炼大模型，并获取AI响应。

#### Scenario: 发送用户消息
- **WHEN** 用户在输入框中输入文本并点击发送按钮或按Enter键
- **THEN** 系统应将消息显示在消息列表中，并调用aiService.callAI()获取AI响应

#### Scenario: 空消息拦截
- **WHEN** 用户尝试发送空消息或仅包含空格的文本
- **THEN** 系统应阻止发送，并在输入框显示提示

#### Scenario: 消息发送防抖
- **WHEN** 用户连续快速点击发送按钮
- **THEN** 系统应在前一个请求完成前禁用发送按钮

### Requirement: 对话上下文管理
系统SHALL在每次AI调用时传递完整的对话历史，保持对话连贯性。

#### Scenario: 传递对话历史
- **WHEN** 调用AI模型时
- **THEN** 系统应将完整messages数组（用户消息和AI回复）传递给aiService.callAI()

#### Scenario: 上下文长度限制
- **WHEN** 对话历史超过20条消息
- **THEN** 系统应仅传递最近20条消息作为上下文

#### Scenario: 消息格式
- **WHEN** 构建消息数组时
- **THEN** 每条消息应包含role（user/assistant）、content（消息内容）和timestamp（时间戳）字段

### Requirement: AI响应处理
系统SHALL正确处理AI模型的响应，包括成功、失败和超时情况。

#### Scenario: 成功接收响应
- **WHEN** AI模型成功返回响应
- **THEN** 系统应将响应文本显示为AI消息，添加到消息列表并保存到localStorage

#### Scenario: API调用失败
- **WHEN** AI模型调用失败（网络错误、API错误等）
- **THEN** 系统应显示错误提示，如"抱歉，AI服务暂时不可用，请稍后重试"

#### Scenario: 请求超时
- **WHEN** AI模型响应时间超过30秒
- **THEN** 系统应显示超时提示，并允许用户重新发送

### Requirement: 加载状态显示
系统SHALL在等待AI响应时显示加载状态，提升用户体验。

#### Scenario: 显示加载提示
- **WHEN** 用户发送消息后等待AI响应
- **THEN** 系统应在消息列表中显示"AI正在思考..."的加载提示

#### Scenario: 禁用输入框
- **WHEN** AI请求正在进行中
- **THEN** 系统应禁用输入框和发送按钮，防止重复提交

#### Scenario: 恢复输入
- **WHEN** AI响应返回或请求失败
- **THEN** 系统应恢复输入框和发送按钮的可用状态

### Requirement: 错误处理与恢复
系统SHALL提供完善的错误处理机制，允许用户从错误中恢复。

#### Scenario: 网络错误重试
- **WHEN** 发生网络错误导致AI调用失败
- **THEN** 系统应显示错误消息，并在失败的消息旁显示"重试"按钮

#### Scenario: API密钥未配置
- **WHEN** aiService.js中未配置有效的API Key
- **THEN** 系统应显示提示"请先配置AI服务"，并引导用户查看配置说明

#### Scenario: 清除错误状态
- **WHEN** 用户点击重试或重新发送消息
- **THEN** 系统应清除之前的错误状态，重新发起请求

### Requirement: 会话管理
系统SHALL提供会话管理功能，允许用户清除对话或开始新对话。

#### Scenario: 清除对话
- **WHEN** 用户点击聊天窗口中的"清除对话"按钮
- **THEN** 系统应清空localStorage中的聊天记录，并显示欢迎提示

#### Scenario: 确认清除
- **WHEN** 用户点击清除对话按钮且当前有对话内容
- **THEN** 系统应显示确认对话框"确定要清除所有对话记录吗？"

#### Scenario: 取消清除
- **WHEN** 用户在确认对话框中点击取消
- **THEN** 系统应保持现有对话内容不变

### Requirement: AI参数配置
系统SHALL使用合理的AI模型参数配置，平衡回答质量和响应速度。

#### Scenario: Temperature设置
- **WHEN** 调用AI模型时
- **THEN** 系统应设置temperature为0.7，平衡创造性和准确性

#### Scenario: Max tokens设置
- **WHEN** 调用AI模型时
- **THEN** 系统应设置max_tokens为2000，限制回复长度

#### Scenario: 模型选择
- **WHEN** 调用AI模型时
- **THEN** 系统应使用aiService.js中配置的MODEL_NAME（当前为qwen3-8b）
