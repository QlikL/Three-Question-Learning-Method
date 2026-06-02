## ADDED Requirements

### Requirement: 文件列表展示
系统 SHALL 在复合知识库模块中展示AI推荐的学习文件列表，每个文件显示标题、类型图标、来源、生成时间和文件大小。

#### Scenario: 加载文件列表
- **WHEN** 用户进入复合知识库模块
- **THEN** 系统从IndexedDB加载该课程的所有文件记录并展示为卡片列表

#### Scenario: 空文件列表
- **WHEN** 课程没有文件记录
- **THEN** 系统显示空状态提示"暂无学习资料，请先完成课程学习"

### Requirement: 文件类型识别
系统 SHALL 根据文件URL或MIME类型自动识别文件类型，并显示对应的图标。

#### Scenario: 识别PDF文件
- **WHEN** 文件URL以.pdf结尾或MIME类型为application/pdf
- **THEN** 系统显示PDF图标并标记类型为"PDF文档"

#### Scenario: 识别网页链接
- **WHEN** 文件URL为http或https协议且无文件扩展名
- **THEN** 系统显示链接图标并标记类型为"网页链接"

### Requirement: 文件点击交互
系统 SHALL 根据文件类型提供不同的点击行为：在线文档在新标签页打开，本地文件触发下载。

#### Scenario: 打开在线文档
- **WHEN** 用户点击网页链接类型的文件
- **THEN** 系统在新标签页打开该链接

#### Scenario: 下载本地文件
- **WHEN** 用户点击PDF/Word/Excel等文件类型的文件
- **THEN** 系统触发浏览器下载该文件

### Requirement: 文件搜索
系统 SHALL 提供搜索框，支持按文件标题和描述进行关键词搜索。

#### Scenario: 搜索文件
- **WHEN** 用户在搜索框输入关键词并按下回车
- **THEN** 系统过滤文件列表，仅显示标题或描述包含该关键词的文件

#### Scenario: 清空搜索
- **WHEN** 用户清空搜索框内容
- **THEN** 系统恢复显示所有文件

### Requirement: 文件分类筛选
系统 SHALL 提供文件类型筛选器，支持按文件类型过滤列表。

#### Scenario: 筛选PDF文件
- **WHEN** 用户点击"PDF文档"筛选按钮
- **THEN** 系统仅显示PDF类型的文件

#### Scenario: 显示全部
- **WHEN** 用户点击"全部"筛选按钮
- **THEN** 系统显示所有类型的文件

### Requirement: 文件元数据存储
系统 SHALL 在IndexedDB中存储文件元数据，包括courseId、fileId、title、url、fileType、source、createdAt、size等字段。

#### Scenario: 保存文件记录
- **WHEN** AI生成文件推荐或用户添加文件
- **THEN** 系统将文件元数据保存到IndexedDB的files对象仓库

#### Scenario: 加载文件记录
- **WHEN** 用户进入复合知识库模块
- **THEN** 系统根据courseId从IndexedDB加载所有相关文件记录

### Requirement: AI文件推荐集成
系统 SHALL 调用AI服务生成学习文件推荐，并将结果存储到IndexedDB。

#### Scenario: 生成文件推荐
- **WHEN** 用户首次进入复合知识库且无缓存数据
- **THEN** 系统调用AI服务生成文件推荐列表并保存

#### Scenario: 使用缓存数据
- **WHEN** 用户再次进入复合知识库且已有缓存
- **THEN** 系统直接从IndexedDB加载文件列表，不调用AI
