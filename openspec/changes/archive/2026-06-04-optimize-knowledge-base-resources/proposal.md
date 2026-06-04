## Why

当前知识库的AI补充资料功能存在资源类型单一、数量不足的问题。`AiService.generateMaterials()` 混合推荐文字和视频资源，但没有明确区分，也没有保证各类资源的最低数量。用户需要更丰富的外部学习资源，包括权威文字资料（知乎、百度文库、菜鸟教程、GitHub等）和国内主流视频教程（B站、抖音等），每类不少于5个。

## What Changes

- **新增**：将AI补充资料分为三个独立分类模块展示——"AI总结文档"、"外部文字资料"、"学习视频"，每个模块有独立标题和资料卡片列表
- **修改**：重新设计 `generateMaterials` 的AI提示词，要求分别生成两类资源：外部文字资料（至少5个，来源包括知乎、百度文库、菜鸟教程、GitHub等）和学习视频（至少5个，来源包括B站、抖音、慕课网等）
- **修改**：知识库页面的AI补充资料区域按三个模块分区展示，AI总结文档在上，外部文字资料居中，学习视频在下
- **修改**：资料卡片根据类型（文字资料/视频）显示不同的图标和来源标识

## Capabilities

### New Capabilities
- `external-resource-crawling`: AI驱动的外部学习资源推荐，分别生成不少于5个文字资料链接和不少于5个视频链接，支持分类展示

### Modified Capabilities
- `knowledge-repository-page`: AI补充资料区域按"AI总结文档"、"外部文字资料"、"学习视频"三个模块分区展示

## Impact

**受影响代码：**
- `js/services/aiService.js` - 重写 `generateMaterials` 提示词，分别要求生成文字资料和视频资源，保证每类不少于5个
- `js/mock/aiMock.js` - 修改 `mockGenerateMaterials` 和 `DataMock.getSampleMaterials`，返回数据按新分类结构调整
- `js/pages/knowledgeRepositoryPage.js` - AI补充资料区域改为三模块分区渲染
- `js/components/materialList.js` - 资料卡片支持新分类（外部文字资料、学习视频）的图标和样式
- `css/pages/knowledge-repository.css` - 新增分区标题和分类样式
