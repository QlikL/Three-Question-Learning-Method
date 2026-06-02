## Why

目前应用使用 IndexedDB 存储课程、知识图谱、测评等数据，但用户无法直观查看数据库中的内容。现有的 `clear-cache.html` 只能做粗粒度的数据管理（清除/删除），无法浏览具体数据。需要一个数据库查看工具，方便调试和数据检视。

## What Changes

- 新增 `db-viewer.html` 独立页面，提供 IndexedDB 和 localStorage 数据的可视化浏览
- 支持查看所有对象仓库（courses、knowledgeGraphs、debates、quizzes、materials）的数据
- 支持查看 localStorage 中的设置数据（app_settings、app_theme）
- 支持按课程展开查看关联数据（知识图谱、测评、争议点等）
- 支持 JSON 格式化显示和原始数据切换
- 支持数据搜索过滤

## Capabilities

### New Capabilities
- `database-viewer`: 提供 IndexedDB 和 localStorage 数据的可视化浏览、搜索和格式化展示功能

### Modified Capabilities
（无）

## Impact

- 新增文件：`db-viewer.html`
- 依赖现有 `js/store.js` 的 IndexedDB 访问方法
- 不影响主应用逻辑，独立页面运行
