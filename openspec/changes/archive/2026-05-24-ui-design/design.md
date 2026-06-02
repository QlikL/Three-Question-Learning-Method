# 技术设计 - 三问高效学习机 UI

## 一、项目文件结构

```
project-root/
├── index.html              # 主入口页面
├── css/
│   ├── variables.css       # CSS自定义属性（主题色、间距、字体）
│   ├── reset.css           # 基础重置与全局样式
│   ├── layout.css          # 布局系统（Header/Sidebar/Content）
│   ├── components.css      # 通用组件样式（卡片、按钮、搜索框等）
│   ├── pages/
│   │   ├── home.css        # 主界面样式
│   │   ├── learning.css    # 学习空间样式
│   │   ├── assessment.css  # 测评中心样式
│   │   └── profile.css     # 个人中心样式
│   └── animations.css      # CSS过渡与动画
├── js/
│   ├── app.js              # 应用入口 - 路由初始化、全局状态
│   ├── router.js           # Hash路由管理器
│   ├── store.js            # 数据管理（IndexedDB + localStorage）
│   ├── components/
│   │   ├── searchBar.js    # 搜索框组件
│   │   ├── courseCard.js   # 课程卡片组件
│   │   ├── knowledgeGraph.js # 知识图谱Canvas绘制
│   │   ├── debatePanel.js  # 争议点对比面板
│   │   ├── materialList.js # 资料列表组件
│   │   ├── quizItem.js     # 测评题目组件
│   │   ├── radarChart.js   # 能力雷达图Canvas绘制
│   │   └── barChart.js     # 柱状图Canvas绘制
│   ├── models/
│   │   ├── course.js       # 课程数据模型
│   │   ├── knowledge.js    # 知识图谱数据模型
│   │   ├── debate.js       # 争议点数据模型
│   │   ├── quiz.js         # 测评数据模型
│   │   └── material.js     # 资料数据模型
│   ├── pages/
│   │   ├── homePage.js     # 主界面页面逻辑
│   │   ├── learningPage.js # 学习空间页面逻辑
│   │   ├── assessmentPage.js # 测评中心页面逻辑
│   │   └── profilePage.js  # 个人中心页面逻辑
│   └── mock/
│       ├── aiMock.js       # AI接口模拟（图谱生成、争议挖掘、测评生成）
│       └── dataMock.js     # 初始模拟数据
└── assets/
    └── icons/              # SVG图标（课程领域图标、操作图标等）
```

## 二、页面路由设计

使用 Hash 路由，路由表如下：

| Hash | 页面 | 说明 |
|------|------|------|
| `#/home` | 主界面 | 默认页，搜索框+引导语 |
| `#/learning/:courseId` | 学习空间 | 特定课程的学习页面 |
| `#/assessment/:courseId` | 测评中心 | 特定课程的测评页面 |
| `#/profile` | 个人中心 | 学习数据总览 |

路由管理逻辑在 `router.js` 中实现：
- 监听 `hashchange` 事件
- 解析 hash 路径与参数
- 调用对应页面模块的 `render(container)` 方法
- 更新页面标题与导航高亮状态

## 三、数据模型设计

### 3.1 Course（课程）
```javascript
{
  id: string,              // 唯一标识
  title: string,           // 课程标题/学科名称
  query: string,           // 用户原始提问
  createdAt: timestamp,    // 创建时间
  updatedAt: timestamp,    // 最近学习时间
  status: 'active' | 'completed' | 'archived',
  progress: {
    phase1: boolean,       // 第一问完成
    phase2: boolean,       // 第二问完成
    phase3: boolean        // 第三问完成
  },
  abilities: {
    concept: number,       // 概念理解 0-100
    critical: number,      // 批判思维 0-100
    practice: number       // 实践迁移 0-100
  }
}
```

### 3.2 KnowledgeGraph（知识图谱）
```javascript
{
  courseId: string,
  nodes: [
    { id, label, type, description, depth }
  ],
  edges: [
    { source, target, relation }
  ]
}
```

### 3.3 Debate（学术分歧）
```javascript
{
  courseId: string,
  topics: [
    {
      id, title,
      sideA: { label, evidences: [{ source, content }] },
      sideB: { label, evidences: [{ source, content }] },
      conclusion: string
    }
  ]
}
```

### 3.4 Quiz（测评题目）
```javascript
{
  courseId: string,
  questions: [
    {
      id, type: 'single' | 'multi' | 'judge',
      level: 'memory' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
      content: string,
      options: [{ label, content }],
      answer: string[],
      explanation: string,
      knowledgePoints: string[]
    }
  ]
}
```

### 3.5 Material（学习资料）
```javascript
{
  courseId: string,
  items: [
    {
      id, title, type: 'ai' | 'upload',
      format: 'pdf' | 'word' | 'markdown',
      source: string,
      size: number,
      uploadTime: timestamp,
      tags: string[]
    }
  ]
}
```

## 四、组件设计

### 4.1 搜索框组件（searchBar.js）
- **功能**：输入问题、点击搜索/回车触发课程创建
- **状态**：`idle`（空闲）| `loading`（生成中）| `done`（创建完成）
- **事件**：`onCourseCreate(courseId)` - 课程创建后跳转学习空间

### 4.2 课程卡片组件（courseCard.js）
- **功能**：展示课程缩略信息、进度条、雷达图缩略、右键菜单
- **属性**：`course`（课程对象）、`onClick`、`onArchive`、`onDelete`
- **菜单操作**：归档、删除、上传资料、导出

### 4.3 知识图谱组件（knowledgeGraph.js）
- **功能**：基于Canvas绘制动态知识图谱
- **交互**：节点点击展开详情、拖拽移动、滚轮缩放
- **布局**：力导向布局算法（简易实现）

### 4.4 争议点面板（debatePanel.js）
- **功能**：左右分栏展示争议双方观点
- **交互**：切换争议主题、点击证据查看详情
- **底部**：AI生成的结论总结

### 4.5 测评题目组件（quizItem.js）
- **功能**：单题展示，支持选择/判断
- **状态**：`answering` | `submitted` | `correct` | `wrong`
- **功能**：标记题目、查看解析、错题溯源链接

### 4.6 雷达图组件（radarChart.js）
- **功能**：Canvas绘制能力雷达图
- **属性**：`dimensions`（维度名数组）、`values`（得分数组）、`max`（满分）

### 4.7 柱状图组件（barChart.js）
- **功能**：Canvas绘制学科对比柱状图
- **属性**：`labels`（学科名）、`values`（得分）、`colors`

## 五、交互流程

### 5.1 课程创建流程
```
用户输入问题 → 点击搜索 → 搜索框进入loading状态
  → AI模拟生成课程数据结构（2秒延迟）
  → 课程存入IndexedDB → 自动跳转到学习空间页面
  → 在主界面新增课程卡片
```

### 5.2 三问学习流程
```
进入学习空间 → 默认展示第一问（知识图谱）
  → 用户完成第一问后 → 点击"第二问"
  → 切换至争议点面板（AI模拟生成争议数据）
  → 用户完成第二问后 → 点击"第三问"
  → 切换至测评界面（AI模拟生成测评题）
  → 全部完成后课程标记为完成
```

### 5.3 测评答题流程
```
展示题目 → 用户选择答案 → 点击提交
  → 即时判断对错 → 显示答案解析
  → 可标记题目 → 可跳转至错题对应知识节点
  → 全部完成后生成测评报告
```

## 六、IndexedDB 数据库设计

### 数据库：ThreeQuestionDB

| 对象仓库 | Key | 说明 |
|---------|-----|------|
| courses | id | 课程数据 |
| knowledgeGraphs | courseId | 知识图谱数据 |
| debates | courseId | 争议点数据 |
| quizzes | courseId | 测评数据 |
| materials | courseId | 资料数据 |

### 数据库版本管理
- version 1：创建所有对象仓库
- 后续版本通过 `onupgradeneeded` 事件扩展

## 七、模拟数据接口

在 `mock/aiMock.js` 中定义以下接口，均返回 Promise：

```javascript
// 生成课程信息
mockGenerateCourse(query) → { title, abilities, ... }

// 生成知识图谱
mockGenerateGraph(courseId) → { nodes, edges }

// 挖掘争议点
mockMineDebates(courseId) → { topics }

// 生成测评题
mockGenerateQuiz(courseId, level) → { questions }
```

每个接口使用 `setTimeout` 模拟 1-2 秒延迟，返回符合数据模型结构的模拟数据。

## 八、性能考虑
- 知识图谱Canvas渲染使用requestAnimationFrame
- 数据加载时显示骨架屏/加载指示器
- 页面切换时使用CSS过渡增强流畅感
- IndexedDB操作封装为Promise，统一错误处理
