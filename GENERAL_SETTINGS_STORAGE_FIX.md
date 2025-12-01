# 通用设置存储修复总结

## 问题描述
通用设置中的代码块美化、标题配置和列表配置在重启思源笔记后失效，设置无法持久化。

## 根本原因
这些设置使用 `localStorage` 存储数据，而思源笔记在重启后会清空 `localStorage`，导致设置丢失。

## 解决方案
将所有设置从 `localStorage` 迁移到思源插件的数据存储 API (`plugin.loadData()` 和 `plugin.saveData()`)，这些 API 会将数据持久化到数据库中。

## 修改文件清单

### 1. src/config/settings.ts
添加了三个设置的存储函数：

#### 标题设置
```typescript
export interface HeadingSettings {
  style: string
  colors: { h1-h6: string }
  levelDisplay: string
  customMarkers: string[]
  titleCenterAlign: boolean
  titleColor: string
}

export async function loadHeadingSettings(plugin: Plugin): Promise<HeadingSettings>
export async function saveHeadingSettings(plugin: Plugin, settings: HeadingSettings): Promise<boolean>
export async function resetHeadingSettings(plugin: Plugin): Promise<boolean>
```

#### 代码块设置
```typescript
export interface CodeBlockSettings {
  style: 'default' | 'github' | 'mac' | 'cartoon'
  fontSize: number
  padding: number
  enableCollapse: boolean
  collapseHeight: number
}

export async function loadCodeBlockSettings(plugin: Plugin): Promise<CodeBlockSettings>
export async function saveCodeBlockSettings(plugin: Plugin, settings: CodeBlockSettings): Promise<boolean>
```

#### 列表设置
```typescript
export async function loadListSettingsFromDB(plugin: Plugin): Promise<ListSettings>
export async function saveListSettingsToDB(plugin: Plugin, settings: ListSettings): Promise<boolean>
```

### 2. src/features/generalSettings/index.ts
修改 `GeneralSettings` 类的初始化方法：

**修改前：**
```typescript
public init() {
  this.addDock();
  this.applySavedSettings();
  this.applyCodeBlockStyle(); // 从 localStorage 加载
  this.applyListStyle(); // 从 localStorage 加载
  console.log('通用设置模块已初始化');
}
```

**修改后：**
```typescript
public async init() {
  this.addDock();
  this.applySavedSettings();
  await this.applyCodeBlockStyle(); // 从数据库加载
  await this.applyListStyle(); // 从数据库加载
  await this.applyHeadingStyle(); // 从数据库加载
  console.log('通用设置模块已初始化');
}
```

### 3. src/features/generalSettings/GeneralSettingsPanel.vue
传递 `plugin` 实例给子组件：

```vue
<CodeBlockSettings :i18n="i18n" :plugin="plugin" @change="handleCodeBlockChange" />
<HeadingSettings :i18n="i18n" :plugin="plugin" @change="handleHeadingChange" />
<ListSettings :i18n="i18n" :plugin="plugin" @change="handleListChange" />
```

### 4. src/features/generalSettings/components/HeadingSettings.vue
**修改前：**
```typescript
// 使用 localStorage
function autoSave() {
  localStorage.setItem('general-heading-settings', JSON.stringify(settings))
}

function loadSettings() {
  const saved = localStorage.getItem('general-heading-settings')
  // ...
}
```

**修改后：**
```typescript
// 使用插件数据存储 API
async function autoSave() {
  const { saveHeadingSettings } = await import('@/config/settings')
  await saveHeadingSettings(props.plugin, settingsToSave)
}

async function loadSettings() {
  const { loadHeadingSettings } = await import('@/config/settings')
  const settings = await loadHeadingSettings(props.plugin)
  // ...
}
```

### 5. src/features/generalSettings/components/CodeBlockSettings.vue
**修改前：**
```typescript
watch(settings, (newSettings) => {
  // ...
  localStorage.setItem('general-codeblock-settings', JSON.stringify(newSettings))
}, { deep: true })

function loadSettings() {
  const saved = localStorage.getItem('general-codeblock-settings')
  // ...
}
```

**修改后：**
```typescript
watch(settings, async (newSettings) => {
  // ...
  const { saveCodeBlockSettings } = await import('@/config/settings')
  await saveCodeBlockSettings(props.plugin, newSettings)
}, { deep: true })

async function loadSettings() {
  const { loadCodeBlockSettings } = await import('@/config/settings')
  const loadedSettings = await loadCodeBlockSettings(props.plugin)
  // ...
}
```

### 6. src/features/generalSettings/components/ListSettings.vue
**修改前：**
```typescript
onMounted(() => {
  const saved = localStorage.getItem('general-list-settings')
  // ...
})

const handleSettingsChange = () => {
  emit('change', settings)
}
```

**修改后：**
```typescript
onMounted(async () => {
  const { loadListSettingsFromDB } = await import('@/config/settings')
  const loadedSettings = await loadListSettingsFromDB(props.plugin)
  // ...
})

const handleSettingsChange = async () => {
  emit('change', settingsWithCSS)
  const { saveListSettingsToDB } = await import('@/config/settings')
  await saveListSettingsToDB(props.plugin, settingsWithCSS)
}
```

## 数据存储位置

### 修改前
- 存储位置：浏览器 localStorage
- 持久化：❌ 重启后丢失
- 作用域：当前浏览器会话

### 修改后
- 存储位置：思源笔记数据库
- 持久化：✅ 重启后保留
- 作用域：工作区级别
- 存储键：
  - `heading-settings` - 标题设置
  - `codeblock-settings` - 代码块设置
  - `list-settings` - 列表设置

## 测试步骤

### 1. 测试代码块设置
1. 打开通用设置 → 代码块美化
2. 修改风格为 "GitHub 风格"
3. 调整字体大小为 15px
4. 启用代码块折叠，设置高度为 500px
5. 重启思源笔记
6. 验证设置是否保留

### 2. 测试标题设置
1. 打开通用设置 → 标题配置
2. 启用标题居中
3. 修改文档标题颜色
4. 设置标题层级显示
5. 重启思源笔记
6. 验证设置是否保留

### 3. 测试列表设置
1. 打开通用设置 → 列表设置
2. 启用自定义无序列表样式
3. 修改一级、二级、三级符号
4. 调整符号大小和边距
5. 重启思源笔记
6. 验证设置是否保留

## 验证方法

### 查看控制台日志
重启后应该看到：
```
通用设置模块已初始化
从数据库加载代码块设置: {...}
代码块样式已从数据库加载并应用: {...}
从数据库加载列表设置: {...}
列表样式已从数据库加载并应用: {...}
从数据库加载标题设置: {...}
标题样式已从数据库加载并应用: {...}
```

### 检查数据库
可以通过插件的 `loadData()` 方法验证数据是否正确保存：
```typescript
const headingSettings = await plugin.loadData('heading-settings')
const codeblockSettings = await plugin.loadData('codeblock-settings')
const listSettings = await plugin.loadData('list-settings')
```

## 优势

1. **持久化存储**：数据保存在数据库中，重启后不会丢失
2. **工作区隔离**：不同工作区可以有不同的设置
3. **统一管理**：所有设置使用相同的存储机制
4. **易于备份**：随工作区数据一起备份
5. **跨设备同步**：如果使用思源的同步功能，设置也会同步

## 注意事项

1. 旧的 localStorage 数据不会自动迁移，用户需要重新设置一次
2. 所有组件都需要 `plugin` prop 才能正常工作
3. 异步加载可能导致初始渲染时使用默认值，但会很快更新

## 后续优化建议

1. 添加数据迁移功能，从 localStorage 自动迁移到数据库
2. 添加设置导入/导出功能
3. 添加设置重置功能
4. 考虑添加设置版本控制，便于未来升级
