<template>
  <div
    class="floating-box-wrapper"
    :class="{ collapsed: !isExpanded }"
    ref="wrapperRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 悬浮触发按钮 -->
    <div
      class="floating-box-trigger"
      :class="{ expanded: isExpanded }"
    >
      <svg class="trigger-icon" viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
      </svg>
    </div>

    <!-- 展开工具栏 -->
    <Transition name="toolbar">
      <div v-if="isExpanded" class="floating-toolbar">
        <!-- 工具按钮 -->
        <div
          v-for="tool in tools"
          :key="tool.id"
          class="tool-item"
          :title="tool.title"
          @click="handleToolClick(tool)"
        >
          <div class="tool-icon" :style="{ background: tool.bgColor }">
            <svg viewBox="0 0 24 24" width="18" height="18" v-html="tool.icon" />
          </div>
          <span class="tool-label">{{ tool.label }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { allTools } from './tools'
import type { FloatingTool } from './types'

defineProps<{
  i18n?: Record<string, string>
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const tools = ref<FloatingTool[]>(allTools)

const handleMouseEnter = () => {
  isExpanded.value = true
}

const handleMouseLeave = () => {
  isExpanded.value = false
}

const handleToolClick = (tool: FloatingTool) => {
  tool.action()
}
</script>

<style scoped lang="scss">
.floating-box-wrapper {
  position: fixed;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.3s ease;

  &.collapsed {
    opacity: 0.35;

    &:hover {
      opacity: 1;
    }
  }
}

.floating-box-trigger {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.45);
  }
}

.trigger-icon {
  transition: transform 0.3s ease;
}

.floating-toolbar {
  position: absolute;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: var(--b3-theme-background);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--b3-theme-surface-lighter);
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;

  &:hover {
    background: var(--b3-theme-surface-lighter);

    .tool-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.97);
  }
}

.tool-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.tool-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--b3-theme-on-background);
}

/* 工具栏动画 */
.toolbar-enter-active,
.toolbar-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-enter-from,
.toolbar-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.95);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .floating-box-wrapper {
    right: 8px;
  }

  .floating-box-trigger {
    width: 28px;
    height: 28px;
  }

  .floating-toolbar {
    right: 36px;
  }

  .tool-item {
    padding: 5px 8px;
    min-width: 80px;
  }

  .tool-icon {
    width: 20px;
    height: 20px;
  }

  .tool-label {
    font-size: 11px;
  }
}
</style>
