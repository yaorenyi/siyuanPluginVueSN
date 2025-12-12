import { Plugin } from 'siyuan'

/**
 * 浮动工具栏增强类
 * 为思源笔记的原生浮动工具栏添加自定义功能按钮
 */
export class FloatingToolbar {
    private plugin: Plugin
    private buttonsAdded: Set<string> = new Set()
    private isProcessing: boolean = false

    constructor(plugin: Plugin) {
        this.plugin = plugin
    }

    /**
     * 初始化浮动工具栏增强
     */
    init() {
        this.bindEvents()
        this.addStyles()
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

        // 定义要添加的按钮
        const buttons = [
            {
                id: 'custom-copy',
                name: this.plugin.i18n.floatingToolbar?.copy || '复制',
                icon: '<svg><use xlink:href="#iconCopy"></use></svg>',
                handler: this.copyText.bind(this)
            },
            {
                id: 'custom-highlight',
                name: this.plugin.i18n.floatingToolbar?.highlight || '高亮',
                icon: '<svg><use xlink:href="#iconMark"></use></svg>',
                handler: this.highlightText.bind(this)
            },
            {
                id: 'custom-search',
                name: this.plugin.i18n.floatingToolbar?.search || '搜索',
                icon: '<svg><use xlink:href="#iconSearch"></use></svg>',
                handler: this.searchText.bind(this)
            },
            {
                id: 'custom-translate',
                name: this.plugin.i18n.floatingToolbar?.translate || '翻译',
                icon: '<svg><use xlink:href="#iconLanguage"></use></svg>',
                handler: this.translateText.bind(this)
            },
            {
                id: 'custom-ai-process',
                name: this.plugin.i18n.floatingToolbar?.aiProcess || 'AI处理',
                icon: '<svg><use xlink:href="#iconSparkles"></use></svg>',
                handler: this.processWithAI.bind(this)
            }
        ]

        // 反转数组并添加按钮
        buttons.reverse()
        buttons.forEach(button => {
            // 检查按钮是否已存在
            if (toolbar.querySelector(`button[data-type="${button.id}"]`)) return

            // 创建按钮HTML
            const buttonHTML = `
                <button class="protyle-toolbar__item b3-tooltips b3-tooltips__ne custom-toolbar-button"
                        data-type="${button.id}"
                        aria-label="${button.name}"
                        style="font-size:14px;">
                    ${button.icon}
                </button>`

            // 在工具栏开头插入按钮
            toolbar.insertAdjacentHTML('afterbegin', buttonHTML)

            // 获取新创建的按钮并添加点击事件
            const btnElement = toolbar.querySelector(`button[data-type="${button.id}"]`) as HTMLButtonElement
            if (btnElement) {
                btnElement.addEventListener('click', async (clickEvent) => {
                    clickEvent.stopPropagation()
                    // 隐藏工具栏
                    toolbar.classList.add('fn__none')
                    // 获取选中的文本
                    const selectedText = this.getSelection(protyle)
                    // 执行按钮功能
                    await button.handler(selectedText)
                })
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
            this.showMessage(this.plugin.i18n.floatingToolbar?.copySuccess || '已复制到剪贴板')
        } catch (error) {
            // 降级方案
            const textarea = document.createElement('textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            this.showMessage(this.plugin.i18n.floatingToolbar?.copySuccess || '已复制到剪贴板')
        }
    }

    /**
     * 高亮文本
     */
    private async highlightText(text: string) {
        const blockId = await this.getCurrentBlockId()
        if (!blockId) {
            this.showMessage(this.plugin.i18n.floatingToolbar?.cannotGetBlockId || '无法获取当前块ID')
            return
        }

        try {
            // 使用思源API更新块，添加高亮标记
            const response = await fetch('/api/block/updateBlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: blockId,
                    dataType: 'markdown',
                    data: `==${text}==`
                })
            })

            if (response.ok) {
                this.showMessage(this.plugin.i18n.floatingToolbar?.highlightSuccess || '已添加高亮')
            } else {
                this.showMessage(this.plugin.i18n.floatingToolbar?.highlightFailed || '高亮失败')
            }
        } catch (error) {
            console.error('高亮文本失败:', error)
            this.showMessage(this.plugin.i18n.floatingToolbar?.highlightFailed || '高亮失败')
        }
    }

    /**
     * 搜索文本
     */
    private searchText(text: string) {
        // 在思源内搜索
        const searchUrl = `/search?q=${encodeURIComponent(text)}`
        window.open(searchUrl, '_blank')
    }

    /**
     * 翻译文本
     */
    private translateText(text: string) {
        // 打开谷歌翻译
        const translateUrl = `https://translate.google.com/?sl=auto&tl=zh-CN&text=${encodeURIComponent(text)}`
        window.open(translateUrl, '_blank')
    }

    /**
     * AI处理文本
     */
    private processWithAI(text: string) {
        // 显示开发中消息
        this.showMessage(this.plugin.i18n.floatingToolbar?.aiProcessInDevelopment || 'AI处理功能开发中...')
    }

    /**
     * 获取当前块ID
     */
    private async getCurrentBlockId(): Promise<string | null> {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const element = range.startContainer.parentElement
            const blockElement = element?.closest('[data-node-id]')
            return blockElement?.getAttribute('data-node-id') || null
        }
        return null
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
    }
}