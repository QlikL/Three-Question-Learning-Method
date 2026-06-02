## ADDED Requirements

### Requirement: 根本性分歧AI定位
系统SHALL调用AI服务定位指定领域的3个根本性分歧，每个分歧包含双方立场、最有力论据、代表学者和前沿启示。

#### Scenario: 成功定位3个分歧
- **WHEN** 用户进入第二问学习阶段，AI服务可用
- **THEN** 系统应调用 `AiService.identifyDisagreements()` 并返回恰好3个分歧，每个包含 `title`、`coreQuestion`、`sideA`、`sideB`、`frontierImplication` 字段

#### Scenario: AI返回数量不足
- **WHEN** AI返回的分歧数量不足3个
- **THEN** 系统应降级使用领域通用分歧模板补足到3个

#### Scenario: AI调用失败降级
- **WHEN** AI服务调用失败或超时
- **THEN** 系统应使用内置的通用分歧模板（含3个模板分歧），并显示提示"AI服务暂不可用，已为您提供通用学术分歧参考"

#### Scenario: Temperature参数设置
- **WHEN** 调用 `identifyDisagreements()` 时
- **THEN** 系统应设置 `temperature` 为 0.8，以获取多样化的分歧视角

### Requirement: 分歧双方论据展示
系统SHALL以左右对比面板形式展示每个分歧的双方论据，突出"最有力论据"和"代表学者"。

#### Scenario: 渲染分歧对比面板
- **WHEN** 分歧数据加载完成
- **THEN** 系统应以左右分栏形式展示，左侧为立场A（含最有力论据、代表学者），右侧为立场B（含最有力论据、代表学者），中间显示核心争议问题

#### Scenario: 切换分歧主题
- **WHEN** 用户点击顶部分歧主题切换按钮
- **THEN** 系统应切换到对应的分歧内容，更新左右面板

#### Scenario: 显示前沿启示
- **WHEN** 分歧数据包含 `frontierImplication` 字段
- **THEN** 系统应在分歧对比面板下方显示"领域前沿启示"区域

### Requirement: 分歧数据持久化
系统SHALL将分歧数据保存到 IndexedDB，以 courseId 为主键。

#### Scenario: 保存分歧数据
- **WHEN** AI成功返回分歧数据
- **THEN** 系统应将数据保存到 IndexedDB 的 `debates` 对象仓库（复用现有仓库），key 为 `courseId`

#### Scenario: 读取缓存的分歧数据
- **WHEN** 用户再次进入同一课程的第二问
- **THEN** 系统应先从 IndexedDB 读取缓存数据，如存在则直接展示，不再调用AI
