/**
 * API参考管理器
 * 负责管理所有API提供者的注册、查找和检索
 */
import type { ApiProvider, ApiManager as IApiManager, ApiCategory, ApiEndpoint } from './types'

class ApiReferenceManager implements IApiManager {
  private providers: Map<string, ApiProvider> = new Map()

  /**
   * 注册API提供者
   */
  registerProvider(provider: ApiProvider): void {
    this.providers.set(provider.id, provider)
    console.log(`[API Reference] Registered provider: ${provider.name}`)
  }

  /**
   * 获取所有API提供者
   */
  getProviders(): ApiProvider[] {
    return Array.from(this.providers.values())
  }

  /**
   * 根据ID获取API提供者
   */
  getProvider(id: string): ApiProvider | undefined {
    return this.providers.get(id)
  }

  /**
   * 获取指定提供者的所有分类
   */
  getCategories(providerId: string): ApiCategory[] {
    const provider = this.getProvider(providerId)
    return provider ? provider.categories : []
  }

  /**
   * 获取指定分类
   */
  getCategory(providerId: string, categoryId: string): ApiCategory | undefined {
    const categories = this.getCategories(providerId)
    return categories.find(cat => cat.id === categoryId)
  }

  /**
   * 获取指定端点
   */
  getEndpoint(providerId: string, categoryId: string, endpointId: string): ApiEndpoint | undefined {
    const category = this.getCategory(providerId, categoryId)
    return category?.endpoints.find(ep => ep.id === endpointId)
  }

  /**
   * 搜索API提供者
   */
  searchProviders(query: string): ApiProvider[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getProviders().filter(provider =>
      provider.name.toLowerCase().includes(lowercaseQuery) ||
      provider.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * 在指定提供者中搜索端点
   */
  searchEndpoints(providerId: string, query: string): ApiEndpoint[] {
    const provider = this.getProvider(providerId)
    if (!provider) return []

    const lowercaseQuery = query.toLowerCase()
    const results: ApiEndpoint[] = []

    provider.categories.forEach(category => {
      category.endpoints.forEach(endpoint => {
        if (
          endpoint.name.toLowerCase().includes(lowercaseQuery) ||
          endpoint.description.toLowerCase().includes(lowercaseQuery) ||
          endpoint.endpoint.toLowerCase().includes(lowercaseQuery)
        ) {
          results.push(endpoint)
        }
      })
    })

    return results
  }

  /**
   * 全局搜索端点
   */
  searchAllEndpoints(query: string): Array<{
    provider: ApiProvider
    endpoint: ApiEndpoint
    category: ApiCategory
  }> {
    const lowercaseQuery = query.toLowerCase()
    const results: Array<{
      provider: ApiProvider
      endpoint: ApiEndpoint
      category: ApiCategory
    }> = []

    this.providers.forEach(provider => {
      provider.categories.forEach(category => {
        category.endpoints.forEach(endpoint => {
          if (
            endpoint.name.toLowerCase().includes(lowercaseQuery) ||
            endpoint.description.toLowerCase().includes(lowercaseQuery) ||
            endpoint.endpoint.toLowerCase().includes(lowercaseQuery) ||
            provider.name.toLowerCase().includes(lowercaseQuery)
          ) {
            results.push({ provider, endpoint, category })
          }
        })
      })
    })

    return results
  }
}

// 导出单例实例
export const apiManager = new ApiReferenceManager()

// 导出类型
export type { ApiProvider }
