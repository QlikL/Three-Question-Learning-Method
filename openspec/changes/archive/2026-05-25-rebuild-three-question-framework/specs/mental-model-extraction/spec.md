## ADDED Requirements

### Requirement: 心智模型AI提取
系统SHALL调用AI服务提取指定领域的5个核心心智模型，每个模型包含名称、描述、第一性原理和应用说明。

#### Scenario: 成功提取5个心智模型
- **WHEN** 用户进入第一问学习阶段，AI服务可用
- **THEN** 系统应调用 `AiService.extractMentalModels()` 并返回恰好5个心智模型，每个包含 `name`、`description`、`principle`、`application` 字段

#### Scenario: AI返回数量不足
- **WHEN** AI返回的心智模型数量不足5个
- **THEN** 系统应降级使用领域通用心智模型模板补足到5个

#### Scenario: AI调用失败降级
- **WHEN** AI服务调用失败或超时
- **THEN** 系统应使用内置的领域通用心智模型模板（含5个模板模型），并显示提示"AI服务暂不可用，已为您提供通用心智模型参考"

#### Scenario: Temperature参数设置
- **WHEN** 调用 `extractMentalModels()` 时
- **THEN** 系统应设置 `temperature` 为 0.3，确保输出的一致性和准确性

### Requirement: 心智模型列表展示
系统SHALL以结构化列表形式展示5个核心心智模型，每个模型卡片显示名称、描述、第一性原理和应用场景。

#### Scenario: 渲染心智模型列表
- **WHEN** 心智模型数据加载完成
- **THEN** 系统应以卡片列表形式渲染5个心智模型，每个卡片包含：序号（1-5）、名称、描述、第一性原理、应用说明

#### Scenario: 默认展开第一个模型
- **WHEN** 心智模型列表渲染完成
- **THEN** 第一个心智模型的详细内容应默认展开显示，其余模型折叠

#### Scenario: 点击展开/折叠
- **WHEN** 用户点击某个心智模型卡片的标题区域
- **THEN** 该模型的详细内容（principle、application）应展开或折叠

### Requirement: 心智模型数据持久化
系统SHALL将提取的心智模型数据保存到 IndexedDB，以 courseId 为主键。

#### Scenario: 保存心智模型
- **WHEN** AI成功返回心智模型数据
- **THEN** 系统应将数据保存到 IndexedDB 的 `knowledgeGraphs` 对象仓库（复用现有仓库），key 为 `courseId`

#### Scenario: 读取缓存的心智模型
- **WHEN** 用户再次进入同一课程的第一问
- **THEN** 系统应先从 IndexedDB 读取缓存数据，如存在则直接展示，不再调用AI
