/**
 * API提供者注册器
 * 注册所有可用的API提供者
 */
import { createApiReferenceStorage } from './storage'
import type { Plugin } from 'siyuan'

/**
 * 初始化默认API提供者
 */
export async function initializeDefaultProviders(plugin: Plugin) {
  const storage = createApiReferenceStorage(plugin)
  
  // 检查是否已经初始化过
  const existingProviders = await storage.getProviders()
  
  // 如果已有提供者，直接返回
  if (existingProviders.length > 0) {
    return existingProviders
  }

  // 首次使用，返回空数组，由用户手动添加
  return []
}

/**
 * 获取所有已注册的API提供者
 */
export async function getRegisteredProviders(plugin: Plugin) {
  const storage = createApiReferenceStorage(plugin)
  return await storage.getProviders()
}

/**
 * 获取API提供者
 */
export async function getProvider(plugin: Plugin, id: string) {
  const storage = createApiReferenceStorage(plugin)
  const providers = await storage.getProviders()
  return providers.find(p => p.id === id)
}

/**
 * 搜索API提供者
 */
export async function searchProviders(plugin: Plugin, query: string) {
  const storage = createApiReferenceStorage(plugin)
  const providers = await storage.getProviders()
  const lowercaseQuery = query.toLowerCase()
  
  return providers.filter(provider =>
    provider.name.toLowerCase().includes(lowercaseQuery) ||
    provider.description.toLowerCase().includes(lowercaseQuery)
  )
}
