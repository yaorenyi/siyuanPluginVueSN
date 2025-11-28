/**
 * 二维码生成功能模块
 * 功能：右键菜单选项，生成选中文本的二维码
 */
import { Plugin } from 'siyuan'

let plugin: Plugin | null = null

/**
 * 注册二维码生成功能
 */
export function registerQRCode(pluginInstance: Plugin) {
  plugin = pluginInstance

  // 监听编辑器右键菜单事件
  plugin.eventBus.on('open-menu-content', (event: any) => {
    handleEditorContextMenu(event)
  })

  console.log('✅ 二维码生成功能已注册')
}

/**
 * 处理编辑器右键菜单事件
 */
function handleEditorContextMenu(event: any) {
  try {
    const menu = event.detail?.menu
    const selectedText = window.getSelection()?.toString().trim()

    // 只在有选中文本时添加二维码菜单项
    if (selectedText && menu) {
      console.log('📋 检测到选中文本:', selectedText)

      try {
        menu.addItem({
          iconHTML: '🔲',
          label: plugin?.i18n?.qrcodeGenerate || '生成二维码',
          click: async () => {
            console.log('🔲 二维码菜单项被点击')
            openQRCodeDialog(selectedText)
          },
        })

        console.log('✅ 二维码菜单项已添加')
      } catch (addItemError) {
        console.error('添加菜单项失败:', addItemError)
      }
    }
  } catch (error) {
    console.error('处理右键菜单事件失败:', error)
  }
}

/**
 * 打开二维码对话框
 * 通过事件通知 App.vue 更新状态
 */
function openQRCodeDialog(content: string) {
  // 使用 setTimeout 确保事件在同步执行流之外
  setTimeout(() => {
    const event = new CustomEvent('openQRCodeDialog', {
      detail: { content }
    })
    window.dispatchEvent(event)
  }, 0)
}

