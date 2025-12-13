<template>
  <div class="settings-overlay" @click="onCancel">
    <div class="settings-panel" @click.stop>
      <div class="settings-header">
        <h2 class="settings-title">{{ i18n.pluginSettings }}</h2>
        <p class="settings-desc">{{ i18n.pluginSettingsDesc }}</p>
      </div>

    <div class="fn__hr"></div>

    <div class="settings-content">
      <div class="settings-scroll">
      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enablePageLock }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enablePageLock"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enablePageLockDesc }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableTableOfContents }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableTableOfContents"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableTableOfContentsDesc }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableImageCompressor }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableImageCompressor"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableImageCompressorDesc }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableDocNavigation }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableDocNavigation"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableDocNavigationDesc }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableShortcuts || '快捷键面板' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableShortcuts"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableShortcutsDesc || '在右侧边栏显示快捷键面板' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableWordQuery || '单词查询' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableWordQuery"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableWordQueryDesc || '在右侧边栏查询单词释义、音标、谐音等信息' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableGeneralSettings || '通用设置' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableGeneralSettings"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableGeneralSettingsDesc || '在右侧边栏提供字体设置等通用配置功能' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.qrcodeGenerate || '二维码生成' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableQRCode"
          />
        </div>
        <div class="b3-label__text">{{ i18n.qrcodeDesc || '右键选中文本生成二维码，支持复制和下载' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.unitConverter || '单位转换' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableUnitConverter"
          />
        </div>
        <div class="b3-label__text">{{ i18n.unitConverterDesc || '在右侧边栏提供长度、面积、体积、质量、功率、时间、速度、数据存储、进制、ASCII等转换功能' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableDiskBrowser || '本地磁盘浏览器' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableDiskBrowser"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableDiskBrowserDesc || '在右侧边栏显示本地磁盘列表，可快速打开文件夹' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableFloatingToolbar }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableFloatingToolbar"
          />
        </div>
        <div class="b3-label__text">{{ i18n.floatingToolbarDescription }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.enableStatistics || '数据统计' }}
          </span>
          <span class="fn__space"></span>
          <input
            type="checkbox"
            class="b3-switch fn__flex-center"
            v-model="localSettings.enableStatistics"
          />
        </div>
        <div class="b3-label__text">{{ i18n.enableStatisticsDesc || '在右侧边栏显示数据统计面板，包括笔记数量、字数统计、趋势分析等功能' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.statisticsUpdateInterval || '统计自动更新间隔' }}
          </span>
          <span class="fn__space"></span>
          <select
            class="b3-select fn__flex-center"
            v-model="localSettings.statisticsUpdateInterval"
          >
            <option :value="30000">30秒</option>
            <option :value="60000">1分钟</option>
            <option :value="300000">5分钟</option>
            <option :value="600000">10分钟</option>
            <option :value="1800000">30分钟</option>
            <option :value="3600000">1小时</option>
          </select>
        </div>
        <div class="b3-label__text">{{ i18n.statisticsUpdateIntervalDesc || '设置统计数据的自动收集间隔，建议设置为1分钟以上以避免频繁查询影响性能' }}</div>
      </div>

      <div class="setting-item b3-label">
        <div class="fn__flex">
          <span class="fn__flex-1">
            {{ i18n.statisticsTheme || '统计面板主题' }}
          </span>
          <span class="fn__space"></span>
          <select
            class="b3-select fn__flex-center"
            v-model="localSettings.statisticsTheme"
          >
            <option value="default">默认</option>
            <option value="github">GitHub</option>
          </select>
        </div>
        <div class="b3-label__text">{{ i18n.statisticsThemeDesc || '选择统计面板的显示主题风格' }}</div>
      </div>
      </div>
    </div>

    <div class="fn__hr"></div>

    <div class="settings-footer">
      <button class="b3-button b3-button--outline" @click="onReset">
        <svg class="b3-button__icon"><use xlink:href="#iconUndo"></use></svg>
        <span class="b3-button__text">{{ i18n.resetSettings }}</span>
      </button>
      <span class="fn__flex-1"></span>
      <button class="b3-button b3-button--cancel" @click="onCancel">
        {{ i18n.cancel }}
      </button>
      <span class="fn__space"></span>
      <button class="b3-button b3-button--text" @click="onSave">
        {{ i18n.save }}
      </button>
    </div>

    <div class="settings-notice">
      <svg class="icon"><use xlink:href="#iconInfo"></use></svg>
      <span>{{ i18n.settingsNotice }}</span>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { showMessage } from 'siyuan'
import type { PluginSettings } from '@/config/settings'
import { DEFAULT_SETTINGS } from '@/config/settings'

interface Props {
  settings: PluginSettings
  i18n: any
}

interface Emits {
  (e: 'save', settings: PluginSettings): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地配置副本
const localSettings = ref<PluginSettings>({ ...props.settings })

// 保存设置
const onSave = () => {
  // 清理定时器
  const overlay = document.querySelector('.settings-overlay') as HTMLElement
  if (overlay && (overlay as any)._focusTimer) {
    clearInterval((overlay as any)._focusTimer)
  }
  emit('save', localSettings.value)
}

// 取消
const onCancel = () => {
  // 清理定时器
  const overlay = document.querySelector('.settings-overlay') as HTMLElement
  if (overlay && (overlay as any)._focusTimer) {
    clearInterval((overlay as any)._focusTimer)
  }
  emit('cancel')
}

// 重置为默认设置
const onReset = () => {
  localSettings.value = { ...DEFAULT_SETTINGS }
  showMessage(props.i18n.resetSettingsSuccess || '已重置为默认设置', 2000, 'info')
}

onMounted(() => {
  // 确保本地配置与传入的配置同步
  localSettings.value = { ...props.settings }

  // 确保设置面板在最上层
  const overlay = document.querySelector('.settings-overlay') as HTMLElement
  if (overlay) {
    // 使用更高的z-index确保在集市之上
    overlay.style.zIndex = '30000'

    // 添加事件监听，确保焦点始终在设置面板上
    const focusTimer = setInterval(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        const activeElement = document.activeElement as HTMLElement
        // 如果当前焦点元素不在设置面板内，强制焦点回到设置面板
        if (!activeElement.closest('.settings-panel')) {
          const firstInput = overlay.querySelector('input') as HTMLInputElement
          if (firstInput) {
            firstInput.focus()
          }
        }
      }
    }, 200)

    // 存储定时器ID以便清理
    ;(overlay as any)._focusTimer = focusTimer
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  const overlay = document.querySelector('.settings-overlay') as HTMLElement
  if (overlay && (overlay as any)._focusTimer) {
    clearInterval((overlay as any)._focusTimer)
  }
})
</script>

<style lang="scss" scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  pointer-events: auto;
}

.settings-panel {
  padding: 0;
  max-width: 1080px;
  width: 90%;
  max-height: 85vh;
  background: var(--b3-theme-background);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  color: var(--b3-theme-on-background);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--b3-theme-surface-lighter);
  background: var(--b3-theme-surface);
  flex-shrink: 0;
}

.settings-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-on-background);
}

.settings-desc {
  margin: 0;
  font-size: 13px;
  color: var(--b3-theme-on-surface);
  line-height: 1.4;
  opacity: 0.7;
}

.settings-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.settings-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-content: start;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--b3-theme-surface-lighter);
    border-radius: 3px;

    &:hover {
      background: var(--b3-theme-on-surface);
    }
  }
}

.setting-item {
  margin-bottom: 0;
  padding: 12px;
  background: var(--b3-theme-surface);
  border-radius: 6px;
  border: 1px solid var(--b3-theme-surface-lighter);
  transition: all 0.2s ease;

  &:hover {
    background: var(--b3-theme-surface-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .fn__flex-1 {
    font-size: 14px;
    font-weight: 500;
    color: var(--b3-theme-on-background);
  }

  .b3-label__text {
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    line-height: 1.5;
    margin-top: 4px;
    opacity: 0.8;
  }
}

.settings-footer {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 8px;
  flex-shrink: 0;
  border-top: 1px solid var(--b3-theme-surface-lighter);
  background: var(--b3-theme-surface);
}

.settings-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  margin: 0 20px 16px;
  background: var(--b3-theme-primary-lighter);
  border: 1px solid var(--b3-theme-primary-light);
  border-radius: 6px;
  font-size: 12px;
  color: var(--b3-theme-primary);
  line-height: 1.5;
  flex-shrink: 0;

  .icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: var(--b3-theme-primary);
  }
}

.fn__hr {
  margin: 0;
  border: none;
  border-top: 1px solid var(--b3-theme-surface-lighter);
}
</style>
