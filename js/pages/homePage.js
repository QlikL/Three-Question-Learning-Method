/**
 * 主界面页面逻辑 HomePage
 */
const HomePage = {
    /** 是否显示课程列表 */
    _showCourses: false,

    /**
     * 渲染主界面
     * @param {HTMLElement} container
     * @param {Object} options - { showCourses: boolean }
     */
    async render(container, options = {}) {
        this._showCourses = options.showCourses || false;

        // 为首页添加特殊类名，允许全宽
        const appContent = container.closest('.app-content');
        if (appContent) {
            if (this._showCourses) {
                appContent.classList.remove('home-content');
            } else {
                appContent.classList.add('home-content');
            }
        }

        if (this._showCourses) {
            // 我的课程页面：显示课程列表
            await this._renderCoursesPage(container);
        } else {
            // 首页：只显示搜索框
            await this._renderHomePage(container);
        }
    },

    /** 渲染简洁首页（仅搜索框） */
    async _renderHomePage(container) {
        container.innerHTML = `
            <div class="page-container home-page">
                <div id="search-container"></div>
            </div>
        `;

        // 渲染搜索框
        SearchBar.render(
            document.getElementById('search-container'),
            (query) => this._handleCreateCourse(query)
        );
    },

    /** 渲染我的课程页面 */
    async _renderCoursesPage(container) {
        container.innerHTML = `
            <div class="page-container home-page">
                <h2 style="margin-bottom:var(--spacing-lg);"> 我的课程</h2>
                
                <!-- 筛选排序和导入控制区 -->
                <div class="course-toolbar">
                    <div class="course-filter-bar">
                        <div class="filter-group">
                            <label class="filter-label">排序方式：</label>
                            <div id="sort-select-container"></div>
                        </div>
                    </div>
                    <div class="course-import-bar">
                        <button class="btn btn-outline" id="import-course-btn">
                            📥 导入课程
                        </button>
                    </div>
                </div>
                
                <div id="course-grid-container"></div>
            </div>
        `;

        await this._loadCourses();
        
        // 渲染自定义下拉选择器
        const sortItems = [
            { value: 'updateTime-desc', label: '最近更新' },
            { value: 'updateTime-asc', label: '最早创建' },
            { value: 'title-asc', label: '拼音首字母 A-Z' },
            { value: 'title-desc', label: '拼音首字母 Z-A' },
            { value: 'progress-desc', label: '进度高到低' },
            { value: 'progress-asc', label: '进度低到高' }
        ];
        
        const sortContainer = document.getElementById('sort-select-container');
        CustomSelect.render(sortContainer, {
            items: sortItems,
            defaultValue: 'updateTime-desc',
            onChange: (value) => {
                this._loadCourses(value);
            }
        });

        document.getElementById('import-course-btn').addEventListener('click', () => {
            this._importCourse();
        });
    },

    /**
     * 处理课程创建
     * @param {string} query - 用户提问
     */
    async _handleCreateCourse(query) {
        try {
            // 调用模拟AI生成课程信息
            const courseData = await AiMock.mockGenerateCourse(query);

            // 创建课程对象
            const course = new Course({
                title: courseData.title,
                query: query,
                subject: courseData.subject || '其他',
                rating: courseData.rating || 0,
                abilityMapping: courseData.abilityMapping || [],
                abilities: courseData.abilities
            });

            // 保存到 IndexedDB
            await Store.saveCourse(course);

            // 停止搜索框加载
            SearchBar.stopLoading();

            // 重新加载课程列表（如果在课程页面）
            if (this._showCourses) {
                await this._loadCourses();
            }

            // 自动跳转到学习空间
            Router.navigate('/learning/' + course.id);
        } catch (err) {
            console.error('课程创建失败:', err);
            SearchBar.showError('课程创建失败，请重试');
        }
    },

    /** 加载并显示课程列表 */
    async _loadCourses(sortType = 'updateTime-desc') {
        try {
            const courses = await Store.getAllCourses();
            // 只显示 active 和 completed 的课程，不显示 archived
            let activeCourses = courses
                .filter(c => c.status !== 'archived')
                .map(c => new Course(c));

            // 排序逻辑
            activeCourses = this._sortCourses(activeCourses, sortType);

            const gridContainer = document.getElementById('course-grid-container');
            if (!gridContainer) {
                console.error('course-grid-container 不存在');
                return;
            }

            CourseCard.renderList(gridContainer, activeCourses, {
                onClick: (courseId) => {
                    Router.navigate('/learning/' + courseId);
                },
                onMaterials: (courseId) => {
                    Router.navigate('/knowledge/' + courseId);
                },
                onArchive: async (courseId) => {
                    await Store.updateCourseStatus(courseId, 'archived');
                    await this._loadCourses(sortType);
                },
                onDelete: async (courseId) => {
                    await Store.deleteCourse(courseId);
                    await this._loadCourses(sortType);
                }
            });
        } catch (err) {
            console.error('加载课程列表失败:', err);
        }
    },

    /** 课程排序 */
    _sortCourses(courses, sortType) {
        const [field, order] = sortType.split('-');
        
        // 创建副本避免修改原数组
        const sorted = [...courses];
        
        return sorted.sort((a, b) => {
            let result = 0;
            
            switch(field) {
                case 'updateTime':
                    // 时间排序：desc=最新(大的在前), asc=最早(小的在前)
                    // (b - a) > 0 表示b的时间戳更大
                    result = (b.updatedAt || 0) - (a.updatedAt || 0);
                    // desc 不需要反转，asc 需要反转
                    return order === 'desc' ? result : -result;
                    
                case 'title':
                    // 标题排序：asc=A-Z(小的在前), desc=Z-A(大的在前)
                    // localeCompare > 0 表示 a > b
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    result = titleA.localeCompare(titleB, 'zh-CN');
                    // asc 不需要反转，desc 需要反转
                    return order === 'desc' ? -result : result;
                    
                case 'progress':
                    // 进度排序：desc=进度高(大的在前), asc=进度低(小的在前)
                    const progressA = a.progress || {};
                    const progressB = b.progress || {};
                    const scoreA = (progressA.phase1 ? 1 : 0) + (progressA.phase2 ? 1 : 0) + (progressA.phase3 ? 1 : 0);
                    const scoreB = (progressB.phase1 ? 1 : 0) + (progressB.phase2 ? 1 : 0) + (progressB.phase3 ? 1 : 0);
                    // (scoreB - scoreA) > 0 表示B的进度更高
                    result = scoreB - scoreA;
                    // desc 不需要反转，asc 需要反转
                    return order === 'desc' ? result : -result;
            }
            
            return 0;
        });
    },

    /** 导入课程 */
    async _importCourse() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!data.version || !data.course?.title) {
                    Dialog.toast('文件格式无效：缺少课程数据', 'error');
                    return;
                }

                const oldId = data.course.id;
                const newId = 'course_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

                data.course.id = newId;
                data.course.updatedAt = Date.now();
                await Store.saveCourse(new Course(data.course));

                if (data.knowledgeGraph) {
                    data.knowledgeGraph.courseId = newId;
                    await Store.saveKnowledgeGraph(data.knowledgeGraph);
                }

                if (data.mentalModels) {
                    data.mentalModels.courseId = newId;
                    await Store.saveMentalModel(data.mentalModels);
                }

                if (data.debates) {
                    data.debates.courseId = newId;
                    await Store.saveDebate(data.debates);
                }

                if (data.quizzes) {
                    data.quizzes.courseId = newId;
                    await Store.saveQuiz(data.quizzes);
                }

                if (data.materials) {
                    data.materials.courseId = newId;
                    await Store.saveMaterial(data.materials);
                }

                Dialog.toast(`课程「${data.course.title}」导入成功！`, 'success');
                await this._loadCourses();
            } catch (err) {
                console.error('导入课程失败:', err);
                if (err instanceof SyntaxError) {
                    Dialog.toast('文件格式错误：不是有效的JSON文件', 'error');
                } else {
                    Dialog.toast('导入失败：' + err.message, 'error');
                }
            }
        };

        input.click();
    }
};
