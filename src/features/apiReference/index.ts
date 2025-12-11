/**
 * API参考模块
 * 功能：通过快捷键居中弹出多API使用方式参考
 */
import { Plugin } from 'siyuan'
import { createApp, h } from 'vue'
import ApiReferencePanel from './ApiReferencePanel.vue'
import { registerApiProviders } from './register'

/**
 * 注册API参考模块
 */
export function registerApiReference(plugin: Plugin) {
  // 注册API提供者
  registerApiProviders()

  // 注册全局快捷键 Ctrl+Alt+A 打开API参考面板
  document.addEventListener('keydown', (event) => {
    // 检测 Ctrl+Alt+A 组合键
    if (event.ctrlKey && event.altKey && event.key === 'A') {
      event.preventDefault()
      showApiReferencePanel(plugin)
    }
  })

  // 监听超级面板中的打开API参考事件
  window.addEventListener('openApiReference', () => {
    showApiReferencePanel(plugin)
  })

  console.log('API参考功能已注册，快捷键: Ctrl+Alt+A')
}

/**
 * 显示API参考面板
 */
function showApiReferencePanel(plugin: Plugin) {
  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.id = 'api-reference-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '9999'
  overlay.style.display = 'flex'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'

  // 创建面板容器
  const panelContainer = document.createElement('div')
  panelContainer.style.width = '90%'
  panelContainer.style.maxWidth = '1400px'
  panelContainer.style.height = '90%'
  panelContainer.style.backgroundColor = 'var(--b3-theme-background)'
  overlay.appendChild(panelContainer)

  // 创建Vue应用
  const app = createApp({
    setup() {
      return () => h(ApiReferencePanel, {
        i18n: plugin.i18n,
        onClose: () => {
          // 清理并移除遮罩层
          app.unmount()
          document.body.removeChild(overlay)
        }
      })
    }
  })

  app.mount(panelContainer)

  // 点击遮罩层关闭面板
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      app.unmount()
      document.body.removeChild(overlay)
    }
  })

  // 添加到页面
  document.body.appendChild(overlay)

  console.log('API参考面板已打开')
}
