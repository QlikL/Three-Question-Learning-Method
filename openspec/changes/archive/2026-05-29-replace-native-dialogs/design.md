# 设计方案：替换浏览器原生弹窗

## 1. Dialog 组件设计

### 1.1 API 设计

```javascript
const Dialog = {
    // 提示弹窗（替代 alert）
    alert(message, title),
    
    // 确认弹窗（替代 confirm）- 返回 Promise<boolean>
    confirm(message, title),
    
    // Toast 轻提示（自动消失）
    toast(message, type),  // type: 'success' | 'error' | 'warning' | 'info'
    
    // 内部方法
    _createOverlay(),
    _removeOverlay()
};
```

### 1.2 Alert 弹窗

- 半透明遮罩层覆盖全屏
- 居中白色卡片，圆角阴影
- 标题行（可选）+ 消息内容
- 单个"确定"按钮
- 点击确定或遮罩层关闭
- 返回 Promise，resolve 时关闭

### 1.3 Confirm 弹窗

- 半透明遮罩层覆盖全屏
- 居中白色卡片，圆角阴影
- 标题行（可选）+ 消息内容
- 两个按钮："取消"（灰色）+ "确定"（蓝色）
- 点击确定 resolve(true)，点击取消或遮罩层 resolve(false)
- 返回 Promise<boolean>

### 1.4 Toast 轻提示

- 固定在页面顶部居中
- 根据类型显示不同颜色和图标：
  - success：绿色 + ✅
  - error：红色 + ❌
  - warning：橙色 + ⚠️
  - info：蓝色 + ℹ️
- 自动消失：2.5秒后淡出
- 不阻塞用户操作

## 2. 样式设计

### 2.1 遮罩层
```css
.dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
}
```

### 2.2 弹窗卡片
```css
.dialog-box {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: scaleIn 0.2s ease;
}
```

### 2.3 Toast
```css
.toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10001;
    animation: slideDown 0.3s ease;
}
```

## 3. 替换策略

| 原始调用 | 替换为 | 备注 |
|----------|--------|------|
| `alert('成功消息')` | `Dialog.toast('成功消息', 'success')` | 上传成功等 |
| `alert('错误消息')` | `Dialog.toast('错误消息', 'error')` | 下载失败等 |
| `alert('警告消息')` | `Dialog.alert('警告消息')` | 格式不支持等 |
| `confirm('确认消息')` | `await Dialog.confirm('确认消息')` | 删除确认等 |

## 4. 文件结构

- `js/components/dialog.js` - Dialog 组件
- `css/components.css` - 追加 Dialog 样式
- `index.html` - 引入 dialog.js
