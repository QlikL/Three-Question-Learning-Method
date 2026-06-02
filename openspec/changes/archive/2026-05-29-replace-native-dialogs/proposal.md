# 替换浏览器原生弹窗为内置自定义弹窗

## 背景

项目中多处使用浏览器原生的 `alert()` 和 `confirm()` 弹窗，这些弹窗会阻塞页面渲染、样式丑陋且无法自定义，影响用户体验。需要全部替换为内置的自定义弹窗组件。

## 现有使用位置（共12处）

| 文件 | 行号 | 类型 | 内容 |
|------|------|------|------|
| materialList.js | 181 | alert | 文档内容为空 |
| materialList.js | 224 | alert | 文档内容为空，无法下载 |
| materialList.js | 309 | alert | 文件下载失败 |
| materialList.js | 317 | confirm | 确定要删除资料吗 |
| materialList.js | 386 | alert | 打开PDF失败 |
| courseCard.js | 151 | confirm | 确定要删除课程吗 |
| courseCard.js | 159 | alert | 导出功能将在后续版本实现 |
| knowledgeRepositoryPage.js | 218 | alert | 仅支持特定格式文件 |
| knowledgeRepositoryPage.js | 225 | alert | 文件大小不能超过20MB |
| knowledgeRepositoryPage.js | 278 | alert | 文件上传成功 |
| knowledgeRepositoryPage.js | 282 | alert | 文件上传失败 |
| aiChatWidget.js | 462 | confirm | 确定要开启新对话吗 |

## 变更范围

### 1. 新建内置弹窗组件（Dialog）
- `alert` 弹窗：显示消息 + "确定"按钮，自动关闭
- `confirm` 弹窗：显示消息 + "确定"/"取消"按钮，返回 Promise<boolean>
- Toast 提示：轻量级消息提示，自动消失（用于成功/失败提示）

### 2. 全局替换
将所有 `alert()` 替换为 `Dialog.alert()`，所有 `confirm()` 替换为 `Dialog.confirm()`

## 不涉及的范围

- 不修改页面中已有的自定义模态框（如课程筛选弹窗、资料预览弹窗）
- 不引入第三方UI库
