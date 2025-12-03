/**
 * 磁盘浏览器数据存储管理
 */
import { Plugin } from 'siyuan'

/**
 * 磁盘浏览器设置接口
 */
export interface DiskBrowserSettings {
  favoriteFolders: string[]
}

/**
 * 磁盘浏览器存储管理器
 */
export class DiskBrowserStorage {
  private plugin: Plugin
  private readonly STORAGE_KEY = 'disk-browser-settings'

  constructor(plugin: Plugin) {
    this.plugin = plugin
  }

  /**
   * 保存收藏夹列表
   */
  async saveFavorites(favorites: string[]): Promise<boolean> {
    try {
      const settings: DiskBrowserSettings = { favoriteFolders: favorites }
      await this.plugin.saveData(this.STORAGE_KEY, settings)
      return true
    } catch (error) {
      console.error('保存收藏夹失败:', error)
      return false
    }
  }

  /**
   * 加载收藏夹列表
   */
  async loadFavorites(): Promise<string[]> {
    try {
      const data = await this.plugin.loadData(this.STORAGE_KEY)
      const settings = data as DiskBrowserSettings
      return settings?.favoriteFolders || []
    } catch (error) {
      console.error('加载收藏夹失败:', error)
      return []
    }
  }

  /**
   * 初始化存储
   */
  async init(): Promise<void> {
    try {
      const settings = await this.plugin.loadData(this.STORAGE_KEY)
      if (!settings) {
        const defaultSettings: DiskBrowserSettings = {
          favoriteFolders: []
        }
        await this.plugin.saveData(this.STORAGE_KEY, defaultSettings)
      }
    } catch (error) {
      console.error('初始化磁盘浏览器存储失败:', error)
    }
  }
}
