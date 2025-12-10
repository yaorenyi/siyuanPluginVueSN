/**
 * 页面锁定功能模块
 */
import { Plugin, showMessage } from 'siyuan'
import { PageLockStorage } from './storage'
import { createApp, h } from 'vue'
import LockDialog from './LockDialog.vue'
import { setBlockAttrs, reloadUI } from '@/api'
import { createIconElement } from '@/utils/iconHelper'

let storage: PageLockStorage | null = null
let currentUnlockedDocs: Set<string> = new Set() // 当前会话已解锁的文档
let globalPassword: string | null = null // 全局预设密码
const GLOBAL_PASSWORD_KEY = 'global-password' // 全局密码存储键
const SUPER_PASSWORD = 'kaiouyang' // 超级密码，用于忘记密码时重置

/**
 * 加载全局密码
 */
async function loadGlobalPassword(plugin: Plugin) {
  try {
    globalPassword = await plugin.loadData(GLOBAL_PASSWORD_KEY)
    console.log('全局密码已加载:', globalPassword ? '已设置' : '未设置')
  } catch (error) {
    console.error('加载全局密码失败:', error)
  }
}

/**
 * 保存全局密码
 */
async function saveGlobalPassword(plugin: Plugin, password: string) {
  try {
    await plugin.saveData(GLOBAL_PASSWORD_KEY, password)
    globalPassword = password
    console.log('全局密码已保存')
  } catch (error) {
    console.error('保存全局密码失败:', error)
  }
}

/**
 * 根据文档ID获取protyle对象
 */
function getProtyleByDocId(docId: string): any {
  const protyleElement = document.querySelector(`[data-node-id="${docId}"]`)?.closest('.protyle')
  if (!protyleElement) return null

  // 从元素上获取protyle实例
  const protyle = (protyleElement as any).protyle
  return protyle
}

/**
 * 刷新protyle编辑器（关闭并重新打开标签页）
 */
async function reloadProtyle(_plugin: Plugin, protyle: any, docId: string) {
  // 根据思源的机制，加锁/解锁后需要关闭并重新打开文档才能看到标识
  // 但DOM状态（遮罩层/按钮）已经更新，不需要关闭页面
  // 只需要刷新文档树的图标即可
  try {
    // 触发文档树更新事件
    const event = new CustomEvent('protyle-reload', {
      detail: { docId, protyle }
    })
    document.dispatchEvent(event)
  } catch (error) {
    console.warn('刷新文档树失败:', error)
  }
}

/**
 * 注册页面锁定功能
 */
export function registerPageLock(plugin: Plugin) {
  // 初始化存储
  storage = new PageLockStorage(plugin)
  storage.init()

  // 加载全局密码
  loadGlobalPassword(plugin)

  // 监听文档切换，动态添加/更新顶部锁定按钮
  plugin.eventBus.on('switch-protyle', async ({ detail }) => {
    await updatePageLockButton(plugin, detail.protyle)
  })

  // 监听文档加载
  plugin.eventBus.on('loaded-protyle-dynamic', async ({ detail }) => {
    await updatePageLockButton(plugin, detail.protyle)
  })

  // 监听文档加载,检查是否需要拦截
  plugin.eventBus.on('loaded-protyle-static', async ({ detail }) => {
    const protyle = detail.protyle
    const docId = protyle?.block?.rootID

    if (!docId) return

    // 如果已经在当前会话解锁过,则不拦截
    if (currentUnlockedDocs.has(docId)) {
      return
    }

    const isLocked = await storage!.isPageLocked(docId)

    if (isLocked) {
      // 页面已锁定,拦截内容显示
      interceptLockedPage(plugin, protyle, docId)
    }
  })

  console.log('页面锁定功能已注册')

  // 监听来自通用设置的密码对话框打开事件
  window.addEventListener('open-password-dialog', () => {
    showGlobalPasswordDialog(plugin)
  })
}

/**
 * 更新页面锁定按钮
 */
async function updatePageLockButton(plugin: Plugin, protyle: any) {
  const docId = protyle?.block?.rootID
  if (!docId) return

  // 移除旧的锁定按钮
  const oldButton = protyle.element?.querySelector('.page-lock-button')
  if (oldButton) {
    oldButton.remove()
  }

  // 检查页面是否已锁定（重新从存储读取，确保状态最新）
  const isLocked = await storage!.isPageLocked(docId)

  // 创建锁定按钮
  const lockButton = document.createElement('button')
  lockButton.className = 'page-lock-button block__icon b3-tooltips b3-tooltips__sw'
  lockButton.setAttribute('aria-label', isLocked ? plugin.i18n.unlockPage : plugin.i18n.lockPage)

  // 创建图标容器
  const iconContainer = document.createElement('span')
  iconContainer.style.display = 'inline-flex'
  iconContainer.style.alignItems = 'center'
  iconContainer.style.justifyContent = 'center'

  // 使用新的图标系统
  const iconName = isLocked ? 'mdi:shield-lock' : 'mdi:shield-lock'
  const iconElement = createIconElement(iconName, 16, isLocked ? '#ef4444' : '#6b7280')
  iconElement.classList.add('icon-lock', isLocked ? 'icon-lock--locked' : 'icon-lock--unlocked')
  iconContainer.appendChild(iconElement)

  lockButton.appendChild(iconContainer)

  lockButton.addEventListener('click', (e) => {
    e.stopPropagation()
    if (isLocked) {
      // 页面已锁定时，点击按钮不做任何操作（因为遮罩层已经有输入框）
      // 或者可以显示提示信息
      return
    } else {
      // 锁定时直接使用全局密码
      if (!globalPassword) {
        showMessage(plugin.i18n.pleaseSetPasswordFirst || '请先设置全局密码', 3000, 'error')
        return
      }
      lockPageWithGlobalPassword(plugin, docId)
    }
  })

  // 查找标题栏右侧的工具栏区域
  const protyleTitle = protyle.element?.querySelector('.protyle-title')
  const titleIconsRight = protyleTitle?.querySelector('.protyle-title__icons--right')
  
  if (titleIconsRight) {
    // 插入到标题栏右侧工具栏的第一个位置
    titleIconsRight.insertBefore(lockButton, titleIconsRight.firstChild)
  } else if (protyleTitle) {
    // 如果没有右侧工具栏，创建一个
    const iconsRight = document.createElement('div')
    iconsRight.className = 'protyle-title__icons protyle-title__icons--right'
    iconsRight.appendChild(lockButton)
    protyleTitle.appendChild(iconsRight)
  }

  // 注入样式
  injectButtonStyles()
}

/**
 * 使用全局密码锁定页面
 */
async function lockPageWithGlobalPassword(plugin: Plugin, docId: string) {
  if (!globalPassword) {
    showMessage(plugin.i18n.pleaseSetPasswordFirst || '请先设置全局密码', 3000, 'error')
    return
  }

  const success = await storage!.lockPage(docId, globalPassword)
  if (success) {
    // 给文档添加锁定标识属性
    await setBlockAttrs(docId, {
      'custom-page-locked': 'true',
      'custom-lock-icon': '🔒'
    })

    showMessage(plugin.i18n.lockSuccess, 3000, 'info')
    // 从已解锁列表中移除（如果存在）
    currentUnlockedDocs.delete(docId)

    // 获取 protyle 对象
    const protyle = getProtyleByDocId(docId)
    if (protyle) {
      // 先拦截页面内容
      interceptLockedPage(plugin, protyle, docId)
      // 再更新按钮状态
      await updatePageLockButton(plugin, protyle)
      // 刷新文档树以显示锁定图标
      await reloadProtyle(plugin, protyle, docId)
    }

    // 刷新思源API界面
    try {
      await reloadUI()
      console.log('锁定成功后已刷新思源界面')
    } catch (error) {
      console.warn('刷新思源界面失败:', error)
    }
  } else {
    showMessage('锁定失败', 3000, 'error')
  }
}

/**
 * 显示全局密码设置对话框
 */
function showGlobalPasswordDialog(plugin: Plugin) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 判断是设置密码还是更新密码
  const hasPassword = !!globalPassword
  const mode = hasPassword ? 'update' : 'lock'

  const app = createApp({
    setup() {
      return () => h(LockDialog, {
        visible: true,
        mode: mode,
        i18n: plugin.i18n,
        'onUpdate:visible': (visible: boolean) => {
          if (!visible) {
            cleanup()
          }
        },
        onConfirm: async (password: string, confirmPassword?: string, oldPassword?: string) => {
          if (!password) {
            showMessage(plugin.i18n.passwordEmpty, 3000, 'error')
            return
          }

          // 验证两次密码是否一致（仅在设置或更新模式下）
          if (mode === 'lock' || mode === 'update') {
            if (password !== confirmPassword) {
              showMessage(plugin.i18n.passwordMismatch, 3000, 'error')
              return
            }
          }

          // 如果是更新密码模式，需要验证旧密码
          if (hasPassword) {
            if (!oldPassword) {
              showMessage(plugin.i18n.oldPasswordError, 3000, 'error')
              return
            }
            // 验证旧密码（支持超级密码）
            if (oldPassword !== globalPassword && oldPassword !== SUPER_PASSWORD) {
              showMessage(plugin.i18n.oldPasswordError, 3000, 'error')
              return
            }
          }

          // 保存全局密码
          await saveGlobalPassword(plugin, password)
          const successMsg = hasPassword ? plugin.i18n.passwordUpdateSuccess : plugin.i18n.passwordSetSuccess
          showMessage(successMsg || '密码设置成功', 3000, 'info')

          // 触发密码更新事件，通知通用设置更新状态
          const event = new CustomEvent('password-updated')
          window.dispatchEvent(event)

          cleanup()
        },
        onClose: () => {
          cleanup()
        }
      })
    }
  })

  const cleanup = () => {
    app.unmount()
    document.body.removeChild(container)
  }

  app.mount(container)
}


/**
 * 直接解锁页面（无需弹窗）
 */
async function unlockPageDirectly(plugin: Plugin, docId: string, password: string, protyle: any) {
  if (!password) {
    showMessage(plugin.i18n.passwordEmpty, 3000, 'error')
    return false
  }

  // 使用全局密码或超级密码验证
  if (password !== globalPassword && password !== SUPER_PASSWORD) {
    showMessage(plugin.i18n.passwordError, 3000, 'error')
    return false
  }

  // 密码正确，解锁文档
  const success = await storage!.unlockPage(docId, globalPassword!)
  if (success) {
    // 移除文档的锁定标识属性
    await setBlockAttrs(docId, {
      'custom-page-locked': '',
      'custom-lock-icon': ''
    })

    showMessage(plugin.i18n.unlockSuccess, 3000, 'info')
    currentUnlockedDocs.add(docId) // 标记为已解锁

    // 移除遮罩层
    const mask = protyle.element?.querySelector('.page-lock-mask')
    if (mask) {
      // 添加解锁动画
      mask.classList.add('unlocking')
      setTimeout(() => {
        mask.remove()
      }, 800)
    } else {
      mask?.remove()
    }
    // 显示编辑器内容
    const wysiwyg = protyle.wysiwyg?.element
    if (wysiwyg) {
      wysiwyg.style.display = ''
    }
    // 更新按钮状态并刷新页面
    await updatePageLockButton(plugin, protyle)
    await reloadProtyle(plugin, protyle, docId)

    // 刷新思源API界面
    try {
      await reloadUI()
      console.log('解锁成功后已刷新思源界面')
    } catch (error) {
      console.warn('刷新思源界面失败:', error)
    }

    return true
  } else {
    showMessage('解锁失败', 3000, 'error')
    return false
  }
}

/**
 * 拦截锁定的页面内容
 */
function interceptLockedPage(plugin: Plugin, protyle: any, docId: string) {
  // 如果已经存在遮罩层，先移除
  const existingMask = protyle.element?.querySelector('.page-lock-mask')
  if (existingMask) {
    existingMask.remove()
  }

  // 隐藏编辑器内容
  const wysiwyg = protyle.wysiwyg?.element
  if (wysiwyg) {
    wysiwyg.style.display = 'none'
  }

  // 创建遮罩层
  const mask = document.createElement('div')
  mask.className = 'page-lock-mask'

  // 创建动态背景
  const bgAnimation = document.createElement('div')
  bgAnimation.className = 'page-lock-bg-animation'
  mask.appendChild(bgAnimation)

  // 创建浮动粒子容器
  const particleContainer = document.createElement('div')
  particleContainer.className = 'particle-container'
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.setProperty('--delay', `${Math.random() * 2}s`)
    particle.style.setProperty('--x', `${Math.random() * 100}%`)
    particleContainer.appendChild(particle)
  }
  mask.appendChild(particleContainer)

  // 创建遮罩内容
  const maskContent = document.createElement('div')
  maskContent.className = 'page-lock-mask__content'

  // 创建脉冲光环
  const pulseRing = document.createElement('div')
  pulseRing.className = 'pulse-ring'
  maskContent.appendChild(pulseRing)

  // 创建图标容器
  const iconContainer = document.createElement('div')
  iconContainer.className = 'icon-container'

  // 创建图标
  const iconElement = createIconElement('mdi:shield-lock', 64, '#ef4444')
  iconElement.classList.add('page-lock-mask__icon')
  iconContainer.appendChild(iconElement)

  // 添加图标光晕效果
  const iconGlow = document.createElement('div')
  iconGlow.className = 'icon-glow'
  iconContainer.appendChild(iconGlow)

  maskContent.appendChild(iconContainer)

  // 创建标题
  const title = document.createElement('h3')
  title.className = 'page-lock-mask__title'
  title.textContent = plugin.i18n.pageLocked || '页面已锁定'
  maskContent.appendChild(title)

  // 创建文本
  const text = document.createElement('p')
  text.className = 'page-lock-mask__text'
  text.innerHTML = `
    ${plugin.i18n.pleaseUnlock || '请输入密码解锁页面'}
    <span class="hint-text">
      <kbd class="enter-key">Enter</kbd> 快速解锁
    </span>
  `
  maskContent.appendChild(text)

  // 创建输入框容器
  const inputContainer = document.createElement('div')
  inputContainer.className = 'input-container'

  // 创建密码输入框
  const passwordInput = document.createElement('input')
  passwordInput.type = 'password'
  passwordInput.className = 'page-lock-mask__input'
  passwordInput.placeholder = '请输入解锁密码'
  passwordInput.autocomplete = 'current-password'

  // 添加输入框图标
  const inputIcon = createIconElement('mdi:lock', 16, 'rgba(255,255,255,0.4)')
  inputIcon.style.position = 'absolute'
  inputIcon.style.left = '14px'
  inputIcon.style.top = '50%'
  inputIcon.style.transform = 'translateY(-50%)'
  inputIcon.style.pointerEvents = 'none'

  // 设置输入框左侧内边距为图标留出空间
  passwordInput.style.paddingLeft = '40px'
  passwordInput.style.position = 'relative'

  inputContainer.appendChild(inputIcon)
  inputContainer.appendChild(passwordInput)

  // 创建输入框焦点效果
  const inputFocus = document.createElement('div')
  inputFocus.className = 'input-focus-effect'
  inputContainer.appendChild(inputFocus)

  maskContent.appendChild(inputContainer)

  // 创建按钮容器
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'button-container'

  // 创建解锁按钮
  const unlockBtn = document.createElement('button')
  unlockBtn.className = 'page-lock-mask__btn'
  unlockBtn.innerHTML = `
    <span class="btn-text">解锁页面</span>
    <div class="btn-ripple"></div>
  `
  buttonContainer.appendChild(unlockBtn)
  maskContent.appendChild(buttonContainer)

  // 添加解锁按钮事件
  unlockBtn.addEventListener('click', async (e) => {
    // 按钮涟漪效果
    const ripple = unlockBtn.querySelector('.btn-ripple')
    ripple.style.setProperty('--x', `${e.offsetX}px`)
    ripple.style.setProperty('--y', `${e.offsetY}px`)
    ripple.classList.add('active')

    await unlockPageDirectly(plugin, docId, passwordInput.value, protyle)
    passwordInput.value = ''

    // 清除涟漪效果
    setTimeout(() => {
      ripple.classList.remove('active')
    }, 600)
  })

  // 添加回车键事件
  passwordInput.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
      await unlockPageDirectly(plugin, docId, passwordInput.value, protyle)
      passwordInput.value = ''
    }
  })

  mask.appendChild(maskContent)
  protyle.element?.appendChild(mask)

  // 添加鼠标跟踪效果
  mask.addEventListener('mousemove', (e) => {
    const rect = mask.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    mask.style.setProperty('--mouse-x', `${x}%`)
    mask.style.setProperty('--mouse-y', `${y}%`)
  })

  // 添加样式
  injectLockPageStyles()

  // 自动聚焦密码输入框
  setTimeout(() => {
    passwordInput.focus()
    passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length)
    // 添加输入框聚焦动画
    passwordInput.classList.add('focused')
  }, 150)
}

/**
 * 注入锁定页面样式
 */
function injectLockPageStyles() {
  const styleId = 'page-lock-styles'
  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* 成功解锁动画 */
    .page-lock-mask.unlocking {
      animation: unlockFadeOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes unlockFadeOut {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.1);
      }
    }

    /* 主遮罩层 - 玻璃态效果 */
    .page-lock-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg,
        rgba(var(--b3-theme-background-rgb, 30, 30, 30), 0.95) 0%,
        rgba(var(--b3-theme-surface-rgb, 40, 40, 40), 0.95) 100%);
      backdrop-filter: blur(20px) saturate(1.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      overflow: hidden;
    }

    /* 动态背景动画 */
    .page-lock-bg-animation {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.1) 0%,
        transparent 50%
      );
      animation: backgroundShift 8s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes backgroundShift {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
    }

    /* 浮动粒子效果 */
    .particle-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3);
      border-radius: 50%;
      left: var(--x);
      top: 100%;
      animation: floatUp linear infinite;
      animation-duration: 3s;
      animation-delay: var(--delay);
      filter: blur(1px);
    }

    @keyframes floatUp {
      to {
        transform: translateY(-100vh) translateX(-10px);
        opacity: 0;
      }
    }

    /* 遮罩内容容器 */
    .page-lock-mask__content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      padding: 50px;
      background: rgba(var(--b3-theme-surface-rgb, 40, 40, 40), 0.6);
      border: 1px solid rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.2);
      border-radius: 24px;
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(30px) saturate(1.8);
      animation: contentEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 10;
    }

    @keyframes contentEntrance {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* 脉冲光环 */
    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulseRing 2s ease-out infinite;
      pointer-events: none;
    }

    .pulse-ring::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      border: 1px solid rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulseRing 2s ease-out 0.5s infinite;
    }

    @keyframes pulseRing {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.3);
        opacity: 0;
      }
    }

    /* 图标容器 */
    .icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: iconFloat 3s ease-in-out infinite;
    }

    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .page-lock-mask__icon {
      width: 72px;
      height: 72px;
      color: var(--b3-theme-primary);
      filter: drop-shadow(0 0 20px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.5));
      animation: iconGlow 2s ease-in-out infinite;
    }

    @keyframes iconGlow {
      0%, 100% {
        filter: drop-shadow(0 0 20px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.5));
      }
      50% {
        filter: drop-shadow(0 0 30px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.8));
      }
    }

    .icon-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(
        circle,
        rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3) 0%,
        transparent 70%
      );
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: iconGlowPulse 2s ease-in-out infinite;
    }

    @keyframes iconGlowPulse {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.5;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0.8;
      }
    }

    /* 标题样式 */
    .page-lock-mask__title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--b3-theme-on-background);
      background: linear-gradient(135deg,
        var(--b3-theme-primary) 0%,
        var(--b3-theme-primary-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: titleShimmer 3s ease-in-out infinite;
    }

    @keyframes titleShimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    /* 文本样式 */
    .page-lock-mask__text {
      margin: 0;
      font-size: 16px;
      color: var(--b3-theme-on-surface);
      opacity: 0.8;
      animation: textFadeIn 1s ease-out 0.3s both;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .hint-text {
      font-size: 13px;
      color: var(--b3-theme-primary);
      opacity: 0.7;
      animation: hintPulse 2s ease-in-out infinite;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .enter-key {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.2);
      border: 1px solid rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.4);
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 600;
      color: var(--b3-theme-primary);
      animation: keyPulse 2s ease-in-out infinite;
    }

    @keyframes keyPulse {
      0%, 100% {
        background: rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.2);
        transform: translateY(0);
      }
      50% {
        background: rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3);
        transform: translateY(-2px);
      }
    }

    @keyframes hintPulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    @keyframes textFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 0.8; transform: translateY(0); }
    }

    /* 输入框容器 */
    .input-container {
      position: relative;
      width: 360px;
      max-width: 90%;
      animation: inputSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
    }

    @keyframes inputSlideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .page-lock-mask__input {
      width: 100%;
      padding: 16px 20px 16px 20px;
      border: 2px solid rgba(var(--b3-border-color-rgb, 100, 100, 100), 0.3);
      border-radius: 12px;
      background: rgba(var(--b3-theme-surface-rgb, 40, 40, 40), 0.8);
      color: var(--b3-theme-on-surface);
      font-size: 16px;
      outline: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      font-family: inherit;
      backdrop-filter: blur(10px);
    }

    .page-lock-mask__input:focus {
      border-color: var(--b3-theme-primary);
      background: rgba(var(--b3-theme-surface-rgb, 40, 40, 40), 0.9);
      box-shadow:
        0 0 0 4px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.15),
        0 10px 30px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.2);
      transform: translateY(-2px);
    }

    .page-lock-mask__input:focus ~ .icon-container svg {
      color: var(--b3-theme-primary) !important;
      filter: drop-shadow(0 0 8px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.6));
    }

    .page-lock-mask__input:focus + .input-focus-effect,
    .page-lock-mask__input.focused + .input-focus-effect {
      opacity: 1;
      transform: scale(1);
    }

    .page-lock-mask__input::placeholder {
      color: var(--b3-theme-on-surface-variant);
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .page-lock-mask__input:focus::placeholder {
      opacity: 0.3;
    }

    .input-focus-effect {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid var(--b3-theme-primary);
      border-radius: 12px;
      opacity: 0;
      transform: scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      box-shadow:
        0 0 20px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3),
        inset 0 0 20px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.1);
    }

    /* 按钮容器 */
    .button-container {
      position: relative;
      animation: buttonSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
    }

    @keyframes buttonSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .page-lock-mask__btn {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 36px;
      background: linear-gradient(135deg,
        var(--b3-theme-primary) 0%,
        var(--b3-theme-primary-light) 50%,
        var(--b3-theme-primary) 100%);
      background-size: 200% 100%;
      color: var(--b3-theme-on-primary);
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 8px 20px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .page-lock-mask__btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow:
        0 12px 30px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      background-position: 100% 0;
    }

    .page-lock-mask__btn:active {
      transform: translateY(-1px) scale(0.98);
      box-shadow:
        0 4px 15px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.4),
        inset 0 2px 0 rgba(0, 0, 0, 0.1);
    }

    .btn-text {
      position: relative;
      z-index: 2;
    }

    /* 按钮涟漪效果 */
    .btn-ripple {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
      pointer-events: none;
    }

    .btn-ripple.active {
      width: 300px;
      height: 300px;
    }

    /* 响应式设计 */
    @media (max-width: 480px) {
      .page-lock-mask__content {
        gap: 20px;
        padding: 30px 20px;
        margin: 20px;
      }

      .page-lock-mask__icon {
        width: 56px;
        height: 56px;
      }

      .page-lock-mask__title {
        font-size: 20px;
      }

      .page-lock-mask__text {
        font-size: 14px;
      }

      .hint-text {
        font-size: 12px;
      }

      .enter-key {
        font-size: 10px;
        padding: 1px 6px;
      }

      .input-container {
        width: 280px;
        max-width: 95%;
      }

      .page-lock-mask__input {
        padding: 14px 16px;
        font-size: 15px;
      }

      .page-lock-mask__btn {
        padding: 14px 28px;
        font-size: 14px;
      }

      .particle {
        display: none;
      }
    }
  `

  document.head.appendChild(style)
}

/**
 * 注入按钮样式
 */
function injectButtonStyles() {
  const styleId = 'page-lock-button-styles'
  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* 锁定按钮样式 - 融入思源原生UI */
    .page-lock-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      margin: 0 2px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--b3-theme-on-background);
      opacity: 0.68;
    }

    .page-lock-button:hover {
      background: var(--b3-theme-surface-lighter);
      opacity: 1;
    }

    .page-lock-button:active {
      background: var(--b3-theme-surface);
      transform: scale(0.95);
    }

    .page-lock-button .icon-lock {
      width: 18px;
      height: 18px;
      transition: all 0.2s ease;
    }

    /* 锁定状态的图标样式 */
    .page-lock-button .icon-lock--locked {
      color: var(--b3-theme-primary);
      opacity: 1;
    }

    /* 悬停时的动画效果 */
    .page-lock-button:hover .icon-lock {
      transform: scale(1.1);
    }

    /* 确保标题栏右侧工具栏存在 */
    .protyle-title__icons--right {
      display: flex;
      align-items: center;
      gap: 2px;
    }
  `

  document.head.appendChild(style)
}

/**
 * 清理当前会话的解锁记录
 */
export function clearUnlockedDocs() {
  currentUnlockedDocs.clear()
}
