## ADDED Requirements

### Requirement: 深度理解题AI生成
系统SHALL调用AI服务生成10道深度理解测试题，题目设计目标为区分"真正理解"和"死记硬背"。

#### Scenario: 成功生成10道题
- **WHEN** 用户进入第三问学习阶段，AI服务可用
- **THEN** 系统应调用 `AiService.generateDeepQuestions()` 并返回恰好10道题，每题包含 `question`、`expectedUnderstanding`、`answer`、`explanation`、`misconceptionHint` 字段

#### Scenario: AI返回数量不足
- **WHEN** AI返回的题目数量不足10道
- **THEN** 系统应降级使用领域通用深度理解题模板补足到10道

#### Scenario: AI调用失败降级
- **WHEN** AI服务调用失败或超时
- **THEN** 系统应使用内置的通用深度理解题模板（含10道模板题），并显示提示"AI服务暂不可用，已为您提供通用深度理解测试题"

#### Scenario: 每题附带出题意图
- **WHEN** AI生成题目时
- **THEN** 每道题MUST包含 `expectedUnderstanding` 字段，说明该题考察什么深层理解

#### Scenario: Temperature参数设置
- **WHEN** 调用 `generateDeepQuestions()` 时
- **THEN** 系统应设置 `temperature` 为 0.6，平衡题目创意和结构规范

### Requirement: 错误反馈闭环
系统SHALL在用户答错深度理解题时提供"追问AI"功能，获取针对该错误的个性化解释。

#### Scenario: 显示追问AI按钮
- **WHEN** 用户提交答案后判定为错误
- **THEN** 系统应在解析区显示"追问AI：为什么我会错？"按钮

#### Scenario: 点击追问AI
- **WHEN** 用户点击"追问AI"按钮
- **THEN** 系统应调用 `AiService.explainWrongAnswer()` 传入题目内容、用户选择的答案和正确答案，获取个性化解释

#### Scenario: 显示AI反馈
- **WHEN** AI返回错误解释
- **THEN** 系统应在解析区追加显示AI反馈内容，说明错误原因和遗漏的关键概念

#### Scenario: 追问AI失败降级
- **WHEN** AI追问调用失败
- **THEN** 系统应显示原有答案解析，不展示追问结果

#### Scenario: 追问结果暂存内存
- **WHEN** 用户刷新页面
- **THEN** 追问AI的结果应被清除，不持久化到 IndexedDB

### Requirement: 深度理解题展示与交互
系统SHALL以题目列表形式展示深度理解题，支持选择答案、提交判断和查看解析。

#### Scenario: 渲染题目列表
- **WHEN** 深度理解题数据加载完成
- **THEN** 系统应以卡片列表形式渲染10道题，每题显示题目内容和选项

#### Scenario: 每题独立判定
- **WHEN** 用户为某道题选择答案并提交
- **THEN** 系统应独立判定该题正确性，高亮正确/错误选项，并显示该题的答案解析

#### Scenario: 显示出题意图
- **WHEN** 用户查看答案解析时
- **THEN** 系统应在解析下方显示"出题意图"区域，展示 `expectedUnderstanding` 内容

#### Scenario: 测评完成报告
- **WHEN** 用户完成全部10道题的作答
- **THEN** 系统应显示测评报告，包含正确率、错题列表、以及每条错题的"追问AI"入口

### Requirement: 深度理解题数据持久化
系统SHALL将深度理解题数据保存到 IndexedDB，以 courseId 为主键。

#### Scenario: 保存题目数据
- **WHEN** AI成功返回深度理解题数据
- **THEN** 系统应将数据保存到 IndexedDB 的 `quizzes` 对象仓库（复用现有仓库），key 为 `courseId`

#### Scenario: 读取缓存的题目数据
- **WHEN** 用户再次进入同一课程的第三问
- **THEN** 系统应先从 IndexedDB 读取缓存数据，如存在则直接展示，不再调用AI
