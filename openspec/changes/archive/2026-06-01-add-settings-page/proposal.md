## Why

当前系统缺少设置页面，用户无法：
- 修改 AI 模型配置（API Key、模型选择）
- 切换深色/浅色主题
- 管理学习数据（清除、导出、导入）
- 设置测验难度偏好
- 查看系统信息和使用帮助

添加设置页面可以提升用户体验，让用户更好地个性化配置系统。

## What Changes

- 在个人中心标题右边添加设置齿轮图标按钮（⚙）
- 创建设置页面，包含以下功能模块：
  1. **AI 模型配置**：设置 API Key、选择/切换 AI 模型
  2. **主题切换**：深色模式/浅色模式切换
  3. **学习偏好**：测验难度偏好设置
  4. **数据管理**：清除学习数据、导出/导入课程数据
  5. **关于与帮助**：版本信息、使用帮助

## Capabilities

### New Capabilities
- `settings-page`: 设置页面，包含 AI 配置、主题切换、学习偏好、数据管理、关于帮助

### Modified Capabilities
- `profile-page`: 在个人中心添加设置入口按钮

## Impact

- 新增 `js/pages/settingsPage.js` - 设置页面逻辑
- 新增 `css/pages/settings.css` - 设置页面样式
- 修改 `js/pages/profilePage.js` - 添加设置按钮
- 修改 `js/router.js` - 添加设置页面路由
- 修改 `js/store.js` - 添加设置数据存储
- 修改 `index.html` - 引入新文件
