## Why

当前"三问学习法"的三问内容定义过于宽泛（知识图谱→争议点→测评），缺乏每问的具体目标和产出标准。核心三问框架将每问聚焦到明确的量化目标：5个核心心智模型、3个根本性分歧、10道深度理解测试题，使学习流程更有针对性和可衡量性，能在20分钟内帮助学习者构建完整的学科认知地图。

## What Changes

- **第一问重构**：从通用"知识图谱生成"改为"5个核心心智模型提取"，AI提示词聚焦于专家共享的底层思维框架，要求生成5个领域核心心智模型及其描述
- **第二问重构**：从通用"争议点挖掘"改为"3个根本性分歧定位"，要求AI输出各方最有力的论据，帮助学习者定位知识边界和前沿动态
- **第三问重构**：从通用"测评题生成"改为"10道深度理解测试题"，题目设计目标为区分"真正理解"和"死记硬背"，并增加错误反馈闭环（对错误答案追问AI解释原因）
- **AI服务提示词重构**：重写 `generateKnowledgeGraph()` → `extractMentalModels()`、`mineDebates()` → `identifyDisagreements()`、`generateQuiz()` → `generateDeepQuestions()`，每个函数的提示词对齐新框架的量化目标
- **学习页面UI优化**：调整三问导航的图标、标题和描述文案，使每问的目标产出更直观可见

## Capabilities

### New Capabilities

- `mental-model-extraction`: 5个核心心智模型提取功能，AI生成领域专家共享的底层思维框架
- `fundamental-disagreements`: 3个根本性分歧定位功能，AI输出各方立场及最有力论据
- `deep-understanding-test`: 10道深度理解测试题生成功能，区分真正理解与死记硬背，包含错误反馈闭环

### Modified Capabilities

- `ai-chat-integration`: AI消息发送和响应处理需要适配新的三问提示词，温度参数和max_tokens需按新问题类型调整（心智模型提取需更低温度以保证准确性，分歧挖掘需更高温度以体现多样性）

## Impact

**受影响代码：**
- `js/services/aiService.js` - 重写三个核心AI生成函数的方法名和提示词
- `js/mock/aiMock.js` - 同步更新模拟数据生成逻辑
- `js/pages/learningPage.js` - 更新三问导航文案和阶段渲染逻辑
- `css/pages/learning.css` - 可能需要调整新UI元素的样式
- `js/models/debate.js` - 可能需要调整争议数据结构以支持"各方最有力论据"
- `js/models/quiz.js` - 可能需要扩展题目模型以支持"错误反馈"追问功能

**新增功能：**
- 5个核心心智模型的AI生成和展示
- 3个根本性分歧的定位和各方针锋相对的论据展示
- 10道深度理解题的生成，含错误反馈闭环（答错后AI追问解释）

**数据层：**
- `js/store.js` - 可能需要新增心智模型、分歧数据的存储对象
- IndexedDB - 新增心智模型和分歧数据的持久化
