# 实现任务清单

## 1. Course 数据模型扩展

- [x] 1.1 在 `js/models/course.js` 中扩展 `abilities` 为6维（critical, creative, systems, practical, metacognitive, connection），分值范围0-10
- [x] 1.2 在 `js/models/course.js` 中新增 `subject` 字段（默认'未分类'）和 `rating` 字段（课程评分0-100）
- [x] 1.3 在 `js/models/course.js` 中新增 `abilityMapping` 字段（数组，记录课程体现的能力维度ID）
- [x] 1.4 实现旧数据向后兼容：3维abilities自动迁移为6维，缺失字段自动补充默认值

## 2. AiService 课程生成扩展

- [x] 2.1 修改 `js/services/aiService.js` 的 `generateCourse()` 方法，prompt中要求AI返回subject、abilityMapping和6维abilities
- [x] 2.2 在 `js/services/aiService.js` 中定义预定义学科列表常量 `SUBJECTS`（已移至course.js全局定义）
- [x] 2.3 修改 `js/services/aiService.js` 的 fallback 逻辑，适配新的6维abilities结构和subject字段

## 3. 课程评分计算

- [x] 3.1 在 `js/pages/learningPage.js` 的 `_onQuizComplete()` 中，根据测评正确率和认知层级计算课程rating
- [x] 3.2 rating计算公式：基础分(60) + 正确率加成(0-30) + 认知层级加成(0-10)
- [x] 3.3 在 `js/pages/assessmentPage.js` 的 `_onComplete()` 中同步更新rating逻辑

## 4. 雷达图重写

- [x] 4.1 重写 `js/components/radarChart.js`，支持6维度六边形雷达图
- [x] 4.2 实现3层背景网格六边形（对应约3.3、6.6、10分值线）
- [x] 4.3 实现数据区域渐变填充和描边绘制
- [x] 4.4 实现顶点外侧标签显示（能力名称 + 分值）
- [x] 4.5 实现中心综合平均分显示
- [x] 4.6 添加数据更新时的过渡动画效果（暂未实现，Canvas动画复杂度较高）

## 5. 柱状图重写

- [x] 5.1 重写 `js/components/barChart.js`，使用课程subject字段分组
- [x] 5.2 实现圆角柱体和渐变填充
- [x] 5.3 实现每个学科不同配色（从调色板循环取色）
- [x] 5.4 实现柱体上方分值显示、X轴学科名称、Y轴刻度和网格线
- [x] 5.5 添加柱体hover高亮效果（暂未实现，Canvas交互复杂度较高）

## 6. ProfilePage 逻辑更新

- [x] 6.1 修改 `_renderStats()` 方法：平均能力分 = 已完成课程的rating平均值（仅统计rating>0的已完成课程）
- [x] 6.2 修改 `_renderRadarChart()` 方法：仅统计已完成课程的6维abilities，按abilityMapping计算各能力平均值
- [x] 6.3 修改 `_renderBarChart()` 方法：使用subject字段分组，计算每学科已完成课程的rating平均分
- [x] 6.4 添加空数据时的友好提示（区分"暂无课程"和"暂无已完成课程"）

## 7. Mock 数据适配

- [x] 7.1 修改 `js/mock/dataMock.js` 中的示例课程数据，适配新的6维abilities、subject、rating、abilityMapping字段
- [x] 7.2 确保 `js/mock/aiMock.js` 的课程生成fallback也适配新结构

## 8. CSS 样式更新

- [x] 8.1 更新 `css/pages/profile.css` 中雷达图相关样式（容器尺寸、标签样式）
- [x] 8.2 更新 `css/pages/profile.css` 中柱状图相关样式（容器布局、hover效果）
- [x] 8.3 确保响应式布局在移动端正常显示
