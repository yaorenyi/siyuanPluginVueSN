/**
 * API提供者注册器
 * 注册所有可用的API提供者
 */
import { createApiReferenceStorage } from './storage'
import { openaiMarkdownContent } from './providers/openai'
import { siyuanMarkdownContent } from './providers/siyuan'
import type { ApiProvider } from './types'
import type { Plugin } from 'siyuan'

/**
 * 初始化默认API提供者
 */
export async function initializeDefaultProviders(plugin: Plugin) {
  const storage = createApiReferenceStorage(plugin)
  
  try {
    // 检查是否已经初始化过
    const existingProviders = await storage.getProviders()
    if (existingProviders.length > 0) {
      console.log('[API Reference] Providers already initialized')
      return existingProviders
    }

    // 创建默认提供者
    const defaultProviders: ApiProvider[] = [
      {
        id: 'siyuan-api',
        name: '思源笔记 API',
        description: siyuanMarkdownContent,
        icon: '📝',
        version: '2.x',
        documentationUrl: 'https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md',
        baseUrl: 'http://127.0.0.1:6806',
        authType: 'bearer',
        categories: []
      },
      {
        id: 'openai-api',
        name: 'OpenAI API',
        description: openaiMarkdownContent,
        icon: '🤖',
        version: 'v1',
        documentationUrl: 'https://platform.openai.com/docs/api-reference',
        baseUrl: 'https://api.openai.com/v1',
        authType: 'bearer',
        categories: []
      }
    ]

    // 保存默认提供者
    await storage.saveProviders(defaultProviders)
    
    // 保存 Markdown 内容
    await storage.saveMarkdownContent('siyuan-api', siyuanMarkdownContent)
    await storage.saveMarkdownContent('openai-api', openaiMarkdownContent)

    console.log('[API Reference] Default providers initialized')
    return defaultProviders
  } catch (error) {
    console.error('[API Reference] Failed to initialize default providers:', error)
    return []
  }
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
