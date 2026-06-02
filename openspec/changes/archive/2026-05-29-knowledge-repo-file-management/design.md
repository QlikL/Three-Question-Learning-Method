# 设计方案：知识库文件管理增强

## 1. 资料删除功能

### 1.1 UI 设计

在用户上传资料的详情弹窗（`showPreview` 的 `isUpload` 分支）中，"下载文件"按钮左侧添加"删除"按钮：

```
[  🗑️ 删除] [💾 下载文件] [关闭]
```

删除按钮样式：红色边框/文字（`btn-danger` 样式），防止误操作。

### 1.2 交互流程

1. 用户点击"删除"按钮
2. 弹出 `confirm` 对话框："确定要删除资料「{文件名}」吗？删除后不可恢复。"
3. 用户确认 → 从 `_materialData.items` 中移除该条目 → 保存到 IndexedDB → 关闭弹窗 → 重新渲染资料列表
4. 用户取消 → 无操作

### 1.3 数据操作

```javascript
// 删除逻辑
deleteMaterial(materialId) {
    this._currentData.items = this._currentData.items.filter(m => m.id !== materialId);
    this._currentData.courseId = this._currentData.courseId || MaterialList._courseId;
    Store.saveMaterial(this._currentData);
    // 重新渲染
    const container = document.getElementById('materials-container');
    if (container) MaterialList.render(container, this._currentData);
}
```

### 1.4 样式

新增 `.btn-danger` 样式：
- 背景色：`#EF4444`（红色）
- hover：`#DC2626`
- 文字：白色

## 2. 文件预览功能

### 2.1 预览策略

| 格式 | 预览方式 |
|------|----------|
| TXT | 直接展示文本内容（Base64解码后） |
| MD | 解码后通过 `_markdownToHtml` 渲染 |
| PDF | 使用 `<iframe>` + Blob URL 嵌入PDF查看器 |
| DOC/DOCX | 显示文件信息 + 下载按钮（浏览器无法直接渲染） |

### 2.2 PDF 预览实现

```javascript
// Base64 → Blob → ObjectURL → iframe
const byteString = atob(base64Content.split(',')[1]);
const ab = new ArrayBuffer(byteString.length);
const ia = new Uint8Array(ab);
for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
}
const blob = new Blob([ab], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
// 渲染 iframe
`<iframe src="${url}" style="width:100%;height:500px;border:none;border-radius:8px;"></iframe>`
```

### 2.3 TXT/MD 预览实现

复用现有的 `_markdownToHtml` 方法，与AI总结文档使用相同的渲染样式：

```javascript
const textContent = atob(base64Content.split(',')[1]);
// 如果是MD格式，使用markdown渲染
const html = format === 'md' ? this._markdownToHtml(textContent) : 
    `<pre style="white-space:pre-wrap;word-break:break-word;">${textContent}</pre>`;
```

### 2.4 DOC/DOCX 降级处理

浏览器无法直接渲染 Word 文档，采用降级方案：
- 显示文件基本信息（名称、大小、上传时间）
- 提供"下载文件"按钮
- 提示"Word文档请下载后查看"

### 2.5 预览弹窗样式

仿照AI总结文档的预览样式：
- 顶部：文件图标 + 文件名 + 格式标签
- 中间：预览区域（带边框、圆角、最大高度400px可滚动）
- 底部：操作按钮组（删除、下载、关闭）

## 3. 课程卡片上传跳转

### 3.1 路由设计

使用 URL 参数传递上传意图：
```
#/knowledge/:courseId?upload=true
```

### 3.2 courseCard.js 修改

将 `case 'upload':` 从 alert 改为路由跳转：

```javascript
case 'upload':
    Router.navigate('/knowledge/' + course.id + '?upload=true');
    break;
```

### 3.3 knowledgeRepositoryPage.js 修改

在页面初始化时检测 URL 参数：

```javascript
async render(container, courseId) {
    // ... 现有逻辑 ...
    
    // 检测是否需要自动打开上传
    const params = Router.currentParams;
    if (params.upload === 'true') {
        setTimeout(() => {
            document.getElementById('file-input')?.click();
        }, 500);
    }
}
```

### 3.4 Router 参数解析

当前 Router 的 `_parseHash` 方法已支持参数解析，需确认 `?upload=true` 能被正确解析到 `Router.currentParams`。
