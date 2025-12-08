# 变更：为AI内容生成器编辑模式添加总结和子文件插入功能

## 为什么
为了增强AI内容生成器的编辑体验，用户需要能够快速总结文档内容并在引用的文档下创建子文档，这将大大提高文档编辑和组织效率。

## 变更内容
- 在编辑模式的AI智能编辑工具栏中添加总结按钮
- 在应用编辑按钮旁边添加插入子文件按钮
- 允许用户在引用的文档下直接创建新的子文档
- 保持与现有UI设计的一致性

## 影响
- 受影响的规范：aiContentGenerator（新增规范）
- 受影响的代码：
  - `src/features/aiContentGenerator/AIContentGeneratorPanel.vue` - 主要组件文件
  - `src/features/aiContentGenerator/index.scss` - 样式文件