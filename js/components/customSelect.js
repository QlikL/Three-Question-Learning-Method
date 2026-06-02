/**
 * 自定义下拉选择器组件 CustomSelect
 * 解决原生select样式受限问题，提供完全可控的下拉选项样式
 */
const CustomSelect = {
    /**
     * 渲染自定义下拉选择器
     * @param {HTMLElement} container - 容器元素
     * @param {Object} options - 配置选项
     * @param {Array} options.items - 选项列表 [{value, label}]
     * @param {string} options.defaultValue - 默认值
     * @param {Function} options.onChange - 值改变回调
     * @param {string} options.className - 自定义类名
     */
    render(container, options = {}) {
        const {
            items = [],
            defaultValue = items[0]?.value || '',
            onChange = () => {},
            className = ''
        } = options;

        const selectedItem = items.find(item => item.value === defaultValue) || items[0];

        container.innerHTML = `
            <div class="custom-select ${className}" data-value="${defaultValue}">
                <div class="custom-select-trigger">
                    <span class="custom-select-value">${selectedItem?.label || ''}</span>
                    <svg class="custom-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="custom-select-dropdown">
                    ${items.map(item => `
                        <div class="custom-select-option ${item.value === defaultValue ? 'selected' : ''}" 
                             data-value="${item.value}">
                            ${item.label}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 初始化全局点击外部关闭
        this._initGlobalClickHandler();
        
        this._bindEvents(container, onChange);
    },

    /** 绑定事件 */
    _bindEvents(container, onChange) {
        const select = container.querySelector('.custom-select');
        const trigger = select.querySelector('.custom-select-trigger');
        const dropdown = select.querySelector('.custom-select-dropdown');
        const options = select.querySelectorAll('.custom-select-option');

        // 点击触发器展开/收起
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            
            // 关闭所有其他下拉框
            document.querySelectorAll('.custom-select-dropdown.open').forEach(d => {
                d.classList.remove('open');
            });

            if (!isOpen) {
                dropdown.classList.add('open');
            }
        });

        // 点击选项
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const label = option.textContent.trim();
                
                console.log('选项点击:', value, label); // 调试信息

                // 更新选中状态
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // 更新显示值
                select.querySelector('.custom-select-value').textContent = label;
                select.dataset.value = value;

                // 收起下拉框
                dropdown.classList.remove('open');

                // 触发回调
                if (onChange) {
                    console.log('触发onChange:', value); // 调试信息
                    onChange(value);
                }
            });
        });
    },

    /** 初始化全局点击外部关闭事件（只执行一次） */
    _initGlobalClickHandler() {
        if (this._globalClickInitialized) return;
        
        document.addEventListener('click', (e) => {
            // 如果点击的不是custom-select内部，则关闭所有下拉框
            if (!e.target.closest('.custom-select')) {
                document.querySelectorAll('.custom-select-dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
            }
        });
        
        this._globalClickInitialized = true;
    },

    /** 获取当前选中值 */
    getValue(container) {
        const select = container.querySelector('.custom-select');
        return select?.dataset.value || '';
    },

    /** 设置选中值 */
    setValue(container, value) {
        const select = container.querySelector('.custom-select');
        if (!select) return;

        const option = select.querySelector(`.custom-select-option[data-value="${value}"]`);
        if (!option) return;

        // 触发点击事件
        option.click();
    }
};
