## MODIFIED Requirements

### Requirement: 聊天记录持久化
系统SHALL将当前会话的聊天记录保存到localStorage，刷新页面后恢复。同时，系统SHALL记录用户点击"去问AI"按钮的次数，用于课程学习评估。

#### Scenario: 保存聊天记录
- **WHEN** 用户发送或接收消息
- **THEN** 系统应将消息保存到localStorage，key为`ai_chat_messages`

#### Scenario: 恢复聊天记录
- **WHEN** 用户刷新页面并打开聊天窗口
- **THEN** 系统应从localStorage读取聊天记录并显示在消息列表中

#### Scenario: 限制消息数量
- **WHEN** 聊天记录超过50条
- **THEN** 系统应保留最近50条消息，删除更早的消息

#### Scenario: 记录AI咨询次数
- **WHEN** 用户点击"去问AI"按钮
- **THEN** 系统应增加该课程对应的AI咨询次数计数器

#### Scenario: 存储AI咨询次数
- **WHEN** AI咨询次数更新
- **THEN** 系统应将次数存储在localStorage中，key为`ai_consultation_count_<courseId>`
