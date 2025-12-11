/**
 * Markdown API 文档加载器
 * 支持纯 Markdown 内容渲染
 */
import { marked } from 'marked'
import type { ApiProvider } from './types'

/**
 * 渲染 Markdown 内容为 HTML
 */
export function renderMarkdown(content: string): string {
  try {
    // 使用同步的 marked 方法
    const result = marked(content, {
      breaks: true,
      gfm: true
    })
    
    // 确保返回字符串
    return typeof result === 'string' ? result : String(result)
  } catch (error) {
    console.error('Failed to render markdown:', error)
    return content
  }
}

/**
 * 解析 markdown 文件内容为 API 提供者（暂未使用）
 */
export function parseMarkdownToProvider(content: string, filename: string): ApiProvider {
  // 简化实现，暂时返回基本结构
  const providerId = filename.replace('.md', '')
  
  return {
    id: providerId,
    name: providerId,
    description: content,
    icon: '📄',
    documentationUrl: '',
    baseUrl: '',
    authType: 'none',
    categories: []
  }
}

// 未使用的解析函数已移除，保持文件简洁

// 注意：以下函数暂时保留用于未来可能的文件系统集成

/**
 * 从文件系统加载所有 API 文档（暂未使用）
 */
export async function loadApiProvidersFromMarkdown(): Promise<ApiProvider[]> {
  // 暂时返回空数组，未来可以实现从文件系统加载
  console.warn('loadApiProvidersFromMarkdown is not implemented yet')
  return []
}