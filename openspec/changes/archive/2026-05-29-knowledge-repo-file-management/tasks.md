# 实现任务清单

## 1. 资料删除功能

- [x] 1.1 在 `js/components/materialList.js` 的 `showPreview()` 方法中，为用户上传资料（isUpload）的弹窗添加"删除"按钮
- [x] 1.2 实现 `deleteMaterial(materialId)` 方法：从 `_materialData.items` 中移除指定条目，保存到 IndexedDB，关闭弹窗，重新渲染列表
- [x] 1.3 删除前弹出 `confirm` 确认对话框，显示文件名防止误操作
- [x] 1.4 在 `css/components.css` 中添加 `.btn-danger` 样式（红色背景/边框）

## 2. 文件预览功能

- [x] 2.1 在 `js/components/materialList.js` 中实现 `_renderUploadPreview(materialData)` 方法，根据文件格式分发到不同的预览逻辑
- [x] 2.2 实现 TXT 文件预览：Base64解码文本内容，在预览区域以 `<pre>` 标签展示
- [x] 2.3 实现 MD 文件预览：Base64解码后通过 `_markdownToHtml` 渲染，复用AI总结文档的预览样式
- [x] 2.4 实现 PDF 文件预览：Base64转Blob转ObjectURL，使用 `<iframe>` 嵌入PDF查看器
- [x] 2.5 实现 DOC/DOCX 降级预览：显示文件信息提示 + 下载按钮，提示"Word文档请下载后查看"
- [x] 2.6 修改 `showPreview()` 的 isUpload 分支，替换为带预览区域的UI（仿照ai-summary样式：顶部文件信息、中间预览区、底部操作按钮）

## 3. 课程卡片上传跳转

- [x] 3.1 修改 `js/components/courseCard.js` 的 `case 'upload':` 分支，将 alert 替换为 `Router.navigate('/knowledge/' + course.id + '?upload=true')`
- [x] 3.2 修改 `js/pages/knowledgeRepositoryPage.js` 的 `render()` 方法，在页面加载完成后检测 `Router.currentParams.upload` 参数
- [x] 3.3 当检测到 `upload=true` 时，延迟调用 `document.getElementById('file-input').click()` 自动打开文件选择器
- [x] 3.4 确认 Router 的参数解析支持 `?upload=true` 格式（已修改 `_parseHash` 方法添加查询参数解析）

## 4. 样式和体验优化

- [x] 4.1 预览弹窗使用内联样式，已确保响应式（max-height + overflow-y: auto）
- [x] 4.2 PDF预览 iframe 设置 height:500px
- [x] 4.3 删除操作后自动刷新列表（通过重新渲染实现即时反馈）
