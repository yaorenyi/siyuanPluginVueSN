# 二维码生成功能

## 功能介绍

二维码生成功能允许用户在思源笔记中快速生成选中文本的二维码。通过右键菜单，用户可以方便地为任何文本内容生成对应的二维码，并支持复制到剪贴板或下载为图片文件。

## 功能特点

- **右键菜单集成**：在编辑器中右键选中文本时，会显示"生成二维码"选项
- **实时预览**：点击后立即弹出对话框显示生成的二维码
- **大小调整**：通过滑块调整二维码的大小（100px-500px）
- **纠错级别设置**：支持4种纠错等级（L/M/Q/H），确保不同使用场景的兼容性
- **复制功能**：一键复制二维码到剪贴板
- **下载功能**：下载二维码为PNG格式的图片文件
- **多语言支持**：支持中文和英文界面

## 使用方式

### 基本使用流程

1. **选中文本**：在思源笔记编辑器中选中要转换为二维码的文本内容
2. **打开菜单**：右键点击选中的文本
3. **选择生成**：在右键菜单中点击"生成二维码"选项
4. **对话框弹出**：二维码生成对话框自动弹出并展示二维码
5. **自定义设置**：可选地调整大小和纠错级别
6. **操作二维码**：
   - 点击"复制图片"将二维码复制到剪贴板
   - 点击"下载"将二维码保存为PNG文件
   - 点击"关闭"关闭对话框

### 快捷操作

- **复制到剪贴板**：方便直接粘贴到其他文档或应用
- **下载为图片**：自动生成带时间戳的文件名（qrcode-{timestamp}.png）
- **实时调整**：修改大小或纠错级别时，二维码实时更新

## 技术实现

### 文件结构

```
src/features/qrCode/
├── index.ts                 # 功能模块入口，处理右键菜单事件
├── QRCodeDialog.vue        # 对话框组件，展示二维码及控制选项
└── README.md              # 本文档
```

### 核心模块

#### `index.ts` - 功能模块
- **registerQRCode()**：注册功能并监听右键菜单事件
- **getSelectedText()**：获取用户选中的文本
- **addQRCodeMenuItem()**：向右键菜单添加二维码选项
- **showQRCodeDialog()**：弹出二维码对话框
- **injectQRCodeMenuStyles()**：注入菜单项样式

#### `QRCodeDialog.vue` - Vue组件
- **界面布局**：包含输入框、预览区域、设置选项和操作按钮
- **二维码生成**：使用qrcode库生成二维码canvas
- **事件处理**：处理复制、下载、关闭等交互事件
- **响应式设计**：支持不同屏幕尺寸的适配

## 配置选项

### 插件设置

在 `src/config/settings.ts` 中：
```typescript
interface PluginSettings {
  enableQRCode: boolean  // 是否启用二维码生成功能
}
```

### i18n 多语言支持

#### 中文 (zh_CN.json)
```json
{
  "qrcodeGenerate": "生成二维码",
  "qrcodeContent": "内容",
  "qrcodePlaceholder": "输入或选择内容生成二维码...",
  "qrcodePreview": "二维码预览",
  "qrcodeSize": "大小",
  "qrcodeErrorCorrection": "纠错级别",
  "qrcodeCopy": "复制图片",
  "qrcodeDownload": "下载",
  "qrcodeCopied": "二维码已复制到剪贴板",
  "qrcodeDownloaded": "二维码已下载"
}
```

#### 英文 (en_US.json)
```json
{
  "qrcodeGenerate": "Generate QR Code",
  "qrcodeContent": "Content",
  "qrcodePlaceholder": "Enter or select content to generate QR code...",
  "qrcodePreview": "QR Code Preview",
  "qrcodeSize": "Size",
  "qrcodeErrorCorrection": "Error Correction Level",
  "qrcodeCopy": "Copy Image",
  "qrcodeDownload": "Download",
  "qrcodeCopied": "QR code copied to clipboard",
  "qrcodeDownloaded": "QR code downloaded"
}
```

## 依赖库

- **qrcode** (^1.5.4)：核心二维码生成库

## 兼容性

- **浏览器**：支持现代浏览器，需要Canvas API和Clipboard API支持
- **思源平台**：支持桌面版和Web版
- **操作系统**：Windows、macOS、Linux均支持

## 注意事项

1. **文本长度**：二维码可以编码的内容长度取决于纠错级别和数据类型
   - 数字：最多3547字符
   - 字母数字：最多2331字符
   - 字节：最多1852字符
   - 汉字（UTF-8）：约400-600字符（取决于纠错级别）

2. **纠错级别选择**：
   - L (7%)：最小，适合简短信息
   - M (15%)：平衡，适合大多数场景
   - Q (25%)：较高，适合打印或远距离扫描
   - H (30%)：最高，适合恶劣环境

3. **剪贴板操作**：复制功能需要浏览器支持Clipboard API

## 故障排查

### 问题：右键菜单中找不到二维码选项

**解决方案**：
1. 检查插件配置中是否启用了 `enableQRCode`
2. 确保在编辑器中已选中文本
3. 重启思源笔记应用

### 问题：复制按钮不工作

**解决方案**：
1. 检查浏览器是否支持Clipboard API
2. 确保二维码已成功生成
3. 在https环境或本地localhost环境中使用

### 问题：下载的二维码图片为空

**解决方案**：
1. 确保输入内容不为空
2. 等待二维码完全生成后再下载
3. 尝试在Chrome/Firefox等主流浏览器中使用

## 开发指南

### 扩展功能

如需扩展功能，可以修改以下文件：

1. **添加新的样式**：修改 `QRCodeDialog.vue` 中的 `<style>` 部分
2. **修改菜单项位置**：编辑 `index.ts` 中的 `addQRCodeMenuItem()` 方法
3. **支持更多格式**：可以在下载时添加SVG或PDF格式支持

### 测试

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 观察模式构建
pnpm dev
```

## 相关链接

- [qrcode npm包](https://www.npmjs.com/package/qrcode)
- [思源笔记API文档](https://github.com/siyuan-note/siyuan/blob/master/API.md)
- [Vue 3文档](https://vuejs.org/)

## 许可证

同主项目许可证
