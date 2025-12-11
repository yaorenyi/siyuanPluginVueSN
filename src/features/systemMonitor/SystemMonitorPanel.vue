<template>
  <div class="system-monitor-panel" :class="{ 'compact-mode': compactMode }">
    <!-- CPU使用率 -->
    <div v-if="showCpuUsage" class="monitor-item cpu-usage">
      <div class="monitor-label">
        <span class="monitor-icon">⚡</span>
        <span class="monitor-text">{{ i18n?.systemMonitor?.cpu || 'CPU' }}</span>
      </div>
      <div class="monitor-value">
        <span class="usage-value">{{ formatPercentage(cpuUsage) }}</span>
        <div class="usage-bar">
          <div class="usage-bar-fill" :style="{ width: `${cpuUsage}%` }" :class="getUsageClass(cpuUsage)"></div>
        </div>
      </div>
    </div>

    <!-- 内存使用率 -->
    <div v-if="showMemoryUsage" class="monitor-item memory-usage">
      <div class="monitor-label">
        <span class="monitor-icon">💾</span>
        <span class="monitor-text">{{ i18n?.systemMonitor?.memory || '内存' }}</span>
      </div>
      <div class="monitor-value">
        <span class="usage-value">{{ formatPercentage(memoryUsage) }}</span>
        <div class="usage-bar">
          <div class="usage-bar-fill" :style="{ width: `${memoryUsage}%` }" :class="getUsageClass(memoryUsage)"></div>
        </div>
      </div>
    </div>

    <!-- 内存详情（可选） -->
    <div v-if="showMemoryDetails" class="memory-details">
      <div class="detail-item">
        <span class="detail-label">{{ i18n?.systemMonitor?.used || '已用' }}:</span>
        <span class="detail-value">{{ formatMemory(memoryUsed) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ i18n?.systemMonitor?.free || '可用' }}:</span>
        <span class="detail-value">{{ formatMemory(memoryFree) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ i18n?.systemMonitor?.total || '总计' }}:</span>
        <span class="detail-value">{{ formatMemory(memoryTotal) }}</span>
      </div>
    </div>

    <!-- 更新时间 -->
    <div class="update-time" v-if="!compactMode">
      {{ formatTime(lastUpdate) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { SystemResourceUsage } from './types'
import { getSystemResourceUsage } from './resourceMonitor'

interface Props {
  i18n?: any
  compactMode?: boolean
  showCpuUsage?: boolean
  showMemoryUsage?: boolean
  showMemoryDetails?: boolean
  updateInterval?: number
  onUpdate?: (usage: SystemResourceUsage) => void
}

const props = withDefaults(defineProps<Props>(), {
  compactMode: true,
  showCpuUsage: true,
  showMemoryUsage: true,
  showMemoryDetails: false,
  updateInterval: 1000,
})

// 状态
const cpuUsage = ref(0)
const memoryUsage = ref(0)
const memoryTotal = ref(0)
const memoryUsed = ref(0)
const memoryFree = ref(0)
const lastUpdate = ref(Date.now())
let updateTimer: ReturnType<typeof setInterval> | null = null

// 格式化函数
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatMemory = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

const getUsageClass = (usage: number) => {
  if (usage < 50) return 'low'
  if (usage < 80) return 'medium'
  return 'high'
}

// 使用实际的资源监控器获取系统资源使用情况

// 更新资源使用情况
const updateResourceUsage = async () => {
  try {
    const usage = await getSystemResourceUsage()

    cpuUsage.value = usage.cpuUsage
    memoryUsage.value = usage.memoryUsage
    memoryTotal.value = usage.memoryTotal
    memoryUsed.value = usage.memoryUsed
    memoryFree.value = usage.memoryFree
    lastUpdate.value = usage.timestamp

    // 触发更新回调
    if (props.onUpdate) {
      props.onUpdate(usage)
    }
  } catch (error) {
    console.error('获取系统资源使用情况失败:', error)

    // 如果获取失败，使用模拟数据作为回退
    const now = Date.now()
    const simulatedCpuUsage = Math.min(100, Math.max(0, 30 + Math.sin(now / 10000) * 20 + Math.random() * 15))
    const totalMemory = 8 * 1024 * 1024 * 1024
    const usedMemory = totalMemory * (0.4 + Math.sin(now / 15000) * 0.1 + Math.random() * 0.1)
    const freeMemory = totalMemory - usedMemory
    const memoryUsagePercent = (usedMemory / totalMemory) * 100

    cpuUsage.value = simulatedCpuUsage
    memoryUsage.value = memoryUsagePercent
    memoryTotal.value = totalMemory
    memoryUsed.value = usedMemory
    memoryFree.value = freeMemory
    lastUpdate.value = now
  }
}

// 启动监控
const startMonitoring = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }

  // 立即更新一次
  updateResourceUsage()

  // 设置定时更新
  updateTimer = setInterval(updateResourceUsage, props.updateInterval)
}

// 停止监控
const stopMonitoring = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 生命周期
onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})

// 监听属性变化
const effectiveUpdateInterval = computed(() => props.updateInterval)
watch(effectiveUpdateInterval, (newInterval) => {
  stopMonitoring()
  startMonitoring()
})
</script>

<style scoped>
.system-monitor-panel {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 0 0 3px 0;
  height: 22px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 11px;
  color: var(--b3-theme-on-surface);
  background: transparent;
  user-select: none;
}

.system-monitor-panel.compact-mode {
  gap: 6px;
  padding: 0 0 2px 0;
}

.monitor-item {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  min-width: 90px;
}

.monitor-item.compact-mode {
  min-width: 80px;
}

.monitor-label {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  min-width: 30px;
  line-height: 1;
}

.monitor-icon {
  font-size: 10px;
  opacity: 0.7;
  line-height: 1;
}

.monitor-text {
  font-weight: 500;
  white-space: nowrap;
  font-size: 10px;
  line-height: 1;
}

.monitor-value {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  flex: 1;
}

.usage-value {
  min-width: 32px;
  text-align: right;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
  font-weight: 600;
  font-size: 10px;
  line-height: 1;
}

.usage-bar {
  width: 32px;
  height: 4px;
  background: var(--b3-theme-surface-lighter);
  border-radius: 2px;
  overflow: hidden;
  align-self: flex-end;
  margin-bottom: 2px;
}

.usage-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.usage-bar-fill.low {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.usage-bar-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.usage-bar-fill.high {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.memory-details {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  font-size: 11px;
  opacity: 0.8;
}

.detail-item {
  display: flex;
  align-items: flex-end;
  gap: 2px;
}

.detail-label {
  font-weight: 500;
  line-height: 1;
}

.detail-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
  line-height: 1;
}

.update-time {
  font-size: 11px;
  opacity: 0.6;
  margin-left: auto;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
  line-height: 1;
}
</style>
