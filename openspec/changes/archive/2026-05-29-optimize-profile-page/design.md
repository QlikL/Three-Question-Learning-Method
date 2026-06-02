# 设计方案：优化个人中心界面

## 1. 数据模型变更

### 1.1 Course 模型扩展

**六维能力体系**（每项0-10分，小数保留1位）：

| 能力ID | 名称 | 说明 |
|--------|------|------|
| `critical` | 批判思维 | 质疑假设、评估证据、识别逻辑谬误 |
| `creative` | 创新创造 | 产生新想法、建立跨域连接、发散思维 |
| `systems` | 系统思维 | 理解整体性、识别因果关系、把握反馈回路 |
| `practical` | 实践应用 | 将理论转化为行动、解决实际问题 |
| `metacognitive` | 元认知 | 自我反思、监控学习过程、调节策略 |
| `connection` | 知识关联 | 跨学科连接、建立知识网络、迁移能力 |

**新增字段**：
```javascript
// Course 构造函数中
this.subject = data.subject || '未分类';           // 学科分类
this.rating = data.rating || 0;                     // 课程评分 0-100
this.abilityMapping = data.abilityMapping || [];    // 体现的能力维度ID列表
this.abilities = {                                  // 六维能力评分 0-10
    critical: data.abilities?.critical || 0,
    creative: data.abilities?.creative || 0,
    systems: data.abilities?.systems || 0,
    practical: data.abilities?.practical || 0,
    metacognitive: data.abilities?.metacognitive || 0,
    connection: data.abilities?.connection || 0
};
```

### 1.2 向后兼容

旧数据（3维abilities）在读取时自动迁移：
- `concept` → 合并到 `systems` 和 `critical` 的平均
- `critical` → 保留
- `practice` → 映射到 `practical`
- 缺失维度默认为0
- `subject` 默认通过标题关键词推断
- `rating` 默认取三维度平均值

## 2. 课程生成流程

### 2.1 AiService.generateCourse() 扩展

生成课程时，AI额外返回：
```json
{
  "title": "课程标题",
  "subject": "计算机科学",
  "rating": 75,
  "abilityMapping": ["critical", "systems", "practical"],
  "abilities": {
    "critical": 7.5,
    "creative": 3.0,
    "systems": 8.0,
    "practical": 6.5,
    "metacognitive": 4.0,
    "connection": 5.0
  }
}
```

- `subject`：从预定义学科列表中选择
- `rating`：课程初始预估评分（完成测评后会根据表现调整）
- `abilityMapping`：该课程能体现的能力维度（1-3种）
- `abilities`：该课程对各能力维度的贡献度（0-10）

### 2.2 课程完成时评分更新

在 `learningPage._onQuizComplete()` 中：
- 根据测评正确率和题目认知层级计算最终 rating
- rating = 基础分(60) + 正确率加成(0-30) + 认知层级加成(0-10)

## 3. 雷达图重写

### 3.1 六边形设计

- 6个顶点对应6种能力
- 数据刻度0-10
- 背景网格：3层六边形（分别对应约3.3、6.6、10分值）
- 填充：半透明渐变（主色调 `var(--color-primary)`）
- 边缘：实线描边
- 数据点：小圆点标记
- 标签：顶点外侧显示能力名称 + 分值

### 3.2 数据计算逻辑

```
某能力分值 = Σ(已完成课程中该能力的评分) / 该能力被映射到的课程数
```

示例：已完成5门课程，其中3门映射了"批判思维"
- 课程A批判思维=7，课程C批判思维=8，课程E批判思维=6
- 批判思维分值 = (7+8+6)/3 = 7.0

### 3.3 视觉规格

- Canvas尺寸：400x400
- 中心点：(200, 200)
- 最大半径：150px
- 背景网格颜色：`rgba(148, 163, 184, 0.15)`
- 数据区域填充：`rgba(37, 99, 235, 0.2)` + 描边 `rgba(37, 99, 235, 0.8)`
- 标签字体：14px，颜色 `var(--color-text-secondary)`
- 中心显示：综合平均分（大字）+ "综合"（小字）

## 4. 柱状图重写

### 4.1 学科分组逻辑

使用课程的 `subject` 字段直接分组（而非标题关键词匹配）。

### 4.2 评分计算

```
某学科评分 = Σ(该学科已完成课程的rating) / 该学科已完成课程数
```

### 4.3 视觉规格

- Canvas尺寸：自适应容器宽度，高度350px
- 柱体：圆角顶部，渐变填充
- 颜色：每个学科不同配色（从预定义调色板循环取色）
- 柱体上方显示分值
- X轴：学科名称
- Y轴：0-100刻度
- 网格线：浅灰色虚线

## 5. 平均能力分修正

### 5.1 新逻辑

```
平均能力分 = Σ(已完成课程的rating) / 已完成课程数
```

仅统计 `status === 'completed'` 且 `rating > 0` 的课程。

### 5.2 显示格式

保留整数，四舍五入。

## 6. 预定义学科列表

```javascript
const SUBJECTS = [
    '计算机科学', '数学', '物理学', '化学', '生物学',
    '历史学', '文学', '语言学', '哲学', '经济学',
    '心理学', '艺术学', '工程学', '医学', '法学',
    '教育学', '社会学', '其他'
];
```
