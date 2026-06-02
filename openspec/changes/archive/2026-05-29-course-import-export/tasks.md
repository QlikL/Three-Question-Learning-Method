# 实现任务清单

## 1. 课程导出功能

- [x] 1.1 在 `js/components/courseCard.js` 的 `case 'export'` 分支中实现导出逻辑：从 IndexedDB 读取课程及所有关联数据（知识图谱、心智模型、争议点、测评、资料）
- [x] 1.2 将所有数据组装为 `{ version, exportedAt, course, knowledgeGraph, mentalModels, debates, quizzes, materials }` 格式的 JSON
- [x] 1.3 使用 Blob + URL.createObjectURL 实现文件下载，文件名格式为 `{课程标题}_{YYYY-MM-DD}.json`
- [x] 1.4 导出完成后使用 `Dialog.toast` 显示成功提示

## 2. 课程导入功能

- [x] 2.1 在 `js/pages/homePage.js` 的 `_renderCoursesPage` 中，`.course-filter-bar` 排序选择器右边添加"📥 导入课程"按钮
- [x] 2.2 添加 `.btn-sm` 样式到 `css/components.css`（小尺寸按钮：padding减小、font-size:13px）
- [x] 2.3 绑定导入按钮点击事件：创建隐藏 `<input type="file" accept=".json">`，触发文件选择
- [x] 2.4 实现文件读取和 JSON 解析，验证数据格式（必须有 version、course.title 字段）
- [x] 2.5 实现 ID 冲突处理：为导入的课程生成新ID，更新所有关联数据中的 courseId 引用
- [x] 2.6 按顺序写入 IndexedDB：course → knowledgeGraph → mentalModels → debates → quizzes → materials
- [x] 2.7 导入成功后刷新课程列表，使用 `Dialog.toast` 显示成功提示；导入失败显示错误提示
