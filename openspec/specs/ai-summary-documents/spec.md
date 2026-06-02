## ADDED Requirements

### Requirement: AI自动生成课程总结文档
系统 SHALL 在AI补充资料中自动生成一份或多份课程总结文档，内容基于课程主题和学习内容，以docx格式提供。

#### Scenario: 生成课程总结文档
- **WHEN** 用户进入知识库页面且课程尚无AI总结资料
- **THEN** 系统自动生成1-2份课程总结文档，包含在AI补充资料列表中

#### Scenario: 总结文档数据结构
- **WHEN** AI总结文档被生成
- **THEN** 文档数据包含 `type: 'ai-summary'`、`format: 'docx'`、`tags: ['AI总结资料']`、`source: 'AI 生成'`、`content`（文档正文内容）

### Requirement: AI总结资料显示专属标签
系统 SHALL 在AI总结资料卡片上显示"AI总结资料"标签，与网上文献类资料区分。

#### Scenario: 显示AI总结资料标签
- **WHEN** 资料的type为'ai-summary'
- **THEN** 卡片标签区域显示紫色"AI总结资料"徽章

#### Scenario: 显示文件大小
- **WHEN** 资料的type为'ai-summary'
- **THEN** 卡片元信息区域显示文档文件大小

### Requirement: AI总结资料详情弹窗支持打开和下载
系统 SHALL 在AI总结资料的详情弹窗中提供"打开"和"下载"两个操作按钮。

#### Scenario: 点击打开按钮预览文档
- **WHEN** 用户在AI总结资料详情弹窗中点击"打开"按钮
- **THEN** 弹窗内直接渲染文档内容（HTML格式）供用户查看

#### Scenario: 点击下载按钮下载docx文件
- **WHEN** 用户在AI总结资料详情弹窗中点击"下载"按钮
- **THEN** 系统将文档内容转换为docx格式并触发浏览器下载

#### Scenario: docx文件命名
- **WHEN** 用户下载AI总结文档
- **THEN** 文件名格式为"{课程标题}_AI总结.docx"
