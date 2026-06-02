## Why

知识库页面存在三个体验问题：1) AI补充资料只包含网上文献链接，缺少AI自主生成的课程总结文档，用户无法获取结构化的学习总结；2) 网上文献类资料无法下载，但仍显示文件大小，造成困惑；3) 页面布局不合理，用户上传区域在上方、AI资料在下方，应该将AI资料放在更显眼的位置。

## What Changes

- **新增**：AI自主生成课程总结文档功能，生成一份或多份docx格式的总结资料，带有"AI总结资料"标签
- **新增**：AI总结资料的详情弹窗支持"打开"（在窗口内预览）和"下载"（下载docx文件）功能
- **修改**：移除网上文献类资料的文件大小显示（此类资料不可下载，显示大小无意义）
- **修改**：调整知识库页面布局顺序，AI补充资料模块移至上方，用户上传模块移至下方

## Capabilities

### New Capabilities
- `ai-summary-documents`: AI根据课程内容自主生成总结文档，支持在知识库中展示、预览和下载docx格式文件

### Modified Capabilities
- `knowledge-repository-page`: 调整页面布局顺序，AI补充资料模块置顶，用户上传模块移至底部

## Impact

**受影响代码：**
- `js/components/materialList.js` - 修改资料渲染逻辑：移除网上文献的文件大小、AI总结资料标签、详情弹窗增加打开/下载按钮
- `js/pages/knowledgeRepositoryPage.js` - 调整页面布局顺序，AI资料区域在上、上传区域在下
- `js/mock/aiMock.js` - 新增AI生成总结文档的模拟逻辑
- `js/services/aiService.js` - 可能新增AI生成总结文档的prompt
- `css/pages/knowledgeRepository.css` - 新增AI总结资料卡片和预览弹窗样式

**数据影响：**
- 资料数据模型新增 `type: 'ai-summary'` 类型，包含 `content`（文档内容）字段用于生成docx
- IndexedDB 存储结构无需变更，复用现有 material items 数组
