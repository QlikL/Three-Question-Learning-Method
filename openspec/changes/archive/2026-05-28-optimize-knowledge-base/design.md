## Context

知识库页面（knowledgeRepositoryPage）当前有两个资料区块：AI补充资料和用户上传资料。AI补充资料目前只包含网上文献链接（通过AiMock.mockGenerateMaterials生成），不包含AI自主生成的总结文档。页面布局中，用户上传区域（拖拽上传区）在上方，资料列表在下方。资料详情弹窗对网上文献只显示跳转链接，对上传文件显示下载按钮。

## Goals / Non-Goals

**Goals:**
- AI能够根据课程内容生成1-2份结构化总结文档，以docx格式提供下载
- AI总结资料在知识库中带有"AI总结资料"专属标签，区别于网上文献
- 网上文献类资料不再显示文件大小（不可下载的资料显示大小无意义）
- 页面布局调整：AI补充资料模块在上，用户上传模块在下
- AI总结资料详情弹窗支持"在窗口打开"预览和"下载docx"两个操作

**Non-Goals:**
- 不实现服务端AI调用，仍使用前端模拟数据（AiMock）
- 不实现docx文件的真实服务端生成，使用前端docx库（如docx.js）在浏览器端生成
- 不修改IndexedDB存储结构，复用现有material items数组
- 不修改用户上传文件的功能逻辑

## Decisions

### 1. AI总结文档生成方案

**选择：** 前端使用 `docx` npm库（或CDN引入）在浏览器端生成docx文件

**理由：**
- 项目当前无后端服务，所有AI逻辑都在前端模拟
- docx库支持在浏览器端直接生成Word文档
- 生成的Blob可以直接用于下载和预览

**替代方案：**
- 使用纯文本/Markdown作为总结格式 → 用户体验差，不支持富文本排版
- 引入后端服务生成docx → 架构改动过大，超出当前范围

### 2. AI总结资料数据模型

**选择：** 在现有material items数组中新增 `type: 'ai-summary'` 类型

```
{
  id: 'ai_summary_xxx',
  title: '课程核心知识总结',
  type: 'ai-summary',
  format: 'docx',
  source: 'AI 生成',
  tags: ['AI总结资料'],
  content: '...',       // 纯文本/Markdown内容，用于生成docx
  size: null,           // 动态计算
  url: null             // 无外部链接
}
```

**理由：** 复用现有数据结构，无需修改Store层，最小化变更范围

### 3. docx文件预览方案

**选择：** 详情弹窗中使用iframe或div渲染纯文本/HTML预览，同时提供下载docx按钮

**理由：**
- 浏览器原生不支持docx预览，需要转为HTML展示
- AI生成的内容先以Markdown/HTML存储，预览时直接渲染HTML
- 下载时再通过docx库转为docx格式

### 4. 页面布局调整

**选择：** 在 `_renderLayout` 方法中，将资料列表区域（repo-content）移到上传区域（upload-section）之前

**理由：** 纯DOM顺序调整，无逻辑变更，风险最低

## Risks / Trade-offs

- **[docx库体积]** docx库约100KB，会增加页面加载体积 → 使用CDN引入，延迟加载，仅在需要下载时才加载
- **[AI总结质量]** 前端模拟的总结内容质量有限 → 使用预设的高质量模板内容，确保演示效果
- **[浏览器兼容]** Blob和URL.createObjectURL在现代浏览器均支持 → 不考虑IE11等老旧浏览器
