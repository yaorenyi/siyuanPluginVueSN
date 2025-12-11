<template>
  <div class="api-reference-panel">
    <!-- 头部 -->
    <div class="api-reference-header">
      <div class="header-title">
        <span class="icon">📚</span>
        <h2>{{ i18n.apiReference?.title || 'API使用参考' }}</h2>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="showAddProviderDialog" title="添加API文档">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" fill="currentColor"/>
          </svg>
        </button>
        <button class="close-btn" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293 11.146 4.146a.5.5 0 0 1 .708.708L8.707 8l3.147 3.146a.5.5 0 0 1-.708.708L8 8.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 8 4.146 4.854a.5.5 0 0 1 0-.708z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 快捷键提示 -->
    <div class="shortcut-hint">
      <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>A</kbd> {{ i18n.apiReference?.shortcutHint || '快速打开此面板' }}
    </div>

    <!-- API选择器 -->
    <div class="api-selector" v-if="providers.length > 0">
      <div class="selector-label">{{ i18n.apiReference?.selectApi || '选择API' }}:</div>
      <div class="api-tabs">
        <button
          v-for="provider in providers"
          :key="provider.id"
          :class="['api-tab', { active: selectedProvider?.id === provider.id }]"
          @click="selectProvider(provider.id)"
        >
          <span class="provider-icon">{{ provider.icon }}</span>
          <span class="provider-name">{{ provider.name }}</span>
          <span class="provider-version" v-if="provider.version">{{ provider.version }}</span>
          <button 
            class="remove-provider-btn" 
            @click.stop="removeProvider(provider.id)"
            title="删除此API文档"
          >
            ×
          </button>
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="providers.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>{{ i18n.apiReference?.noProviders || '暂无API文档' }}</h3>
      <p>{{ i18n.apiReference?.addFirstProvider || '点击上方的 + 按钮添加您的第一个API文档' }}</p>
      <button class="add-provider-btn" @click="showAddProviderDialog">
        {{ i18n.apiReference?.addProvider || '添加API文档' }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="api-reference-content" v-if="selectedProvider">
      <!-- Markdown 内容渲染 -->
      <div class="markdown-content-wrapper" ref="contentRef">
        <div 
          class="markdown-content" 
          v-html="renderedMarkdown"
          @click="handleContentClick"
        ></div>
      </div>
    </div>

    <!-- 添加API文档对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="hideAddProviderDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ i18n.apiReference?.addProvider || '添加API文档' }}</h3>
          <button class="close-btn" @click="hideAddProviderDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>{{ i18n.apiReference?.providerName || 'API名称' }}:</label>
            <input 
              v-model="newProvider.name" 
              type="text" 
              :placeholder="i18n.apiReference?.providerNamePlaceholder || '例如: OpenAI API'"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>{{ i18n.apiReference?.providerIcon || '图标' }}:</label>
            <input 
              v-model="newProvider.icon" 
              type="text" 
              :placeholder="i18n.apiReference?.providerIconPlaceholder || '例如: 🤖'"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>{{ i18n.apiReference?.markdownContent || 'Markdown内容' }}:</label>
            <textarea 
              v-model="newProvider.content" 
              :placeholder="i18n.apiReference?.markdownPlaceholder || '请输入Markdown格式的API文档内容...'"
              class="form-textarea"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="hideAddProviderDialog">
            {{ i18n.apiReference?.cancel || '取消' }}
          </button>
          <button class="btn btn-primary" @click="addProvider" :disabled="!canAddProvider">
            {{ i18n.apiReference?.add || '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Plugin } from 'siyuan'
import { renderMarkdown } from './markdownLoader'
import { createApiReferenceStorage } from './storage'
import { initializeDefaultProviders } from './register'
import hljs from 'highlight.js'
import type { ApiProvider } from './types'

interface Props {
  i18n: any
  plugin: Plugin
  onClose: () => void
}

const props = defineProps<Props>()

// 存储管理器
const storage = createApiReferenceStorage(props.plugin)

// 响应式数据
const contentRef = ref<HTMLElement>()
const providers = ref<ApiProvider[]>([])
const selectedProvider = ref<ApiProvider>()
const showAddDialog = ref(false)

// 新增API文档表单
const newProvider = ref({
  name: '',
  icon: '📄',
  content: ''
})

// 计算属性
const renderedMarkdown = computed(() => {
  if (!selectedProvider.value) return ''
  
  // 从存储中获取Markdown内容并渲染
  const content = selectedProvider.value.description || ''
  return renderMarkdown(content)
})

const canAddProvider = computed(() => {
  return newProvider.value.name.trim() && newProvider.value.content.trim()
})

// 初始化
onMounted(async () => {
  await initializeProviders()
  await loadProviders()
})

// 监听选中的提供者变化，高亮代码块
watch(selectedProvider, () => {
  nextTick(() => {
    highlightCodeBlocks()
  })
})

/**
 * 初始化默认提供者
 */
async function initializeProviders() {
  try {
    await initializeDefaultProviders(props.plugin)
    console.log('[API Reference] Default providers initialized')
  } catch (error) {
    console.error('[API Reference] Failed to initialize providers:', error)
  }
}

/**
 * 加载API提供者列表
 */
async function loadProviders() {
  try {
    const storedProviders = await storage.getProviders()
    providers.value = storedProviders
    
    // 默认选择第一个提供者
    if (providers.value.length > 0) {
      await selectProvider(providers.value[0].id)
    }
    
    console.log('[API Reference] Loaded providers:', providers.value.length)
  } catch (error) {
    console.error('[API Reference] Failed to load providers:', error)
  }
}

/**
 * 选择API提供者
 */
async function selectProvider(providerId: string) {
  const provider = providers.value.find(p => p.id === providerId)
  if (!provider) return
  
  try {
    // 从存储中获取Markdown内容
    const content = await storage.getMarkdownContent(providerId)
    if (content) {
      // 更新提供者的描述为Markdown内容
      provider.description = content
    }
    
    selectedProvider.value = provider
    console.log('[API Reference] Selected provider:', providerId)
  } catch (error) {
    console.error('[API Reference] Failed to load provider content:', error)
    selectedProvider.value = provider
  }
}

/**
 * 显示添加API文档对话框
 */
function showAddProviderDialog() {
  newProvider.value = {
    name: '',
    icon: '📄',
    content: ''
  }
  showAddDialog.value = true
}

/**
 * 隐藏添加API文档对话框
 */
function hideAddProviderDialog() {
  showAddDialog.value = false
}

/**
 * 添加新的API文档
 */
async function addProvider() {
  if (!canAddProvider.value) return
  
  try {
    const providerId = generateProviderId(newProvider.value.name)
    
    // 创建新的API提供者
    const provider: ApiProvider = {
      id: providerId,
      name: newProvider.value.name,
      description: newProvider.value.content,
      icon: newProvider.value.icon,
      documentationUrl: '',
      baseUrl: '',
      authType: 'none',
      categories: []
    }
    
    // 保存到存储
    const updatedProviders = [...providers.value, provider]
    await storage.saveProviders(updatedProviders)
    await storage.saveMarkdownContent(providerId, newProvider.value.content)
    
    // 更新本地状态
    providers.value = updatedProviders
    selectedProvider.value = provider
    
    // 关闭对话框
    hideAddProviderDialog()
    
    console.log('[API Reference] Added new provider:', provider.name)
  } catch (error) {
    console.error('[API Reference] Failed to add provider:', error)
  }
}

/**
 * 删除API文档
 */
async function removeProvider(providerId: string) {
  if (!confirm(props.i18n.apiReference?.confirmDelete || '确定要删除此API文档吗？')) {
    return
  }
  
  try {
    // 从存储中删除
    await storage.removeProvider(providerId)
    
    // 更新本地状态
    providers.value = providers.value.filter(p => p.id !== providerId)
    
    // 如果删除的是当前选中的提供者，选择第一个
    if (selectedProvider.value?.id === providerId) {
      selectedProvider.value = providers.value.length > 0 ? providers.value[0] : undefined
    }
    
    console.log('[API Reference] Removed provider:', providerId)
  } catch (error) {
    console.error('[API Reference] Failed to remove provider:', error)
  }
}

/**
 * 生成提供者ID
 */
function generateProviderId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now()
}

/**
 * 处理内容点击事件（用于处理链接等）
 */
function handleContentClick(event: Event) {
  const target = event.target as HTMLElement
  
  // 处理链接点击
  if (target.tagName === 'A') {
    const href = target.getAttribute('href')
    if (href && href.startsWith('http')) {
      event.preventDefault()
      window.open(href, '_blank')
    }
  }
}

/**
 * 高亮代码块
 */
function highlightCodeBlocks() {
  nextTick(() => {
    const codeBlocks = contentRef.value?.querySelectorAll('pre code')
    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        try {
          hljs.highlightElement(block as HTMLElement)
        } catch (err) {
          console.warn('Failed to highlight code block:', err)
        }
      })
    }
  })
}

/**
 * 关闭面板
 */
function handleClose() {
  props.onClose()
}
</script>

<style scoped>
.api-reference-panel {
  width: 100%;
  height: 100%;
  background-color: var(--b3-theme-background);
  color: var(--b3-theme-color);
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.api-reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--b3-theme-border);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: 1px solid var(--b3-theme-border);
  color: var(--b3-theme-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: var(--b3-theme-hover);
  border-color: var(--b3-theme-primary);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title .icon {
  font-size: 24px;
}

.header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--b3-theme-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: var(--b3-theme-hover);
}

.shortcut-hint {
  padding: 12px 20px;
  background-color: var(--b3-theme-surface);
  font-size: 13px;
  color: var(--b3-theme-color2);
  border-bottom: 1px solid var(--b3-theme-border);
}

.shortcut-hint kbd {
  background-color: var(--b3-theme-background2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--b3-theme-border);
}

.api-selector {
  padding: 16px 20px;
  border-bottom: 1px solid var(--b3-theme-border);
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--b3-theme-color);
}

.api-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.api-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.api-tab:hover {
  background-color: var(--b3-theme-hover);
  border-color: var(--b3-theme-primary);
}

.api-tab.active {
  background-color: var(--b3-theme-primary-light);
  border-color: var(--b3-theme-primary);
  color: var(--b3-theme-primary);
}

.provider-icon {
  font-size: 16px;
}

.provider-version {
  font-size: 11px;
  opacity: 0.6;
  padding: 2px 6px;
  background: var(--b3-theme-background2);
  border-radius: 4px;
}

.remove-provider-btn {
  background: none;
  border: none;
  color: var(--b3-theme-color2);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
  transition: all 0.2s;
  margin-left: 8px;
}

.remove-provider-btn:hover {
  background-color: var(--b3-theme-error);
  color: white;
}

.search-bar {
  padding: 12px 20px;
  border-bottom: 1px solid var(--b3-theme-border);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--b3-theme-color2);
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 6px;
  color: var(--b3-theme-color);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--b3-theme-primary);
}

.api-reference-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--b3-theme-color);
}

.empty-state p {
  margin: 0 0 24px 0;
  color: var(--b3-theme-color2);
  font-size: 14px;
}

.add-provider-btn {
  background: var(--b3-theme-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-provider-btn:hover {
  background: var(--b3-theme-primary-hover);
}

/* Markdown 内容包装器 */
.markdown-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.api-nav {
  width: 200px;
  padding: 20px;
  border-right: 1px solid var(--b3-theme-border);
  overflow-y: auto;
  background-color: var(--b3-theme-surface);
}

.api-nav h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--b3-theme-color2);
}

.api-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.api-nav li {
  margin-bottom: 4px;
}

.api-nav a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  color: var(--b3-theme-color2);
  text-decoration: none;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s;
}

.api-nav a:hover {
  background-color: var(--b3-theme-hover);
  color: var(--b3-theme-color);
}

.api-nav a.active {
  background-color: var(--b3-theme-primary-light);
  color: var(--b3-theme-primary);
  font-weight: 500;
}

.endpoint-count {
  font-size: 11px;
  opacity: 0.6;
}

.search-results {
  width: 100%;
  padding: 20px;
  overflow-y: auto;
}

.search-results h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--b3-theme-color2);
  font-size: 14px;
}

.result-list {
  display: grid;
  gap: 12px;
}

.result-item {
  padding: 16px;
  background: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: var(--b3-theme-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-provider {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--b3-theme-color2);
  margin-bottom: 8px;
}

.result-endpoint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.method-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.method-badge.get {
  background: #d1fae5;
  color: #065f46;
}

.method-badge.post {
  background: #dbeafe;
  color: #1e40af;
}

.method-badge.put {
  background: #fef3c7;
  color: #92400e;
}

.method-badge.delete {
  background: #fee2e2;
  color: #991b1b;
}

.endpoint-path {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 12px;
  color: var(--b3-theme-color);
}

.result-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--b3-theme-color);
}

.result-category {
  font-size: 12px;
  color: var(--b3-theme-color2);
}

.api-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content-section {
  margin-bottom: 32px;
  scroll-margin-top: 20px;
}

.content-section h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.category-description {
  color: var(--b3-theme-color2);
  margin-bottom: 20px;
  font-size: 14px;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.endpoint-item {
  background-color: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 8px;
  padding: 20px;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.endpoint-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.endpoint-path {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  color: var(--b3-theme-color2);
  margin-bottom: 12px;
  padding: 4px 8px;
  background: var(--b3-theme-background2);
  border-radius: 4px;
}

.endpoint-description {
  color: var(--b3-theme-color2);
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.5;
}

.parameters-section,
.examples-section {
  margin-top: 20px;
}

.parameters-section h4,
.examples-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.parameters-table {
  border: 1px solid var(--b3-theme-border);
  border-radius: 6px;
  overflow: hidden;
}

.parameter-header,
.parameter-row {
  display: grid;
  grid-template-columns: 150px 100px 80px 1fr;
  gap: 12px;
  padding: 12px;
  align-items: start;
}

.parameter-header {
  background: var(--b3-theme-surface);
  font-weight: 600;
  font-size: 13px;
  color: var(--b3-theme-color);
}

.parameter-row {
  border-top: 1px solid var(--b3-theme-border);
  font-size: 13px;
}

.param-name {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  color: var(--b3-theme-color);
}

.param-type {
  color: var(--b3-theme-color2);
}

.param-required {
  text-align: center;
  color: var(--b3-theme-color2);
}

.param-description {
  color: var(--b3-theme-color2);
}

.example-item {
  margin-bottom: 16px;
  border: 1px solid var(--b3-theme-border);
  border-radius: 6px;
  overflow: hidden;
}

.example-header {
  padding: 12px;
  background: var(--b3-theme-surface);
  border-bottom: 1px solid var(--b3-theme-border);
}

.example-header strong {
  color: var(--b3-theme-color);
}

.example-desc {
  margin-left: 8px;
  color: var(--b3-theme-color2);
  font-size: 13px;
}

.example-details {
  padding: 12px;
  font-size: 13px;
}

.example-details > div {
  margin-bottom: 8px;
}

.example-details strong {
  color: var(--b3-theme-color);
}

.example-details pre {
  margin: 8px 0 0 0;
  padding: 12px;
  background: var(--b3-theme-background2);
  border-radius: 4px;
  overflow-x: auto;
}

.example-details code {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 12px;
  color: var(--b3-theme-color);
  line-height: 1.5;
}

/* Markdown 内容样式 */
.markdown-content {
  margin: 8px 0 0 0;
  padding: 12px;
  background: var(--b3-theme-background2);
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 12px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.markdown-content p {
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--b3-theme-color);
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 24px;
  font-size: 13px;
  color: var(--b3-theme-color);
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content code:not(pre code) {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 12px;
  background: var(--b3-theme-surface);
  padding: 2px 4px;
  border-radius: 3px;
  color: var(--b3-theme-color);
}

.markdown-content pre {
  margin: 8px 0;
  padding: 12px;
  background: var(--b3-theme-surface) !important;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content pre code {
  background: none !important;
  padding: 0 !important;
  font-size: 12px;
  color: var(--b3-theme-color);
}

/* 覆盖 highlight.js 样式以适配思源主题 */
.markdown-content .hljs {
  background: var(--b3-theme-surface) !important;
  color: var(--b3-theme-color) !important;
}

/* 基本语法高亮样式 */
.markdown-content .hljs-keyword {
  color: #c678dd !important;
  font-weight: 600;
}

.markdown-content .hljs-string {
  color: #98c379 !important;
}

.markdown-content .hljs-comment {
  color: #5c6370 !important;
  font-style: italic;
}

.markdown-content .hljs-number {
  color: #d19a66 !important;
}

.markdown-content .hljs-function {
  color: #61afef !important;
}

.markdown-content .hljs-title {
  color: #e06c75 !important;
  font-weight: 600;
}

.markdown-content .hljs-attr {
  color: #e06c75 !important;
}

.markdown-content .hljs-built_in {
  color: #e6db74 !important;
}

.markdown-content .hljs-literal {
  color: #56b6c2 !important;
}

.markdown-content .hljs-variable {
  color: #d19a66 !important;
}

.markdown-content .hljs-operator {
  color: #56b6c2 !important;
}

.markdown-content .hljs-punctuation {
  color: var(--b3-theme-color) !important;
}

.markdown-content blockquote {
  margin: 8px 0;
  padding: 8px 12px;
  border-left: 3px solid var(--b3-theme-primary);
  background: var(--b3-theme-surface);
  font-size: 13px;
  color: var(--b3-theme-color2);
}

.markdown-content strong {
  font-weight: 600;
  color: var(--b3-theme-color);
}

.markdown-content em {
  font-style: italic;
}

.markdown-content table {
  margin: 8px 0;
  border-collapse: collapse;
  font-size: 12px;
}

.markdown-content table td,
.markdown-content table th {
  padding: 4px 8px;
  border: 1px solid var(--b3-theme-border);
}

.markdown-content table th {
  background: var(--b3-theme-surface);
  font-weight: 600;
}

.provider-info {
  margin-top: 40px;
  padding: 20px;
  background: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 8px;
}

.provider-info h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.info-item {
  margin-bottom: 12px;
  font-size: 13px;
}

.info-item strong {
  color: var(--b3-theme-color);
}

.doc-link {
  color: var(--b3-theme-primary);
  text-decoration: none;
  font-weight: 500;
}

.doc-link:hover {
  text-decoration: underline;
}

/* 滚动条样式 */
.api-nav::-webkit-scrollbar,
.api-content::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 6px;
}

.api-nav::-webkit-scrollbar-track,
.api-content::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.api-nav::-webkit-scrollbar-thumb,
.api-content::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background: var(--b3-theme-surface-lighter);
  border-radius: 3px;
}

.api-nav::-webkit-scrollbar-thumb:hover,
.api-content::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover {
  background: var(--b3-theme-on-surface);
}
</style>

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.dialog {
  background: var(--b3-theme-background);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--b3-theme-border);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-color);
}

.dialog-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--b3-theme-color);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  background: var(--b3-theme-surface);
  border: 1px solid var(--b3-theme-border);
  border-radius: 6px;
  color: var(--b3-theme-color);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--b3-theme-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--b3-theme-border);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: var(--b3-theme-surface);
  color: var(--b3-theme-color);
  border: 1px solid var(--b3-theme-border);
}

.btn-secondary:hover {
  background: var(--b3-theme-hover);
}

.btn-primary {
  background: var(--b3-theme-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--b3-theme-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 增强 Markdown 内容样式 */
.markdown-content {
  line-height: 1.6;
  color: var(--b3-theme-color);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 24px 0 16px 0;
  font-weight: 600;
  color: var(--b3-theme-color);
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 28px;
  border-bottom: 2px solid var(--b3-theme-border);
  padding-bottom: 8px;
}

.markdown-content h2 {
  font-size: 24px;
  border-bottom: 1px solid var(--b3-theme-border);
  padding-bottom: 6px;
}

.markdown-content h3 {
  font-size: 20px;
}

.markdown-content h4 {
  font-size: 16px;
}

.markdown-content h5 {
  font-size: 14px;
}

.markdown-content h6 {
  font-size: 13px;
  color: var(--b3-theme-color2);
}

.markdown-content p {
  margin: 12px 0;
  font-size: 14px;
}

.markdown-content ul,
.markdown-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 6px 0;
  font-size: 14px;
}

.markdown-content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--b3-theme-primary);
  background: var(--b3-theme-surface);
  color: var(--b3-theme-color2);
  font-style: italic;
}

.markdown-content code:not(pre code) {
  background: var(--b3-theme-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  color: var(--b3-theme-color);
}

.markdown-content pre {
  margin: 16px 0;
  padding: 16px;
  background: var(--b3-theme-surface) !important;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid var(--b3-theme-border);
}

.markdown-content pre code {
  background: none !important;
  padding: 0 !important;
  font-size: 13px;
  line-height: 1.5;
  color: var(--b3-theme-color);
}

.markdown-content table {
  margin: 16px 0;
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

.markdown-content table th,
.markdown-content table td {
  padding: 8px 12px;
  border: 1px solid var(--b3-theme-border);
  text-align: left;
}

.markdown-content table th {
  background: var(--b3-theme-surface);
  font-weight: 600;
  color: var(--b3-theme-color);
}

.markdown-content table td {
  color: var(--b3-theme-color);
}

.markdown-content a {
  color: var(--b3-theme-primary);
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 12px 0;
}

.markdown-content hr {
  margin: 24px 0;
  border: none;
  border-top: 1px solid var(--b3-theme-border);
}

/* 代码高亮主题适配 */
.markdown-content .hljs {
  background: var(--b3-theme-surface) !important;
  color: var(--b3-theme-color) !important;
}

.markdown-content .hljs-keyword {
  color: #c678dd !important;
  font-weight: 600;
}

.markdown-content .hljs-string {
  color: #98c379 !important;
}

.markdown-content .hljs-comment {
  color: #5c6370 !important;
  font-style: italic;
}

.markdown-content .hljs-number {
  color: #d19a66 !important;
}

.markdown-content .hljs-function {
  color: #61afef !important;
}

.markdown-content .hljs-title {
  color: #e06c75 !important;
  font-weight: 600;
}

.markdown-content .hljs-attr {
  color: #e06c75 !important;
}

.markdown-content .hljs-built_in {
  color: #e6db74 !important;
}

.markdown-content .hljs-literal {
  color: #56b6c2 !important;
}

.markdown-content .hljs-variable {
  color: #d19a66 !important;
}

.markdown-content .hljs-operator {
  color: #56b6c2 !important;
}

<style scoped lang="scss">
@import "./index.scss";
</style>