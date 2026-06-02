## ADDED Requirements

### Requirement: 用户可上传本地文件到知识库
系统 SHALL 允许用户通过拖拽或点击选择的方式上传本地学习资料文件。

#### Scenario: 拖拽文件上传
- **WHEN** 用户将文件拖拽到上传区域并释放
- **THEN** 系统验证文件格式和大小，开始上传

#### Scenario: 点击选择文件上传
- **WHEN** 用户点击上传区域并选择文件
- **THEN** 系统验证文件格式和大小，开始上传

#### Scenario: 上传进度显示
- **WHEN** 文件正在上传
- **THEN** 系统显示上传进度百分比和剩余时间

### Requirement: 文件格式验证
系统 SHALL 验证上传文件的格式，仅允许特定类型的学习资料文件。

#### Scenario: 允许的文件格式
- **WHEN** 用户上传pdf、doc、docx、txt、md格式的文件
- **THEN** 系统接受文件并开始上传

#### Scenario: 不支持的文件格式
- **WHEN** 用户上传exe、zip、jpg等不支持的格式
- **THEN** 系统拒绝上传并提示"仅支持pdf、doc、docx、txt、md格式"

### Requirement: 文件大小限制
系统 SHALL 限制单个上传文件的大小，防止占用过多存储空间。

#### Scenario: 文件大小在限制内
- **WHEN** 用户上传小于20MB的文件
- **THEN** 系统接受文件

#### Scenario: 文件超出大小限制
- **WHEN** 用户上传大于20MB的文件
- **THEN** 系统拒绝上传并提示"文件大小不能超过20MB"

### Requirement: 上传资料存储
系统 SHALL 将上传的文件内容存储到IndexedDB，并在资料列表中展示。

#### Scenario: 文件成功存储
- **WHEN** 文件验证通过且上传完成
- **THEN** 系统将文件Base64编码后存储到materials表，type标记为"upload"

#### Scenario: 存储失败处理
- **WHEN** IndexedDB写入失败
- **THEN** 系统显示错误提示并回滚上传状态

### Requirement: 上传资料展示
系统 SHALL 在知识库页面中展示用户上传的资料，与AI生成的资料分开显示。

#### Scenario: 显示上传资料列表
- **WHEN** 页面加载且存在用户上传资料
- **THEN** 系统在" 用户上传资料"区域展示资料卡片

#### Scenario: 上传资料点击行为
- **WHEN** 用户点击上传的资料卡片
- **THEN** 系统弹出模态框显示文件信息，提供下载或预览选项

### Requirement: 上传错误处理
系统 SHALL 妥善处理上传过程中的各种错误情况。

#### Scenario: 文件读取失败
- **WHEN** FileReader读取文件内容失败
- **THEN** 系统显示错误提示"文件读取失败，请重试"

#### Scenario: 存储空间不足
- **WHEN** IndexedDB存储空间不足
- **THEN** 系统提示"存储空间不足，请清理部分资料"

#### Scenario: 网络异常（如果未来需要联网验证）
- **WHEN** 上传过程中网络中断
- **THEN** 系统提示"网络异常，请检查网络连接"
