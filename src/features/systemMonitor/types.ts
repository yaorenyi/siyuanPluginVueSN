/**
 * 系统监控功能类型定义
 */

/**
 * 系统资源使用情况
 */
export interface SystemResourceUsage {
  cpuUsage: number  // CPU使用率 (0-100)
  memoryUsage: number  // 内存使用率 (0-100)
  memoryTotal: number  // 总内存 (MB)
  memoryUsed: number   // 已用内存 (MB)
  memoryFree: number   // 可用内存 (MB)
  timestamp: number    // 时间戳
}

/**
 * 系统监控配置
 */
export interface SystemMonitorConfig {
  updateInterval: number  // 更新间隔（毫秒）
  showCpuUsage: boolean   // 显示CPU使用率
  showMemoryUsage: boolean // 显示内存使用率
  showMemoryDetails: boolean // 显示内存详情
  compactMode: boolean    // 紧凑模式
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: SystemMonitorConfig = {
  updateInterval: 1000,  // 1秒
  showCpuUsage: true,
  showMemoryUsage: true,
  showMemoryDetails: false,
  compactMode: true,
}

/**
 * 系统监控状态
 */
export interface SystemMonitorState {
  isMonitoring: boolean
  lastUpdate: number
  usageHistory: SystemResourceUsage[]
  config: SystemMonitorConfig
}

/**
 * 平台特定的资源监控接口
 */
export interface ResourceMonitor {
  getCpuUsage(): Promise<number>
  getMemoryUsage(): Promise<{
    usage: number
    total: number
    used: number
    free: number
  }>
  isAvailable(): boolean
}