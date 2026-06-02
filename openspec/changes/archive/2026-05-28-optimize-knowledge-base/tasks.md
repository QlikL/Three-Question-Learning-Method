## 1. AI总结文档数据生成

- [x] 1.1 在 `js/mock/aiMock.js` 中新增 `mockGenerateSummaryDocuments(courseId)` 方法
- [x] 1.2 实现根据课程主题生成1-2份AI总结文档的数据结构（type: 'ai-summary', format: 'docx', tags: ['AI总结资料']）
- [x] 1.3 编写高质量的总结文档内容模板（包含章节标题、核心知识点、要点总结等结构化内容）
- [x] 1.4 在 `mockGenerateMaterials` 方法中调用 `mockGenerateSummaryDocuments`，将AI总结文档合并到资料列表

## 2. 资料列表组件修改

- [x] 2.1 修改 `js/components/materialList.js` 的 `_renderSection` 方法，移除网上文献（type: 'ai'）的文件大小显示
- [x] 2.2 为AI总结资料（type: 'ai-summary'）添加紫色"AI总结资料"专属徽章标签
- [x] 2.3 为AI总结资料显示文件大小（动态计算content长度）
- [x] 2.4 修改AI总结资料的卡片图标为区别于网上文献的图标

## 3. 详情弹窗改造

- [x] 3.1 修改 `js/components/materialList.js` 的 `showPreview` 方法，新增AI总结资料（type: 'ai-summary'）的弹窗逻辑
- [x] 3.2 弹窗中实现"打开"按钮：在弹窗内渲染文档HTML内容进行预览
- [x] 3.3 弹窗中实现"下载"按钮：将文档内容转换为docx格式并触发下载
- [x] 3.4 实现docx文件生成逻辑（使用docx库或纯前端方案生成Word文档）
- [x] 3.5 实现Markdown/纯文本内容转HTML的渲染函数，用于弹窗内预览
- [x] 3.6 设置下载文件名为"{课程标题}_AI总结.docx"

## 4. 页面布局调整

- [x] 4.1 修改 `js/pages/knowledgeRepositoryPage.js` 的 `_renderLayout` 方法
- [x] 4.2 将资料列表区域（repo-content）移到上传区域（upload-section）之前
- [x] 4.3 确保AI补充资料模块在页面上方，用户上传模块在页面下方

## 5. 样式适配

- [x] 5.1 在 `css/pages/knowledgeRepository.css` 中新增AI总结资料卡片的专属样式
- [x] 5.2 新增AI总结资料详情弹窗的预览区域样式（文档内容渲染区）
- [x] 5.3 新增"打开"和"下载"按钮的样式（复用现有btn样式）
- [x] 5.4 确保弹窗内文档预览区域支持滚动查看长文档

## 6. 测试验证

- [x] 6.1 测试AI总结文档是否正确生成并在知识库中显示
- [x] 6.2 测试AI总结资料卡片的标签和文件大小显示
- [x] 6.3 测试详情弹窗的"打开"按钮是否正确预览文档内容
- [x] 6.4 测试详情弹窗的"下载"按钮是否正确下载docx文件
- [x] 6.5 测试网上文献类资料是否已移除文件大小显示
- [x] 6.6 测试页面布局是否正确（AI资料在上，用户上传在下）
- [x] 6.7 测试整体页面在不同屏幕尺寸下的显示效果
