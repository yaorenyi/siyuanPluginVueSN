<template>
  <div class="api-reference-panel">
    <!-- 头部 -->
    <div class="api-reference-header">
      <div class="header-title">
        <span class="icon">📚</span>
        <h2>{{ i18n.apiReference?.title || 'API使用参考' }}</h2>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="showAddProviderDialog" :title="i18n.apiReference?.addProvider || '添加API文档'">
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
            :title="i18n.apiReference?.deleteProvider || '删除此API文档'"
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
      <!-- 目录导航 -->
      <div class="toc-sidebar" v-if="hasToc">
        <div class="toc-header">
          <span class="toc-icon">📑</span>
          <h3>{{ i18n.apiReference?.tableOfContents || '目录' }}</h3>
        </div>
        <nav class="toc-nav">
          <TocTree 
            :items="tocItems" 
            :activeSlug="activeHeading"
            @navigate="scrollToHeading"
          />
        </nav>
      </div>

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
import { ref, computed, onMounted, nextTick, watch, defineComponent, h } from 'vue'
import { Plugin } from 'siyuan'
import { renderMarkdown, extractToc, type TocItem } from './markdownLoader'
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

// ============================================================================
// TOC Tree 组件
// ============================================================================
const TocTree = defineComponent({
  name: 'TocTree',
  props: {
    items: {
      type: Array as () => TocItem[],
      required: true
    },
    activeSlug: {
      type: String,
      default: ''
    }
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    const handleClick = (slug: string, event: Event) => {
      event.preventDefault()
      emit('navigate', slug)
    }

    const renderItem = (item: TocItem) => {
      const isActive = props.activeSlug === item.slug
      const hasChildren = item.children && item.children.length > 0

      return h('li', { class: `toc-item toc-level-${item.level}` }, [
        h('a', {
          href: `#${item.slug}`,
          class: { 'toc-link': true, 'active': isActive },
          onClick: (e: Event) => handleClick(item.slug, e)
        }, item.text),
        hasChildren ? h('ul', { class: 'toc-children' }, item.children!.map(renderItem)) : null
      ])
    }

    return () => h('ul', { class: 'toc-list' }, props.items.map(renderItem))
  }
})

// ============================================================================
// 响应式数据
// ============================================================================
const storage = createApiReferenceStorage(props.plugin)
const contentRef = ref<HTMLElement>()
const providers = ref<ApiProvider[]>([])
const selectedProvider = ref<ApiProvider>()
const showAddDialog = ref(false)
const tocItems = ref<TocItem[]>([])
const activeHeading = ref<string>('')

const newProvider = ref({
  name: '',
  icon: '📄',
  content: ''
})

// ============================================================================
// 计算属性
// ============================================================================
const renderedMarkdown = computed(() => {
  if (!selectedProvider.value) return ''
  
  const content = selectedProvider.value.description || ''
  return renderMarkdown(content)
})

const hasToc = computed(() => tocItems.value.length > 0)

const canAddProvider = computed(() => {
  return newProvider.value.name.trim() && newProvider.value.content.trim()
})

// ============================================================================
// 生命周期
// ============================================================================
onMounted(async () => {
  await initializeProviders()
  await loadProviders()
})

// 监听选中的提供者变化
watch(selectedProvider, (newProvider) => {
  if (newProvider) {
    const content = newProvider.description || ''
    tocItems.value = extractToc(content)
    
    nextTick(() => {
      highlightCodeBlocks()
      setupScrollSpy()
    })
  } else {
    tocItems.value = []
  }
}, { immediate: true })

// ============================================================================
// 初始化和加载
// ============================================================================
async function initializeProviders() {
  try {
    await initializeDefaultProviders(props.plugin)
    console.log('[API Reference] Default providers initialized')
  } catch (error) {
    console.error('[API Reference] Failed to initialize providers:', error)
  }
}

async function loadProviders() {
  try {
    const storedProviders = await storage.getProviders()
    providers.value = storedProviders
    
    if (providers.value.length > 0) {
      await selectProvider(providers.value[0].id)
    }
    
    console.log('[API Reference] Loaded providers:', providers.value.length)
  } catch (error) {
    console.error('[API Reference] Failed to load providers:', error)
  }
}

// ============================================================================
// Provider 管理
// ============================================================================
async function selectProvider(providerId: string) {
  const provider = providers.value.find(p => p.id === providerId)
  if (!provider) return
  
  try {
    const content = await storage.getMarkdownContent(providerId)
    if (content) {
      provider.description = content
    }
    
    selectedProvider.value = provider
    console.log('[API Reference] Selected provider:', providerId)
  } catch (error) {
    console.error('[API Reference] Failed to load provider content:', error)
    selectedProvider.value = provider
  }
}

async function addProvider() {
  if (!canAddProvider.value) return
  
  try {
    const providerId = generateProviderId(newProvider.value.name)
    
    const provider: ApiProvider = {
      id: providerId,
      name: newProvider.value.name,
      description: newProvider.value.content,
      icon: newProvider.value.icon,
      version: '',
      documentationUrl: '',
      baseUrl: '',
      authType: 'none',
      categories: []
    }
    
    const updatedProviders = [...providers.value, provider]
    await storage.saveProviders(updatedProviders)
    await storage.saveMarkdownContent(providerId, newProvider.value.content)
    
    providers.value = updatedProviders
    selectedProvider.value = provider
    
    hideAddProviderDialog()
    
    console.log('[API Reference] Added new provider:', provider.name)
  } catch (error) {
    console.error('[API Reference] Failed to add provider:', error)
  }
}

async function removeProvider(providerId: string) {
  if (!confirm(props.i18n.apiReference?.confirmDelete || '确定要删除此API文档吗？')) {
    return
  }
  
  try {
    await storage.removeProvider(providerId)
    
    providers.value = providers.value.filter(p => p.id !== providerId)
    
    if (selectedProvider.value?.id === providerId) {
      selectedProvider.value = providers.value.length > 0 ? providers.value[0] : undefined
    }
    
    console.log('[API Reference] Removed provider:', providerId)
  } catch (error) {
    console.error('[API Reference] Failed to remove provider:', error)
  }
}

function generateProviderId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now()
}

// ============================================================================
// 对话框管理
// ============================================================================
function showAddProviderDialog() {
  newProvider.value = {
    name: '',
    icon: '📄',
    content: ''
  }
  showAddDialog.value = true
}

function hideAddProviderDialog() {
  showAddDialog.value = false
}

// ============================================================================
// 内容交互
// ============================================================================
function handleContentClick(event: Event) {
  const target = event.target as HTMLElement
  
  if (target.tagName === 'A') {
    const href = target.getAttribute('href')
    if (href && href.startsWith('http')) {
      event.preventDefault()
      window.open(href, '_blank')
    }
  }
}

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

function scrollToHeading(slug: string) {
  const element = contentRef.value?.querySelector(`[id="${slug}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = slug
  }
}

function setupScrollSpy() {
  const container = contentRef.value
  if (!container) return

  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  if (headings.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          if (id) {
            activeHeading.value = id
          }
        }
      })
    },
    {
      root: container,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    }
  )

  headings.forEach((heading) => observer.observe(heading))
}

function handleClose() {
  props.onClose()
}
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
