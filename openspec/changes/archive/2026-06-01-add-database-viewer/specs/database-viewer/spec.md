## ADDED Requirements

### Requirement: 浏览 IndexedDB 对象仓库
系统 SHALL 提供可视化界面浏览 IndexedDB 中所有对象仓库的数据。

#### Scenario: 显示对象仓库列表
- **WHEN** 用户打开数据库查看页面
- **THEN** 系统应显示所有对象仓库的名称（courses、knowledgeGraphs、debates、quizzes、materials）及每个仓库的记录数

#### Scenario: 查看对象仓库数据
- **WHEN** 用户点击某个对象仓库
- **THEN** 系统应显示该仓库中的所有记录，以树形 JSON 格式展示

#### Scenario: 折叠/展开 JSON 节点
- **WHEN** 用户点击 JSON 对象或数组的折叠/展开按钮
- **THEN** 系统应折叠或展开该节点的子内容

### Requirement: 浏览 localStorage 数据
系统 SHALL 提供可视化界面浏览 localStorage 中的所有数据。

#### Scenario: 显示 localStorage 键值对
- **WHEN** 用户切换到 localStorage 标签页
- **THEN** 系统应显示所有 localStorage 键值对，值以格式化 JSON 展示

### Requirement: 数据搜索过滤
系统 SHALL 支持在当前数据中进行关键词搜索过滤。

#### Scenario: 搜索过滤数据
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统应只显示包含该关键词的记录或键值对

#### Scenario: 清空搜索恢复全部
- **WHEN** 用户清空搜索框
- **THEN** 系统应恢复显示所有数据

### Requirement: 格式化/原始数据切换
系统 SHALL 支持格式化 JSON 和原始数据两种展示模式。

#### Scenario: 切换为原始数据
- **WHEN** 用户点击"原始数据"按钮
- **THEN** 系统应以未格式化的原始 JSON 字符串展示数据

#### Scenario: 切换为格式化数据
- **WHEN** 用户点击"格式化"按钮
- **THEN** 系统应以树形格式化 JSON 展示数据

### Requirement: 页面样式一致
数据库查看页面 SHALL 使用项目统一的 CSS 变量，保持视觉风格一致。

#### Scenario: 深色模式支持
- **WHEN** 用户在主应用中切换到深色模式后打开数据库查看页面
- **THEN** 页面应跟随深色主题样式
