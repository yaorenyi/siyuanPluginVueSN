<template>
  <div v-if="visible" class="pronunciation-overlay" @click.self="closeDialog">
    <div class="pronunciation-dialog">
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <div class="dialog-title">
          <svg class="dialog-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12Z"/>
          </svg>
          <span>{{ i18n.pronunciationHelp || '谐音翻译' }}</span>
        </div>
        <button class="close-btn" @click="closeDialog" :title="i18n.close || '关闭'">
          <svg class="icon"><use xlink:href="#iconClose"></use></svg>
        </button>
      </div>

      <!-- 对话框内容 -->
      <div class="dialog-body">
        <!-- 输入单词 -->
        <div class="input-section">
          <label class="input-label">英文单词</label>
          <input
            v-model="inputWord"
            class="word-input"
            placeholder="输入或选择英文单词..."
            @keyup.enter="generatePronunciation"
          />
        </div>

        <!-- API提供商选择 -->
        <div class="api-section">
          <label class="setting-label">API提供商</label>
          <select v-model="apiProvider" class="api-select">
            <option value="tongyi">通义千问</option>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <!-- 生成按钮 -->
        <div class="action-section">
          <button
            class="btn-generate"
            @click="generatePronunciation"
            :disabled="!inputWord || isGenerating"
          >
            <svg class="btn-icon" v-if="!isGenerating"><use xlink:href="#iconRefresh"></use></svg>
            <span v-if="isGenerating">生成中...</span>
            <span v-else>生成谐音</span>
          </button>
        </div>

        <!-- 结果展示 -->
        <div class="result-section" v-if="generatedResult">
          <label class="result-label">谐音记忆</label>
          <div class="result-content" v-html="formatResult(generatedResult)"></div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button class="btn-copy" @click="copyResult" :disabled="!generatedResult">
          <svg class="btn-icon"><use xlink:href="#iconCopy"></use></svg>
          <span>复制结果</span>
        </button>
        <button class="btn-close" @click="closeDialog">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { showMessage } from 'siyuan'
import type PluginSample from '@/index'

interface Props {
  visible: boolean
  content?: string
  plugin?: PluginSample
  i18n?: Record<string, any>
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  i18n: () => ({})
})

const emit = defineEmits<Emits>()

// 状态
const inputWord = ref(props.content || '')
const apiProvider = ref('tongyi')
const isGenerating = ref(false)
const generatedResult = ref('')

// 监听props变化
watch(() => props.content, (newContent) => {
  if (newContent) {
    inputWord.value = newContent
    generatedResult.value = ''
  }
})

// 检测是否为英文单词
function isEnglishWord(text: string): boolean {
  return /^[a-zA-Z\s-]+$/.test(text)
}

// 获取API配置
function getApiConfig() {
  const settings = (props.plugin as any)?.settings || {}
  return {
    provider: apiProvider.value,
    model: settings.aiModel || 'qwen-plus',
    apiKey: settings.aiApiKey || '',
    customEndpoint: settings.aiCustomEndpoint || ''
  }
}

// 构建提示词
function buildPrompt(word: string): string {
  return `请为英文单词 "${word}" 生成谐音记忆，要求：

1. 使用英式标准发音
2. 谐音使用带声调的拼音标注
3. 严格按照以下格式输出：

#### ${word}

单词：${word}
音标：[英式音标]
释义：[中文释义]
谐音：[中文谐音(使用英式自然发音,带拼音标注),如:西斯腾(xī sī téng)]
发音：[发音要点说明]

注意事项：
- 音标必须是英式音标
- 谐音要贴近实际发音，便于记忆
- 拼音必须带声调
- 发音说明要包含音节、重音、元音特点等
- 只输出格式化内容，不要有其他说明文字`
}

// 生成谐音翻译
async function generatePronunciation() {
  if (!inputWord.value) {
    showMessage('请输入单词', 3000, 'error')
    return
  }

  if (!isEnglishWord(inputWord.value)) {
    showMessage('请输入英文单词', 3000, 'error')
    return
  }

  isGenerating.value = true
  generatedResult.value = ''

  try {
    const prompt = buildPrompt(inputWord.value)
    const config = getApiConfig()

    let result = ''

    switch (config.provider) {
      case 'tongyi':
        result = await callTongyiAPI(prompt, config)
        break
      case 'openai':
        result = await callOpenAIAPI(prompt, config)
        break
      case 'deepseek':
        result = await callDeepSeekAPI(prompt, config)
        break
      case 'custom':
        result = await callCustomAPI(prompt, config)
        break
      default:
        throw new Error(`不支持的API供应商: ${config.provider}`)
    }

    if (result) {
      generatedResult.value = result
      showMessage('✓ 谐音翻译已生成', 2000, 'info')
    } else {
      showMessage('生成失败，请重试', 3000, 'error')
    }
  } catch (error) {
    console.error('Pronunciation generation error:', error)
    const errorMsg = (error as Error).message || '未知错误'
    showMessage('🚫 生成失败: ' + errorMsg, 5000, 'error')
  } finally {
    isGenerating.value = false
  }
}

// 调用通义千问API
async function callTongyiAPI(prompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('请先在超级面板中配置API密钥')
  }

  const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

  const requestBody = {
    model: config.model || 'qwen-plus',
    input: {
      messages: [
        {
          role: 'system',
          content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    parameters: {
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: 800
    }
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (data.output && data.output.text) {
    return data.output.text
  } else if (data.output && data.output.choices && data.output.choices.length > 0) {
    return data.output.choices[0].message.content
  } else if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  } else if (data.text) {
    return data.text
  } else if (data.content) {
    return data.content
  } else {
    throw new Error(`API返回数据格式错误，响应结构: ${JSON.stringify(Object.keys(data))}`)
  }
}

// 调用OpenAI API
async function callOpenAIAPI(prompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('请先在超级面板中配置API密钥')
  }

  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  const requestBody = {
    model: config.model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  } else {
    throw new Error('OpenAI API返回数据格式错误')
  }
}

// 调用DeepSeek API
async function callDeepSeekAPI(prompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('请先在超级面板中配置API密钥')
  }

  const apiUrl = 'https://api.deepseek.com/v1/chat/completions'

  const requestBody = {
    model: config.model || 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  } else {
    throw new Error('DeepSeek API返回数据格式错误')
  }
}

// 调用自定义API
async function callCustomAPI(prompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('请先在超级面板中配置API密钥')
  }

  if (!config.customEndpoint) {
    throw new Error('请先在超级面板中配置自定义API端点')
  }

  const requestBody = {
    model: config.model || 'default',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的英语发音教学助手，擅长用中文谐音帮助学习者记忆英语单词发音。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  }

  const response = await fetch(config.customEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`自定义API请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  } else if (data.output && data.output.text) {
    return data.output.text
  } else if (data.text) {
    return data.text
  } else if (data.content) {
    return data.content
  } else {
    throw new Error('自定义API返回数据格式错误')
  }
}

// 格式化结果显示
function formatResult(result: string): string {
  // 将markdown格式转换为HTML
  return result
    .replace(/####\s+(.+)/g, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

// 复制结果到剪贴板
async function copyResult() {
  if (!generatedResult.value) return

  try {
    await navigator.clipboard.writeText(generatedResult.value)
    showMessage('📋 已复制到剪贴板', 2000, 'info')
  } catch (error) {
    console.error('复制失败:', error)
    showMessage('复制失败', 3000, 'error')
  }
}

// 关闭对话框
function closeDialog() {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped lang="scss">
.pronunciation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  pointer-events: auto;
}

.pronunciation-dialog {
  background: var(--b3-theme-background);
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--b3-theme-surface);
  background: var(--b3-theme-surface);
  flex-shrink: 0;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--b3-theme-on-background);
}

.dialog-icon {
  width: 20px;
  height: 20px;
  color: var(--b3-theme-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--b3-theme-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--b3-theme-surface-lighter);
    color: var(--b3-theme-on-background);
  }
}

.close-btn .icon {
  width: 18px;
  height: 18px;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label,
.setting-label,
.result-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--b3-theme-on-surface);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.word-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--b3-theme-surface-lighter);
  border-radius: 3px;
  background: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--b3-theme-primary);
  }
}

.api-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-select {
  padding: 7px;
  border: 1px solid var(--b3-theme-surface-lighter);
  border-radius: 3px;
  background: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  font-size: 11px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--b3-theme-primary);
  }
}

.action-section {
  display: flex;
  justify-content: center;
}

.btn-generate {
  padding: 8px 16px;
  border: 1px solid var(--b3-theme-primary);
  border-radius: 3px;
  background: var(--b3-theme-primary);
  color: var(--b3-theme-on-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--b3-theme-surface);
  border-radius: 3px;
}

.result-content {
  font-size: 12px;
  line-height: 1.6;
  color: var(--b3-theme-on-background);
  white-space: pre-wrap;
  word-break: break-word;

  :deep(h4) {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--b3-theme-primary);
  }

  :deep(strong) {
    color: var(--b3-theme-on-background);
    font-weight: 600;
  }
}

.dialog-footer {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid var(--b3-theme-surface);
  background: var(--b3-theme-surface);
  flex-shrink: 0;
}

.btn-copy,
.btn-close {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid var(--b3-theme-outline);
  border-radius: 3px;
  background: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
    border-color: var(--b3-theme-primary);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-icon {
  width: 12px;
  height: 12px;
}

.btn-close {
  background: var(--b3-theme-primary);
  color: var(--b3-theme-on-primary);
  border-color: var(--b3-theme-primary);

  &:hover {
    opacity: 0.9;
  }
}

.dialog-body::-webkit-scrollbar {
  width: 5px;
}

.dialog-body::-webkit-scrollbar-track {
  background: transparent;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: var(--b3-theme-surface-lighter);
  border-radius: 2px;

  &:hover {
    background: var(--b3-theme-on-surface-variant);
  }
}
</style>
