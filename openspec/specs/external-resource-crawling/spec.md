## ADDED Requirements

### Requirement: AI分别生成文字资料和学习视频资源
系统 SHALL 通过AI生成两类外部学习资源：文字资料（不少于5个）和学习视频（不少于5个），每类资源独立返回并带有 `category` 字段标识。

#### Scenario: 生成外部文字资料
- **WHEN** AI调用 `generateMaterials` 生成资料
- **THEN** 返回的 `items` 数组中 `category === 'text'` 的资源不少于5个，来源包括知乎、百度文库、菜鸟教程、GitHub（计算机类）、CSDN、掘金等

#### Scenario: 生成学习视频资源
- **WHEN** AI调用 `generateMaterials` 生成资料
- **THEN** 返回的 `items` 数组中 `category === 'video'` 的资源不少于5个，来源包括B站、抖音、慕课网、网易公开课、中国大学MOOC等

#### Scenario: 资源数据包含category字段
- **WHEN** AI生成的资源数据返回
- **THEN** 每个资源项 MUST 包含 `category` 字段，值为 `'text'` 或 `'video'`

#### Scenario: 历史数据兼容
- **WHEN** 已存储的资料数据缺少 `category` 字段
- **THEN** 前端根据 `format` 字段推断：`format === 'video'` 归为视频，其余归为文字资料

### Requirement: 外部资源降级到模拟数据
系统 SHALL 在AI调用失败时降级到模拟数据，模拟数据也 MUST 按新结构提供分类资源。

#### Scenario: AI调用失败降级
- **WHEN** AI调用 `generateMaterials` 失败
- **THEN** 系统使用 `DataMock.getSampleMaterials` 返回模拟数据，模拟数据 MUST 包含不少于5个文字资料和不少于5个视频资源，且每个资源项 MUST 带有 `category` 字段
