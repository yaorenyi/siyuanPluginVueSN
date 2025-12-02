<template>
  <div class="pronunciation-panel">
    <div class="pronunciation-header">
      <h3>🔊 {{ i18n.pronunciation || '谐音翻译' }}</h3>
      <p class="pronunciation-desc">{{ i18n.pronunciationDesc || '输入英文单词，生成谐音记忆' }}</p>
    </div>

    <div class="pronunciation-input-section">
      <input
        v-model="word"
        type="text"
        class="pronunciation-input"
        :placeholder="i18n.pronunciationPlaceholder || '输入英文单词...'"
        @keyup.enter="handleGenerate"
      />
      <button
        class="pronunciation-btn"
        :disabled="isGenerating || !word.trim()"
        @click="handleGenerate"
      >
        {{ isGenerating ? (i18n.generating || '生成中...') : (i18n.generate || '生成') }}
      </button>
    </div>

    <div v-if="isGenerating" class="pronunciation-loading">
      <div class="loading-spinner"></div>
      <p>{{ i18n.aiThinking || 'AI正在思考...' }}</p>
    </div>

    <div v-if="result && !isGenerating" class="pronunciation-result">
      <div class="result-header">
        <h4>{{ i18n.generatedContent || '生成结果' }}</h4>
        <div class="result-actions">
          <button class="action-btn" @click="copyResult" :title="i18n.copy || '复制'">
            📋 {{ i18n.copy || '复制' }}
          </button>
        </div>
      </div>
      <div class="result-content" v-html="formatResult(result)"></div>
    </div>

    <div v-if="!result && !isGenerating" class="pronunciation-empty">
      <p>{{ i18n.pronunciationHint || '输入英文单词，点击生成按钮，AI将为您生成谐音记忆' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showMessage } from 'siyuan';

interface Props {
  i18n: any;
  onGenerate: (word: string) => Promise<string>;
}

const props = defineProps<Props>();

const word = ref('');
const result = ref('');
const isGenerating = ref(false);

const handleGenerate = async () => {
  if (!word.value.trim()) {
    showMessage(props.i18n.enterInput || '请输入单词', 2000, 'error');
    return;
  }

  isGenerating.value = true;
  result.value = '';

  try {
    const response = await props.onGenerate(word.value.trim());
    result.value = response;
  } catch (error) {
    console.error('生成失败:', error);
  } finally {
    isGenerating.value = false;
  }
};

const formatResult = (text: string) => {
  // 简单的Markdown格式化
  return text
    .replace(/####\s+(.+)/g, '<h4>$1</h4>')
    .replace(/###\s+(.+)/g, '<h3>$1</h3>')
    .replace(/##\s+(.+)/g, '<h2>$1</h2>')
    .replace(/#\s+(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(result.value);
    showMessage(props.i18n.copySuccess || '已复制到剪贴板', 2000, 'info');
  } catch (error) {
    showMessage(props.i18n.copyFailed || '复制失败', 2000, 'error');
  }
};
</script>

<style scoped lang="scss">
.pronunciation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--b3-theme-background);
  overflow: hidden;
}

.pronunciation-header {
  padding: 16px;
  border-bottom: 1px solid var(--b3-theme-surface-lighter);
  background: var(--b3-theme-surface);

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--b3-theme-on-background);
  }

  .pronunciation-desc {
    margin: 0;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    opacity: 0.7;
  }
}

.pronunciation-input-section {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--b3-theme-surface-lighter);
}

.pronunciation-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--b3-theme-surface-light);
  border-radius: 6px;
  background: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--b3-theme-primary);
    box-shadow: 0 0 0 3px rgba(var(--b3-theme-primary-rgb, 59, 130, 246), 0.1);
  }
}

.pronunciation-btn {
  padding: 8px 16px;
  background: var(--b3-theme-primary);
  color: var(--b3-theme-on-primary);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--b3-theme-primary-light);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.pronunciation-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--b3-theme-surface-lighter);
    border-top-color: var(--b3-theme-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin: 0;
    color: var(--b3-theme-on-surface);
    font-size: 14px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pronunciation-result {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--b3-theme-on-background);
    }
  }

  .result-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    padding: 4px 12px;
    background: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-surface-lighter);
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--b3-theme-on-surface);

    &:hover {
      background: var(--b3-theme-surface-lighter);
    }
  }

  .result-content {
    padding: 12px;
    background: var(--b3-theme-surface);
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--b3-theme-on-surface);
    word-wrap: break-word;

    :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
      margin: 12px 0 8px 0;
      color: var(--b3-theme-on-background);
    }

    :deep(strong) {
      font-weight: 600;
      color: var(--b3-theme-primary);
    }
  }
}

.pronunciation-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;

  p {
    margin: 0;
    color: var(--b3-theme-on-surface);
    opacity: 0.6;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
