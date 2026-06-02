# Fix 过程文档

本文档记录项目开发过程中发现的问题及修复方案。

---

## 1. 第一问展开计数为0

**现象**：第一问的五个心智模型标签都已展开，但识别计数仍为0，无法进入第二问。

**原因**：第一个心智模型卡片初始就是展开状态，但 `_expandedSet` 没有记录它。

**修复**：在 `render()` 中自动将第一个模型的ID加入 `_expandedSet`，并在 `_renderContent()` 末尾调用 `_checkAllExpanded()`。

**文件**：`js/components/mentalModelList.js`

---

## 2. 题目标签全部显示"🧠 深度理解"

**现象**：第三问10道题的标签全部显示为"🧠 深度理解"。

**原因**：标签使用 `question.type` 字段，所有题目type都是 `deep_understanding`。

**修复**：改为优先使用 `question.level` 字段。

**文件**：`js/components/quizItem.js`

---

## 3. 修复后全部显示"✅ 评价"

**现象**：修复上一个问题后，所有题目标签变成"✅ 评价"。

**原因**：AI生成题目未返回 `level` 字段时，全部默认为 `'evaluate'`。

**修复**：按预设分布 `['understand','understand','apply','apply','analyze','analyze','evaluate','evaluate','evaluate','create']` 分配。

**文件**：`js/components/quizItem.js`

---

## 4. AI解析答对时仍说"你的选择不完全正确"

**现象**：回答正确的题目点击"AI解析"时，AI仍给出错误答案的解释。

**原因**：`mockExplainWrongAnswer` 总是返回错误答案的解释，不区分对错。

**修复**：传入 `isCorrect` 参数，正确时给出肯定+拓展建议。

**文件**：`js/mock/aiMock.js`

---

## 5. 选项分布太集中

**现象**：10道题中B选项占比过高，分布不均匀。

**原因**：AI生成题目时选项顺序固定，正确答案位置集中。

**修复**：手动调整模拟数据选项顺序，并为AI生成题目添加 `_shuffleOptions` 自动打乱。

**文件**：`js/components/quizItem.js`

---

## 6. 多选题误判为单选

**现象**：单选题被误判为多选题。

**原因**：答案数组包含逗号合并的字符串，如 `['增加索引, 分页查询']`。

**修复**：添加 `_normalizeAnswer` 方法自动拆分合并答案。

**文件**：`js/components/quizItem.js`

---

## 7. 课程卡片"返回首页"路由错误

**现象**：点击"返回首页"按钮跳转到错误页面。

**原因**：路由路径使用 `/home`，实际应为 `/home/courses`。

**修复**：从 `/home` 改为 `/home/courses`。

**文件**：`js/pages/learningPage.js`

---

## 8. 文件预览格式判断不匹配

**现象**：TXT和MD文件提示"暂不支持预览此格式"。

**原因**：`_getFileFormat` 返回的格式值与预览逻辑中的判断不匹配。txt存储为 `'text'` 但代码判断 `'txt'`；md存储为 `'markdown'` 但代码判断 `'md'`。

**修复**：修改 `_renderUploadPreview` 中的格式判断，兼容两种值（`'text' || 'txt'`、`'markdown' || 'md'`）。

**文件**：`js/components/materialList.js`

---

## 9. PDF预览iframe加载失败

**现象**：PDF文件预览提示"无法打开此文件，出错了"。

**原因**：iframe内嵌PDF在Blob URL方式下存在兼容性问题。

**修复**：改为显示文件信息 + "在新标签页中打开"按钮，点击后创建Blob URL并 `window.open` 打开。

**文件**：`js/components/materialList.js`

---

## 10. PDF新标签页标题乱码

**现象**：PDF在新标签页打开后，标签名显示乱码（Blob URL）。

**原因**：直接打开Blob URL时，浏览器将URL作为标签标题。

**修复**：生成带正确 `<title>` 的HTML包装页面（内嵌全屏iframe显示PDF），再打开该HTML。

**文件**：`js/components/materialList.js`

---

## 11. 浏览器原生弹窗体验差

**现象**：项目中多处使用 `alert()` 和 `confirm()`，弹窗丑陋且阻塞页面。

**原因**：直接调用浏览器原生API。

**修复**：创建内置 `Dialog` 组件，提供 `Dialog.alert()`、`Dialog.confirm()`、`Dialog.toast()` 三种方法，替换全部12处原生调用。

**文件**：`js/components/dialog.js`（新建）、`js/components/materialList.js`、`js/components/courseCard.js`、`js/pages/knowledgeRepositoryPage.js`、`js/components/aiChatWidget.js`

---

## 12. 课程导入报错 "course.toJSON is not a function"

**现象**：导入课程JSON文件时控制台报错。

**原因**：导入的 `data.course` 是JSON解析后的普通对象，没有 `toJSON()` 方法，而 `Store.saveCourse()` 内部调用了 `course.toJSON()`。

**修复**：用 `new Course(data.course)` 包装为 `Course` 实例后再保存。

**文件**：`js/pages/homePage.js`

---

## 13. 知识图谱布局混乱

**现象**：知识图谱节点分布不均，连线交叉严重，难以观察。

**原因**：原始布局算法简单均匀分布，未考虑节点层级关系。

**修复**：重写为分层辐射式布局：
- 核心节点（depth=0）居中
- 子节点（depth=1）按邻接关系排序后环绕中心
- 深层节点（depth=2）聚集在父节点附近扇形分布
- 增强碰撞检测（10轮迭代，间距+36px）
- 连线弧度分离，避免重叠

**文件**：`js/components/knowledgeGraph.js`

---

## 14. AI生成文字显示原始Markdown标记

**现象**：AI总结资料和AI对话框中的文字显示为原始Markdown格式（如 `**粗体**`、`# 标题`），没有渲染为富文本。

**原因**：`materialList.js` 的 `_markdownToHtml()` 方法过于简单，`aiChatWidget.js` 使用 `_escapeHtml()` 转义所有内容。

**修复**：
1. 重写 `materialList.js` 的 `_markdownToHtml()` 方法，支持完整的Markdown语法（标题、粗体、斜体、列表、代码块、链接、引用）
2. 为 `aiChatWidget.js` 添加 `_markdownToHtml()` 方法，AI消息使用Markdown渲染，用户消息保持纯文本
3. 为 `quizItem.js` 添加 `_markdownToHtml()` 方法，AI解析面板也支持Markdown渲染

**文件**：`js/components/materialList.js`、`js/components/aiChatWidget.js`、`js/components/quizItem.js`

---

## 15. AI总结文档字数限制过短

**现象**：AI生成的总结文档内容过于简略，只有800-1200字。

**原因**：Prompt中设置的字数要求为800-1200字，`max_tokens` 参数为2000。

**修复**：
1. 将Prompt字数要求改为3000-5000字
2. 将 `max_tokens` 从2000改为8000
3. 增加内容要求：核心要点5-8个，难点5个，要求详细展开并给出具体案例

**文件**：`js/mock/aiMock.js`

---

## 16. 预览窗口和下载HTML文件出现水平滚动条

**现象**：AI总结文档预览窗口和下载的HTML文件中，文字超出右边界出现水平滚动条。

**原因**：`_markdownToHtml()` 生成的HTML元素（pre、code、h1-h4、ul、li等）没有设置自动换行样式。

**修复**：
1. 为预览区域添加 `overflow-x: hidden; word-wrap: break-word; word-break: break-word; white-space: normal;`
2. 为下载HTML的CSS添加 `* { box-sizing: border-box; }` 和自动换行样式
3. 为 `_markdownToHtml()` 生成的所有HTML元素添加内联 `word-break` 样式

**文件**：`js/components/materialList.js`

---

## 17. 第三问AI按钮展开动画异常

**现象**：点击"AI解析"按钮后，展开动画不流畅，按钮空间占用异常。

**原因**：使用 `grid-template-rows: 0fr` 实现展开/折叠，导致空间计算问题。

**修复**：改为使用 `display: none/block` + `fadeInUp` CSS动画实现平滑展开效果，添加 `fadeOutDown` 动画用于折叠。

**文件**：`js/components/quizItem.js`、`css/pages/assessment.css`

---

## 18. 模型切换后API调用失败

**现象**：将模型从 `qwen3-8b` 切换为 `qwen3.6-plus` 后，AI服务调用失败。

**原因**：`aiService.js` 中的模型名称未更新。

**修复**：将 `MODEL_NAME` 从 `qwen3-8b` 改为 `qwen3.6-plus`。

**文件**：`js/services/aiService.js`

---

## 19. 下载的docx文件无法用Office打开

**现象**：下载的AI总结文档（docx格式）用Office打开提示"无法读取内容"。

**原因**：使用HTML格式伪装成docx，Office无法正确解析。

**修复**：改为下载标准HTML格式文件，用户可以用浏览器打开或通过打印功能保存为PDF。

**文件**：`js/components/materialList.js`

---

## 20. 知识库页面布局顺序不合理

**现象**：知识库页面上方是用户上传模块，下方是AI补充资料模块，不符合使用习惯。

**原因**：原始布局设计中AI补充资料在下方。

**修复**：调整布局顺序，将AI补充资料模块移到上方，用户上传文件模块移到下方。

**文件**：`js/pages/knowledgeRepositoryPage.js`

---

## 21. 原生select下拉菜单样式无法自定义

**现象**：设置页面的原生 `<select>` 元素在不同浏览器中样式不一致，无法自定义。

**原因**：原生 `<select>` 的样式受浏览器限制。

**修复**：使用项目已有的 `CustomSelect` 组件替换原生 `<select>`，统一下拉菜单风格。

**文件**：`js/pages/settingsPage.js`、`css/components.css`

---

## 22. 已保存模型"当前使用"判断错误

**现象**：切换服务商后，已保存模型弹窗中"当前使用"标签显示在错误的模型上。

**原因**：对比的是页面临时状态 `_currentProvider`/`_currentModel`，而非存储中已保存的配置。

**修复**：改为对比 `Store.getSettings()` 中的 `aiProvider`/`aiModel`。

**文件**：`js/pages/settingsPage.js`

---

## 23. 切换服务商时自动保存干扰判断

**现象**：切换服务商后，未点"保存配置"就已生效，导致已保存模型判断异常。

**原因**：`_onProviderChange` 中直接调用了 `Store.saveSettings()`。

**修复**：改为仅更新页面状态，等用户点击"保存配置"才持久化。

**文件**：`js/pages/settingsPage.js`

---

## 24. 切换服务商时API Key输入框残留掩码

**现象**：切换服务商后，API Key输入框仍显示前一个服务商的掩码字符。

**原因**：切换服务商时未清空输入框。

**修复**：`_onProviderChange` 中清空 API Key 和 API 端点输入框。

**文件**：`js/pages/settingsPage.js`

---

## 25. 切换服务商后API端点未同步切换

**现象**：切换到DeepSeek等服务商后，API请求仍发到阿里云百炼端点，报错 "Incorrect API key"。

**原因**：`callAI` 始终使用 `this.API_ENDPOINT`（硬编码为阿里云地址），未根据服务商切换。

**修复**：添加 `PROVIDER_ENDPOINTS` 映射表和 `_getEndpoint()` 方法，`callAI` 动态获取端点。

**文件**：`js/services/aiService.js`、`js/app.js`、`js/pages/settingsPage.js`

---

## 26. AI配置初始有默认值

**现象**：设置页面打开时，API Key 和模型已有默认值，不是空白状态。

**原因**：`aiService.js` 中 `API_KEY` 默认为 `'YOUR_API_KEY_HERE'`，`MODEL_NAME` 默认为 `'qwen3.6-plus'`。

**修复**：改为空字符串，由用户自行配置。

**文件**：`js/services/aiService.js`、`js/store.js`、`js/app.js`

---

## 27. 自定义服务商的模型选择应为文本输入

**现象**：选择"自定义（OpenAI兼容）"后，模型仍为下拉菜单（空列表）。

**原因**：`custom` 服务商的模型列表为空，但仍渲染下拉选择器。

**修复**：`provider === 'custom'` 时渲染文本输入框。

**文件**：`js/pages/settingsPage.js`

---

## 28. 下拉菜单关闭过渡期内选项仍可点击

**现象**：选择选项后菜单收起，但快速点击原位置会改变选择。

**原因**：CSS 过渡动画期间 `visibility` 尚未变为 `hidden`，选项仍可交互。

**修复**：添加 `pointer-events: none/auto` 和 `visibility` 延迟切换。

**文件**：`css/components.css`

---

## 29. 测验难度设置未生效

**现象**：在设置中切换测验难度后，生成的题目难度分布不变。

**原因**：`generateQuiz` 中难度分布硬编码为"简单3题、中等5题、困难2题"。

**修复**：读取 `Store.getQuizDifficulty()`，根据难度调整 prompt 中的分布和侧重。

**文件**：`js/services/aiService.js`

---

## 30. 保存配置按钮位置不合理

**现象**：保存按钮在 API Key 右侧，用户不易发现。

**原因**：保存按钮与输入框内联显示。

**修复**：移到 AI 模型配置模块底部，全宽按钮。

**文件**：`js/pages/settingsPage.js`、`css/pages/settings.css`

---

## 31. 已保存模型列表中当前模型显示切换/删除按钮

**现象**：当前使用的模型不应显示切换和删除操作。

**原因**：所有已保存模型都渲染相同的按钮。

**修复**：当前使用的模型改为显示"当前使用"标签，卡片高亮。

**文件**：`js/pages/settingsPage.js`、`css/pages/settings.css`

---

## 32. 首页未配置AI时无提示

**现象**：首次使用时用户不知道需要配置AI。

**原因**：首页无引导提示。

**修复**：首页加载后检测 `AiService.API_KEY`，为空时弹出 toast 提示"首次使用先配置AI模型哦"。

**文件**：`js/app.js`

---

## 33. 自定义端点需手动补全路径

**现象**：用户输入 `https://api.deepseek.com` 忘记加 `/chat/completions`，调用失败。

**原因**：端点输入无自动补全。

**修复**：保存时自动检测并补全 `/chat/completions`。

**文件**：`js/pages/settingsPage.js`

---

## 34. API Key初始显示掩码字符

**现象**：未保存过 API Key 时输入框就显示 `••••••••••••••••`。

**原因**：初始渲染时用 `settings.aiApiKey ? '••••' : ''` 判断，但 `aiApiKey` 可能有残留值。

**修复**：初始为空，保存后才显示掩码。

**文件**：`js/pages/settingsPage.js`

---

## 35. 已保存模型切换后API Key错误

**现象**：在已保存模型中切换后，API调用报错 "Incorrect API key"。

**原因**：每个已保存模型配置未存储 API Key，切换时用的是全局 `settings.aiApiKey`（可能是其他服务商的Key）。

**修复**：`_saveCurrentModelConfig` 保存时同时存储 `apiKey` 和 `endpoint`，`_switchToModel` 切换时从模型配置中恢复。

**文件**：`js/pages/settingsPage.js`

---

## 36. 每服务商模型下拉缺少"其他模型"选项

**现象**：用户想用预设列表之外的模型时无法输入。

**原因**：下拉菜单只有预设模型，无自定义输入入口。

**修复**：每个服务商下拉菜单末尾添加"其他模型（手动输入）"选项，选择后切换为文本输入框。

**文件**：`js/pages/settingsPage.js`

---

## 37. 进入课程加载耗时过长

**现象**：进入课程后需要等待第一问、第二问、第三问、知识库依次生成，耗时很长。

**原因**：所有阶段内容串行生成，用户必须等待全部完成。

**修复**：第一问优先加载显示，后台并行预生成第二问、第三问和知识库，页面底部显示生成状态提示。

**文件**：`js/pages/learningPage.js`

---

## 38. 数据管理中多余红字提示

**现象**：设置页面"危险操作"下方的红色警告文字"此操作不可恢复，请谨慎操作"多余。

**原因**：清除操作已有确认弹窗，红字提示重复。

**修复**：移除该提示文字。

**文件**：`js/pages/settingsPage.js`

---

## 39. 深色模式下拉箭头样式残留

**现象**：设置页面移除原生select后，深色模式下拉箭头CSS仍存在。

**原因**：未清理已废弃的 `.settings-select` 相关样式。

**修复**：清理 `.settings-select` 相关CSS，移除深色模式下拉箭头覆盖样式。

**文件**：`css/pages/settings.css`

---

## 40. IndexedDB 版本不匹配导致所有数据操作失败

**现象**：所有 IndexedDB 操作报 `VersionError`，课程、测评、知识库等数据完全无法读写。

**原因**：代码中 `DB_VERSION` 为 1，但浏览器 IndexedDB 中已存在版本 2（之前调试时创建）。

**修复**：
1. 将 `DB_VERSION` 改为 2
2. 新增 `_openWithVersion()` 和 `_initStores()` 方法
3. `openDB()` 增加自动恢复机制：捕获 `VersionError` 后先以 `undefined` 版本打开获取实际版本号，再以 `actualVersion + 1` 重新打开

**文件**：`js/store.js`

---

## 41. 第三问十道题目全部显示 undefined

**现象**：第三问所有题目内容、选项、解析均显示 `undefined`。

**原因**：`_bgGeneratePhase3` 使用 `mockGenerateQuiz` 返回原始 AI 数据（字段名为 `question`），但渲染组件期望 `content` 字段。

**修复**：
1. 将 `_bgGeneratePhase3` 改为使用 `mockGenerateDeepQuestions`
2. 在 `assessmentPage.js` 和 `learningPage.js` 中添加 `_normalizeQuizData()` 方法，统一字段名映射（`question`→`content`）和类型规范化

**文件**：`js/pages/learningPage.js`、`js/pages/assessmentPage.js`、`js/mock/aiMock.js`

---

## 42. 选项标签重复显示（如 "A. D. xxx"）

**现象**：选项内容显示为"A. D. xxx"，选项字母前缀重复。

**原因**：AI 返回选项为 "A. text" 格式字符串，`_convertOptions` 保留了前缀字母，`_shuffleOptions` 又重新分配标签导致重复。

**修复**：在 `_convertOptions` 和 `_normalizeQuizData` 中添加 `stripPrefix` 正则，去除选项内容中的字母前缀（`/^[\s]*[A-Fa-f][\.\、\s]+/`）。

**文件**：`js/mock/aiMock.js`、`js/pages/learningPage.js`、`js/pages/assessmentPage.js`

---

## 43. AI解释按钮变细（高度减小）

**现象**：题目下方的"追问AI"按钮高度明显变小。

**原因**：按钮同时使用了 `btn-ai-help` 和 `btn-sm` 两个 CSS 类，`btn-sm` 的 `padding` 和 `font-size` 覆盖了 `btn-ai-help` 的样式。

**修复**：移除按钮上的 `btn-sm` 类，保留 `btn btn-ai-help`。

**文件**：`js/components/quizItem.js`

---

## 44. 出现多选题

**现象**：第三问十道题中出现多选题，不符合产品需求。

**原因**：AI Prompt 允许多选类型（`type: "multi"`），未明确限制。

**修复**：
1. 更新所有 AI Prompt，明确要求只生成单选题（`type: "single"`）和判断题（`type: "judge"`）
2. 在 `_convertQuestionsToQuizFormat` 和 `_normalizeQuizData` 中强制类型规范化：`judge`/`truefalse`→`judge`，其他→`single`
3. 更新 fallback 数据，全部改为 `single` 和 `judge` 类型

**文件**：`js/services/aiService.js`、`js/mock/aiMock.js`、`js/mock/dataMock.js`、`js/pages/learningPage.js`、`js/pages/assessmentPage.js`

---

## 45. 数学公式无法渲染（显示原始 LaTeX 文本）

**现象**：AI 生成的文字中包含 LaTeX 公式（如 `$e^{kt}$`）直接显示为原始文本。

**原因**：项目无任何数学公式渲染支持。

**修复**：创建 `mathRenderer.js`，纯本地轻量实现 LaTeX→Unicode/HTML 转换：
- 希腊字母映射（`\alpha`→α）
- 数学符号映射（`\infty`→∞、`\sum`→Σ）
- 上下标转换（`^{kt}`→`<sup>kt</sup>`）
- 分式、平方根、三角函数等转换
- 通过占位符模式在 Markdown 渲染前后提取/恢复公式

在 `quizItem.js`、`aiChatWidget.js`、`materialList.js`、`assessmentDialog.js`、`debatePanel.js`、`mentalModelList.js` 中集成。

**文件**：`js/mathRenderer.js`（新建）、`index.html`、`css/components.css` 及 6 个组件文件

---

## 46. 卡片高度异常（第二题之后区域变高）

**现象**：第三问第二道题目之后的卡片区域变得非常高，蓝色左侧边条可见异常。

**原因**：浏览器跟踪预防功能（Tracking Prevention）完全屏蔽了 KaTeX CDN 的 CSS 和 JS 资源（12 条阻止记录），导致 `mathRenderer.js` 依赖的 KaTeX 库加载失败，渲染出的 HTML 元素没有正确样式，布局崩溃。

**修复**：
1. 移除 `index.html` 中的 3 行 KaTeX CDN `<link>`/`<script>` 引用
2. 将 `mathRenderer.js` 从 KaTeX 依赖改写为纯本地 Unicode 转换实现，零外部依赖
3. 在 `components.css` 中添加 `.math-display` 和 `.math-inline` 专用样式

**文件**：`index.html`、`js/mathRenderer.js`、`css/components.css`

---

## 47. 后台预加载状态提示多余

**现象**：页面底部出现"正在后台预加载后续内容..."浮动提示。

**原因**：后台预生成使用 `_showBgStatus` 显示状态，对用户造成干扰。

**修复**：移除 `_showBgStatus` 和 `_hideBgStatus` 方法及其所有调用，后台预生成静默执行。

**文件**：`js/pages/learningPage.js`

---

## 48. 课程资料串到其他课程

**现象**：JavaScript 编程基础课程的资料库中显示了"高中数学函数"的 AI 总结资料。

**原因**：`mockGenerateMaterials` 和 `_generateSummaryDocuments` 通过 `Store.getCourse(courseId)` 重新获取课题，并发场景下返回了错误课程的数据。

**修复**：为 `mockGenerateMaterials` 和 `_generateSummaryDocuments` 新增 `topicHint` 参数，调用方从已有的课程数据中提取课题一路透传，不再依赖 `Store.getCourse()` 二次查询。

**文件**：`js/mock/aiMock.js`、`js/pages/learningPage.js`、`js/pages/knowledgeRepositoryPage.js`

---

## 49. 数学题目卡片布局被破坏

**现象**：包含数学符号（如 `<`、`>`）的题目卡片高度异常，蓝色边框错位重叠。

**原因**：题目和选项内容直接插入 HTML 模板未做转义，`x < 0` 中的 `<` 被浏览器解析为 HTML 标签，破坏 DOM 结构。

**修复**：在 `QuizItem` 中添加 `_esc()` HTML 转义方法，应用到所有 HTML 渲染点：题目文本、选项内容、答案解析、出题意图、常见误解、知识标签、正确答案显示、错题回顾。

**文件**：`js/components/quizItem.js`

---

## 50. AI补充资料弹窗变小

**现象**：点击 AI 补充资料弹出的预览窗口宽度明显变小。

**原因**：`components.css` 中 `.modal-lg { max-width: 700px }` 特异性（0,1,0）与 `settings.css`/`profile.css` 中 `.modal-content { max-width: 500px }` 相同，后加载的 CSS 覆盖了 `.modal-lg`。

**修复**：将三个模块的 modal 类名完全分离：
- `components.css` → `.modal-*`（通用组件库）
- `settings.css` → `.settings-modal-*`（设置页专用）
- `profile.css` → `.profile-modal-*`（个人中心专用）

**文件**：`css/components.css`、`css/pages/settings.css`、`css/pages/profile.css`、`js/pages/settingsPage.js`、`js/pages/profilePage.js`

---

## 51. 外部学习资料推荐内容不相关

**现象**：AI 推荐的学习资料以英文文档为主，不符合国内用户习惯。

**原因**：AI Prompt 指定推荐 MDN、GitHub 等英文资源。

**修复**：更新 AI Prompt，优先推荐国内主流视频平台资源（B站、中国大学MOOC、慕课网、网易公开课、腾讯课堂等），同步更新降级模拟数据。

**文件**：`js/services/aiService.js`、`js/mock/dataMock.js`

---

## 52. 资料卡片图标不显示

**现象**：外部学习资料卡片左侧没有图标，只有 AI 总结资料有。

**原因**：部分 emoji（如 ` `）在某些系统/浏览器中不渲染。

**修复**：将 emoji 图标改为 SVG + 纯文本方案：视频用 ▶️ SVG 三角、PDF 用红色"PDF"文字、Word 用蓝色"DOC"文字、链接用 🔗 SVG 等，每种类型配渐变背景色。

**文件**：`js/components/materialList.js`

---

## 53. 评估数据统计不准确

**现象**：
1. AI 咨询同一知识点重复计数
2. 测验正确率没有记录每次成绩
3. 资料阅读同一资料重复计数

**原因**：
1. AI 咨询每次点击都 +1，不区分话题
2. 测验完成回调不传递 result 参数，且只在通过时触发
3. 资料阅读每次打开都 +1，不区分资料 ID

**修复**：
1. **AI 咨询**：新增 `recordAiConsultation(courseId, topic)` 方法，用 `topics[]` 数组去重
2. **测验记录**：新增 `recordQuizAttempt(courseId, accuracy, correctCount, totalQuestions)` 方法，存储历史记录到 `quiz_history[]`；`onComplete` 回调改为每次都触发（移除 `passed` 条件），`learningPage` 和 `assessmentPage` 均调用记录
3. **资料阅读**：`recordMaterialRead` 新增 `materialId` 参数，用 `readItems[]` 数组去重

**文件**：`js/store.js`、`js/components/aiChatWidget.js`、`js/components/quizItem.js`、`js/pages/learningPage.js`、`js/pages/assessmentPage.js`、`js/components/materialList.js`

---

## 54. 判断题答案判定错误

**现象**：判断题中用户选择正确答案，系统判定为错误，然后显示的正确答案就是用户选的那个。

**原因**：判断题答案存储格式为 `['B']`（label 格式），但用户选择的 radio value 是 `"对"`/`"错"`，比较 `"B" === "错"` 永远不匹配。

**修复**：
1. `_normalizeAnswer` 对判断题特殊处理，统一映射为 `"对"`/`"错"`（兼容 "A"/"B"/"true"/"false"/"正确"/"错误"）
2. `_normalizeQuizData` 加载缓存数据时自动修正判断题答案格式
3. `_submitAnswer` 中判断题选项查找增加 "对"→"正确"、"错"→"错误" 映射
4. 正确答案高亮改为按 label/content/value 三维度匹配
5. 判断题错误提示只显示内容文本（如"错"），不显示 "B. 错"

**文件**：`js/mock/aiMock.js`、`js/pages/learningPage.js`、`js/pages/assessmentPage.js`、`js/components/quizItem.js`

---

## 55. 判断题选项显示冗余文字

**现象**：判断题选项显示为"对 正确""错 错误"，文字重复。

**原因**：判断题渲染模板包含 `option-label`（对/错）和 `option-content`（正确/错误）两个 span。

**修复**：移除判断题渲染中的 `option-content` span，只保留 `option-label`（对/错）。

**文件**：`js/components/quizItem.js`
