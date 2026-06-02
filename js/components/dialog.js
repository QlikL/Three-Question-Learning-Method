/**
 * 内置弹窗组件 Dialog
 * 替代浏览器原生 alert/confirm，提供自定义样式的弹窗和轻提示
 */
const Dialog = {
    /**
     * 提示弹窗（替代 alert）
     * @param {string} message - 消息内容
     * @param {string} [title] - 标题（可选）
     * @returns {Promise<void>}
     */
    alert(message, title) {
        return new Promise(resolve => {
            const overlay = this._createOverlay();
            overlay.innerHTML = `
                <div class="dialog-box">
                    ${title ? `<div class="dialog-title">${title}</div>` : ''}
                    <div class="dialog-message">${message}</div>
                    <div class="dialog-actions">
                        <button class="btn btn-primary dialog-btn-ok">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const close = () => {
                overlay.classList.add('dialog-fade-out');
                setTimeout(() => overlay.remove(), 200);
                resolve();
            };

            overlay.querySelector('.dialog-btn-ok').addEventListener('click', close);
            overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        });
    },

    /**
     * 确认弹窗（替代 confirm）
     * @param {string} message - 消息内容
     * @param {string} [title] - 标题（可选）
     * @returns {Promise<boolean>}
     */
    confirm(message, title) {
        return new Promise(resolve => {
            const overlay = this._createOverlay();
            overlay.innerHTML = `
                <div class="dialog-box">
                    ${title ? `<div class="dialog-title">${title}</div>` : ''}
                    <div class="dialog-message">${message}</div>
                    <div class="dialog-actions">
                        <button class="btn btn-secondary dialog-btn-cancel">取消</button>
                        <button class="btn btn-primary dialog-btn-ok">确定</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const close = (result) => {
                overlay.classList.add('dialog-fade-out');
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            overlay.querySelector('.dialog-btn-ok').addEventListener('click', () => close(true));
            overlay.querySelector('.dialog-btn-cancel').addEventListener('click', () => close(false));
            overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
        });
    },

    /**
     * Toast 轻提示（自动消失）
     * @param {string} message - 消息内容
     * @param {'success'|'error'|'warning'|'info'} [type='info'] - 类型
     */
    toast(message, type = 'info') {
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-text">${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    /** 创建遮罩层 */
    _createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        return overlay;
    }
};
