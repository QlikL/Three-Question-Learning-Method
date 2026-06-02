## MODIFIED Requirements

### Requirement: 聊天窗口展开与收起
系统SHALL支持聊天窗口的展开和收起操作，点击按钮切换窗口状态，并支持通过外部调用方式打开窗口。

#### Scenario: 点击按钮展开窗口
- **WHEN** 用户点击悬浮聊天按钮
- **THEN** 系统应展开聊天窗口，显示消息列表和输入框

#### Scenario: 点击按钮收起窗口
- **WHEN** 用户点击已展开的聊天窗口头部或按钮
- **THEN** 系统应收起聊天窗口，仅显示悬浮按钮

#### Scenario: 窗口最小化按钮
- **WHEN** 聊天窗口处于展开状态
- **THEN** 窗口头部应显示最小化按钮，点击后收起窗口

#### Scenario: 外部调用打开并发送消息
- **WHEN** 外部组件调用 `AiChatWidget.openWithMessage(message)` 方法
- **THEN** 系统应展开聊天窗口，并自动将message作为用户消息发送

#### Scenario: 外部调用时聊天窗口已展开
- **WHEN** 聊天窗口已处于展开状态且外部调用 `openWithMessage(message)`
- **THEN** 系统应直接将message作为用户消息发送，无需重新展开窗口
