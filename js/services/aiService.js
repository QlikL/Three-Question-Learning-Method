/**
 * 阿里云百炼 AI 服务
 * 用于调用大语言模型API
 * 
 * 【配置说明】
 * 1. API Key获取方式：
 *    - 登录阿里云百炼平台：https://bailian.console.aliyun.com/
 *    - 进入"API-KEY管理"页面
 *    - 创建并复制你的API Key
 * 
 * 2. 模型名称：
 *    - 通义千问系列模型：
 *      * qwen-turbo（速度快，成本低）
 *      * qwen-plus（均衡推荐）
 *      * qwen-max（效果最好，成本高）
 *      * qwen-long（适合长文本）
 * 
 * 3. 将下方的 YOUR_API_KEY_HERE 和 YOUR_MODEL_NAME_HERE 替换为你的实际值
 */

const AiService = {
    // ==================== 配置区域 ====================
    // ⚠️ 请在设置页面配置 API Key 和模型名称
    API_KEY: '',
    
    // ⚠️ 请在设置页面选择模型
    MODEL_NAME: '',

    // 当前服务商
    PROVIDER: '',
    
    // API 端点（根据服务商自动切换）
    API_ENDPOINT: '',

    // 各服务商 API 端点映射
    PROVIDER_ENDPOINTS: {
        dashscope: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/chat/completions',
        moonshot: 'https://api.moonshot.cn/v1/chat/completions',
        zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        spark: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
        baidu: 'https://qianfan.baidubce.com/v2/chat/completions',
        tencent: 'https://api.lkeap.cloud.tencent.com/v1/chat/completions',
        custom: ''
    },
    
    // 额外参数（某些模型需要）
    EXTRA_PARAMS: {
        enable_thinking: false  // qwen3 系列模型需要设置为 false
    },
   // ==================================================

    /* ==================== 核心三问框架 AI 方法 ==================== */
    // ⚠️ 以下方法对应核心三问框架的三个问题和错误反馈闭环
    // 旧方法（generateKnowledgeGraph、mineDebates、generateQuiz）保留在下方

    /**
     * 提取领域5个核心心智模型（第一问）
     * 目标：识别专家共享的底层思维框架和第一性原理
     * @param {string} topic - 学习主题
     * @returns {Promise<Object>} 心智模型数据
     */
    async extractMentalModels(topic) {
        const prompt = `你是一个认知科学和学科分析专家。请为以下学习主题提取该领域专家共享的核心心智模型。

学习主题：${topic}

心智模型是专家用来理解和解决问题的底层思维框架，是领域的"第一性原理"。

请返回JSON格式：
{
  "mentalModels": [
    {
      "id": "mm_1",
      "name": "心智模型名称（2-6字）",
      "description": "该心智模型的简要描述（50字以内）",
      "principle": "该心智模型的底层第一性原理或核心逻辑（80字以内）",
      "application": "该模型如何帮助理解领域问题（80字以内）"
    }
    // ... 共5个
  ]
}

要求：
- 精确输出5个核心心智模型，不多不少
- 名称要简洁有力，能概括该思维框架的本质
- description要有助于快速理解该模型
- principle要揭示底层的根本逻辑
- application要说明实际用途`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.3, max_tokens: 3000 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.mentalModels && data.mentalModels.length > 0) {
                    // 确保恰好5个
                    while (data.mentalModels.length < 5) {
                        data.mentalModels.push(this._generateFallbackMentalModel(data.mentalModels.length + 1));
                    }
                    return data;
                }
            }
        } catch (e) {
            console.warn('心智模型提取解析失败:', e);
        }

        // 降级到模板数据
        return { mentalModels: this._generateFallbackMentalModels() };
    },

    /**
     * 定位领域3个根本性分歧（第二问）
     * 目标：揭示专家存在根本性争议的地方，帮助学习者快速定位知识边界
     * @param {string} topic - 学习主题
     * @returns {Promise<Object>} 分歧数据
     */
    async identifyDisagreements(topic) {
        const prompt = `你是一个学术研究专家。请为以下学习主题定位该领域专家存在根本性分歧的关键争议点。

学习主题：${topic}

请返回JSON格式：
{
  "disagreements": [
    {
      "id": "dg_1",
      "title": "分歧主题",
      "coreQuestion": "核心争议问题（一句话概括）",
      "sideA": {
        "label": "立场A的名称",
        "strongestArgument": "最有力论据（100-150字，概括性陈述）",
        "supportingScholars": ["代表学者/学派1", "代表学者/学派2"],
        "evidences": [
          {"source": "来源1", "content": "具体证据或研究发现（50字以内）"},
          {"source": "来源2", "content": "具体证据或研究发现（50字以内）"}
        ]
      },
      "sideB": {
        "label": "立场B的名称",
        "strongestArgument": "最有力论据（100-150字，概括性陈述）",
        "supportingScholars": ["代表学者/学派1", "代表学者/学派2"],
        "evidences": [
          {"source": "来源1", "content": "具体证据或研究发现（50字以内）"},
          {"source": "来源2", "content": "具体证据或研究发现（50字以内）"}
        ]
      },
      "frontierImplication": "该分歧对领域前沿研究和实践的影响（50字以内）"
    }
    // ... 共3个
  ]
}

要求：
- 精确输出3个根本性分歧，不多不少
- strongestArgument是概括性的核心论据陈述
- evidences是具体的支撑证据、研究发现或案例，与strongestArgument内容不同
- 每个立场提供2-3个证据
- 代表学者要真实可信
- frontierImplication要说明这个争议对领域发展的意义`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.8, max_tokens: 3000 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.disagreements && data.disagreements.length > 0) {
                    while (data.disagreements.length < 3) {
                        data.disagreements.push(this._generateFallbackDisagreement(data.disagreements.length + 1));
                    }
                    return data;
                }
            }
        } catch (e) {
            console.warn('分歧定位解析失败:', e);
        }

        return { disagreements: this._generateFallbackDisagreements() };
    },

    /**
     * 生成10道深度理解测试题（第三问）
     * 目标：生成能区分"真正理解"和"死记硬背"的高阶问题
     * @param {string} topic - 学习主题
     * @returns {Promise<Object>} 深度理解题数据
     */
    async generateDeepQuestions(topic) {
        const prompt = `你是一个教育测评设计专家。请为以下学习主题生成10道深度理解测试题。

学习主题：${topic}

这些题目的核心目标是区分"真正理解了该学科"还是"仅仅记住了事实"。

请返回JSON格式：
{
  "questions": [
    {
      "id": "1",
      "type": "single",
      "level": "understand",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案（单个字符串，如A/B/C/D，判断题为"对"或"错"）",
      "explanation": "为什么这个答案体现深层理解（80字以内）",
      "expectedUnderstanding": "出题意图（40字以内）",
      "misconceptionHint": "选错通常意味着什么误解（40字以内）"
    }
    // ... 共10道
  ]
}

题型要求（极其重要）：
- 所有题目必须为单选题（type: "single"，4个选项）或判断题（type: "judge"，选项为["对","错"]）
- 严禁出现多选题！每道题只能有一个正确答案
- 单选题8道，判断题2道
- type字段只能是"single"或"judge"，不要使用其他值

认知层级分布要求（level字段必须严格按以下分布）：
- 理解层（level: "understand"）：3道，考察概念本质和原理理解
- 应用层（level: "apply"）：3道，考察在新情境中运用知识的能力
- 分析层（level: "analyze"）：2道，考察拆解问题、识别因果关系的能力
- 评价层（level: "evaluate"）：2道，考察批判性思维和权衡判断的能力

设计原则：
- 避免考察事实记忆（如"XX是哪一年提出的"）
- 设计需要理解概念关系、原理机制、权衡取舍才能作答的问题
- 每道题的level必须与上述分布严格对应，不要全部使用同一个level
- 每题都需要应用、分析、综合或评价层次的认知活动
- 选项设计要有迷惑性，错误选项应反映常见误解
- 精确输出10道题，不多不少`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.6, max_tokens: 4000 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.questions && data.questions.length > 0) {
                    while (data.questions.length < 10) {
                        data.questions.push(this._generateFallbackDeepQuestion(data.questions.length + 1, topic));
                    }
                    return data;
                }
            }
        } catch (e) {
            console.warn('深度理解题生成解析失败:', e);
        }

        return { questions: this._generateFallbackDeepQuestions(topic) };
    },

    /**
     * 解释错误答案（追问AI反馈闭环）
     * 用于第三问答错后，用户点击"追问AI"时调用
     * @param {Object} params - { question, userAnswer, correctAnswer, options }
     * @returns {Promise<string>} 个性化错误解释
     */
    async explainWrongAnswer({ question, userAnswer, correctAnswer, options, isCorrect, explanation }) {
        let prompt;
        if (isCorrect) {
            prompt = `你是一个耐心的学习辅导老师。学生答对了一道深度理解题，请给予肯定并帮助他加深理解。

题目：${question}
学生选择的答案：${userAnswer}

请用一段话：
1. 肯定学生的回答
2. 简要解释为什么这个答案是正确的（深层理解）
3. 给一个拓展学习建议

语言简洁亲切，150字以内。`;
        } else {
            prompt = `你是一个耐心的学习辅导老师。学生做错了一道深度理解题，请帮助他理解为什么错了。

题目：${question}
选项：${options ? options.join(' | ') : ''}
正确答案：${correctAnswer}
学生选择的答案：${userAnswer}

请用一段话解释：
1. 为什么学生的选择是错误的（指出具体错误原因）
2. 正确答案为什么是对的（解释深层理解）
3. 学生遗漏了什么关键概念或误解了什么
4. 给一个简短的学习建议

语言简洁亲切，200字以内。`;
        }

        try {
            return await this.callAI([
                { role: 'user', content: prompt }
            ], { temperature: 0.7, max_tokens: 1000 });
        } catch (e) {
            console.warn('错误追问AI调用失败:', e);
            throw e;
        }
    },

    /* ==================== 课程学习评估 ==================== */

    /**
     * 生成课程学习评估报告
     * 基于五个维度的学习数据，生成约500字的学习情况总结
     * @param {Object} assessmentData - 评估数据
     * @returns {Promise<string>} 评估报告内容
     */
    async generateAssessmentReport(assessmentData) {
        const { courseTitle, dimensions } = assessmentData;
        
        const prompt = `你是一个专业的学习分析师。请根据以下学习数据，为用户生成一份课程学习评估报告。

课程名称：${courseTitle}

学习数据：
1. AI咨询次数：${dimensions.aiConsultation.count}次 - ${dimensions.aiConsultation.description}
2. 学习进度：${dimensions.learningProgress.completedPhases}/${dimensions.learningProgress.totalPhases}阶段完成（${dimensions.learningProgress.percentage}%） - ${dimensions.learningProgress.description}
3. 测验表现：答对${dimensions.quizPerformance.correctCount}/${dimensions.quizPerformance.totalQuestions}题，正确率${dimensions.quizPerformance.accuracy}%，测验次数${dimensions.quizPerformance.attemptCount}次 - ${dimensions.quizPerformance.description}
4. 资料阅读：阅读${dimensions.materialReading.readCount}份资料，类型包括${dimensions.materialReading.readTypes.join('、') || '无'} - ${dimensions.materialReading.description}
5. 资料上传：上传${dimensions.materialUpload.uploadCount}份资料，类型包括${dimensions.materialUpload.uploadTypes.join('、') || '无'} - ${dimensions.materialUpload.description}

参与度等级：${assessmentData.summary.engagementLevel}

请生成一份约500字的学习评估报告，包含以下部分：

【学习优点】
列出2-3个该用户在学习过程中的亮点和优势

【学习不足】
指出2-3个需要改进的地方

【需要提升的知识点】
根据测验表现和学习进度，指出需要加强的具体知识点或技能

【学习建议】
给出3-4条具体可行的改进建议

要求：
- 语言亲切友好，鼓励为主
- 分析要基于数据，不要凭空臆造
- 建议要具体可操作
- 总字数控制在450-550字之间`;

        try {
            const response = await this.callAI([
                { role: 'user', content: prompt }
            ], { temperature: 0.7, max_tokens: 2000 });
            return response;
        } catch (e) {
            console.warn('评估报告生成失败:', e);
            return this._generateFallbackAssessmentReport(assessmentData);
        }
    },

    /** 生成降级评估报告 */
    _generateFallbackAssessmentReport(data) {
        const { courseTitle, dimensions } = data;
        const progress = dimensions.learningProgress.percentage;
        const accuracy = dimensions.quizPerformance.accuracy;
        
        let report = `【${courseTitle} 学习评估报告】\n\n`;
        
        report += `【学习优点】\n`;
        if (dimensions.aiConsultation.count > 3) {
            report += `- 积极利用AI辅助学习，主动提问${dimensions.aiConsultation.count}个知识点，展现了良好的求知欲。\n`;
        }
        if (progress >= 66) {
            report += `- 学习进度良好，已完成${dimensions.learningProgress.completedPhases}个阶段的学习，学习节奏稳定。\n`;
        }
        if (accuracy >= 70) {
            report += `- 测验平均正确率达到${accuracy}%，共完成${dimensions.quizPerformance.attemptCount}次测验，对核心概念有较好的理解。\n`;
        }
        if (dimensions.materialReading.readCount > 5) {
            report += `- 广泛阅读学习资料，知识面较广。\n`;
        }
        
        report += `\n【学习不足】\n`;
        if (dimensions.aiConsultation.count < 2) {
            report += `- AI咨询较少，建议更多地利用AI工具解决学习疑惑。\n`;
        }
        if (progress < 50) {
            report += `- 学习进度较慢，建议加快学习节奏。\n`;
        }
        if (accuracy < 60) {
            report += `- 测验平均正确率偏低（${accuracy}%），需要加强对核心概念的理解。\n`;
        }
        if (dimensions.materialReading.readCount < 3) {
            report += `- 资料阅读量不足，建议多阅读补充材料。\n`;
        }
        
        report += `\n【需要提升的知识点】\n`;
        if (accuracy < 80) {
            report += `- 建议回顾测验中答错的题目，深入理解相关概念\n`;
        }
        if (progress < 100) {
            report += `- 完成剩余学习阶段，构建完整的知识体系\n`;
        }
        
        report += `\n【学习建议】\n`;
        report += `1. 制定规律的学习计划，保持学习的连续性\n`;
        report += `2. 遇到不理解的概念时，积极使用"去问AI"功能\n`;
        report += `3. 多做测验题目，检验学习效果\n`;
        report += `4. 阅读更多补充资料，拓宽知识面\n`;
        
        return report;
    },

    /* ==================== 降级数据生成 ==================== */

    /** 生成通用心智模型模板（5个） */
    _generateFallbackMentalModels() {
        return [
            { id: 'mm_1', name: '系统思维', description: '将事物视为相互关联的整体来理解', principle: '整体大于部分之和，理解系统需要分析元素间的关系而非孤立元素', application: '用于分析复杂问题，识别因果链和反馈回路' },
            { id: 'mm_2', name: '第一性原理', description: '回归最基本的真理或假设进行推理', principle: '将复杂问题分解到最基本的单元，再从基础向上构建理解', application: '用于突破思维定式，从本质思考问题解决方案' },
            { id: 'mm_3', name: '逆向思维', description: '从目标反向推导实现路径', principle: '先明确期望的结果，再反向推理需要满足的条件和步骤', application: '用于目标规划和问题解决，避免正向推理的盲区' },
            { id: 'mm_4', name: '归纳与演绎', description: '从特殊到一般和从一般到特殊的推理', principle: '归纳从具体案例提炼通则，演绎从通则推导具体结论', application: '用于理论构建和假设验证，形成完整论证链条' },
            { id: 'mm_5', name: '思维实验', description: '在头脑中模拟场景来检验想法', principle: '通过假设性推理探索概念的内涵和逻辑一致性', application: '用于检验理论假设，在无法实证时推演可能结果' }
        ];
    },

    /** 生成单个通用心智模型 */
    _generateFallbackMentalModel(index) {
        const models = this._generateFallbackMentalModels();
        return models[index - 1] || { id: 'mm_' + index, name: '心智模型' + index, description: '通用心智模型', principle: '该领域的核心思维框架', application: '帮助理解领域问题的基本逻辑' };
    },

    /** 生成通用分歧模板（3个） */
    _generateFallbackDisagreements() {
        return [
            { id: 'dg_1', title: '理论驱动vs数据驱动', coreQuestion: '学科发展应主要依赖理论推演还是数据分析？', sideA: { label: '理论优先', strongestArgument: '理论框架为研究提供方向和解释力，没有理论指导的数据挖掘是盲目的', supportingScholars: ['库恩'] }, sideB: { label: '数据优先', strongestArgument: '大数据时代，数据本身可以揭示理论无法预见的模式和关联', supportingScholars: ['安德森'] }, frontierImplication: '影响研究方法论的选择和学科发展方向' },
            { id: 'dg_2', title: '还原论vs涌现论', coreQuestion: '复杂现象应还原为基础单元解释，还是作为整体理解？', sideA: { label: '还原论', strongestArgument: '所有复杂现象最终都可分解为基本元素及其相互作用，这是科学分析的基础', supportingScholars: ['笛卡尔'] }, sideB: { label: '涌现论', strongestArgument: '整体具有部分不存在的新特性，仅分析部分无法理解整体行为', supportingScholars: ['霍兰德'] }, frontierImplication: '决定研究切入点和解释层次的选择' },
            { id: 'dg_3', title: '确定性vs概率性', coreQuestion: '领域规律是确定性的还是概率性的？', sideA: { label: '确定性', strongestArgument: '只要有足够的信息和计算能力，所有现象都可精确预测', supportingScholars: ['拉普拉斯'] }, sideB: { label: '概率性', strongestArgument: '系统固有随机性和认知局限性决定了只能用概率描述', supportingScholars: ['波普尔'] }, frontierImplication: '影响预测模型的构建方式和不确定性的处理方法' }
        ];
    },

    /** 生成单个通用分歧 */
    _generateFallbackDisagreement(index) {
        const dgs = this._generateFallbackDisagreements();
        return dgs[index - 1] || { id: 'dg_' + index, title: '通用分歧' + index, coreQuestion: '该领域的核心争议', sideA: { label: '立场A', strongestArgument: '立场A的论据', supportingScholars: [] }, sideB: { label: '立场B', strongestArgument: '立场B的论据', supportingScholars: [] }, frontierImplication: '影响领域发展' };
    },

    /** 生成通用深度理解题模板（10道，仅单选和判断） */
    _generateFallbackDeepQuestions(topic) {
        return [
            { id: '1', type: 'single', level: 'understand', question: '在' + topic + '领域，以下哪个最能体现"真正理解"而非"知道"？', options: ['能够复述核心定义', '能够在不同情境中识别适用概念', '知道主要学者的名字', '记住关键数据'], answer: 'B', explanation: '真正的理解体现在知识迁移能力，而非简单记忆', expectedUnderstanding: '区分事实记忆与概念理解', misconceptionHint: '容易把记忆等同于理解' },
            { id: '2', type: 'single', level: 'understand', question: '当' + topic + '中的两个核心原则产生冲突时，最合理的做法是？', options: ['否定其中一个原则', '理解原则的适用边界和优先级', '寻找第三个原则', '放弃分析'], answer: 'B', explanation: '理解原则的边界条件比记忆原则本身更重要', expectedUnderstanding: '理解原则的适用条件和权衡关系', misconceptionHint: '容易误以为原则是绝对的' },
            { id: '3', type: 'single', level: 'understand', question: '若要向一个外行人解释' + topic + '的本质，最合适的方式是？', options: ['列出所有专业术语定义', '用一个生动的类比说明核心逻辑', '展示复杂的数据表格', '逐条背诵教科书章节'], answer: 'B', explanation: '能用类比解释说明真正抓住了核心逻辑，而非记忆表面知识', expectedUnderstanding: '测试知识的深层结构理解', misconceptionHint: '误以为术语量等于理解深度' },
            { id: '4', type: 'single', level: 'apply', question: '在' + topic + '领域，以下哪种情况最能暴露一个人"只是记住了"？', options: ['被问到一个没见过的变式问题', '被要求默写定义', '被要求列出所有分类', '被问到发表日期'], answer: 'A', explanation: '无法处理变式说明只有表面记忆，没有理解底层逻辑', expectedUnderstanding: '检测知识的灵活运用能力', misconceptionHint: '容易把熟悉当成理解' },
            { id: '5', type: 'single', level: 'apply', question: '如果' + topic + '中的一个公认理论被新证据推翻，真正的理解者会怎么做？', options: ['拒绝接受，因为已经学了很久', '理解被推翻的逻辑并更新认知框架', '等待别人告诉他要怎么想', '查找更多支持旧理论的证据'], answer: 'B', explanation: '真正的理解包含对知识局限性的认识，愿意根据证据更新认知', expectedUnderstanding: '理解知识的暂定性和演进性', misconceptionHint: '容易把知识与自我绑定' },
            { id: '6', type: 'single', level: 'apply', question: '关于' + topic + '，以下哪个问题最有价值？', options: ['它是什么（事实性问题）', '它为什么是这样（因果性问题）', '它是什么时候被发现的（历史性问题）', '它有多少种类（分类性问题）'], answer: 'B', explanation: '"为什么"指向因果机制和理解深度，而事实性问题只测试记忆', expectedUnderstanding: '区分低阶和高阶认知问题', misconceptionHint: '容易认为事实性问题最重要' },
            { id: '7', type: 'single', level: 'analyze', question: '在' + topic + '中，两个看似矛盾的观点可能同时成立，这意味着？', options: ['其中一个是错的', '学科不成熟', '存在更高层次的统一框架可以解释两者', '不应该同时学习两者'], answer: 'C', explanation: '矛盾往往源于视角不同，高层次理解可以整合看似冲突的观点', expectedUnderstanding: '理解知识的辩证性和多视角性', misconceptionHint: '容易陷入非此即彼的思维' },
            { id: '8', type: 'single', level: 'analyze', question: '学习' + topic + '时，以下哪个做法更能指向深层理解？', options: ['反复背诵定义和公式', '主动寻找反例和边界条件', '做详细的思维导图', '看更多的入门教程'], answer: 'B', explanation: '寻找反例和边界条件是主动检验理解深度的有效方法', expectedUnderstanding: '理解主动学习与深度理解的关系', misconceptionHint: '容易误以为整理笔记等于理解' },
            { id: '9', type: 'judge', level: 'evaluate', question: '学习' + topic + '时，如果一个人能准确背诵所有定义但无法解释定义之间的关系，说明他已经真正理解了该领域。', options: ['对', '错'], answer: '错', explanation: '真正的理解要求把握概念间的关系和逻辑结构，而非孤立地记忆定义', expectedUnderstanding: '区分记忆与理解的本质差异', misconceptionHint: '容易把记忆量等同于理解深度' },
            { id: '10', type: 'judge', level: 'evaluate', question: '在' + topic + '领域，创新应用通常源于对核心原理的深刻理解，而非对更多案例的记忆。', options: ['对', '错'], answer: '对', explanation: '创新需要理解原理并能跨情境迁移，而非记忆更多案例', expectedUnderstanding: '理解创造源于原理而非记忆', misconceptionHint: '容易认为创新需要更多信息而非更深理解' }
        ];
    },

    /** 生成单个通用深度理解题 */
    _generateFallbackDeepQuestion(index, topic) {
        const questions = this._generateFallbackDeepQuestions(topic);
        return questions[index - 1] || { id: String(index), type: 'single', level: 'understand', question: '关于' + topic + '的深度理解问题', options: ['选项A', '选项B', '选项C', '选项D'], answer: 'B', explanation: '深度理解题解析', expectedUnderstanding: '考察深层理解', misconceptionHint: '常见误解' };
    },

    /** 获取当前服务商的 API 端点 */
    _getEndpoint() {
        if (this.API_ENDPOINT) return this.API_ENDPOINT;
        if (this.PROVIDER && this.PROVIDER_ENDPOINTS[this.PROVIDER]) {
            return this.PROVIDER_ENDPOINTS[this.PROVIDER];
        }
        return this.PROVIDER_ENDPOINTS.dashscope;
    },

    /**
     * 调用 AI 大模型（支持多服务商）
     * @param {Array} messages - 消息数组
     * @param {Object} options - 可选配置
     * @returns {Promise<string>} AI 响应文本
     */
    async callAI(messages, options = {}) {
        if (!this.API_KEY) {
            throw new Error('请先在设置页面配置 AI API Key！');
        }

        const endpoint = this._getEndpoint();
        if (!endpoint) {
            throw new Error('请先在设置页面配置 AI 服务商和 API 端点！');
        }

        const {
            temperature = 0.7,
            max_tokens = 2000,
            top_p = 0.8
        } = options;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: this.MODEL_NAME,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: max_tokens,
                    top_p: top_p,
                    ...this.EXTRA_PARAMS  // 添加额外参数（如 enable_thinking）
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API调用失败: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('AI API调用错误:', error);
            throw error;
        }
    },

    /**
     * 根据用户提问生成课程信息
     * @param {string} query - 用户提问
     * @returns {Promise<Object>} 课程数据
     */
    async generateCourse(query) {
        const subjectList = typeof SUBJECTS !== 'undefined' ? SUBJECTS.join('、') : '计算机科学、数学、物理学、化学、生物学、历史学、文学、语言学、哲学、经济学、心理学、艺术学、工程学、医学、法学、教育学、社会学、其他';
        const prompt = `你是一个智能学习助手。用户提出了一个问题，你需要：
1. 从问题中提取核心主题作为课程标题
2. 判断该课程属于哪个学科（从以下列表选择）：${subjectList}
3. 标记该课程能体现哪几种能力维度（从以下6种中选1-3种）：
   - critical（批判思维）：质疑假设、评估证据、识别逻辑谬误
   - creative（创新创造）：产生新想法、建立跨域连接、发散思维
   - systems（系统思维）：理解整体性、识别因果关系、把握反馈回路
   - practical（实践应用）：将理论转化为行动、解决实际问题
   - metacognitive（元认知）：自我反思、监控学习过程、调节策略
   - connection（知识关联）：跨学科连接、建立知识网络、迁移能力
4. 评估该课程对各能力维度的贡献度（0-10分）

用户问题：${query}

请以JSON格式返回：
{
  "title": "课程标题",
  "subject": "学科名称",
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

注意：
- 课程标题应该简洁明了，去除疑问词
- subject必须从给定列表中选择
- abilityMapping标记课程重点体现的能力（1-3种），对应abilities中分值较高的维度
- abilities各维度分值范围0-10，abilityMapping中的维度应>=5`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.7 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                return this._normalizeCourseData(data, query);
            }
        } catch (e) {
            console.warn('AI响应解析失败，使用默认数据:', e);
        }

        return this._generateFallbackCourse(query);
    },

    /** 标准化AI返回的课程数据 */
    _normalizeCourseData(data, query) {
        const title = data.title || this._extractTitle(query);
        const subject = (typeof SUBJECTS !== 'undefined' && SUBJECTS.includes(data.subject)) ? data.subject : '其他';
        const abilities = {
            critical: Math.min(10, Math.max(0, data.abilities?.critical || 0)),
            creative: Math.min(10, Math.max(0, data.abilities?.creative || 0)),
            systems: Math.min(10, Math.max(0, data.abilities?.systems || 0)),
            practical: Math.min(10, Math.max(0, data.abilities?.practical || 0)),
            metacognitive: Math.min(10, Math.max(0, data.abilities?.metacognitive || 0)),
            connection: Math.min(10, Math.max(0, data.abilities?.connection || 0))
        };
        let abilityMapping = data.abilityMapping || [];
        abilityMapping = abilityMapping.filter(k => abilities[k] !== undefined);
        if (abilityMapping.length === 0) {
            abilityMapping = Object.entries(abilities)
                .filter(([, v]) => v >= 5)
                .map(([k]) => k)
                .slice(0, 3);
        }
        if (abilityMapping.length === 0) {
            abilityMapping = ['critical', 'systems'];
        }
        const rating = Math.min(100, Math.max(0, data.rating || 70));
        return { title, subject, rating, abilityMapping, abilities };
    },

    /** 降级课程数据生成 */
    _generateFallbackCourse(query) {
        const title = this._extractTitle(query);
        const abilities = {
            critical: +(Math.random() * 3 + 4).toFixed(1),
            creative: +(Math.random() * 3 + 3).toFixed(1),
            systems: +(Math.random() * 3 + 5).toFixed(1),
            practical: +(Math.random() * 3 + 4).toFixed(1),
            metacognitive: +(Math.random() * 2 + 3).toFixed(1),
            connection: +(Math.random() * 3 + 3).toFixed(1)
        };
        const abilityMapping = Object.entries(abilities)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([k]) => k);
        return {
            title,
            subject: '其他',
            rating: Math.floor(Math.random() * 20) + 60,
            abilityMapping,
            abilities
        };
    },

    /**
     * 生成知识图谱
     * @param {string} query - 学习主题
     * @returns {Promise<Object>} 知识图谱数据
     */
    async generateKnowledgeGraph(query) {
        const prompt = `你是一个知识图谱生成专家。请为以下学习主题生成知识图谱。

学习主题：${query}

请返回JSON格式，包含核心概念和它们之间的关系：
{
  "nodes": [
    {"id": "1", "label": "概念名称", "depth": 0, "description": "简短描述"},
    ...
  ],
  "edges": [
    {"source": "节点ID", "target": "节点ID", "relation": "关系类型"},
    ...
  ]
}

要求：
- 生成8-15个核心概念节点
- depth分为：0（核心3-5个）、1（重要5-8个）、2（扩展2-5个）
- 节点之间要有合理的关联关系
- relation如：包含、依赖、前提、应用、相关等
- 每个节点添加简短的description（20字以内）`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.8 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // 确保所有节点都有depth字段
                data.nodes = (data.nodes || []).map(node => ({
                    ...node,
                    depth: node.depth !== undefined ? node.depth : 1,
                    description: node.description || ''
                }));
                // 确保所有边都有relation字段
                data.edges = (data.edges || []).map(edge => ({
                    ...edge,
                    relation: edge.relation || edge.label || '相关'
                }));
                return data;
            }
        } catch (e) {
            console.warn('知识图谱生成失败:', e);
        }

        // 降级到模拟数据
        return this._generateMockGraph(query);
    },

    /**
     * 挖掘学术争议点
     * @param {string} query - 学习主题
     * @returns {Promise<Array>} 争议点数组
     */
    async mineDebates(query) {
        const prompt = `你是一个学术研究专家。请为以下主题挖掘学术界存在的争议点和不同观点。

学习主题：${query}

请返回JSON数组格式：
[
  {
    "topic": "争议点标题",
    "viewA": "观点A的论述（100字以内）",
    "viewB": "观点B的论述（100字以内）",
    "keyQuestion": "核心争议问题"
  },
  ...
]

要求：
- 生成3-5个有代表性的学术争议
- 观点要客观、平衡
- 争议点要有学术价值`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.9 });

        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('争议点挖掘失败:', e);
        }

        // 降级到模拟数据
        return this._generateMockDebates(query);
    },

    /**
     * 生成测评题
     * @param {string} query - 学习主题
     * @returns {Promise<Object>} 测评数据
     */
    async generateQuiz(query) {
        const difficulty = Store.getQuizDifficulty();
        const difficultyMap = {
            easy: { label: '简单', dist: '简单7题、中等2题、困难1题', focus: '以基础概念和基本理解为主' },
            medium: { label: '中等', dist: '简单3题、中等5题、困难2题', focus: '兼顾基础理解和深度思考' },
            hard: { label: '困难', dist: '简单1题、中等3题、困难6题', focus: '以深度理解、综合应用和辨析为主' }
        };
        const diff = difficultyMap[difficulty] || difficultyMap.medium;

        const prompt = `你是一个教育测评专家。请为以下学习主题生成一套测评题。

学习主题：${query}

请返回JSON格式：
{
  "questions": [
    {
      "id": "1",
      "type": "single",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案（单个字符串，如A/B/C/D，判断题为"对"或"错"）",
      "explanation": "答案解析（50字以内）",
      "difficulty": "easy/medium/hard"
    },
    ...
  ]
}

要求：
- 生成10道题目
- 题型只能是单选题（type: "single"）或判断题（type: "judge"，选项为["对","错"]），严禁出现多选题
- 单选题7道、判断题3道
- 难度分布：${diff.dist}
- 难度侧重：${diff.focus}
- 每道题只能有一个正确答案
- 题目要有层次性，覆盖不同知识点`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.7 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('测评题生成失败:', e);
        }

        // 降级到模拟数据
        return this._generateMockQuiz(query);
    },

    /**
     * 生成学习资料推荐
     * @param {string} query - 学习主题
     * @returns {Promise<Object>} 资料数据
     */
    async generateMaterials(query) {
        const prompt = `你是一个学习资源推荐专家。请为以下学习主题推荐两类学习资源：外部文字资料和学习视频。

学习主题：${query}

请返回JSON格式：
{
  "textResources": [
    {
      "id": "text_1",
      "title": "针对该主题的资料描述标题",
      "source": "知乎",
      "tags": ["标签1", "标签2"]
    }
  ],
  "videoResources": [
    {
      "id": "vid_1",
      "title": "针对该主题的视频描述标题",
      "source": "B站",
      "tags": ["标签1", "标签2"]
    }
  ]
}

要求：
1. 外部文字资料（textResources）生成6-10个，来源平台从以下选择：知乎、百度文库、菜鸟教程、GitHub、CSDN、掘金、W3School、SegmentFault、博客园、开源中国
2. 学习视频（videoResources）生成6-10个，来源平台从以下选择：B站、抖音、慕课网、网易公开课、中国大学MOOC、腾讯课堂、优酷、西瓜视频
3. 每个资源的title要具体描述该主题下的学习内容，不要泛泛而谈
4. 标签要准确描述资料特点
5. 两种资源分开返回，不要混合
6. 不需要返回url字段，系统会自动构造链接
7. source字段必须严格使用上述平台名称之一`;

        const response = await this.callAI([
            { role: 'user', content: prompt }
        ], { temperature: 0.8 });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // 合并 textResources 和 videoResources 为 items 数组，并自动构造搜索URL
                const textItems = (parsed.textResources || []).map((item, idx) => ({
                    id: item.id || `text_${idx + 1}`,
                    title: item.title || `${query}相关资料`,
                    type: 'ai',
                    category: 'text',
                    format: 'link',
                    source: item.source || '知乎',
                    size: null,
                    tags: item.tags || ['学习资料'],
                    url: this._buildSearchUrl(item.source || '知乎', query, 'text')
                }));
                const videoItems = (parsed.videoResources || []).map((item, idx) => ({
                    id: item.id || `vid_${idx + 1}`,
                    title: item.title || `${query}相关视频`,
                    type: 'ai',
                    category: 'video',
                    format: 'video',
                    source: item.source || 'B站',
                    size: null,
                    tags: item.tags || ['视频教程'],
                    url: this._buildSearchUrl(item.source || 'B站', query, 'video')
                }));
                return { items: [...textItems, ...videoItems] };
            }
        } catch (e) {
            console.warn('资料推荐生成失败:', e);
        }

        // 降级到模拟数据
        return this._generateMockMaterials(query);
    },

    /**
     * 根据平台名称构造真实可用的搜索URL
     * @private
     * @param {string} platform - 平台名称
     * @param {string} query - 搜索关键词
     * @param {string} category - 'text' | 'video'
     * @returns {string} 搜索URL
     */
    _buildSearchUrl(platform, query, category) {
        const q = encodeURIComponent(query);
        const textUrls = {
            '知乎': `https://www.zhihu.com/search?type=content&q=${q}`,
            '百度文库': `https://wenku.baidu.com/search?word=${q}`,
            '菜鸟教程': `https://www.runoob.com/`,
            'GitHub': `https://github.com/search?q=${q}&type=repositories`,
            'CSDN': `https://so.csdn.net/so/search?q=${q}`,
            '掘金': `https://juejin.cn/search?query=${q}`,
            'W3School': `https://www.w3school.com.cn/`,
            'SegmentFault': `https://segmentfault.com/search?q=${q}`,
            '博客园': `https://zzk.cnblogs.com/s?w=${q}`,
            '开源中国': `https://www.oschina.net/search?q=${q}`
        };
        const videoUrls = {
            'B站': `https://search.bilibili.com/all?keyword=${q}`,
            '抖音': `https://www.douyin.com/search/${q}`,
            '慕课网': `https://www.imooc.com/search/?word=${q}`,
            '网易公开课': `https://open.163.com/`,
            '中国大学MOOC': `https://www.icourse163.org/search.htm?search=${q}`,
            '腾讯课堂': `https://ke.qq.com/search.html?word=${q}`,
            '优酷': `https://so.youku.com/search_video/q_${q}`,
            '西瓜视频': `https://www.ixigua.com/search/${q}`
        };
        const urlMap = category === 'video' ? videoUrls : textUrls;
        return urlMap[platform] || `https://www.baidu.com/s?wd=${q}+${encodeURIComponent(platform)}`;
    },

    /**
     * 从提问中提取标题关键词（降级方法）
     * @private
     * @param {string} query
     * @returns {string}
     */
    _extractTitle(query) {
        const cleaned = query
            .replace(/如何|怎么|怎样|什么是|哪些|什么|吗/g, '')
            .trim();
        return cleaned || '自定义课程';
    },

    /**
     * 生成模拟知识图谱（降级方法）
     * @private
     */
    _generateMockGraph(query) {
        return {
            nodes: [
                { id: '1', label: query, level: '核心' },
                { id: '2', label: '基础概念', level: '核心' },
                { id: '3', label: '核心原理', level: '重要' },
                { id: '4', label: '应用场景', level: '重要' },
                { id: '5', label: '实践技巧', level: '扩展' }
            ],
            edges: [
                { source: '1', target: '2', label: '包含' },
                { source: '2', target: '3', label: '前提' },
                { source: '3', target: '4', label: '应用' },
                { source: '4', target: '5', label: '延伸' }
            ]
        };
    },

    /**
     * 生成模拟争议点（降级方法）
     * @private
     */
    _generateMockDebates(query) {
        return [
            {
                topic: '理论vs实践',
                viewA: '应该先从理论入手，建立完整的知识框架',
                viewB: '应该通过实践项目驱动学习，在实践中理解理论',
                keyQuestion: '学习应该理论先行还是实践先行？'
            },
            {
                topic: '深度学习vs广度学习',
                viewA: '应该深入钻研一个领域，成为专家',
                viewB: '应该广泛涉猎多个领域，培养跨学科思维',
                keyQuestion: '应该专精还是博学？'
            }
        ];
    },

    /**
     * 生成模拟测评题（降级方法）
     * @private
     */
    _generateMockQuiz(query) {
        return {
            questions: [
                {
                    id: '1',
                    type: 'single',
                    question: `关于${query}，以下哪个说法正确？`,
                    options: ['选项A', '选项B', '选项C', '选项D'],
                    answer: 'A',
                    explanation: '这是基础知识',
                    difficulty: 'easy'
                }
            ]
        };
    },

    /**
     * 生成模拟资料推荐（降级方法，使用真实搜索URL）
     * @private
     */
    _generateMockMaterials(query) {
        const textPlatforms = [
            { source: '知乎', title: `${query} 相关话题深度讨论`, tags: ['问答讨论', '深度解析'] },
            { source: '百度文库', title: `${query} 专业文档资料`, tags: ['文档资料', '专业'] },
            { source: '菜鸟教程', title: `${query} 入门到精通教程`, tags: ['教程', '入门'] },
            { source: 'GitHub', title: `${query} 开源项目与代码示例`, tags: ['开源项目', '代码示例'] },
            { source: 'CSDN', title: `${query} 技术博客与解决方案`, tags: ['技术博客', '解决方案'] },
            { source: '掘金', title: `${query} 技术文章精选`, tags: ['技术文章', '开发者社区'] },
            { source: 'SegmentFault', title: `${query} 技术问答与讨论`, tags: ['技术问答', '社区讨论'] },
            { source: '博客园', title: `${query} 开发者博客`, tags: ['博客', '技术分享'] }
        ];
        const videoPlatforms = [
            { source: 'B站', title: `${query} B站热门学习视频合集`, tags: ['视频教程', '入门'] },
            { source: '中国大学MOOC', title: `${query} 高校精品课程`, tags: ['高校课程', '系统学习'] },
            { source: '慕课网', title: `${query} 实战技术教程`, tags: ['实战', '进阶'] },
            { source: '网易公开课', title: `${query} 名校公开课资源`, tags: ['公开课', '名校课程'] },
            { source: '抖音', title: `${query} 知识短视频精选`, tags: ['短视频', '碎片学习'] },
            { source: '腾讯课堂', title: `${query} 在线培训课程`, tags: ['在线课程', '培训'] },
            { source: '优酷', title: `${query} 教学视频`, tags: ['教学视频', '详细讲解'] },
            { source: '西瓜视频', title: `${query} 知识科普视频`, tags: ['科普', '通俗易懂'] }
        ];
        const shuffleAndPick = (arr, min, max) => {
            const shuffled = [...arr].sort(() => Math.random() - 0.5);
            const count = min + Math.floor(Math.random() * (max - min + 1));
            return shuffled.slice(0, Math.min(count, arr.length));
        };
        const selectedText = shuffleAndPick(textPlatforms, 6, 8);
        const selectedVideo = shuffleAndPick(videoPlatforms, 6, 8);
        return {
            items: [
                ...selectedText.map((item, idx) => ({
                    id: `text_${idx + 1}`,
                    title: item.title,
                    type: 'ai',
                    category: 'text',
                    format: 'link',
                    source: item.source,
                    size: null,
                    tags: item.tags,
                    url: this._buildSearchUrl(item.source, query, 'text')
                })),
                ...selectedVideo.map((item, idx) => ({
                    id: `vid_${idx + 1}`,
                    title: item.title,
                    type: 'ai',
                    category: 'video',
                    format: 'video',
                    source: item.source,
                    size: null,
                    tags: item.tags,
                    url: this._buildSearchUrl(item.source, query, 'video')
                }))
            ]
        };
    }
};
