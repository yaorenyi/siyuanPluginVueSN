# 加密功能问题修复

## 修复的问题

### 1. 加密后刷新界面变成未加密状态

**问题原因**：
- 直接操作 DOM 插入文本不会触发思源的保存机制
- 思源需要接收到输入事件才会保存文档更改

**解决方案**：
在 `replaceSelectedText` 方法中添加事件触发：
```typescript
// 触发输入事件，让思源保存更改
if (editableElement) {
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: newText
  })
  editableElement.dispatchEvent(inputEvent)
  
  // 额外触发一个change事件确保保存
  const changeEvent = new Event('change', { bubbles: true })
  editableElement.dispatchEvent(changeEvent)
}
```

### 2. 设置的密码刷新或重启界面失效

**问题原因**：
- `registerEncryption` 函数创建实例后没有调用 `init()` 方法
- 密码没有从存储中加载

**解决方案**：
1. 修改注册函数为异步，并调用 `init()`：
```typescript
export async function registerEncryption(plugin: Plugin) {
  encryptionInstance = new Encryption(plugin)
  await encryptionInstance.init()  // 加载密码
  console.log('加密功能已注册')
}
```

2. 在主入口文件中使用 `await` 调用：
```typescript
if (this.settings.enableEncryption) {
  console.log('注册内容加密功能')
  await registerEncryption(this)
}
```

3. 在密码设置组件中添加 `onActivated` 钩子：
```typescript
onActivated(() => {
  // 组件激活时重新检查密码状态
  checkPasswordStatus()
})
```

### 3. 复制按钮背景有问题

**问题原因**：
- 使用了 `var(--b3-theme-primary-light)` 变量，但该变量可能不存在或颜色不合适
- 在某些主题下背景色显示异常

**解决方案**：
改用透明背景 + 边框样式：
```typescript
style="padding: 10px 20px; border: 1px solid var(--b3-theme-primary); background: transparent; color: var(--b3-theme-primary); ..."
```

这样可以：
- 适配所有主题
- 视觉上更清晰
- 与主按钮形成对比

## 测试验证

### 测试步骤

1. **密码持久化测试**：
   - [ ] 设置密码
   - [ ] 刷新页面
   - [ ] 打开加密设置，检查密码状态是否显示"已设置"
   - [ ] 重启思源
   - [ ] 再次检查密码状态

2. **加密文本持久化测试**：
   - [ ] 设置密码
   - [ ] 选中文本并加密
   - [ ] 刷新页面
   - [ ] 检查文本是否仍然是加密状态（`[encrypted]...[/encrypted]`）
   - [ ] 重启思源
   - [ ] 再次检查加密文本

3. **解密功能测试**：
   - [ ] 选中加密文本
   - [ ] 右键解密
   - [ ] 输入密码
   - [ ] 查看解密内容
   - [ ] 点击复制按钮，检查是否成功复制
   - [ ] 点击替换按钮，检查是否成功替换
   - [ ] 刷新页面，检查替换后的文本是否保存

4. **UI样式测试**：
   - [ ] 在浅色主题下测试复制按钮样式
   - [ ] 在深色主题下测试复制按钮样式
   - [ ] 检查按钮边框和文字颜色是否清晰可见

## 技术细节

### 事件触发机制

思源笔记使用 `contenteditable` 属性实现富文本编辑，需要通过以下事件来触发保存：

1. **InputEvent**：告诉编辑器有内容变化
   - `inputType: 'insertText'`：表示插入文本操作
   - `bubbles: true`：事件冒泡
   - `data: newText`：插入的文本内容

2. **Change Event**：额外的保险措施
   - 确保编辑器捕获到变化
   - 触发自动保存机制

### 密码加载流程

```
插件启动
  ↓
registerEncryption(plugin)
  ↓
new Encryption(plugin)
  ↓
await init()
  ↓
await loadPassword()
  ↓
从 encryption_password.json 加载密码
  ↓
设置 this.password
```

### 组件生命周期

```
组件挂载 (onMounted)
  ↓
checkPasswordStatus()
  ↓
获取加密实例
  ↓
检查密码状态

组件激活 (onActivated)
  ↓
重新 checkPasswordStatus()
  ↓
更新显示状态
```

## 已知限制

1. **编辑器兼容性**：
   - 依赖思源的 `contenteditable` 编辑器
   - 在某些特殊块类型中可能需要额外处理

2. **事件触发**：
   - 使用 DOM 事件模拟用户输入
   - 在未来思源版本中可能需要调整

3. **密码安全**：
   - 密码存储在插件数据目录
   - 建议用户使用强密码
   - 不建议在多人共享的环境中使用

## 后续优化建议

1. **使用思源官方 API**：
   - 如果思源提供了更新块内容的 API，应该使用官方 API
   - 减少对 DOM 操作的依赖

2. **密码加密存储**：
   - 考虑对存储的密码进行额外加密
   - 使用设备指纹或其他机制增强安全性

3. **批量操作**：
   - 支持批量加密/解密
   - 提供文档级别的加密选项

4. **密码管理**：
   - 支持多个密码（不同内容使用不同密码）
   - 密码提示功能
   - 密码找回机制（安全问题）
