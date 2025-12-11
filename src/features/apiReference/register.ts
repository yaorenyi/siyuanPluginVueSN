/**
 * API提供者注册器
 * 注册所有可用的API提供者
 */
import { apiManager } from './manager'
import { siyuanApiProvider } from './providers/siyuan'
import { openaiApiProvider } from './providers/openai'
import { githubApiProvider } from './providers/github'
import { restApiProvider } from './providers/rest'

/**
 * 注册所有API提供者
 */
export function registerApiProviders() {
  // 注册思源API
  apiManager.registerProvider(siyuanApiProvider)

  // 注册OpenAI API
  apiManager.registerProvider(openaiApiProvider)

  // 注册GitHub API
  apiManager.registerProvider(githubApiProvider)

  // 注册通用REST API
  apiManager.registerProvider(restApiProvider)

  console.log('[API Reference] All API providers registered')
}

/**
 * 获取所有已注册的API提供者
 */
export function getRegisteredProviders() {
  return apiManager.getProviders()
}

/**
 * 获取API提供者
 */
export function getProvider(id: string) {
  return apiManager.getProvider(id)
}

/**
 * 搜索API提供者
 */
export function searchProviders(query: string) {
  return apiManager.searchProviders(query)
}
