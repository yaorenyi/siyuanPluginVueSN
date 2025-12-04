# AI内容生成器 - 移动端自动收起功能

## 功能概述

在移动端使用AI内容生成器时，当用户触发内容生成操作后，系统会自动收起顶部的设置面板和提示词选择器，让用户可以立即看到生成的内容，无需手动滚动页面。

## 设计理念

### 问题分析
在移动端，屏幕空间有限。如果设置面板和提示词选择器保持展开状态，用户需要：
1. 等待内容生成
2. 手动向下滚动
3. 才能看到生成的结果

这增加了操作步骤，降低了用户体验。

### 解决方案
**自动收起机制**：当用户触发任何生成操作时，自动收起所有展开的面板，让生成结果直接呈现在用户视野中。

## 触发场景

### 1. 普通模式生成
**触发时机：** 点击"生成"按钮

**收起内容：**
- ✅ 对话设置面板
- ✅ 提示词选择器

**代码位置：**
```typescript
// handleGenerate() 函数
if (isMobile.value) {
  showSettings.value = false;
  showPromptSelector.value = false;
}
```

### 2. AI编辑工具
**触发时机：** 点击任何AI编辑按钮
- 润色
- 扩写
- 精简
- 纠错
- 翻译
- 改写

**收起内容：**
- ✅ 对话设置面板

**代码位置：**
```typescript
// aiEditAction() 函数
if (isMobile.value) {
  showSettings.value = false;
}
```

### 3. 智能分析
**触发时机：** 点击"智能分析"按钮

**收起内容：**
- ✅ 对话设置面板

**代码位置：**
```typescript
// analyzeDocument() 函数
if (isMobile.value) {
  showSettings.value = false;
}
```

### 4. 应用AI建议
**触发时机：** 点击"应用建议优化"按钮

**收起内容：**
- ✅ 对话设置面板

**代码位置：**
```typescript
// applySuggestions() 函数
if (isMobile.value) {
  showSettings.value = false;
}
```

## 技术实现

### 移动端检测
```typescript
const isMobile = ref(false);

const checkIsMobile = () => {
  // 检测思源笔记的移动端环境
  const isSiyuanMobile = document.body.classList.contains('body--mobile');
  // 检测屏幕宽度
  const isSmallScreen = window.innerWidth <= 768;
  isMobile.value = isSiyuanMobile || isSmallScreen;
};
```

### 自动收起逻辑
```typescript
// 在生成操作前执行
if (isMobile.value) {
  showSettings.value = false;        // 收起设置面板
  showPromptSelector.value = false;  // 收起提示词选择器（仅普通模式）
}
```

### 生命周期管理
```typescript
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});
```

## 用户体验流程

### 优化前
```
1. 用户打开AI生成器
2. 展开设置面板（可能）
3. 选择提示词（可能）
4. 输入问题
5. 点击生成
6. 等待生成...
7. 👎 手动向下滚动
8. 看到生成结果
```

### 优化后
```
1. 用户打开AI生成器
2. 展开设置面板（可能）
3. 选择提示词（可能）
4. 输入问题
5. 点击生成
6. ✅ 面板自动收起
7. 等待生成...
8. ✅ 直接看到生成结果
```

**节省操作：** 1步（手动滚动）
**体验提升：** 即时反馈，减少等待焦虑

## 桌面端行为

**不受影响**：桌面端屏幕空间充足，不需要自动收起功能。

```typescript
if (isMobile.value) {  // 仅在移动端执行
  showSettings.value = false;
  showPromptSelector.value = false;
}
```

## 边界情况处理

### 1. 用户想重新打开设置
**解决方案：** 点击顶部的"设置"按钮即可重新展开

### 2. 生成失败
**行为：** 面板已收起，用户可以看到错误提示
**操作：** 点击"重试"或重新打开设置调整参数

### 3. 快速连续生成
**行为：** 每次生成都会触发自动收起
**效果：** 确保用户始终能看到最新的生成结果

### 4. 横竖屏切换
**行为：** 响应式检测，自动适配
**效果：** 横屏时可能不触发（取决于宽度）

## 性能影响

- ✅ **无性能损失**：仅修改两个布尔值
- ✅ **无额外请求**：纯前端逻辑
- ✅ **即时响应**：无延迟

## 兼容性

| 平台 | 支持情况 | 说明 |
|------|---------|------|
| iOS Safari | ✅ 完全支持 | 检测 body--mobile 或屏幕宽度 |
| Android Chrome | ✅ 完全支持 | 检测 body--mobile 或屏幕宽度 |
| 思源移动端 | ✅ 完全支持 | 优先检测 body--mobile class |
| iPad | ✅ 部分支持 | 取决于屏幕宽度（≤768px） |
| 桌面端 | ✅ 不影响 | 功能不触发 |

## 测试清单

### 功能测试
- [ ] 点击生成按钮，设置面板自动收起
- [ ] 点击生成按钮，提示词选择器自动收起
- [ ] 点击AI编辑工具，设置面板自动收起
- [ ] 点击智能分析，设置面板自动收起
- [ ] 点击应用建议，设置面板自动收起
- [ ] 生成后可以重新打开设置面板
- [ ] 桌面端不触发自动收起

### 设备测试
- [ ] iPhone 12/13/14（竖屏）
- [ ] iPhone 12/13/14（横屏）
- [ ] Android 手机（竖屏）
- [ ] Android 手机（横屏）
- [ ] iPad（竖屏）
- [ ] iPad（横屏）
- [ ] 小屏幕笔记本（≤768px）

### 场景测试
- [ ] 设置面板展开时生成
- [ ] 提示词选择器展开时生成
- [ ] 两者都展开时生成
- [ ] 两者都收起时生成
- [ ] 快速连续生成多次
- [ ] 生成失败后重试

## 用户反馈

### 预期反馈
- ✅ "生成后直接看到结果，很方便"
- ✅ "不用手动滚动了，体验更流畅"
- ✅ "移动端用起来更舒服了"

### 潜在问题
- ❓ "我想看着设置面板生成"
  - **解决：** 桌面端不受影响，移动端可以生成后重新打开
- ❓ "面板突然消失，有点突兀"
  - **解决：** 可以考虑添加过渡动画（后续优化）

## 后续优化方向

1. **过渡动画**
   - 添加平滑的收起动画
   - 提升视觉体验

2. **用户偏好**
   - 添加"自动收起"开关
   - 让用户自主选择

3. **智能判断**
   - 根据内容长度决定是否收起
   - 短内容可能不需要收起

4. **手势支持**
   - 下滑手势展开设置
   - 上滑手势收起设置

## 相关文件

- `src/features/aiContentGenerator/AIContentGeneratorPanel.vue` - 主要实现
- `docs/AI_CONTENT_GENERATOR_MOBILE_OPTIMIZATION.md` - 移动端优化总览
- `docs/MOBILE_OPTIMIZATION_SUMMARY.md` - 快速参考

## 更新记录

- **2024-12-04**：初始实现
  - 添加移动端检测
  - 实现自动收起功能
  - 覆盖所有生成场景

## 总结

移动端自动收起功能通过简单的逻辑判断，显著提升了移动端用户的使用体验。用户无需手动滚动即可看到生成结果，减少了操作步骤，提高了效率。同时，该功能不影响桌面端用户，保持了良好的兼容性。
