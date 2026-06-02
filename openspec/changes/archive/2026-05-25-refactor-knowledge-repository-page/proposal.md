## Why

当前学习空间页面将知识图谱、争议点、测评和复合知识库全部整合在一个页面中，导致页面过长、信息过载。用户在学习过程中需要频繁滚动查看不同模块，体验不佳。将复合知识库独立为单独页面，可以提升学习专注度，同时为知识库提供更丰富的功能空间。

## What Changes

- **移除**：从学习空间页面（learningPage）中移除复合知识库模块
- **新增**：创建独立的知识库页面（knowledgeRepositoryPage）
- **新增**：在"我的课程"列表中的每个课程卡片上添加"资料"图标按钮
- **新增**：支持用户上传本地文件到知识库
- **修改**：路由系统添加知识库页面路由（#/knowledge/:courseId）
- **优化**：知识库页面保持当前的资料列表样式，新增上传功能

## Capabilities

### New Capabilities
- `knowledge-repository-page`: 独立的知识库页面，展示课程的AI生成资料和用户上传资料，支持资料查看、跳转、上传功能
- `file-upload`: 文件上传功能，支持用户将本地学习资料添加到知识库，包含文件选择、上传进度、格式验证

### Modified Capabilities
- `learning-space`: 学习空间页面移除复合知识库模块，简化页面结构
- `course-card`: 课程卡片组件新增资料入口按钮，点击跳转到知识库页面

## Impact

**受影响文件：**
- `js/pages/learningPage.js` - 移除复合知识库渲染逻辑
- `css/pages/learning.css` - 移除资料区样式
- `js/components/materialList.js` - 新增上传功能
- `js/pages/knowledgeRepositoryPage.js` - 新建知识库页面
- `css/pages/knowledgeRepository.css` - 新建知识库样式
- `js/router.js` - 新增知识库路由
- `js/components/courseCard.js` - 新增资料按钮
- `index.html` - 可能需要更新导航

**数据影响：**
- 现有IndexedDB存储的资料数据无需迁移，只需改变访问方式
- 新增文件上传需要扩展资料数据模型，添加文件内容存储

**用户影响：**
- 学习空间页面更简洁，专注于三问学习流程
- 知识库入口更明显，方便随时查看和添加资料
- 新增文件上传功能，用户可以积累自己的学习资料库
