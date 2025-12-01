# AI内容生成器存储修复

## 问题描述

AI内容生成器面板的提示词配置在重启程序后失效，原因是使用了`localStorage`进行存储，而思源插件应该使用插件自带的持久化存储API。

## 原因分析

### 问题根因
1. **使用不当的存储方式**：代码中使用`localStorage.setItem()`和`localStorage.getItem()`进行数据持久化
2. **重启后数据丢失**：思源插件重启时，`localStorage`可能被清理或重置
3. **缺乏插件集成**：没有利用思源提供的`plugin.saveData()`和`plugin.loadData()` API

### 代码问题定位
```javascript
// 问题代码 - 使用localStorage
localStorage.setItem('ai-content-generator-settings', JSON.stringify(settings));
const saved = localStorage.getItem('ai-content-generator-settings');
```

## 解决方案

### 1. 创建专用存储管理器
创建了`storage.ts`文件，实现`AIGeneratorStorage`类：

```typescript
export class AIGeneratorStorage {
  private plugin: Plugin
  private readonly SETTINGS_STORAGE_KEY = 'ai-content-generator-settings'
  private readonly PROMPTS_STORAGE_KEY = 'ai-content-generator-prompts'
  private readonly CURRENT_PROMPT_STORAGE_KEY = 'ai-content-generator-current-prompt'

  constructor(plugin: Plugin) {
    this.plugin = plugin
  }

  async saveSettings(settings: AIGeneratorSettings): Promise<boolean> {
    await this.plugin.saveData(this.SETTINGS_STORAGE_KEY, settings)
  }

  async loadSettings(): Promise<AIGeneratorSettings | null> {
    return await this.plugin.loadData(this.SETTINGS_STORAGE_KEY)
  }
}
```

### 2. 修改存储调用
将所有`localStorage`调用替换为插件存储API：

```javascript
// 修复前
localStorage.setItem('ai-content-generator-settings', JSON.stringify(settings));
const saved = localStorage.getItem('ai-content-generator-settings');

// 修复后
await storage.saveSettings(settings);
const settings = await storage.loadSettings();
```

### 3. 添加降级处理
为了确保兼容性，添加了`localStorage`降级机制：

```javascript
try {
  if (storage) {
    await storage.saveSettings(settings);
  }
} catch (error) {
  // 降级使用localStorage
  localStorage.setItem('ai-content-generator-settings', JSON.stringify(settings));
}
```

## 修改的文件

### 1. 新建文件
- `src/features/aiContentGenerator/storage.ts` - 存储管理器

### 2. 修改文件
- `src/features/aiContentGenerator/AIContentGeneratorPanel.vue` - 使用新存储管理器
- `src/features/aiContentGenerator/index.ts` - 传递plugin实例

## 功能特性

### 存储功能
- ✅ **设置持久化**：系统提示词、温度、最大tokens等
- ✅ **提示词管理**：保存、加载、删除提示词配置
- ✅ **当前状态**：记录当前选中的提示词
- ✅ **初始化**：首次使用时创建默认配置

### 兼容性保障
- ✅ **插件存储优先**：优先使用`plugin.saveData()`
- ✅ **localStorage降级**：插件API失败时降级使用浏览器存储
- ✅ **错误处理**：完整的异常捕获和日志记录
- ✅ **异步支持**：所有存储操作都是异步的

### 数据结构
```typescript
interface AIGeneratorSettings {
  systemPrompt: string        // 系统提示词
  temperature: number        // 创造性参数
  maxTokens: number         // 最大生成长度
  enableMarkdown: boolean   // 强制Markdown输出
  enableTypewriter: boolean // 打字机效果
  contextMessageLimit: number // 上下文消息数量
}

interface AIPromptConfig {
  id: string                 // 唯一标识
  name: string               // 配置名称
  systemPrompt: string       // 系统提示词
  temperature: number        // 创造性
  maxTokens: number         // 最大tokens
  enableMarkdown: boolean   // Markdown格式
  enableTypewriter: boolean // 打字机效果
  contextMessageLimit: number // 上下文限制
  createdAt: number          // 创建时间
}
```

## 使用效果

### 修复前
- ❌ 重启程序后提示词配置丢失
- ❌ 系统设置重置为默认值
- ❌ 用户需要重新配置所有参数

### 修复后
- ✅ 重启程序后配置保持不变
- ✅ 提示词配置持久化保存
- ✅ 系统设置在重启间保持一致
- ✅ 用户体验得到显著改善

## 测试验证

### 功能测试
1. **保存配置**：修改设置后重启程序，验证设置保持
2. **提示词管理**：保存多个提示词配置，重启后验证列表完整
3. **当前状态**：选中的提示词在重启后保持选中
4. **错误处理**：插件API异常时降级到localStorage

### 兼容性测试
1. **插件API正常**：使用插件存储，数据完整保存
2. **插件API异常**：自动降级到localStorage，不丢失数据
3. **浏览器兼容**：支持各种浏览器的存储限制

## 最佳实践

### 存储策略
1. **优先使用插件API**：确保与思源生态系统集成
2. **异步操作**：所有存储操作使用async/await
3. **错误捕获**：完整的try-catch错误处理
4. **降级机制**：确保在任何情况下都不丢失数据
5. **日志记录**：便于问题排查和调试

### 代码维护
1. **类型安全**：使用TypeScript接口定义数据结构
2. **模块化设计**：存储逻辑独立成单独模块
3. **可扩展性**：便于后续添加新的配置项
4. **向后兼容**：确保数据结构变更的平滑迁移

## 总结

通过将AI内容生成器的存储机制从`localStorage`迁移到思源插件的持久化API，彻底解决了重启程序后提示词配置失效的问题。新的存储系统提供了更好的数据安全性、可靠性和用户体验。