/**
 * 初始模拟数据 DataMock
 * 提供演示用的模拟课程数据
 */
const DataMock = {
    /** 生成一组示例课程 */
    getSampleCourses() {
        return [
            new Course({
                id: 'sample_js',
                title: 'JavaScript 编程开发',
                query: '如何快速掌握JavaScript编程开发？',
                createdAt: Date.now() - 86400000 * 3,
                updatedAt: Date.now() - 86400000,
                status: 'active',
                subject: '计算机科学',
                rating: 0,
                abilityMapping: ['critical', 'systems', 'practical'],
                progress: { phase1: true, phase2: false, phase3: false },
                abilities: { critical: 6.5, creative: 3.0, systems: 7.0, practical: 7.5, metacognitive: 4.0, connection: 5.0 }
            }),
            new Course({
                id: 'sample_ml',
                title: '机器学习基础',
                query: '机器学习入门需要哪些数学基础？',
                createdAt: Date.now() - 86400000 * 7,
                updatedAt: Date.now() - 86400000 * 2,
                status: 'active',
                subject: '数学',
                rating: 0,
                abilityMapping: ['critical', 'systems'],
                progress: { phase1: true, phase2: true, phase3: false },
                abilities: { critical: 7.0, creative: 3.5, systems: 8.0, practical: 5.0, metacognitive: 4.5, connection: 6.0 }
            }),
            new Course({
                id: 'sample_ds',
                title: '数据结构与算法',
                query: '如何系统学习数据结构和算法？',
                createdAt: Date.now() - 86400000 * 14,
                updatedAt: Date.now() - 86400000 * 10,
                status: 'completed',
                subject: '计算机科学',
                rating: 88,
                abilityMapping: ['critical', 'systems', 'practical'],
                progress: { phase1: true, phase2: true, phase3: true },
                abilities: { critical: 8.0, creative: 4.0, systems: 8.5, practical: 7.0, metacognitive: 5.5, connection: 6.5 }
            })
        ];
    },

    /** 生成示例知识图谱（JavaScript） */
    getSampleKnowledgeGraph(courseId) {
        return {
            courseId: courseId,
            nodes: [
                { id: 'js', label: 'JavaScript', type: 'concept', description: '一种高级动态编程语言，广泛用于Web开发', depth: 0 },
                { id: 'syntax', label: '语法基础', type: 'concept', description: '变量、数据类型、运算符、控制流', depth: 1 },
                { id: 'function', label: '函数', type: 'concept', description: '函数定义、作用域、闭包', depth: 1 },
                { id: 'object', label: '对象与原型', type: 'concept', description: '原型链、继承、类', depth: 1 },
                { id: 'async', label: '异步编程', type: 'method', description: '回调、Promise、async/await', depth: 1 },
                { id: 'dom', label: 'DOM操作', type: 'method', description: '文档对象模型、事件处理', depth: 2 },
                { id: 'es6', label: 'ES6+ 特性', type: 'theory', description: '箭头函数、解构、模块化', depth: 2 },
                { id: 'eventLoop', label: '事件循环', type: 'theory', description: '微任务与宏任务、执行栈', depth: 2 }
            ],
            edges: [
                { source: 'js', target: 'syntax', relation: '包含' },
                { source: 'js', target: 'function', relation: '包含' },
                { source: 'js', target: 'object', relation: '包含' },
                { source: 'js', target: 'async', relation: '包含' },
                { source: 'function', target: 'es6', relation: '扩展' },
                { source: 'object', target: 'es6', relation: '扩展' },
                { source: 'async', target: 'eventLoop', relation: '依赖' },
                { source: 'async', target: 'dom', relation: '应用' }
            ]
        };
    },

    /** 生成示例争议点（JavaScript） */
    getSampleDebates(courseId) {
        return {
            courseId: courseId,
            topics: [
                {
                    id: 'debate_1',
                    title: 'TypeScript 是否应该成为 JavaScript 开发的标准？',
                    coreQuestion: '类型系统带来的好处是否超过了其引入的复杂性成本？',
                    sideA: {
                        label: '支持 TypeScript',
                        strongestArgument: 'TypeScript 提供了静态类型检查，能在编译阶段发现潜在错误，显著减少生产环境中的类型相关bug。大型项目中，类型系统作为文档和约束，极大提升代码可维护性和团队协作效率。',
                        supportingScholars: ['Microsoft TypeScript 团队', 'Stack Overflow 2023 调查'],
                        evidences: [
                            { source: 'Microsoft TypeScript 官方文档', content: 'TypeScript 提供了静态类型检查，能在编译阶段发现潜在错误。' },
                            { source: 'Stack Overflow 2023 调查', content: 'TypeScript 在开发者最喜爱的语言中连续多年排名前三。' }
                        ]
                    },
                    sideB: {
                        label: '反对 TypeScript',
                        strongestArgument: '类型系统增加了学习成本和开发启动成本，对小型项目、快速原型和个人项目来说过度工程化。TypeScript 的配置复杂，类型定义维护成本在某些场景下超过了带来的收益。',
                        supportingScholars: ['Douglas Crockford', '开发者社区'],
                        evidences: [
                            { source: 'JavaScript: The Good Parts 作者观点', content: '类型系统增加了学习成本，对小型项目来说过度工程化。' },
                            { source: '开发者社区讨论', content: 'TypeScript 的配置复杂，类型定义维护成本高。' }
                        ]
                    },
                    frontierImplication: '未来JavaScript标准可能引入可选的类型注解语法，在语言层面解决这个争议',
                    conclusion: '两者各有优劣。大型项目建议使用 TypeScript 以保证代码质量；小型项目或快速原型开发可直接使用 JavaScript。'
                },
                {
                    id: 'debate_2',
                    title: 'React Hooks 是否优于 Class 组件？',
                    coreQuestion: '函数式编程范式是否全面优于面向对象的组件组织方式？',
                    sideA: {
                        label: 'Hooks 更优',
                        strongestArgument: 'Hooks 使得状态逻辑可以在组件间复用，不再需要高阶组件和 render props 导致的层级嵌套。函数组件配合 Hooks 更符合声明式编程思想，代码更简洁、易测试。',
                        supportingScholars: ['React 核心团队', 'Dan Abramov'],
                        evidences: [
                            { source: 'React 官方文档', content: 'Hooks 使得状态逻辑可以复用，不再需要高阶组件和 render props。' },
                            { source: 'React Conf 2020', content: 'Hooks 简化了组件编写，减少了 class 组件中的 this 绑定问题。' }
                        ]
                    },
                    sideB: {
                        label: 'Class 仍适用',
                        strongestArgument: 'Class 组件提供清晰的生命周期方法命名，便于理解和调试。在复杂业务场景中，Class 组件的实例化机制和生命周期模型比 Hooks 的闭包机制更直观，闭包陷阱是 Hooks 的固有问题。',
                        supportingScholars: ['经验丰富的 React 开发者社区'],
                        evidences: [
                            { source: '开发者博客', content: 'Class 组件语义明确，尤其适合复杂的生命周期管理。' },
                            { source: '实际项目经验', content: 'Hooks 在大型组件中可能导致闭包陷阱，调试困难。' }
                        ]
                    },
                    frontierImplication: 'React 未来发展方向是 Server Components，Hooks 和 Class 的争论将不再是核心焦点',
                    conclusion: 'React 官方推荐使用 Hooks。但 Class 组件在遗留代码中广泛存在，理解两者对开发者很有价值。'
                }
            ]
        };
    },

    /** 生成示例测评题（JavaScript） */
    getSampleQuiz(courseId) {
        return {
            courseId: courseId,
            questions: [
                {
                    id: 'q1',
                    type: 'single',
                    level: 'memory',
                    content: 'JavaScript 中，以下哪个方法用于将 JSON 字符串转换为 JavaScript 对象？',
                    options: [
                        { label: 'A', content: 'JSON.stringify()' },
                        { label: 'B', content: 'JSON.convert()' },
                        { label: 'C', content: 'JSON.parse()' },
                        { label: 'D', content: 'JSON.toObject()' }
                    ],
                    answer: ['C'],
                    explanation: 'JSON.parse() 用于将 JSON 格式的字符串解析为 JavaScript 对象。JSON.stringify() 则相反。',
                    knowledgePoints: ['JSON', '数据转换']
                },
                {
                    id: 'q2',
                    type: 'single',
                    level: 'understand',
                    content: '以下关于闭包(Closure)的描述，哪一项是正确的？',
                    options: [
                        { label: 'A', content: '闭包只在箭头函数中存在' },
                        { label: 'B', content: '闭包和递归是同一个概念' },
                        { label: 'C', content: '闭包是指函数可以访问其外部作用域中的变量，即使外部函数已经返回' },
                        { label: 'D', content: '闭包会阻止垃圾回收，应避免使用' }
                    ],
                    answer: ['C'],
                    explanation: '闭包是函数与其词法环境的组合。内部函数可以访问外部函数的变量，这是 JavaScript 中实现数据封装和模块化的重要手段。',
                    knowledgePoints: ['闭包', '作用域']
                },
                {
                    id: 'q3',
                    type: 'single',
                    level: 'apply',
                    content: '给定数组 [1, 2, 3, 4, 5]，请选择将所有元素乘以2的正确代码：',
                    options: [
                        { label: 'A', content: 'arr.filter(x => x * 2)' },
                        { label: 'B', content: 'arr.forEach(x => x * 2)' },
                        { label: 'C', content: 'arr.reduce(x => x * 2)' },
                        { label: 'D', content: 'arr.map(x => x * 2)' }
                    ],
                    answer: ['D'],
                    explanation: 'map() 方法创建一个新数组，其中每个元素都是原数组对应元素经过回调函数处理后的结果。forEach 只遍历但不返回新数组。',
                    knowledgePoints: ['数组方法', 'map']
                },
                {
                    id: 'q4',
                    type: 'judge',
                    level: 'analyze',
                    content: 'Promise.all() 会在所有传入的 Promise 都 resolve 后执行 then，如果其中任意一个 reject 则会立即执行 catch。',
                    options: [
                        { label: '对', content: '' },
                        { label: '错', content: '' }
                    ],
                    answer: ['对'],
                    explanation: '正确。Promise.all() 的快速失败特性意味着只要其中一个 Promise 被拒绝，整体就会立即拒绝。',
                    knowledgePoints: ['Promise', '异步编程']
                },
                {
                    id: 'q5',
                    type: 'single',
                    level: 'evaluate',
                    content: '在以下场景中，最适合使用 async/await 的是：',
                    options: [
                        { label: 'A', content: '需要依次执行的多个异步操作，且后续操作依赖前一个结果' },
                        { label: 'B', content: '同步执行的数学计算' },
                        { label: 'C', content: '完全不涉及 I/O 操作的纯函数' },
                        { label: 'D', content: '需要并行执行大量独立请求' }
                    ],
                    answer: ['A'],
                    explanation: 'async/await 最擅长处理有依赖关系的异步操作序列，使代码看起来像同步代码，增强可读性。对于大量并行请求，Promise.all() 更合适。',
                    knowledgePoints: ['async/await', '异步模式选择']
                },
                {
                    id: 'q6',
                    type: 'single',
                    level: 'create',
                    content: '假设你需要设计一个可复用的防抖(debounce)函数，以下哪个实现是正确的？',
                    options: [
                        { label: 'A', content: 'function debounce(fn, delay) { fn(); setTimeout(fn, delay); }' },
                        { label: 'B', content: 'function debounce(fn, delay) { setInterval(fn, delay); }' },
                        { label: 'C', content: 'function debounce(fn, delay) { let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }' },
                        { label: 'D', content: 'function debounce(fn, delay) { return fn.bind(null, delay); }' }
                    ],
                    answer: ['C'],
                    explanation: '防抖的核心原理是：在指定时间内多次触发只执行最后一次。通过维护一个 timer，每次调用时清除之前的定时器，重新计时。',
                    knowledgePoints: ['防抖', '高阶函数', '闭包应用']
                },
                {
                    id: 'q7',
                    type: 'single',
                    level: 'evaluate',
                    content: 'JavaScript 中，以下哪个最能体现对闭包(Closure)的"真正理解"而非"仅仅知道定义"？',
                    options: [
                        { label: 'A', content: '能复述"闭包是函数和其词法环境的组合"' },
                        { label: 'B', content: '能记住闭包优缺点列表' },
                        { label: 'C', content: '能说出闭包消耗内存' },
                        { label: 'D', content: '能解释为什么在循环中用 var 声明变量会导致闭包问题，以及 let 如何解决' }
                    ],
                    answer: ['D'],
                    explanation: '能够解释具体编码场景中的闭包行为并对比不同解决方案，说明真正理解了闭包的作用域机制。',
                    expectedUnderstanding: '区分对闭包的概念记忆与对其作用域机制的行为理解',
                    misconceptionHint: '容易把背定义等同于理解，忽略了实际代码中的行为差异'
                },
                {
                    id: 'q8',
                    type: 'single',
                    level: 'evaluate',
                    content: '当 JavaScript 中 Promise 和 async/await 都可实现同一功能时，选择的关键依据是什么？',
                    options: [
                        { label: 'A', content: 'async/await 总是优于 Promise' },
                        { label: 'B', content: '凭个人喜好选择即可' },
                        { label: 'C', content: 'Promise 是遗留方案，应弃用' },
                        { label: 'D', content: '取决于异步操作之间的依赖关系和错误处理需求' }
                    ],
                    answer: ['D'],
                    explanation: '选择的关键在于理解异步操作间的依赖模式：有依赖链用 async/await，无依赖的并行操作用 Promise.all。',
                    expectedUnderstanding: '理解异步模式选择背后的权衡逻辑，而非机械记忆语法',
                    misconceptionHint: '容易认为新语法一定优于旧语法，忽略了适用场景的差异'
                },
                {
                    id: 'q9',
                    type: 'single',
                    level: 'evaluate',
                    content: 'JavaScript 原型继承和 Class 继承的本质区别是什么？',
                    options: [
                        { label: 'A', content: 'Class 是全新的继承机制，与原型无关' },
                        { label: 'B', content: 'Class 本质上是原型继承的语法糖，但提供了更清晰的声明式接口和更严格的语义' },
                        { label: 'C', content: '原型继承是对象间的委托，Class 继承是类间的复制' },
                        { label: 'D', content: '两者在运行时的行为完全不同' }
                    ],
                    answer: ['B'],
                    explanation: 'Class 在底层仍然是基于原型的继承机制，它优化的是开发者的声明体验而非底层模型。',
                    expectedUnderstanding: '理解语法糖和底层机制的关系，区分语法层面和语义层面的认识',
                    misconceptionHint: '容易误以为 Class 是独立的继承模型，而忽略其原型本质'
                },
                {
                    id: 'q10',
                    type: 'single',
                    level: 'create',
                    content: '如果你要为一个团队设计一套前端错误监控方案，以下哪种架构最合理？',
                    options: [
                        { label: 'A', content: '使用 window.onerror + unhandledrejection 全局捕获，结合 source map 定位源码，上报到统一监控平台' },
                        { label: 'B', content: '在每个函数中手动 try-catch 并 console.log' },
                        { label: 'C', content: '只在生产环境关闭所有错误提示' },
                        { label: 'D', content: '依赖用户反馈来发现错误' }
                    ],
                    answer: ['A'],
                    explanation: '合理的错误监控需要全局捕获（window.onerror、unhandledrejection）、source map 还原、结构化上报和告警机制，这是综合运用多个知识点的系统设计能力。',
                    expectedUnderstanding: '考察综合运用异步错误处理、浏览器错误事件、工程化等知识进行系统设计的能力',
                    misconceptionHint: '容易只关注单点方案而忽视系统性'
                }
            ]
        };
    },

    /**
     * 生成示例资料（使用真实搜索URL）
     * @param {string} courseId
     * @param {string} [topic] - 课程主题，用于构造搜索URL
     */
    getSampleMaterials(courseId, topic) {
        const q = encodeURIComponent(topic || '学习');
        const textPlatforms = [
            { source: '知乎', title: `${topic || ''} 相关话题深度讨论`, tags: ['问答讨论', '深度解析'], url: `https://www.zhihu.com/search?type=content&q=${q}` },
            { source: '百度文库', title: `${topic || ''} 专业文档资料`, tags: ['文档资料', '专业'], url: `https://wenku.baidu.com/search?word=${q}` },
            { source: '菜鸟教程', title: `${topic || ''} 入门到精通教程`, tags: ['教程', '入门'], url: `https://www.runoob.com/` },
            { source: 'GitHub', title: `${topic || ''} 开源项目与代码示例`, tags: ['开源项目', '代码示例'], url: `https://github.com/search?q=${q}&type=repositories` },
            { source: 'CSDN', title: `${topic || ''} 技术博客与解决方案`, tags: ['技术博客', '解决方案'], url: `https://so.csdn.net/so/search?q=${q}` },
            { source: '掘金', title: `${topic || ''} 技术文章精选`, tags: ['技术文章', '开发者社区'], url: `https://juejin.cn/search?query=${q}` },
            { source: 'SegmentFault', title: `${topic || ''} 技术问答与讨论`, tags: ['技术问答', '社区讨论'], url: `https://segmentfault.com/search?q=${q}` },
            { source: '博客园', title: `${topic || ''} 开发者博客`, tags: ['博客', '技术分享'], url: `https://zzk.cnblogs.com/s?w=${q}` }
        ];
        const videoPlatforms = [
            { source: 'B站', title: `${topic || ''} B站热门学习视频合集`, tags: ['视频教程', '入门'], url: `https://search.bilibili.com/all?keyword=${q}` },
            { source: '中国大学MOOC', title: `${topic || ''} 高校精品课程`, tags: ['高校课程', '系统学习'], url: `https://www.icourse163.org/search.htm?search=${q}` },
            { source: '慕课网', title: `${topic || ''} 实战技术教程`, tags: ['实战', '进阶'], url: `https://www.imooc.com/search/?word=${q}` },
            { source: '网易公开课', title: `${topic || ''} 名校公开课资源`, tags: ['公开课', '名校课程'], url: `https://open.163.com/` },
            { source: '抖音', title: `${topic || ''} 知识短视频精选`, tags: ['短视频', '碎片学习'], url: `https://www.douyin.com/search/${q}` },
            { source: '腾讯课堂', title: `${topic || ''} 在线培训课程`, tags: ['在线课程', '培训'], url: `https://ke.qq.com/search.html?word=${q}` },
            { source: '优酷', title: `${topic || ''} 教学视频`, tags: ['教学视频', '详细讲解'], url: `https://so.youku.com/search_video/q_${q}` },
            { source: '西瓜视频', title: `${topic || ''} 知识科普视频`, tags: ['科普', '通俗易懂'], url: `https://www.ixigua.com/search/${q}` }
        ];
        // 随机选取6-8个
        const shuffleAndPick = (arr, min, max) => {
            const shuffled = [...arr].sort(() => Math.random() - 0.5);
            const count = min + Math.floor(Math.random() * (max - min + 1));
            return shuffled.slice(0, Math.min(count, arr.length));
        };
        const selectedText = shuffleAndPick(textPlatforms, 6, 8);
        const selectedVideo = shuffleAndPick(videoPlatforms, 6, 8);
        const now = Date.now();
        return {
            courseId: courseId,
            items: [
                ...selectedText.map((item, i) => ({
                    id: `text_${i + 1}`,
                    title: item.title,
                    type: 'ai',
                    category: 'text',
                    format: 'link',
                    source: item.source,
                    size: null,
                    uploadTime: now - 86400000 * (i + 1),
                    tags: item.tags,
                    url: item.url
                })),
                ...selectedVideo.map((item, i) => ({
                    id: `vid_${i + 1}`,
                    title: item.title,
                    type: 'ai',
                    category: 'video',
                    format: 'video',
                    source: item.source,
                    size: null,
                    uploadTime: now - 3600000 * (i + 1),
                    tags: item.tags,
                    url: item.url
                }))
            ]
        };
    },

    /* ==================== 核心三问框架新数据 ==================== */

    /** 生成示例心智模型（5个核心模型） */
    getSampleMentalModels(courseId) {
        return {
            courseId: courseId,
            mentalModels: [
                {
                    id: 'mm_1',
                    name: '系统思维',
                    description: '将事物视为相互关联的整体来理解',
                    principle: '整体大于部分之和，理解系统需要分析元素间的关系而非孤立元素',
                    application: '用于分析复杂问题，识别因果链和反馈回路'
                },
                {
                    id: 'mm_2',
                    name: '第一性原理',
                    description: '回归最基本的真理或假设进行推理',
                    principle: '将复杂问题分解到最基本的单元，再从基础向上构建理解',
                    application: '用于突破思维定式，从本质思考问题解决方案'
                },
                {
                    id: 'mm_3',
                    name: '逆向思维',
                    description: '从目标反向推导实现路径',
                    principle: '先明确期望的结果，再反向推理需要满足的条件和步骤',
                    application: '用于目标规划和问题解决，避免正向推理的盲区'
                },
                {
                    id: 'mm_4',
                    name: '归纳与演绎',
                    description: '从特殊到一般和从一般到特殊的推理',
                    principle: '归纳从具体案例提炼通则，演绎从通则推导具体结论',
                    application: '用于理论构建和假设验证，形成完整论证链条'
                },
                {
                    id: 'mm_5',
                    name: '思维实验',
                    description: '在头脑中模拟场景来检验想法',
                    principle: '通过假设性推理探索概念的内涵和逻辑一致性',
                    application: '用于检验理论假设，在无法实证时推演可能结果'
                }
            ]
        };
    }
};
