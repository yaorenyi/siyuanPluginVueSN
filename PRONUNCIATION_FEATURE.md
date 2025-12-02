# 谐音翻译功能说明

## 功能概述

谐音翻译功能使用AI大模型为英文单词生成中文谐音记忆，帮助用户更好地记忆单词发音。

## 主要特性

### 1. 超级面板集成
- ✅ 在超级面板中可以启用/禁用谐音翻译功能
- ✅ 使用统一的AI API配置（支持通义千问、OpenAI、DeepSeek、自定义API）
- ✅ 配置状态通过思源API保存，重启后保持

### 2. 右侧边栏面板
- 📱 在右侧边栏提供独立的谐音翻译面板
- 🎯 输入英文单词，点击生成按钮
- 🤖 AI自动生成包含音标、释义、谐音、发音要点的完整信息
- 📋 一键复制生成结果

### 3. 右键菜单支持
- 🖱️ 选中英文单词后右键
- 📝 菜单中显示"谐音翻译"选项
- ⚡ 点击后自动生成并复制到剪贴板

### 4. 快捷键支持
- ⌨️ 快捷键：Shift+Cmd+H (Mac) / Shift+Ctrl+H (Windows)
- 🚀 选中单词后按快捷键即可生成

## 使用方法

### 方法一：通过超级面板

1. 点击右上角超级面板图标
2. 找到"谐音翻译"功能卡片
3. 确保功能已启用（开关为绿色）
4. 点击功能卡片打开右侧边栏面板
5. 输入英文单词，点击"生成"按钮

### 方法二：通过右键菜单

1. 在文档中选中一个英文单词
2. 右键点击选中的文本
3. 选择"🔊 谐音翻译"菜单项
4. 等待生成完成，结果会自动复制到剪贴板

### 方法三：通过快捷键

1. 在文档中选中一个英文单词
2. 按下 Shift+Cmd+H (Mac) 或 Shift+Ctrl+H (Windows)
3. 等待生成完成，结果会自动复制到剪贴板

## API配置

### 在超级面板中配置

1. 打开超级面板
2. 点击右上角的"设置"图标（齿轮）
3. 展开AI配置面板
4. 选择API供应商：
   - 通义千问（推荐）
   - OpenAI
   - DeepSeek
   - 自定义API
5. 选择模型（如 qwen-plus）
6. 输入API密钥
7. 配置会自动保存

### 支持的API供应商

#### 通义千问
- 默认端点：https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
- 推荐模型：qwen-plus, qwen-turbo, qwen-max
- 获取API密钥：https://dashscope.aliyun.com/

#### OpenAI
- 默认端点：https://api.openai.com/v1/chat/completions
- 推荐模型：gpt-3.5-turbo, gpt-4
- 获取API密钥：https://platform.openai.com/

#### DeepSeek
- 默认端点：https://api.deepseek.com/v1/chat/completions
- 推荐模型：deepseek-chat
- 获取API密钥：https://platform.deepseek.com/

#### 自定义API
- 需要提供完整的API端点URL
- 需要兼容OpenAI的API格式

## 生成结果格式

AI会生成以下格式的内容：

```markdown
#### system

单词：system
音标：[ˈsɪstəm]
释义：系统；体系；制度
谐音：西斯腾(xī sī téng)
发音：['sɪs-təm] 两个音节，重音在第一音节，元音为短i音

注意事项：
- 音标为英式音标
- 谐音贴近实际发音，便于记忆
- 拼音带声调
- 发音说明包含音节、重音、元音特点
```

## 技术实现

### 文件结构

```
src/features/pronunciation/
├── index.ts              # 主功能模块
└── PronunciationPanel.vue # Vue面板组件
```

### 配置管理

- 功能开关：`settings.enablePronunciation`
- API配置：使用统一的 `aiApiProvider`, `aiModel`, `aiApiKey`
- 状态保存：通过思源API的 `plugin.saveData()` 持久化

### API调用

支持四种API供应商：
1. 通义千问 - `callTongyiAPI()`
2. OpenAI - `callOpenAIAPI()`
3. DeepSeek - `callDeepSeekAPI()`
4. 自定义 - `callCustomAPI()`

### 集成点

1. **超级面板** (`src/features/superPanel/`)
   - 添加功能卡片
   - 添加开关控制
   - 同步API配置

2. **主入口** (`src/index.ts`)
   - 根据配置注册功能
   - 保存实例引用

3. **配置系统** (`src/config/settings.ts`)
   - 添加 `enablePronunciation` 配置项
   - 默认启用

4. **图标配置** (`src/config/icons.ts`)
   - 添加 `pronunciation` 图标配置
   - 使用 `mdi:volume-high` 图标

5. **国际化** (`src/i18n/`)
   - 添加中英文翻译
   - 支持多语言界面

## 测试清单

- [ ] 在超级面板中启用/禁用功能
- [ ] 在超级面板中配置API密钥
- [ ] 打开右侧边栏面板
- [ ] 输入单词并生成谐音
- [ ] 复制生成结果
- [ ] 右键菜单生成谐音
- [ ] 快捷键生成谐音
- [ ] 测试不同API供应商
- [ ] 测试配置持久化
- [ ] 重启插件后配置保持

## 注意事项

1. **API密钥安全**
   - API密钥保存在思源数据库中
   - 不要在公开场合分享配置文件

2. **网络要求**
   - 需要能够访问对应的API端点
   - 国内用户推荐使用通义千问

3. **API额度**
   - 注意API调用次数限制
   - 合理使用，避免频繁调用

4. **错误处理**
   - API调用失败会显示错误提示
   - 检查网络连接和API密钥是否正确

## 未来改进

- [ ] 支持批量生成
- [ ] 添加历史记录
- [ ] 支持收藏功能
- [ ] 支持自定义提示词模板
- [ ] 添加发音播放功能
- [ ] 支持美式发音选项
