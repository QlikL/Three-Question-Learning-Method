## 1. AI服务层重构

- [x] 1.1 在 `aiService.js` 中新增 `extractMentalModels(topic)` 方法，提示词聚焦"5个核心心智模型"，temperature=0.3，max_tokens=3000
- [x] 1.2 在 `aiService.js` 中新增 `identifyDisagreements(topic)` 方法，提示词聚焦"3个根本性分歧及最有力论据"，temperature=0.8，max_tokens=3000
- [x] 1.3 在 `aiService.js` 中新增 `generateDeepQuestions(topic)` 方法，提示词聚焦"10道区分理解与记忆的深度题"，temperature=0.6，max_tokens=4000
- [x] 1.4 在 `aiService.js` 中新增 `explainWrongAnswer(question, userAnswer, correctAnswer)` 方法，temperature=0.7，max_tokens=1000
- [ ] 1.5 ~~保留旧方法标记为 `@deprecated`~~ (用户要求只添加不删除，跳过)
- [x] 1.6 为每个新方法编写降级模拟数据生成逻辑

## 2. AI接口层更新

- [x] 2.1 在 `aiMock.js` 中新增 `mockExtractMentalModels(courseId)` 方法，自动路由到真实AI或降级数据
- [x] 2.2 在 `aiMock.js` 中新增 `mockIdentifyDisagreements(courseId)` 方法
- [x] 2.3 在 `aiMock.js` 中新增 `mockGenerateDeepQuestions(courseId)` 方法
- [x] 2.4 在 `aiMock.js` 中新增 `mockExplainWrongAnswer(question, userAnswer, correctAnswer)` 方法
- [ ] 2.5 ~~保留旧的 mock 方法标记为 `@deprecated`~~ (用户要求只添加不删除，跳过)

## 3. 数据模型更新

- [x] 3.1 更新 `debate.js` Debate 模型，新增 `coreQuestion`、`strongestArgument`、`supportingScholars`、`frontierImplication` 字段支持
- [x] 3.2 更新 `quiz.js` Quiz 模型，新增 `expectedUnderstanding`、`misconceptionHint` 字段，新增 `deep_understanding` 题型
- [x] 3.3 创建 `js/models/mentalModel.js` 心智模型数据模型类

## 4. 模拟数据更新

- [x] 4.1 在 `dataMock.js` 中新增 `getSampleMentalModels(courseId)` 方法，返回5个通用心智模型模板
- [x] 4.2 更新 `dataMock.js` 中 `getSampleDebates(courseId)` 方法，适配新的分歧数据结构
- [x] 4.3 更新 `dataMock.js` 中 `getSampleQuiz(courseId)` 方法，适配深度理解题数据结构（10道题，含 `expectedUnderstanding`）

## 5. 心智模型展示组件

- [x] 5.1 创建 `js/components/mentalModelList.js` 组件，支持卡片列表渲染、展开/折叠交互
- [x] 5.2 添加心智模型列表样式到 `css/components/`

## 6. 争议面板组件更新

- [x] 6.1 更新 `js/components/debatePanel.js`，支持渲染 `coreQuestion`、`strongestArgument`、`supportingScholars`、`frontierImplication` 新字段
- [x] 6.2 更新争议面板样式，突出"最有力论据"展示

## 7. 测评组件增强

- [x] 7.1 更新 `js/components/quizItem.js`，支持深度理解题的 `expectedUnderstanding` 和 `misconceptionHint` 展示
- [x] 7.2 在 `quizItem.js` 中实现"追问AI"按钮及交互逻辑（答错后显示，点击调用AI追问）
- [x] 7.3 实现追问AI结果的内存暂存和展示（不持久化）

## 8. 学习页面更新

- [x] 8.1 更新 `learningPage.js` 中的 `PHASES` 数组，文案对齐新框架（5个核心心智模型、3个根本性分歧、10道深度理解题）
- [x] 8.2 更新 `_renderPhase1()` 调用 `AiMock.mockExtractMentalModels()` 并使用 `MentalModelList` 组件渲染
- [x] 8.3 更新 `_renderPhase2()` 调用 `AiMock.mockIdentifyDisagreements()` 并使用更新后的 `DebatePanel` 渲染
- [x] 8.4 更新 `_renderPhase3()` 调用 `AiMock.mockGenerateDeepQuestions()` 并使用更新后的 `QuizItem` 渲染

## 9. 路由和入口更新

- [x] 9.1 在 `index.html` 中添加 `mentalModelList.js` 和 `mentalModel.js` 组件脚本引用
- [x] 9.2 更新 `assessmentPage.js` 中的测评调用，适配新的深度理解题数据

## 10. CSS样式更新

- [x] 10.1 添加心智模型列表卡片样式（展开/折叠动画、序号标记等）
- [x] 10.2 更新争议面板样式（最有力论据突出展示、学者标签等）
- [x] 10.3 添加"追问AI"按钮样式（加载态、结果展示区）
- [x] 10.4 添加深度理解题"出题意图"展示区样式

## 11. 验证测试

- [ ] 11.1 创建新课程，验证第一问正确显示5个心智模型
- [ ] 11.2 验证第二问正确显示3个分歧及双方最有力论据
- [ ] 11.3 验证第三问正确显示10道深度理解题，答错后"追问AI"功能正常
- [ ] 11.4 验证旧课程数据兼容性（进入旧课程应触发AI重新生成）
- [ ] 11.5 验证AI降级方案（断开网络时仍能显示模板数据）
