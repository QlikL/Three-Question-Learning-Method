## 1. AI提示词与数据结构改造

- [x] 1.1 修改 `AiService.generateMaterials()` 提示词，要求AI分别返回 `textResources`（不少于5个，来源知乎/百度文库/菜鸟教程/GitHub/CSDN/掘金）和 `videoResources`（不少于5个，来源B站/抖音/慕课网/网易公开课/中国大学MOOC），合并为 `items` 数组并为每项添加 `category` 字段（`'text'` 或 `'video'`）
- [x] 1.2 修改 `AiService.generateMaterials()` 的响应解析逻辑，将AI返回的 `textResources` 和 `videoResources` 合并为 `items` 数组，为每项添加 `category` 字段
- [x] 1.3 修改 `DataMock.getSampleMaterials()` 模拟数据，按新结构提供不少于5个文字资料和不少于5个视频资源，每个资源项带有 `category` 字段

## 2. AI模拟层适配

- [x] 2.1 修改 `AiMock.mockGenerateMaterials()` 方法，确保AI返回的数据结构正确传递 `category` 字段，AI总结文档（`type === 'ai-summary'`）不添加 `category` 字段

## 3. 知识库页面分区渲染

- [x] 3.1 修改 `KnowledgeRepositoryPage` 的 `_renderAIMaterials()` 方法，将AI补充资料按三个子模块分区渲染：AI总结文档（`type === 'ai-summary'`）、外部文字资料（`category === 'text'`）、学习视频（`category === 'video'`），每个子模块有独立标题
- [x] 3.2 添加历史数据兼容逻辑：对缺少 `category` 字段的资料，根据 `format` 字段推断（`format === 'video'` 归为视频，其余归为文字资料）
- [x] 3.3 添加空子模块隐藏逻辑：当某个子模块的资源列表为空时，隐藏该子模块的标题和内容区域

## 4. 资料卡片样式调整

- [x] 4.1 修改 `materialList` 组件的资料卡片渲染，根据 `category` 字段显示不同的图标（文字资料使用文档图标，视频使用播放图标）和来源标识
- [x] 4.2 在 `css/pages/knowledge-repository.css` 中添加三个子模块的分区标题样式和分类图标样式

## 5. 验证与测试

- [x] 5.1 验证AI模式下 `generateMaterials` 返回的数据结构正确，文字资料和视频各不少于5个
- [x] 5.2 验证模拟数据模式下降级数据结构正确
- [x] 5.3 验证知识库页面三个子模块分区渲染正确，空模块隐藏正确
- [x] 5.4 验证历史数据（无 `category` 字段）的兼容性
