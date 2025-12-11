/**
 * 系统监控功能模块
 * 在思源笔记底部状态栏显示 CPU 和内存使用情况
 */
import { Plugin } from 'siyuan'
import { createApp, h } from 'vue'
import SystemMonitorPanel from './SystemMonitorPanel.vue'
import type { SystemResourceUsage, SystemMonitorConfig } from './types'
import { DEFAULT_CONFIG } from './types'

/**
 * 系统监控管理器
 */
class SystemMonitorManager {
  private plugin: Plugin
  private config: SystemMonitorConfig = { ...DEFAULT_CONFIG }
  private statusBarElement: HTMLElement | null = null
  private app: any = null
  private isMonitoring = false
  private updateTimer: number | null = null

  constructor(plugin: Plugin) {
    this.plugin = plugin
  }

  /**
   * 初始化系统监控
   */
  async init() {
    try {
      // 加载配置
      await this.loadConfig()

      // 等待页面加载完成后再创建状态栏
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.createStatusBar()
          this.startMonitoring()
          console.log('系统监控功能已初始化（DOMContentLoaded）')
        })
      } else {
        // 页面已经加载完成
        this.createStatusBar()
        this.startMonitoring()
        console.log('系统监控功能已初始化')
      }

    } catch (error) {
      console.error('初始化系统监控失败:', error)
    }
  }

  /**
   * 销毁系统监控
   */
  destroy() {
    this.stopMonitoring()
    this.removeStatusBar()
    console.log('系统监控功能已销毁')
  }

  /**
   * 加载配置
   */
  private async loadConfig() {
    try {
      const savedConfig = await this.plugin.loadData('system-monitor-config')
      if (savedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...savedConfig }
      }
    } catch (error) {
      console.error('加载系统监控配置失败:', error)
    }
  }

  /**
   * 保存配置
   */
  private async saveConfig() {
    try {
      await this.plugin.saveData('system-monitor-config', this.config)
    } catch (error) {
      console.error('保存系统监控配置失败:', error)
    }
  }

  /**
   * 创建状态栏
   */
  private createStatusBar() {
    // 移除现有的状态栏（如果存在）
    this.removeStatusBar()

    // 创建状态栏容器
    this.statusBarElement = document.createElement('div')
    this.statusBarElement.id = 'system-monitor-status-bar'
    this.statusBarElement.style.cssText = `
      display: flex;
      align-items: center;
      height: 22px;
      padding: 0 4px;
      font-size: 11px;
      color: var(--b3-theme-on-surface);
      background: transparent;
      border-left: 1px solid var(--b3-theme-surface-lighter);
      flex-shrink: 0;
      z-index: 1;
    `

    // 创建 Vue 应用
    const container = document.createElement('div')
    container.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      height: 22px;
    `

    this.app = createApp({
      setup: () => {
        return () => h(SystemMonitorPanel, {
          i18n: this.plugin.i18n,
          compactMode: this.config.compactMode,
          showCpuUsage: this.config.showCpuUsage,
          showMemoryUsage: this.config.showMemoryUsage,
          showMemoryDetails: this.config.showMemoryDetails,
          updateInterval: this.config.updateInterval,
          onUpdate: this.handleResourceUpdate.bind(this),
        })
      },
    })

    this.app.mount(container)
    this.statusBarElement.appendChild(container)

    // 等待页面加载完成后添加到状态栏
    this.addToStatusBarWithRetry()
  }

  /**
   * 尝试将状态栏添加到页面，支持重试
   */
  private addToStatusBarWithRetry() {
    const maxRetries = 10
    const retryInterval = 500 // 500ms

    const tryAdd = (retryCount = 0) => {
      console.log(`尝试添加状态栏 (尝试 ${retryCount + 1}/${maxRetries})...`)

      // 方法1：使用思源笔记的 status 元素
      let statusBar = document.getElementById('status')
      if (!statusBar) {
        // 方法2：查找常见的状态栏类名 - 更精确的选择器
        const statusBarSelectors = [
          '#status', // 思源笔记状态栏
          '.status', // 状态栏容器
          '.status__msg', // 状态消息区域
          '.layout__bottom', // 底部布局
          '.statusbar', // 状态栏
        ]

        for (const selector of statusBarSelectors) {
          const element = document.querySelector(selector)
          if (element && element.getBoundingClientRect().height > 0) {
            statusBar = element as HTMLElement
            console.log(`找到状态栏元素: ${selector}`)
            break
          }
        }
      }

      if (statusBar) {
        // 查找状态栏右侧的合适位置
        let targetContainer = statusBar

        // 尝试找到状态栏右侧的容器
        const rightContainers = statusBar.querySelectorAll<HTMLElement>('.fn__flex, .status__right, .status-right')
        if (rightContainers.length > 0) {
          // 使用找到的右侧容器
          targetContainer = rightContainers[rightContainers.length - 1] as HTMLElement
          console.log('使用右侧容器:', targetContainer)
        }

        // 添加到状态栏的右侧，确保不与现有元素冲突
        targetContainer.appendChild(this.statusBarElement)
        console.log('系统监控状态栏已添加到页面')
        return
      }

      // 如果没找到，尝试重试
      if (retryCount < maxRetries) {
        console.log(`未找到状态栏，${retryInterval}ms 后重试...`)
        setTimeout(() => tryAdd(retryCount + 1), retryInterval)
      } else {
        console.warn('无法找到状态栏，系统监控将不会显示')
      }
    }

    // 开始尝试
    tryAdd()
  }

  /**
   * 移除状态栏
   */
  private removeStatusBar() {
    if (this.statusBarElement && this.statusBarElement.parentElement) {
      this.statusBarElement.parentElement.removeChild(this.statusBarElement)
    }
    this.statusBarElement = null

    if (this.app) {
      this.app.unmount()
      this.app = null
    }
  }

  /**
   * 开始监控
   */
  private startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    console.log('开始系统资源监控')

    // 这里可以添加实际的资源监控逻辑
    // 目前使用组件内部的模拟数据
  }

  /**
   * 停止监控
   */
  private stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }

    console.log('停止系统资源监控')
  }

  /**
   * 处理资源更新
   */
  private handleResourceUpdate(usage: SystemResourceUsage) {
    // 可以在这里记录历史数据或触发其他操作
    // console.log('系统资源更新:', usage)
  }

  /**
   * 更新配置
   */
  async updateConfig(newConfig: Partial<SystemMonitorConfig>) {
    this.config = { ...this.config, ...newConfig }
    await this.saveConfig()

    // 重新创建状态栏以应用新配置
    this.createStatusBar()
  }

  /**
   * 获取当前配置
   */
  getConfig(): SystemMonitorConfig {
    return { ...this.config }
  }

  /**
   * 获取当前监控状态
   */
  getMonitoringStatus(): boolean {
    return this.isMonitoring
  }
}

// 全局管理器实例
let manager: SystemMonitorManager | null = null

/**
 * 注册系统监控功能
 */
export function registerSystemMonitor(plugin: Plugin) {
  console.log('注册系统监控功能 - 开始')

  // 创建管理器实例
  manager = new SystemMonitorManager(plugin)

  // 初始化
  manager.init()

  console.log('注册系统监控功能 - 完成')

  // 返回管理器以便其他模块使用
  return manager
}

/**
 * 获取系统监控管理器
 */
export function getSystemMonitorManager(): SystemMonitorManager | null {
  return manager
}

/**
 * 更新系统监控配置
 */
export async function updateSystemMonitorConfig(config: Partial<SystemMonitorConfig>) {
  if (manager) {
    await manager.updateConfig(config)
  }
}

/**
 * 获取当前配置
 */
export function getSystemMonitorConfig(): SystemMonitorConfig | null {
  return manager?.getConfig() || null
}

/**
 * 获取监控状态
 */
export function getSystemMonitorStatus(): boolean {
  return manager?.getMonitoringStatus() || false
}
