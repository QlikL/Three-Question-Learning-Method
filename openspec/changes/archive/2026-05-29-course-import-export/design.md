# 设计方案：课程导入导出

## 1. 数据格式设计

### 1.1 导出文件结构

```json
{
  "version": 1,
  "exportedAt": 1717000000000,
  "course": { /* 课程基础数据 */ },
  "knowledgeGraph": { /* 知识图谱 */ },
  "mentalModels": { /* 心智模型 */ },
  "debates": { /* 争议点 */ },
  "quizzes": { /* 测评数据 */ },
  "materials": { /* 知识库资料 */ }
}
```

### 1.2 课程基础数据字段

```json
{
  "id": "course_xxx",
  "title": "课程标题",
  "query": "用户原始提问",
  "createdAt": 1717000000000,
  "updatedAt": 1717000000000,
  "status": "active",
  "progress": { "phase1": true, "phase2": false, "phase3": false },
  "subject": "学科分类",
  "rating": 85,
  "abilityMapping": ["critical", "systems"],
  "abilities": { "critical": 8, "creative": 5, "systems": 7, "practical": 6, "metacognitive": 4, "connection": 5 }
}
```

## 2. 导出功能实现

### 2.1 数据收集

从 IndexedDB 读取课程关联的所有数据：

```javascript
const course = await Store.getCourse(courseId);
const graph = await Store.getKnowledgeGraph(courseId);
const mm = await Store.getMentalModel(courseId);
const debate = await Store.getDebate(courseId);
const quiz = await Store.getQuiz(courseId);
const material = await Store.getMaterial(courseId);
```

### 2.2 文件下载

使用 `Blob` + `URL.createObjectURL` + `<a>` 下载：

```javascript
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${course.title}_${date}.json`;
a.click();
URL.revokeObjectURL(url);
```

## 3. 导入功能实现

### 3.1 入口位置

在 `homePage.js` 的 `.course-filter-bar` 中，排序选择器右边添加"导入课程"按钮：

```html
<div class="course-filter-bar">
    <div class="filter-group">
        <label class="filter-label">排序方式：</label>
        <div id="sort-select-container"></div>
    </div>
    <button class="btn btn-outline btn-sm" id="import-course-btn">
        📥 导入课程
    </button>
</div>
```

### 3.2 文件选择

使用隐藏的 `<input type="file" accept=".json">`：

```javascript
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = async (e) => {
    const file = e.target.files[0];
    // 读取并解析 JSON
};
input.click();
```

### 3.3 数据验证

验证导入文件的基本结构：
- 必须有 `version` 字段
- 必须有 `course` 对象
- `course` 必须包含 `title` 字段

### 3.4 ID 冲突处理

导入时为课程生成新ID，避免覆盖已有课程。同时更新所有关联数据中的 `courseId` 引用。

### 3.5 写入顺序

```
1. 生成新ID，更新 course.id
2. Store.saveCourse(course)
3. Store.saveKnowledgeGraph(graph)
4. Store.saveMentalModel(mm)
5. Store.saveDebate(debate)
6. Store.saveQuiz(quiz)
7. Store.saveMaterial(material)
```

## 4. UI 样式

- 导出按钮：使用现有菜单样式，无需额外样式
- 导入按钮：`.btn-outline` 样式（已有），小尺寸 `btn-sm`
- 导入成功/失败使用 `Dialog.toast` 提示

## 5. 涉及文件

| 文件 | 修改内容 |
|------|----------|
| `js/components/courseCard.js` | `case 'export'` 分支实现导出逻辑 |
| `js/pages/homePage.js` | 添加导入按钮 + 导入逻辑 |
| `js/store.js` | 可能需要添加 `getQuiz` 方法 |
| `css/components.css` | 添加 `.btn-sm` 样式 |
