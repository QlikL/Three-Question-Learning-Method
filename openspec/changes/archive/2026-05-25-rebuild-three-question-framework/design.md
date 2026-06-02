## Context

当前项目的"三问学习法"已经实现了基础的三阶段学习流程（知识图谱→争议点→测评），但每问的AI提示词过于泛化，缺乏明确的数量化目标和产出标准。用户提供了一套更精确的核心三问框架，每问都有具体的量化指标：
- 第一问：5个核心心智模型
- 第二问：3个根本性分歧（含各方最有力论据）
- 第三问：10道深度理解测试题（含错误反馈闭环）

项目技术栈：纯前端（HTML/CSS/JS），数据层使用 IndexedDB + localStorage，AI服务对接阿里云百炼（qwen3-8b）。

## Goals / Non-Goals

**Goals:**
- 重写三问的AI提示词，使每问输出对齐新框架的量化目标
- 更新AI服务函数命名和参数，反映新框架语义
- 调整学习页面UI文案，清晰展示每问目标
- 为第三问增加错误反馈闭环（答错后可追问AI解释）
- 保持向后兼容：旧课程数据仍可显示，只是重新进入学习流程时会按新提示词重新生成

**Non-Goals:**
- 不改变首页课程创建流程
- 不改变知识库页面
- 不改变个人中心/测评中心独立页面
- 不改变AI聊天悬浮组件
- 不修改阿里云百炼API配置

## Decisions

### 1. AI函数重命名策略：原地重构而非新增

**决策**：重命名现有三个AI方法，而非创建新方法保留旧的。

**理由**：
- 旧的三问提示词是过渡版本，没有保留价值
- 保持 `AiService` 接口简洁，避免方法膨胀
- `AiMock` 作为代理层会自动路由到新方法

**方法映射**：
```
generateKnowledgeGraph() → extractMentalModels()   // 提取5个核心心智模型
mineDebates()            → identifyDisagreements() // 定位3个根本性分歧
generateQuiz()           → generateDeepQuestions() // 生成10道深度理解题
```

### 2. 第一问：5个核心心智模型的数据结构

**决策**：使用新数据结构，与旧知识图谱节点/边结构分离。

```js
// 新结构：MentalModel
{
  courseId: string,
  mentalModels: [
    {
      id: "mm_1",
      name: "心智模型名称",
      description: "该心智模型的简要描述（50字内）",
      principle: "底层第一性原理阐述",
      application: "该模型如何帮助理解领域问题"
    }
    // ... 共5个
  ]
}
```

**理由**：心智模型与知识图谱是不同层次的知识表示——心智模型是"思维框架"，知识图谱是"概念网络"。但保留知识图谱组件 `KnowledgeGraphRenderer` 在后端继续可用，通过一个新组件 `MentalModelList` 展示心智模型。

### 3. 第二问：3个分歧的数据结构扩展

**决策**：扩展现有 `Debate` 模型，增强各方论据的描述力。

```js
// 分歧项增强结构
{
  id: string,
  title: "分歧主题",
  coreQuestion: "核心争议问题（一句话）",
  sideA: {
    label: "立场A名称",
    strongestArgument: "最有力论据（100-150字）",
    supportingScholars: ["代表学者/学派"]
  },
  sideB: {
    label: "立场B名称",
    strongestArgument: "最有力论据（100-150字）",
    supportingScholars: ["代表学者/学派"]
  },
  frontierImplication: "该分歧对领域前沿的启示"
}
```

**理由**：新框架强调"各方最有力的论据"，需要比原来简单的 `evidences` 数组更强的结构化描述。增加 `strongestArgument` 和 `supportingScholars` 字段。

### 4. 第三问：深度理解题 + 错误反馈闭环

**决策**：扩展 `Quiz` 模型，新增 `deepUnderstanding` 题型属性，并为错题增加"追问AI"入口。

```js
// 深度理解题扩展
{
  id: string,
  type: "deep_understanding",  // 新题型
  question: "题目内容（设计为区分理解vs记忆）",
  expectedUnderstanding: "出题意图说明（这道题考察什么深层理解）",
  answer: "正确答案",
  explanation: "为什么这个答案体现深层理解",
  misconceptionHint: "选错通常意味着什么误解"
}
```

**错误反馈闭环**：答错后在解析区增加"追问AI"按钮，点击后调用 `AiService.explainWrongAnswer()` 获取针对该错误的个性化解释。

### 5. AI提示词温度参数调整

| 函数 | temperature | 理由 |
|------|------------|------|
| `extractMentalModels()` | 0.3 | 心智模型需要高准确性和一致性 |
| `identifyDisagreements()` | 0.8 | 分歧挖掘需要多样性视角 |
| `generateDeepQuestions()` | 0.6 | 题目设计需要创意但结构规范 |
| `explainWrongAnswer()` | 0.7 | 解释需要灵活变通 |

### 6. UI文案更新策略

**决策**：仅更新 `learningPage.js` 中的 `PHASES` 数组和少量渲染文案，不改变布局结构。

```js
PHASES: [
    { key: 'phase1', title: '第一问', subtitle: '5个核心心智模型', icon: '🧠' },
    { key: 'phase2', title: '第二问', subtitle: '3个根本性分歧', icon: '⚔️' },
    { key: 'phase3', title: '第三问', subtitle: '10道深度理解题', icon: '🎯' }
]
```

### 7. IndexedDB 兼容策略

**决策**：Store 层不改动 objectStore 名称（`knowledgeGraphs`、`debates`、`quizzes`），仅写入新结构数据。旧数据在读取时会因结构不匹配而走重新生成逻辑，自然完成迁移。

**理由**：避免 IndexedDB 版本升级的复杂性，利用现有缓存失效逻辑自动刷新。

## Risks / Trade-offs

- **[风险] AI生成的心智模型质量不稳定**：qwen3-8b 对某些冷门领域可能无法生成高质量的心智模型 → 通过精心设计的提示词和多轮 temperature 测试来降低，并在降级方案中提供通用领域的心智模型模板
- **[风险] 深度理解题的"区分度"难以保证**：AI可能生成仍然偏向记忆的题目 → 提示词中明确要求每题附带 `expectedUnderstanding` 说明出题意图，便于人工审核和调优
- **[权衡] 知识图谱组件保留但第一问不再使用**：`KnowledgeGraphRenderer` 组件保留在代码库中但不再绑定到三问流程的第一问。如果未来需要，可通过路由或其他入口调用
- **[风险] 旧课程数据不兼容**：已缓存在 IndexedDB 中的旧格式数据会在读取时因字段缺失而触发重新生成，用户会看到加载过程，但不会丢失功能

## Migration Plan

1. **代码部署**：一次性部署所有修改（AI服务 + 数据模型 + UI文案）
2. **数据迁移**：无手动迁移。旧数据自然过期，用户下次进入三问流程时自动调用新AI方法重新生成
3. **回滚方案**：Git revert 到部署前的 commit。旧格式数据仍在 IndexedDB 中，回滚后可直接读取
4. **验证方式**：创建新课程 → 走完三问流程 → 检查每问是否正确显示5个模型/3个分歧/10道题

## Open Questions

- 心智模型展示组件是复用 `KnowledgeGraphRenderer` 还是新建 `MentalModelList`？建议新建，因为展示形式差异大（列表式 vs 图谱式）
- 错误反馈闭环的AI追问是否需要独立存储？建议暂存内存，刷新后丢失，避免 IndexedDB 膨胀
