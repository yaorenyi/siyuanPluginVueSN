# 浮动工具栏功能模块

## 概述

浮动工具栏功能为思源笔记提供了增强的文本选择工具栏，当用户选中文本时会在文本上方显示一个包含多种操作的工具栏。

## 文件结构

```
floatingToolbar/
├── index.ts                 # 模块入口，注册浮动工具栏功能
├── FloatingToolbar.ts       # 浮动工具栏核心类，管理工具栏显示和事件
├── actions.ts               # 工具栏功能接口和管理器
├── qrcode-action.ts         # 二维码生成功能模块
├── QRCodeDialog.vue         # 二维码对话框组件
└── README.md                # 本文档
```

## 模块化设计

每个功能都被设计为独立的模块，便于维护和扩展：

### 1. 核心模块

- **FloatingToolbar.ts**: 负责浮动工具栏的核心逻辑
  - 监听文本选择事件
  - 管理工具栏的显示和隐藏
  - 注册和管理所有功能按钮

- **actions.ts**: 定义功能接口和管理器
  - `ToolbarAction` 接口：定义功能的标准格式
  - `ToolbarActionManager` 类：管理所有注册的功能
  - `ToolbarActionFactory` 类：提供创建功能的辅助方法

### 2. 功能模块

每个功能都是独立的模块文件，遵循统一的接口：

- **qrcode-action.ts**: 二维码生成功能
  - 导出 `createQRCodeAction()` 函数
  - 处理选中文本并生成二维码
  - 独立的事件处理和消息提示

### 3. UI 组件

- **QRCodeDialog.vue**: 二维码对话框组件
  - 独立的 Vue 组件
  - 支持配置二维码大小、纠错级别等
  - 提供复制和下载功能

## 如何添加新功能

### 步骤 1: 创建功能模块文件

在 `floatingToolbar/` 目录下创建新的功能模块文件，例如 `translate-action.ts`:

```typescript
import { Plugin } from 'siyuan'
import { ToolbarAction } from './actions'

/**
 * 创建翻译功能
 */
export function createTranslateAction(plugin: Plugin): ToolbarAction {
  return {
    id: 'translate',
    name: (plugin.i18n as any).floatingToolbar?.translate || '翻译',
    icon: '<svg><use xlink:href="#iconLanguage"></use></svg>',
    handler: async (selectedText: string) => {
      // 实现翻译逻辑
      console.log('翻译文本:', selectedText)
    }
  }
}
```

### 步骤 2: 在 index.ts 中注册功能

```typescript
import { createQRCodeAction } from './qrcode-action'
import { createTranslateAction } from './translate-action'

export function registerFloatingToolbar(plugin: Plugin): void {
    const floatingToolbar = new FloatingToolbar(plugin)
    floatingToolbar.init()

    // 注册二维码功能
    if (plugin.settings?.enableQRCode) {
        floatingToolbar.registerAction(createQRCodeAction(plugin))
    }

    // 注册翻译功能
    if (plugin.settings?.enableTranslate) {
        floatingToolbar.registerAction(createTranslateAction(plugin))
    }

    (plugin as any).__floatingToolbar = floatingToolbar
}
```

### 步骤 3: 添加国际化

在 `i18n/zh_CN.json` 和 `i18n/en_US.json` 中添加对应的翻译：

```json
{
  "floatingToolbar": {
    "translate": "翻译"
  }
}
```

## 功能接口说明

### ToolbarAction 接口

```typescript
interface ToolbarAction {
    id: string              // 功能唯一标识符
    name: string            // 功能显示名称
    icon: string            // 功能图标 SVG 字符串
    hotkey?: string         // 可选的快捷键
    handler: (selectedText: string) => Promise<void> | void  // 功能处理函数
}
```

### handler 函数参数

- `selectedText`: 用户选中的文本内容

## 已集成功能

### 1. 复制功能（内置）
- ID: `copy`
- 功能: 复制选中的文本到剪贴板

### 2. 二维码生成
- ID: `qrcode`
- 功能: 为选中的文本生成二维码
- 配置: 通过 `enableQRCode` 设置启用/禁用
- 模块文件: `qrcode-action.ts`
- UI组件: `QRCodeDialog.vue`

## 设计原则

1. **模块化**: 每个功能都是独立的模块，互不干扰
2. **可扩展**: 通过统一的接口轻松添加新功能
3. **可配置**: 功能可以通过配置开关控制启用/禁用
4. **国际化**: 所有文本都支持多语言
5. **代码复用**: UI组件可以被多个功能共享

## 注意事项

1. 功能模块文件应该保持简洁，专注于单一功能
2. 复杂的UI组件应该独立为 Vue 组件
3. 所有用户可见的文本都应该使用国际化
4. 功能处理函数应该有适当的错误处理
5. 避免在功能模块中直接操作 DOM，应通过事件或组件通信
