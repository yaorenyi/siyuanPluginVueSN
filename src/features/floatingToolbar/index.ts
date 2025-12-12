import { Plugin } from 'siyuan'
import { FloatingToolbar } from './FloatingToolbar'

/**
 * 注册浮动工具栏功能
 * 当用户选中文字时，在文字上方显示一个包含多种操作的工具栏
 */
export function registerFloatingToolbar(plugin: Plugin) {
    // 创建浮动工具栏实例
    const floatingToolbar = new FloatingToolbar(plugin)

    // 初始化工具栏
    floatingToolbar.init()

    // 在插件卸载时清理资源
    plugin.addEventListener('unload', () => {
        floatingToolbar.destroy()
    })
}
