## 1. 数据层实现

- [ ] 1.1 在store.js中添加files对象仓库，使用fileId作为keyPath
- [ ] 1.2 实现saveFile、getFile、getFilesByCourse、deleteFile等存储方法
- [ ] 1.3 定义文件元数据模型FileRecord（包含courseId、fileId、title、url、fileType、source、createdAt、size等字段）

## 2. AI服务集成

- [ ] 2.1 在aiService.js中实现generateFileRecommendations方法
- [ ] 2.2 编写AI prompt，要求返回文件列表JSON格式（包含title、url、fileType、description、source等字段）
- [ ] 2.3 实现文件类型自动识别函数detectFileType(url)
- [ ] 2.4 添加AI调用失败时的模拟数据降级机制

## 3. UI组件开发

- [ ] 3.1 创建js/components/fileList.js组件，实现文件卡片列表渲染
- [ ] 3.2 实现文件类型图标映射（PDF、Word、Excel、Link等）
- [ ] 3.3 实现文件点击事件处理（在线链接新标签页打开，文件触发下载）
- [ ] 3.4 创建css/pages/knowledge-repository.css样式文件，保持与现有UI风格一致

## 4. 搜索和筛选功能

- [ ] 4.1 在fileList组件中实现搜索框，支持按标题和描述搜索
- [ ] 4.2 实现文件类型筛选器（全部、PDF、Word、Excel、Link等）
- [ ] 4.3 实现搜索和筛选的组合过滤逻辑
- [ ] 4.4 添加空状态提示组件（无文件时显示）

## 5. 页面集成

- [ ] 5.1 创建或更新js/pages/knowledgeRepositoryPage.js页面逻辑
- [ ] 5.2 实现页面初始化：加载课程信息、从IndexedDB或AI获取文件列表
- [ ] 5.3 集成fileList组件到复合知识库页面
- [ ] 5.4 添加加载状态和错误处理

## 6. HTML和路由

- [ ] 6.1 在index.html中添加复合知识库模块入口
- [ ] 6.2 创建knowledge-repository.html页面结构（或使用单页应用路由）
- [ ] 6.3 确保CSS和JS文件正确引入

## 7. 测试和优化

- [ ] 7.1 测试文件列表加载和显示功能
- [ ] 7.2 测试搜索和筛选功能
- [ ] 7.3 测试文件点击交互（链接跳转、文件下载）
- [ ] 7.4 测试AI生成和缓存机制
- [ ] 7.5 优化响应式布局，适配不同屏幕尺寸
- [ ] 7.6 添加控制台调试日志，便于问题排查

## 8. 文档和清理

- [ ] 8.1 更新README.md，添加复合知识库功能说明
- [ ] 8.2 清理未使用的代码和注释
- [ ] 8.3 验证所有功能在主流浏览器中正常工作
