# API参考模块

这是一个模块化的API参考系统，支持多种API类型的文档浏览和查询。

## 功能特性

- 📚 **多API支持**：支持思源笔记、OpenAI、GitHub、通用REST API等多种API
- 🔍 **智能搜索**：可以搜索API端点、参数、示例等
- 🎯 **分类浏览**：按功能分类组织API端点
- 💡 **完整示例**：每个端点都包含详细的请求和响应示例
- 🌐 **双语支持**：完整的中英文界面
- ⚡ **快捷操作**：支持快捷键Ctrl+Alt+A快速打开

## 架构设计

### 核心组件

1. **API Provider** (`types.ts`)
   - 定义API提供者的抽象接口
   - 包含提供者信息、分类、端点等结构

2. **API Manager** (`manager.ts`)
   - 管理所有API提供者的注册和查询
   - 提供搜索和过滤功能

3. **Provider Implementations**
   - `siyuan.ts` - 思源笔记API
   - `openai.ts` - OpenAI API
   - `github.ts` - GitHub API
   - `rest.ts` - 通用REST API设计模式

4. **UI Components**
   - `ApiReferencePanel.vue` - 主要的浏览界面
   - 支持API选择、搜索、分类浏览等功能

### 添加新的API提供者

要添加新的API提供者，请按以下步骤操作：

1. **创建提供者文件**：
   ```typescript
   // src/features/apiReference/providers/myApi.ts
   import type { ApiProvider } from '../types'

   export const myApiProvider: ApiProvider = {
     id: 'myapi',
     name: 'My API',
     description: '我的API描述',
     icon: '🚀',
     version: '1.0',
     documentationUrl: 'https://docs.example.com',
     baseUrl: 'https://api.example.com',
     authType: 'bearer',
     categories: [
       // ... 分类和端点定义
     ]
   }
   ```

2. **注册提供者**：
   ```typescript
   // src/features/apiReference/register.ts
   import { myApiProvider } from './providers/myApi'

   // 在 registerApiProviders 函数中添加
   apiManager.registerProvider(myApiProvider)
   ```

### API Provider 结构

```typescript
interface ApiProvider {
  id: string                    // 唯一标识符
  name: string                  // 显示名称
  description: string           // 描述
  icon: string                  // 图标（emoji）
  version?: string              // 版本号
  documentationUrl: string      // 官方文档链接
  baseUrl: string               // 基础URL
  authType: 'none' | 'apiKey' | 'bearer' | 'basic' | 'oauth'  // 认证类型
  categories: ApiCategory[]     // 分类列表
}
```

### ApiCategory 结构

```typescript
interface ApiCategory {
  id: string            // 分类ID
  title: string         // 分类标题
  description?: string  // 分类描述
  endpoints: ApiEndpoint[]  // 端点列表
}
```

### ApiEndpoint 结构

```typescript
interface ApiEndpoint {
  id: string                    // 端点ID
  name: string                  // 端点名称
  method: string                // HTTP方法
  endpoint: string              // 端点路径
  description: string           // 描述
  parameters?: ApiParameter[]   // 参数列表
  examples: ApiExample[]        // 示例列表
  responseExample?: any         // 响应示例
}
```

## 使用方式

### 快捷键
- `Ctrl+Alt+A` - 打开API参考面板

### 界面操作
1. **选择API**：点击顶部的API标签切换不同API
2. **搜索**：在搜索框中输入关键词搜索API端点
3. **浏览分类**：点击左侧分类导航浏览不同功能的API
4. **查看示例**：展开每个端点查看详细的请求和响应示例

## 当前支持的API

### 1. 思源笔记 API
- 笔记本操作（创建、打开、关闭、列出）
- 文档操作（创建、重命名、删除、移动）
- 块操作（插入、更新、删除、移动）
- 属性操作（设置、获取块属性）
- SQL查询
- 文件操作
- 通知
- 系统信息

### 2. OpenAI API
- 对话生成（Chat Completions）
- 文本补全（Completions）
- 向量嵌入（Embeddings）
- 图像生成（Images）
- 内容审核（Moderations）
- 模型管理（Models）

### 3. GitHub API
- 仓库管理（创建、查询、更新）
- 问题管理（创建、查询、更新Issues）
- 拉取请求（查询PRs）
- 用户管理（获取用户信息）
- 代码片段（Gists）
- 搜索（搜索仓库、代码、用户）

### 4. 通用REST API
- 基础CRUD操作
- 认证授权
- 批量操作
- 关联关系
- 错误处理
- 版本控制

## 扩展指南

### 添加更多API提供者

可以继续添加其他常用API，如：
- Google Maps API
- Twitter API
- Stripe API
- AWS API
- Docker API
- Kubernetes API
- 等等...

### 自定义搜索逻辑

可以通过修改 `manager.ts` 中的搜索方法来改进搜索功能：
- 添加权重评分
- 支持模糊匹配
- 添加高级过滤选项

### UI增强

可以进一步增强UI功能：
- 添加书签功能
- 支持收藏常用的API端点
- 添加历史记录
- 支持暗色主题切换
- 添加代码高亮显示

## 注意事项

- 每个API提供者应该包含尽可能完整的API文档
- 示例应该使用真实的、可工作的示例
- 保持文档的更新和维护
- 注意版权问题，引用官方文档时注明来源

## 贡献指南

欢迎提交新的API提供者或改进现有功能！

1. Fork项目
2. 创建特性分支
3. 添加新的API提供者
4. 测试功能
5. 提交Pull Request

## 许可证

本项目采用与主项目相同的许可证。
