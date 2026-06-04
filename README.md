# 三问高效学习法

以用户提问为核心触发机制的智能学习工具，通过"三问认知引擎"帮助用户从问题提出到深度理解，构建完整的认知闭环。

> GitHub 仓库：https://github.com/QlikL/Three-Question-Learning-Method.git

## 核心理念

**三问法**：围绕用户提出的任何学习问题，自动生成个性化课程，并通过三个递进阶段引导深度学习：

1. **第一问：核心心智模型** — 提取学科底层逻辑框架，以动态知识图谱呈现核心概念及关联
2. **第二问：根本性分歧** — 挖掘学术界的争议点，对比正反方观点与证据
3. **第三问：深度理解测评** — 基于布鲁姆认知层级生成自测题，验证理解深度

## 功能特性

| 功能模块 | 说明 |
|---------|------|
| 智能课程生成 | 输入学习问题，AI自动生成课程标题、学科分类、六维能力评估 |
| 知识图谱可视化 | 分层辐射式布局，支持拖拽、缩放，点击节点可查看详细信息或调用AI详解 |
| 根本性分歧探索 | 正反方观点对比，附带学术引用和支撑论据 |
| 深度理解测评 | 单选题+判断题自测，涵盖记忆/理解/应用/分析/评价/创造六个认知层级 |
| 六维能力体系 | 批判思维、创新创造、系统思维、实践应用、元认知、知识关联 |
| 知识库管理 | AI智能总结文档 + 用户上传资料（PDF/DOC/DOCX/TXT/MD），支持预览和删除 |
| AI助手聊天 | 全局AI对话面板，支持上下文关联，可从多处入口触发 |
| 课程导入导出 | 导出课程为JSON文件（含全部关联数据），从JSON文件导入课程 |
| 个人中心 | 能力雷达图、学科能力柱状图、课程评分、学习数据总览（基于已完成课程统计） |
| 课程学习评估 | 基于五维度评估当前课程学习情况（AI咨询/学习进度/测验表现/资料阅读/资料上传），生成AI评估报告 |
| 设置页面 | AI多服务商配置、主题切换、学习偏好、数据管理 |
| AI多服务商支持 | 支持阿里云百炼、百度文心、讯飞星火、智谱AI、腾讯混元、月之暗面Kimi、DeepSeek及自定义OpenAI兼容接口 |
| 已保存模型管理 | 保存多个AI模型配置，一键切换 |
| 深色/浅色模式 | 全局主题切换，CSS变量驱动 |
| 流光效果背景 | 浅色模式下全屏动态渐变流光背景（8层叠加动画），支持设置页面开关控制，默认开启 |
| 首次使用引导 | 未配置AI时首页自动提示 |
| 内置弹窗系统 | 自定义Dialog组件替代浏览器原生弹窗，支持alert/confirm/toast |
| 自定义下拉选择器 | CustomSelect组件替代原生select，统一样式风格 |
| 后台预生成 | 进入课程后第一问优先加载，后台并行预生成第二问、第三问和知识库 |
| 每服务商多模型 | 每个服务商支持选择预设模型或手动输入其他模型 |
| 数据库查看器 | 独立页面浏览 IndexedDB 和 localStorage 数据（db-viewer.html） |
| 本地数学公式渲染 | 纯本地轻量实现，支持LaTeX公式（上标/下标/希腊字母/数学符号/分式/根号），无外部CDN依赖 |
| 视频资源推荐 | AI推荐国内主流视频平台学习资源（B站/中国大学MOOC/慕课网等） |
| 评估数据去重 | AI咨询同一知识点只计一次、资料阅读同一资料只计一次、测验每次结果独立记录 |

## 快速开始

### 1. 配置 AI 服务

项目支持多服务商 AI 配置。首次打开时首页会提示"首次使用先配置AI模型哦"。

进入 **个人中心 → 设置（⚙）→ AI 模型配置**，选择服务商、输入 API Key、选择模型后点击"保存配置"。

支持的服务商：
- 阿里云百炼（通义千问）
- 百度文心一言
- 讯飞星火
- 智谱AI（ChatGLM）
- 腾讯混元
- 月之暗面 Kimi
- DeepSeek
- 自定义（OpenAI兼容接口）

如不配置，项目会自动降级为模拟数据模式，仍可体验完整功能流程。

### 2. 启动项目

**方式一：直接打开**
- 双击 `index.html` 即可在浏览器中运行

**方式二：本地服务器（推荐）**
- 使用 VS Code 的 Live Server 插件
- 或使用任意 HTTP 服务器指向项目根目录

## 项目结构

```
Three-Question Learning Method/
├── index.html                  # 入口文件
├── AI配置指南.md               # AI服务配置说明
├── HomeWork.md                 # 产品需求文档
├── clear-cache.html            # 缓存清理工具
├── db-viewer.html              # 数据库查看器（IndexedDB + localStorage）
├── assets/
│   └── icons/                  # 图标资源
├── css/
│   ├── variables.css           # CSS变量定义（含深色模式）
│   ├── reset.css               # 样式重置
│   ├── layout.css              # 布局样式
│   ├── components.css          # 组件样式（Dialog弹窗、CustomSelect下拉）
│   ├── animations.css          # 动画样式
│   ├── components/
│   │   ├── aiChatWidget.css    # AI聊天组件样式
│   │   └── assessmentDialog.css # 评估报告弹窗样式
│   └── pages/
│       ├── home.css            # 首页样式
│       ├── learning.css        # 学习空间样式
│       ├── assessment.css      # 测评页面样式
│       ├── knowledgeRepository.css  # 知识库样式
│       ├── profile.css         # 个人中心样式
│       └── settings.css        # 设置页面样式
└── js/
    ├── app.js                  # 应用入口（路由注册、AI配置恢复、主题恢复）
    ├── router.js               # 路由管理
    ├── mathRenderer.js         # 本地数学公式渲染器（LaTeX→Unicode/HTML）
    ├── store.js                # 数据存储（IndexedDB + localStorage）
    ├── components/
    │   ├── dialog.js           # 内置弹窗组件（alert/confirm/toast）
    │   ├── searchBar.js        # 搜索框组件
    │   ├── courseCard.js       # 课程卡片组件
    │   ├── knowledgeGraph.js   # 知识图谱渲染（Canvas 2D）
    │   ├── mentalModelList.js  # 心智模型列表
    │   ├── debatePanel.js      # 争议点面板
    │   ├── quizItem.js         # 测评题目组件
    │   ├── materialList.js     # 资料列表组件
    │   ├── aiChatWidget.js     # AI聊天组件
    │   ├── radarChart.js       # 能力雷达图（Canvas）
    │   ├── barChart.js         # 学科柱状图（Canvas）
    │   ├── customSelect.js     # 自定义下拉选择器
    │   └── assessmentDialog.js # 课程学习评估弹窗
    ├── models/
    │   ├── course.js           # 课程模型（六维能力体系）
    │   ├── knowledge.js        # 知识图谱模型
    │   ├── mentalModel.js      # 心智模型模型
    │   ├── debate.js           # 争议点模型
    │   ├── quiz.js             # 测评模型
    │   └── material.js         # 资料模型
    ├── pages/
    │   ├── homePage.js         # 首页（我的课程）
    │   ├── learningPage.js     # 学习空间
    │   ├── assessmentPage.js   # 测评中心
    │   ├── knowledgeRepositoryPage.js  # 知识库
    │   ├── profilePage.js      # 个人中心
    │   └── settingsPage.js     # 设置页面
    ├── services/
    │   ├── aiService.js        # AI服务（多服务商支持）
    │   └── assessmentDataService.js # 评估数据服务
    └── mock/
        ├── aiMock.js           # AI模拟接口
        └── dataMock.js         # 示例数据
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vanilla JavaScript（无框架依赖） |
| 页面渲染 | HTML5 + CSS3 + Canvas 2D |
| 数据存储 | IndexedDB（主存储）+ localStorage（设置/主题），纯浏览器内置存储，无需额外部署数据库或文件池 |
| AI服务 | 多服务商支持（阿里云百炼/百度文心/讯飞星火/智谱AI/腾讯混元/月之暗面/DeepSeek/自定义） |
| 图表渲染 | Canvas 2D 自绘（雷达图/柱状图/知识图谱） |
| 路由管理 | 自实现 Hash Router |
| 主题系统 | CSS变量 + data-theme 属性切换 |

## 本地调试工具

项目提供两个独立的调试工具页面，直接在浏览器中打开即可使用：

### 数据管理工具（clear-cache.html）

用于管理应用的本地数据，适合调试和排查问题：

| 功能 | 说明 |
|------|------|
| 列出所有课程 | 查看 IndexedDB 中存储的所有课程信息 |
| 清除所有知识图谱 | 清除图谱缓存，使 AI 重新生成 |
| 删除所有课程 | 删除全部课程及关联数据（知识图谱、争议点、测评、资料） |
| 查看当前设置 | 显示 AI 服务商、模型、API Key 状态、已保存模型列表 |
| 重置所有设置 | 清除 AI 配置、主题、学习偏好等设置 |
| 测试 AI 连接 | 直接调用 AI 接口验证配置是否正确 |
| 清除所有数据 | 一键清空 IndexedDB 和 localStorage 全部数据 |

### 数据库查看器（db-viewer.html）

独立页面浏览和管理 IndexedDB 与 localStorage 数据：

| 功能 | 说明 |
|------|------|
| IndexedDB 浏览 | 查看所有 object store 中的数据记录 |
| localStorage 浏览 | 查看所有 localStorage 键值对 |
| 数据搜索 | 按关键词搜索数据内容 |
| 数据编辑 | 支持查看和编辑单条记录 |
| 主题适配 | 自动跟随应用的深色/浅色主题 |

## AI 开发工具

本项目使用以下 AI 辅助开发工具进行代码生成、调试和优化：

| 工具 | 说明 |
|------|------|
| **Trae IDE** | 字节跳动推出的 AI 原生集成开发环境，内置 AI 助手 |
| **阿里云灵码** | 阿里云推出的 AI 编程助手，提供代码补全和对话能力 |
| **OpenCode** | 开源 AI 编程工具，支持多模型切换 |

## 使用的大语言模型

项目开发过程中使用了以下大语言模型：

| 模型 | 说明 |
|------|------|
| `mimo-v2.5-pro` | 小米 MiMo 系列高性能推理模型 |
| `mimo-v2.5` | 小米 MiMo 系列通用模型 |
| `deepseek-v4-pro` | DeepSeek V4 系列高性能模型 |
| `deepseek-v4-flash` | DeepSeek V4 系列快速响应模型 |

## 六维能力体系

| 维度 | ID | 说明 |
|------|----|------|
| 批判思维 | critical | 质疑假设、评估证据、识别偏见 |
| 创新创造 | creative | 联想发散、重构问题、生成新方案 |
| 系统思维 | systems | 全局观、识别模式、理解反馈回路 |
| 实践应用 | practical | 理论转化、情境迁移、动手验证 |
| 元认知 | metacognitive | 自我监控、策略调整、反思复盘 |
| 知识关联 | connection | 跨域联想、类比推理、知识网络 |

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

本项目仅供学习使用。
