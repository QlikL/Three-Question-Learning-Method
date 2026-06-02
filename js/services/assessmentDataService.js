/**
 * 评估数据收集模块 AssessmentDataService
 * 负责收集和聚合课程学习评估所需的五个维度数据
 */
const AssessmentDataService = {
    /**
     * 获取课程的完整评估数据
     * @param {string} courseId - 课程ID
     * @returns {Promise<Object>} 评估数据
     */
    async collectAssessmentData(courseId) {
        const assessmentData = await Store.getAssessmentData(courseId);
        const completedPhases = this._countCompletedPhases(assessmentData.progress);
        const quizStats = this._extractQuizStats(assessmentData.quizData, assessmentData.quizHistory || []);
        const materialStats = this._extractMaterialStats(assessmentData.materialData);

        return {
            courseId: assessmentData.courseId,
            courseTitle: assessmentData.courseTitle,
            dimensions: {
                aiConsultation: {
                    count: assessmentData.aiConsultationCount,
                    description: this._getAiConsultationDescription(assessmentData.aiConsultationCount)
                },
                learningProgress: {
                    completedPhases,
                    totalPhases: 3,
                    percentage: Math.round((completedPhases / 3) * 100),
                    phaseDetails: assessmentData.progress,
                    description: this._getProgressDescription(completedPhases)
                },
                quizPerformance: {
                    correctCount: quizStats.correctCount,
                    totalQuestions: quizStats.totalQuestions,
                    accuracy: quizStats.accuracy,
                    attemptCount: quizStats.attemptCount,
                    description: this._getQuizDescription(quizStats)
                },
                materialReading: {
                    readCount: assessmentData.materialActivity.readCount,
                    readTypes: assessmentData.materialActivity.readTypes,
                    aiMaterialCount: materialStats.aiCount,
                    description: this._getMaterialReadingDescription(assessmentData.materialActivity)
                },
                materialUpload: {
                    uploadCount: assessmentData.materialActivity.uploadCount,
                    uploadTypes: assessmentData.materialActivity.uploadTypes,
                    description: this._getMaterialUploadDescription(assessmentData.materialActivity)
                }
            },
            summary: {
                totalActivities: this._calculateTotalActivities(assessmentData),
                engagementLevel: this._calculateEngagementLevel(assessmentData)
            }
        };
    },

    /**
     * 统计已完成的阶段数
     */
    _countCompletedPhases(progress) {
        let count = 0;
        if (progress.phase1) count++;
        if (progress.phase2) count++;
        if (progress.phase3) count++;
        return count;
    },

    /**
     * 提取测验统计数据
     */
    _extractQuizStats(quizData, quizHistory = []) {
        if (!quizData || !quizData.questions) {
            return { correctCount: 0, totalQuestions: 0, accuracy: 0, attemptCount: quizHistory.length };
        }

        const totalQuestions = quizData.questions.length;
        let correctCount = 0;

        quizData.questions.forEach(q => {
            if (q.userAnswer !== undefined && q.userAnswer === q.correctAnswer) {
                correctCount++;
            }
        });

        const currentAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const attemptCount = quizHistory.length || 1;
        const avgAccuracy = quizHistory.length > 0
            ? Math.round(quizHistory.reduce((sum, h) => sum + h.accuracy, 0) / quizHistory.length)
            : currentAccuracy;

        return { correctCount, totalQuestions, accuracy: avgAccuracy, currentAccuracy, attemptCount };
    },

    /**
     * 提取资料统计数据
     */
    _extractMaterialStats(materialData) {
        if (!materialData || !materialData.items) {
            return { aiCount: 0, userCount: 0 };
        }

        let aiCount = 0;
        let userCount = 0;

        materialData.items.forEach(item => {
            if (item.type === 'ai') {
                aiCount++;
            } else {
                userCount++;
            }
        });

        return { aiCount, userCount };
    },

    /**
     * 获取AI咨询次数描述
     */
    _getAiConsultationDescription(count) {
        if (count === 0) return '尚未使用AI咨询功能';
        if (count <= 3) return '偶尔使用AI咨询';
        if (count <= 10) return '积极使用AI咨询';
        return '频繁使用AI咨询，学习主动性很强';
    },

    /**
     * 获取学习进度描述
     */
    _getProgressDescription(completedPhases) {
        if (completedPhases === 0) return '尚未开始学习';
        if (completedPhases === 1) return '已完成第一阶段学习';
        if (completedPhases === 2) return '已完成两个阶段学习';
        return '已完成全部学习阶段';
    },

    /**
     * 获取测验表现描述
     */
    _getQuizDescription(stats) {
        if (stats.totalQuestions === 0) return '尚未进行测验';
        if (stats.accuracy >= 90) return '测验表现优秀';
        if (stats.accuracy >= 70) return '测验表现良好';
        if (stats.accuracy >= 50) return '测验表现一般';
        return '测验需要加强';
    },

    /**
     * 获取资料阅读描述
     */
    _getMaterialReadingDescription(activity) {
        if (activity.readCount === 0) return '尚未阅读学习资料';
        if (activity.readCount <= 3) return '阅读了少量资料';
        if (activity.readCount <= 10) return '积极阅读学习资料';
        return '广泛阅读学习资料';
    },

    /**
     * 获取资料上传描述
     */
    _getMaterialUploadDescription(activity) {
        if (activity.uploadCount === 0) return '尚未上传学习资料';
        if (activity.uploadCount <= 3) return '上传了少量资料';
        return '积极上传学习资料';
    },

    /**
     * 计算总活动量
     */
    _calculateTotalActivities(data) {
        return data.aiConsultationCount +
            data.materialActivity.readCount +
            data.materialActivity.uploadCount;
    },

    /**
     * 计算参与度等级
     */
    _calculateEngagementLevel(data) {
        const totalActivities = this._calculateTotalActivities(data);
        const completedPhases = this._countCompletedPhases(data.progress);

        if (completedPhases === 3 && totalActivities > 20) return '非常高';
        if (completedPhases >= 2 && totalActivities > 10) return '高';
        if (completedPhases >= 1 || totalActivities > 5) return '中等';
        if (totalActivities > 0) return '低';
        return '未开始';
    }
};
