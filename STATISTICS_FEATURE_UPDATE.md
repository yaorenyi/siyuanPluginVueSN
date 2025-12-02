# 数据统计功能更新说明

## 修复的问题

### 1. ✅ 超级面板关闭后数据统计功能生效
**问题**: 在超级面板中关闭数据统计功能后，设置没有正确保存和应用。

**解决方案**: 
- 在 `src/features/superPanel/index.ts` 的 `settingsMap` 中添加了 `'statistics': 'enableStatistics'` 映射
- 现在可以通过超级面板正确切换统计功能的启用状态

### 2. ✅ 侧边栏图标显示
**问题**: 统计功能的侧边栏图标没有正确显示为 Iconify 图标。

**解决方案**:
- 使用 `iconHelper.ts` 中的 `replaceTopBarIcon` 函数
- 在 Dock 初始化后，查找对应的 DOM 元素并替换图标
- 使用 `mdi:chart-bar` 图标，颜色为 `#0ea5e9`

### 3. ✅ 日视图增加时间范围选择
**问题**: 日视图只能显示最近7天，用户希望能选择不同的时间范围。

**解决方案**:
- 添加了 `dayRange` 属性，支持 7、15、30 天三种选项
- 在日视图模式下显示下拉选择框，用户可以切换时间范围
- 根据选择的范围动态更新标题和数据

**新增选项**:
- 最近7天
- 最近15天
- 最近30天

### 4. ✅ 删除月视图的月份选择框
**问题**: 月视图右侧的月份选择框没有实际作用，容易造成困惑。

**解决方案**:
- 移除了月视图中的月份选择框
- 月视图现在只显示年份选择，展示该年的12个月数据
- 简化了界面，提升了用户体验

## 新增国际化文本

### 中文 (zh_CN.json)
```json
{
  "recent7Days": "最近7天",
  "recent15Days": "最近15天",
  "recent30Days": "最近30天",
  "recent15DaysDaily": "最近15天每日字数",
  "recent30DaysDaily": "最近30天每日字数"
}
```

### 英文 (en_US.json)
```json
{
  "recent7Days": "Recent 7 Days",
  "recent15Days": "Recent 15 Days",
  "recent30Days": "Recent 30 Days",
  "recent15DaysDaily": "Recent 15 Days Daily Words",
  "recent30DaysDaily": "Recent 30 Days Daily Words"
}
```

## 修改的文件

1. **src/features/statistics/Statistics.ts**
   - 添加 `dayRange` 属性
   - 修改 `registerDock` 方法，使用 iconHelper 替换图标
   - 更新 `renderDockPanel` 方法，添加日视图范围选择
   - 移除月视图的月份选择框
   - 删除未使用的 `currentMonth` 和 `generateMonthOptions` 方法

2. **src/features/superPanel/index.ts**
   - 在 `settingsMap` 中添加 `statistics` 映射

3. **src/i18n/zh_CN.json** 和 **src/i18n/en_US.json**
   - 添加日视图范围选择相关的翻译

## 使用说明

### 启用/禁用统计功能
1. 打开超级面板
2. 找到"数据统计"功能卡片
3. 点击开关切换启用状态
4. 重启插件或重新加载思源笔记使设置生效

### 使用日视图范围选择
1. 打开统计面板
2. 点击"日"按钮切换到日视图
3. 在下方的下拉框中选择时间范围：
   - 最近7天：查看最近一周的每日字数
   - 最近15天：查看最近半个月的每日字数
   - 最近30天：查看最近一个月的每日字数
4. 数据和图表会自动更新

### 使用年视图
1. 点击"年"按钮切换到年视图
2. 在下拉框中选择年份
3. 查看该年份的数据统计

### 使用月视图
1. 点击"月"按钮切换到月视图
2. 默认显示当前年份的12个月数据
3. 可以通过年份选择框切换到其他年份

## 技术细节

### 图标替换机制
```typescript
// 在 Dock 初始化后查找 DOM 元素
const dockElement = document.querySelector(`[data-type="statistics-dock"]`);
if (dockElement) {
  const iconElement = dockElement.querySelector('.block__icon') as HTMLElement;
  if (iconElement) {
    replaceTopBarIcon(iconElement, statisticsIcon.icon, statisticsIcon.color);
  }
}
```

### 日视图范围选择实现
```typescript
// 添加属性
private dayRange: 7 | 15 | 30 = 7;

// 在渲染时根据范围获取数据
dailyStats = await this.getDailyStats(this.dayRange);

// 绑定事件监听
const dayRangeSelect = this.dockElement.querySelector('#dayRangeSelect');
if (dayRangeSelect) {
  dayRangeSelect.addEventListener('change', (e) => {
    this.dayRange = parseInt((e.target as HTMLSelectElement).value) as 7 | 15 | 30;
    this.renderDockPanel();
  });
}
```

## 测试建议

1. **功能开关测试**
   - 在超级面板中关闭统计功能
   - 重启插件，确认统计面板不显示
   - 再次开启，确认功能恢复

2. **图标显示测试**
   - 打开统计面板
   - 确认侧边栏图标显示为柱状图图标
   - 确认图标颜色为蓝色 (#0ea5e9)

3. **日视图范围测试**
   - 切换到日视图
   - 依次选择7天、15天、30天
   - 确认数据和图表正确更新
   - 确认标题显示正确的时间范围

4. **月视图测试**
   - 切换到月视图
   - 确认只显示年份选择框
   - 切换不同年份，确认数据正确

5. **年视图测试**
   - 切换到年视图
   - 切换不同年份，确认数据正确

## 已知限制

1. 图标替换依赖于 Iconify API，需要网络连接
2. 首次加载时可能有短暂的图标闪烁
3. 大数据量（如30天）时，柱状图可能显得较密集

## 后续优化建议

1. 添加数据缓存机制，减少重复查询
2. 支持自定义时间范围选择
3. 添加数据导出功能
4. 优化大数据量时的图表显示
5. 添加数据加载动画
