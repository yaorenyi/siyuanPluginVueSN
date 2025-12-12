import { Plugin } from 'siyuan'
import { ToolbarAction, ToolbarActionManager } from './actions'

/**
 * 浮动工具栏增强类
 * 为思源笔记的原生浮动工具栏添加自定义功能按钮
 */
export class FloatingToolbar {
    private plugin: Plugin
    private actionManager: ToolbarActionManager
    private isProcessing: boolean = false

    constructor(plugin: Plugin) {
        this.plugin = plugin
        this.actionManager = new ToolbarActionManager(plugin)
    }

    /**
     * 初始化浮动工具栏增强
     */
    init(): void {
        // 注册所有内置功能
        this.registerBuiltinActions()
        // 绑定事件监听器
        this.bindEvents()
        // 添加样式
        this.addStyles()
    }

    /**
     * 注册内置功能
     */
    private registerBuiltinActions() {
        // 注册复制功能
        this.actionManager.registerAction({
            id: 'copy',
            name: (this.plugin.i18n as any).floatingToolbar?.copy || '复制',
            icon: '<svg><use xlink:href="#iconCopy"></use></svg>',
            hotkey: undefined,
            handler: this.copyText.bind(this)
        })
    }

    /**
     * 注册新功能（供外部使用）
     */
    registerAction(action: ToolbarAction) {
        this.actionManager.registerAction(action)
    }

    /**
     * 移除功能
     */
    unregisterAction(actionId: string) {
        this.actionManager.unregisterAction(actionId)
    }

    /**
     * 绑定事件监听器
     */
    private bindEvents() {
        // 监听选择变化事件
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this))
    }

    /**
     * 处理选择变化事件
     */
    private handleSelectionChange() {
        // 防止重复处理
        if (this.isProcessing) return

        const activeElement = document.activeElement
        if (!activeElement) return

        // 查找最近的 protyle 容器
        const protyle = activeElement.closest('.protyle')
        if (!protyle) return

        // 检查是否有选中的内容
        if (!this.hasSelection(protyle)) return

        // 查找工具栏
        const toolbar = protyle.querySelector('.protyle-toolbar') as HTMLElement
        if (!toolbar) return

        // 防止重复添加事件监听器
        if (!toolbar.hasAttribute('data-floating-toolbar-attached')) {
            toolbar.setAttribute('data-floating-toolbar-attached', 'true')
            this.attachToolbarEvents(toolbar, protyle)
        }
    }

    /**
     * 检查是否有选中的内容
     */
    private hasSelection(protyle: Element): boolean {
        const selection = window.getSelection().toString().trim()
        if (selection) return true

        // 检查是否有多选块
        const selects = protyle.querySelectorAll('.protyle-wysiwyg--select')
        if (selects.length > 0) return true

        return false
    }

    /**
     * 附加工具栏事件
     */
    private attachToolbarEvents(toolbar: HTMLElement, protyle: Element) {
        const mouseupHandler = (event: MouseEvent) => {
            toolbar.removeAttribute('data-floating-toolbar-attached')
            document.removeEventListener('mouseup', mouseupHandler)
            document.removeEventListener('keyup', mouseupHandler)
            this.handleMouseUp(event, toolbar, protyle)
        }

        document.addEventListener('mouseup', mouseupHandler)
        document.addEventListener('keyup', mouseupHandler)
    }

    /**
     * 处理鼠标释放事件
     */
    private handleMouseUp(event: MouseEvent, toolbar: HTMLElement, protyle: Element) {
        if (!this.hasSelection(protyle)) return

        // 添加自定义按钮
        this.addCustomButtons(toolbar, protyle)
    }

    /**
     * 添加自定义按钮到工具栏
     */
    private addCustomButtons(toolbar: HTMLElement, protyle: Element) {
        // 防止重复添加
        if (toolbar.hasAttribute('data-custom-buttons-added')) return
        toolbar.setAttribute('data-custom-buttons-added', 'true')

        // 获取所有已注册的功能
        const actions = this.actionManager.getAllActions()

        // 反转数组并添加按钮（以便按注册顺序显示）
        actions.reverse().forEach(action => {
            // 检查按钮是否已存在
            if (toolbar.querySelector(`button[data-type="${action.id}"]`)) return

            // 创建按钮HTML
            const buttonHTML = `
                <button class="protyle-toolbar__item b3-tooltips b3-tooltips__ne custom-toolbar-button"
                        data-type="${action.id}"
                        aria-label="${action.name}"
                        style="font-size:14px;">
                    ${action.icon}
                </button>`

            // 在工具栏开头插入按钮
            toolbar.insertAdjacentHTML('afterbegin', buttonHTML)

            // 获取新创建的按钮并添加点击事件
            const btnElement = toolbar.querySelector(`button[data-type="${action.id}"]`) as HTMLButtonElement
            if (btnElement) {
                btnElement.addEventListener('click', async (clickEvent) => {
                    clickEvent.stopPropagation()
                    // 隐藏工具栏
                    toolbar.classList.add('fn__none')
                    // 获取选中的文本
                    const selectedText = this.getSelection(protyle)
                    // 执行按钮功能
                    await action.handler(selectedText)
                })

                // 添加快捷键提示
                if (action.hotkey) {
                    btnElement.setAttribute('data-hotkey', action.hotkey)
                }
            }
        })

        // 监听工具栏隐藏事件，移除标记
        const observer = new MutationObserver(() => {
            if (toolbar.classList.contains('fn__none')) {
                toolbar.removeAttribute('data-custom-buttons-added')
                observer.disconnect()
            }
        })
        observer.observe(toolbar, {
            attributes: true,
            attributeFilter: ['class']
        })
    }

    /**
     * 获取选中的文本
     */
    private getSelection(protyle: Element): string {
        const selection = window.getSelection().toString().trim()
        if (selection) return selection

        // 处理多选块
        const selects = protyle.querySelectorAll('.protyle-wysiwyg--select')
        if (selects.length > 0) {
            const markdowns = []
            selects.forEach(block => {
                // 这里应该使用 Lute 来转换，但为了简化直接获取文本
                markdowns.push(block.textContent || '')
            })
            return markdowns.join('\n')
        }

        return ''
    }

    /**
     * 复制文本
     */
    private async copyText(text: string) {
        try {
            await navigator.clipboard.writeText(text)
            this.showMessage((this.plugin.i18n as any).floatingToolbar?.copySuccess || '已复制到剪贴板')
        } catch (error) {
            // 降级方案
            const textarea = document.createElement('textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            this.showMessage((this.plugin.i18n as any).floatingToolbar?.copySuccess || '已复制到剪贴板')
        }
    }

    /**
     * 显示消息
     */
    private showMessage(message: string) {
        fetch('/api/notification/pushMsg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg: message,
                timeout: 7000
            })
        })
    }

    /**
     * 添加样式
     */
    private addStyles() {
        const styleId = 'floating-toolbar-enhanced-styles'
        if (document.getElementById(styleId)) return

        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
            /* 自定义浮动工具栏按钮样式 */
            .custom-toolbar-button {
                transition: all 0.15s ease;
            }

            .custom-toolbar-button:hover {
                background-color: var(--b3-theme-surface-lighter);
            }

            .custom-toolbar-button:active {
                background-color: var(--b3-theme-surface);
            }
        `
        document.head.appendChild(style)
    }

    /**
     * 销毁工具栏增强，清理资源
     */
    destroy() {
        // 移除事件监听
        document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this))

        // 移除所有自定义按钮
        const customButtons = document.querySelectorAll('.custom-toolbar-button')
        customButtons.forEach(button => {
            button.remove()
        })

        // 清理标记
        const toolbars = document.querySelectorAll('[data-floating-toolbar-attached], [data-custom-buttons-added]')
        toolbars.forEach(toolbar => {
            toolbar.removeAttribute('data-floating-toolbar-attached')
            toolbar.removeAttribute('data-custom-buttons-added')
        })

        // 移除样式
        const style = document.getElementById('floating-toolbar-enhanced-styles')
        if (style) {
            style.remove()
        }

        // 清理功能管理器
        this.actionManager.clear()
    }
}
