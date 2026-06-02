# 实现任务清单

## 1. 创建 Dialog 组件

- [x] 1.1 创建 `js/components/dialog.js`，实现 `Dialog` 全局对象
- [x] 1.2 实现 `Dialog.alert(message, title)` 方法：创建遮罩层 + 弹窗卡片 + 确定按钮，返回 Promise
- [x] 1.3 实现 `Dialog.confirm(message, title)` 方法：创建遮罩层 + 弹窗卡片 + 确定/取消按钮，返回 Promise<boolean>
- [x] 1.4 实现 `Dialog.toast(message, type)` 方法：顶部居中轻提示，2.5秒自动消失，支持 success/error/warning/info 四种类型
- [x] 1.5 在 `index.html` 中引入 `dialog.js`

## 2. 添加 Dialog 样式

- [x] 2.1 在 `css/components.css` 中添加 `.dialog-overlay` 遮罩层样式（fixed定位、半透明背景、flex居中、z-index:10000）
- [x] 2.2 添加 `.dialog-box` 弹窗卡片样式（白色背景、圆角、阴影、动画）
- [x] 2.3 添加 `.dialog-btn` 按钮组样式（确定/取消按钮排列）
- [x] 2.4 添加 `.toast` 轻提示样式（fixed顶部居中、不同类型颜色、淡入淡出动画）

## 3. 替换所有原生弹窗调用

- [x] 3.1 替换 `js/components/materialList.js` 中的 5 处调用（2个alert→toast, 2个alert→toast, 1个confirm→confirm）
- [x] 3.2 替换 `js/components/courseCard.js` 中的 2 处调用（1个confirm→confirm, 1个alert→toast）
- [x] 3.3 替换 `js/pages/knowledgeRepositoryPage.js` 中的 4 处调用（2个alert→toast, 2个alert→toast）
- [x] 3.4 替换 `js/components/aiChatWidget.js` 中的 1 处调用（confirm→confirm）
