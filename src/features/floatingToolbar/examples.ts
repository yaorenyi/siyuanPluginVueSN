import { ToolbarAction } from './actions'
import { Plugin } from 'siyuan'

/**
 * 浮动工具栏功能示例
 *
 * 本文件展示了如何创建和注册自定义的浮动工具栏功能
 * 参考这些示例来开发你自己的功能
 */

/**
 * 创建搜索功能的示例
 * @param plugin 插件实例
 * @returns 搜索功能对象
 */
export function createSearchAction(plugin: Plugin): ToolbarAction {
    return {
        id: 'search',
        name: plugin.i18n.floatingToolbar?.search || '搜索',
        icon: '<svg><use xlink:href="#iconSearch"></use></svg>',
        hotkey: 'Ctrl+F',
        handler: async (selectedText: string) => {
            if (!selectedText) return

            // 在思源笔记内搜索
            const searchUrl = `/search?q=${encodeURIComponent(selectedText)}`
            window.open(searchUrl, '_blank')
        }
    }
}

