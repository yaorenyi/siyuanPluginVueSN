<template>
  <div class="api-reference-panel">
    <!-- 头部 -->
    <div class="api-reference-header">
      <div class="header-title">
        <span class="icon">📚</span>
        <h2>{{ i18n.apiReference?.title || 'API使用参考' }}</h2>
      </div>
      <button class="close-btn" @click="handleClose">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293 11.146 4.146a.5.5 0 0 1 .708.708L8.707 8l3.147 3.146a.5.5 0 0 1-.708.708L8 8.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 8 4.146 4.854a.5.5 0 0 1 0-.708z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- 快捷键提示 -->
    <div class="shortcut-hint">
      <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>A</kbd> {{ i18n.apiReference?.shortcutHint || '快速打开此面板' }}
    </div>

    <!-- API选择器 -->
    <div class="api-selector">
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
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.867-3.834zm-5.242.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
        </svg>
        <input
          v-model="searchQuery"
          :placeholder="i18n.apiReference?.searchPlaceholder || '搜索API端点...'"
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="api-reference-content">
      <!-- 左侧分类导航 -->
      <div class="api-nav" v-if="selectedProvider && !searchQuery">
        <h3>{{ i18n.apiReference?.categories || '分类' }}</h3>
        <ul>
          <li v-for="category in selectedProvider.categories" :key="category.id">
            <a
              href="#"
              @click.prevent="scrollToCategory(category.id)"
              :class="{ active: currentCategory === category.id }"
            >
              {{ category.title }}
              <span class="endpoint-count">({{ category.endpoints.length }})</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="searchQuery">
        <h3>{{ i18n.apiReference?.searchResults || '搜索结果' }}</h3>
        <div v-if="searchResults.length === 0" class="no-results">
          {{ i18n.apiReference?.noResults || '未找到匹配的API端点' }}
        </div>
        <div v-else class="result-list">
          <div
            v-for="result in searchResults"
            :key="`${result.provider.id}-${result.endpoint.id}`"
            class="result-item"
            @click="scrollToEndpoint(result.endpoint.id)"
          >
            <div class="result-provider">
              <span class="provider-icon">{{ result.provider.icon }}</span>
              {{ result.provider.name }}
            </div>
            <div class="result-endpoint">
              <span class="method-badge" :class="result.endpoint.method.toLowerCase()">
                {{ result.endpoint.method }}
              </span>
              <span class="endpoint-path">{{ result.endpoint.endpoint }}</span>
            </div>
            <div class="result-title">{{ result.endpoint.name }}</div>
            <div class="result-category">{{ result.category.title }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="api-content" ref="contentRef" @scroll="handleScroll">
        <template v-if="selectedProvider && !searchQuery">
          <div
            v-for="category in selectedProvider.categories"
            :key="category.id"
            class="content-section"
            :id="`category-${category.id}`"
          >
            <h2>{{ category.title }}</h2>
            <p v-if="category.description" class="category-description">{{ category.description }}</p>

            <div class="endpoint-list">
              <div
                v-for="endpoint in category.endpoints"
                :key="endpoint.id"
                class="endpoint-item"
                :id="`endpoint-${endpoint.id}`"
              >
                <div class="endpoint-header">
                  <h3>{{ endpoint.name }}</h3>
                  <span class="method-badge" :class="endpoint.method.toLowerCase()">
                    {{ endpoint.method }}
                  </span>
                </div>
                <div class="endpoint-path">{{ endpoint.endpoint }}</div>
                <p class="endpoint-description">{{ endpoint.description }}</p>

                <!-- 参数 -->
                <div v-if="endpoint.parameters && endpoint.parameters.length > 0" class="parameters-section">
                  <h4>{{ i18n.apiReference?.parameters || '参数' }}:</h4>
                  <div class="parameters-table">
                    <div class="parameter-header">
                      <span>{{ i18n.apiReference?.name || '名称' }}</span>
                      <span>{{ i18n.apiReference?.type || '类型' }}</span>
                      <span>{{ i18n.apiReference?.required || '必需' }}</span>
                      <span>{{ i18n.apiReference?.description || '描述' }}</span>
                    </div>
                    <div
                      v-for="param in endpoint.parameters"
                      :key="param.name"
                      class="parameter-row"
                    >
                      <span class="param-name">{{ param.name }}</span>
                      <span class="param-type">{{ param.type }}</span>
                      <span class="param-required">{{ param.required ? '✓' : '-' }}</span>
                      <span class="param-description">{{ param.description }}</span>
                    </div>
                  </div>
                </div>

                <!-- 示例 -->
                <div class="examples-section">
                  <h4>{{ i18n.apiReference?.examples || '示例' }}:</h4>
                  <div
                    v-for="(example, index) in endpoint.examples"
                    :key="index"
                    class="example-item"
                  >
                    <div class="example-header">
                      <strong>{{ example.title }}</strong>
                      <span v-if="example.description" class="example-desc">{{ example.description }}</span>
                    </div>
                    <div class="example-details">
                      <div v-if="example.method" class="example-method">
                        <strong>{{ i18n.apiReference?.method || '方法' }}:</strong> {{ example.method }}
                      </div>
                      <div v-if="example.endpoint" class="example-endpoint">
                        <strong>{{ i18n.apiReference?.endpoint || '端点' }}:</strong> {{ example.endpoint }}
                      </div>
                      <div v-if="example.headers" class="example-headers">
                        <strong>{{ i18n.apiReference?.headers || '请求头' }}:</strong>
                        <pre><code>{{ JSON.stringify(example.headers, null, 2) }}</code></pre>
                      </div>
                      <div v-if="example.body" class="example-body">
                        <strong>{{ i18n.apiReference?.body || '请求体' }}:</strong>
                        <pre><code>{{ JSON.stringify(example.body, null, 2) }}</code></pre>
                      </div>
                      <div v-if="example.response" class="example-response">
                        <strong>{{ i18n.apiReference?.response || '响应' }}:</strong>
                        <pre><code>{{ JSON.stringify(example.response, null, 2) }}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- API提供者信息 -->
        <div v-if="selectedProvider" class="provider-info">
          <h3>{{ i18n.apiReference?.aboutProvider || '关于此API' }}</h3>
          <div class="info-item">
            <strong>{{ i18n.apiReference?.name || '名称' }}:</strong> {{ selectedProvider.name }}
          </div>
          <div class="info-item">
            <strong>{{ i18n.apiReference?.description || '描述' }}:</strong> {{ selectedProvider.description }}
          </div>
          <div class="info-item" v-if="selectedProvider.version">
            <strong>{{ i18n.apiReference?.version || '版本' }}:</strong> {{ selectedProvider.version }}
          </div>
          <div class="info-item">
            <strong>{{ i18n.apiReference?.baseUrl || '基础URL' }}:</strong> {{ selectedProvider.baseUrl }}
          </div>
          <div class="info-item">
            <strong>{{ i18n.apiReference?.authType || '认证方式' }}:</strong> {{ selectedProvider.authType }}
          </div>
          <div class="info-item">
            <a :href="selectedProvider.documentationUrl" target="_blank" class="doc-link">
              {{ i18n.apiReference?.viewDocs || '查看官方文档' }} →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { ApiProvider, ApiCategory, ApiEndpoint } from './types'

interface Props {
  i18n: any
  onClose: () => void
}

const props = defineProps<Props>()

const contentRef = ref<HTMLElement>()
const currentCategory = ref('')
const searchQuery = ref('')
const searchResults = ref<Array<{
  provider: ApiProvider
  endpoint: ApiEndpoint
  category: ApiCategory
}>>([])

// API提供者列表
const providers = ref<ApiProvider[]>([])

// 当前选中的提供者
const selectedProvider = ref<ApiProvider>()

// 初始化
onMounted(async () => {
  // 动态导入所有提供者
  const { registerApiProviders, getRegisteredProviders } = await import('./register')
  registerApiProviders()
  providers.value = getRegisteredProviders()

  // 默认选择第一个提供者
  if (providers.value.length > 0) {
    selectedProvider.value = providers.value[0]
  }
})

// 选择API提供者
const selectProvider = (providerId: string) => {
  const provider = providers.value.find(p => p.id === providerId)
  if (provider) {
    selectedProvider.value = provider
    searchQuery.value = ''
    searchResults.value = []
    currentCategory.value = ''
  }
}

// 滚动到分类
const scrollToCategory = (categoryId: string) => {
  const element = document.getElementById(`category-${categoryId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    currentCategory.value = categoryId
  }
}

// 滚动到端点
const scrollToEndpoint = (endpointId: string) => {
  const element = document.getElementById(`endpoint-${endpointId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 搜索处理
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  // 简单的搜索实现
  searchResults.value = []
  providers.value.forEach(provider => {
    provider.categories.forEach(category => {
      category.endpoints.forEach(endpoint => {
        if (
          endpoint.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          endpoint.endpoint.toLowerCase().includes(searchQuery.value.toLowerCase())
        ) {
          searchResults.value.push({
            provider,
            endpoint,
            category
          })
        }
      })
    })
  })
}

// 监听滚动更新当前分类
const handleScroll = () => {
  if (!selectedProvider.value || searchQuery.value) return

  const sections = contentRef.value?.querySelectorAll('.content-section')
  if (!sections) return

  const scrollTop = contentRef.value?.scrollTop || 0

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const contentRect = contentRef.value?.getBoundingClientRect()

    if (contentRect) {
      const sectionTop = rect.top - contentRect.top
      if (scrollTop >= sectionTop - 100) {
        currentCategory.value = section.id.replace('category-', '')
      }
    }
  })
}

// 关闭面板
const handleClose = () => {
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
