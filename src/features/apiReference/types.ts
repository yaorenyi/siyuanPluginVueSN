/**
 * API参考模块的类型定义
 */

export interface ApiExample {
  title: string
  description: string
  method?: string
  endpoint: string
  headers?: Record<string, string>
  body?: any
  response?: any
}

export interface ApiCategory {
  id: string
  title: string
  description?: string
  endpoints: ApiEndpoint[]
}

export interface ApiEndpoint {
  id: string
  name: string
  method: string
  endpoint: string
  description: string
  parameters?: ApiParameter[]
  examples: ApiExample[]
  responseExample?: any
}

export interface ApiParameter {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: any
}

export interface ApiProvider {
  id: string
  name: string
  description: string
  icon: string
  version?: string
  documentationUrl: string
  baseUrl: string
  authType: 'none' | 'apiKey' | 'bearer' | 'basic' | 'oauth'
  categories: ApiCategory[]
}

/**
 * API管理器接口
 */
export interface ApiManager {
  getProviders(): ApiProvider[]
  getProvider(id: string): ApiProvider | undefined
  getCategories(providerId: string): ApiCategory[]
  getCategory(providerId: string, categoryId: string): ApiCategory | undefined
  getEndpoint(providerId: string, categoryId: string, endpointId: string): ApiEndpoint | undefined
  searchProviders(query: string): ApiProvider[]
  searchEndpoints(providerId: string, query: string): ApiEndpoint[]
}
