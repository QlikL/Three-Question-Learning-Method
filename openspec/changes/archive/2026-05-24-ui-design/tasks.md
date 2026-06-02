# 实施任务 - UI界面设计与实现

## 任务概览
共 6 个主要任务，预计按顺序实施。每个任务包含多个子步骤。

---

## Task 1: 项目基础框架搭建

### 描述
创建项目目录结构、基础HTML入口、CSS基础系统、JS路由与数据层。

### 子任务
- [x] 1.1 创建项目目录结构
- [x] 1.2 创建 `index.html` - 主入口HTML
- [x] 1.3 创建 `css/variables.css` - CSS自定义属性
- [x] 1.4 创建 `css/reset.css` - 基础重置与全局样式
- [x] 1.5 创建 `css/layout.css` - 页面布局系统
- [x] 1.6 创建 `css/components.css` - 通用组件样式
- [x] 1.7 创建 `css/animations.css` - CSS过渡和关键帧动画
- [x] 1.8 创建 `js/router.js` - Hash路由管理器
- [x] 1.9 创建 `js/store.js` - IndexedDB + localStorage 数据管理模块
- [x] 1.10 创建 `js/models/` 下所有数据模型模块

### 验证
- [ ] 页面空白加载成功，无控制台报错
- [ ] IndexedDB数据库成功创建，对象仓库可用
- [ ] Hash路由可正确解析路径与参数

---

## Task 2: 主界面（Home Page）

### 描述
实现初始状态的搜索界面，以及课程创建后的课程卡片列表展示。

### 子任务
- [x] 2.1 创建 `css/pages/home.css` - 主界面样式
- [x] 2.2 创建 `js/pages/homePage.js` - 主界面页面逻辑
- [x] 2.3 创建 `js/components/searchBar.js` - 搜索框组件
- [x] 2.4 创建 `js/components/courseCard.js` - 课程卡片组件
- [x] 2.5 实现搜索触发课程创建流程
- [x] 2.6 实现课程卡片列表展示

### 验证
- [ ] 初始状态仅显示搜索框和引导语
- [ ] 输入问题后搜索框进入loading状态，2秒后生成课程
- [ ] 课程生成后显示对应课程卡片
- [ ] 课程卡片显示进度条、能力雷达缩略图
- [ ] 右键/点击菜单可归档、删除课程

---

## Task 3: 学习空间界面（Learning Page）

### 描述
实现三问学习空间：知识图谱（第一问）、争议点对比（第二问）、资料区。

### 子任务
- [x] 3.1 创建 `css/pages/learning.css` - 学习空间样式
- [x] 3.2 创建 `js/pages/learningPage.js` - 学习空间页面逻辑
- [x] 3.3 创建 `js/components/knowledgeGraph.js` - 知识图谱Canvas组件
- [x] 3.4 创建 `js/components/debatePanel.js` - 争议点左右分栏面板
- [x] 3.5 创建 `js/components/materialList.js` - 资料列表组件
- [x] 3.6 创建 `js/mock/aiMock.js` - 模拟AI接口
- [x] 3.7 实现三问切换导航

### 验证
- [ ] 进入学习空间默认显示知识图谱
- [ ] 知识图谱节点可点击展开详情
- [ ] 可切换到争议点面板，左右分栏展示双方观点
- [ ] 资料区展示AI补充资料列表
- [ ] 三问进度可正确更新并跳转

---

## Task 4: 测评中心界面（Assessment Page）

### 描述
实现测评题目展示、答题交互、结果反馈报告。

### 子任务
- [x] 4.1 创建 `css/pages/assessment.css` - 测评中心样式
- [x] 4.2 创建 `js/pages/assessmentPage.js` - 测评页面逻辑
- [x] 4.3 创建 `js/components/quizItem.js` - 测评题目组件
- [x] 4.4 在 `mock/aiMock.js` 中添加模拟测评生成接口
- [x] 4.5 实现答题功能
- [x] 4.6 实现测评报告生成

### 验证
- [ ] 测评列表按认知层级分类展示
- [ ] 单题模式下可选择答案并提交
- [ ] 提交后即时显示对错与答案解析
- [ ] 全部完成生成测评报告

---

## Task 5: 个人中心界面（Profile Page）

### 描述
实现学习数据总览、课程归档、资料上传历史。

### 子任务
- [x] 5.1 创建 `css/pages/profile.css` - 个人中心样式
- [x] 5.2 创建 `js/pages/profilePage.js` - 个人中心页面逻辑
- [x] 5.3 创建 `js/components/radarChart.js` - 能力雷达图Canvas组件
- [x] 5.4 创建 `js/components/barChart.js` - 学科对比柱状图Canvas组件
- [x] 5.5 实现周学习时长折线图（Canvas自绘）
- [x] 5.6 实现课程归档管理列表
- [x] 5.7 实现资料上传历史展示

### 验证
- [ ] 雷达图正确显示各能力维度得分
- [ ] 柱状图对比各学科得分
- [ ] 折线图显示周学习时长变化
- [ ] 归档管理可查看和恢复已归档课程

---

## Task 6: 集成测试与细节优化

### 描述
集成所有页面、修复样式问题、优化交互体验。

### 子任务
- [x] 6.1 创建 `js/app.js` - 应用入口
- [x] 6.2 集成所有页面到路由系统
- [x] 6.3 确保页面切换时数据持久化
- [x] 6.4 响应式布局适配（桌面与平板）
- [x] 6.5 统一错误处理与加载状态
- [x] 6.6 代码清理与注释完善

### 验证
- [ ] 所有页面可正常切换，数据流正确
- [ ] 课程创建→学习→测评→完成 全流程可用
- [ ] 刷新页面后数据保留（IndexedDB持久化）
- [ ] 无控制台报错，所有交互反馈正常
