# 统计功能 UI 改进说明

## 更新内容

### 1. 统计卡片优化 ✅

**改进前：**
- 今日新增、今日修改、平均字数以列表形式展示
- 视觉效果较弱，不够突出

**改进后：**
- 改为三个并排的渐变卡片
- 每个卡片包含图标、数值、标签
- 悬停时有上浮动画效果

**卡片设计：**
```
┌─────────────┬─────────────┬─────────────┐
│ 📅 今日新增  │ ✏️ 今日修改  │ 📊 平均字数  │
│    5        │    12       │   1,234     │
└─────────────┴─────────────┴─────────────┘
```

**渐变配色：**
- 今日新增：紫色渐变 (#667eea → #764ba2)
- 今日修改：粉色渐变 (#f093fb → #f5576c)
- 平均字数：蓝色渐变 (#4facfe → #00f2fe)

### 2. 时段平均字数显示 ✅

**功能说明：**
在视图模式选择区域下方，显示当前时段的平均每日字数。

**显示规则：**
- **日视图**：显示"日均字数" - 选定天数范围内的平均每日字数
- **周视图**：显示"周均字数" - 最近几周的平均每周字数
- **月视图**：显示"月均字数" - 选定月份范围内的平均每月字数
- **年视图**：显示"年均字数" - 选定年份范围内的平均每年字数

**计算方式：**
```typescript
平均字数 = 时段内总字数 / 时段天数（或周数、月数、年数）
```

**视觉设计：**
```
┌────────────────────────────────┐
│ 日均字数          1,234 字     │
└────────────────────────────────┘
```
- 绿色渐变背景 (#43e97b → #38f9d7)
- 白色文字
- 左右布局：标签在左，数值在右

## 布局结构

```
统计面板
├── 顶部操作栏（刷新按钮 + 更新时间）
├── 主要统计卡片（笔记总数、总字数）
├── 次要统计卡片（内容块、附件、标签、双链）
├── 扩展统计卡片（今日新增、今日修改、平均字数）✨ 新增
├── 视图模式选择
│   ├── 日/周/月/年 切换按钮
│   ├── 范围选择按钮
│   └── 时段平均字数卡片 ✨ 新增
├── 图表区域（柱状图 + 数据列表）
├── 热门标签云
└── 最近活跃文档
```

## 样式细节

### 扩展统计卡片
```scss
.extended-stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  
  .stat-card-small {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
```

### 时段平均卡片
```scss
.period-avg-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-top: 12px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-radius: 6px;
  color: white;
}
```

## 国际化支持

### 中文
- `todayCreated`: "今日新增"
- `todayModified`: "今日修改"
- `avgWordsPerDoc`: "平均字数"
- `dailyAvgWords`: "日均字数"
- `weeklyAvgWords`: "周均字数"
- `monthlyAvgWords`: "月均字数"
- `yearlyAvgWords`: "年均字数"

### 英文
- `todayCreated`: "Today Created"
- `todayModified`: "Today Modified"
- `avgWordsPerDoc`: "Avg Words/Doc"
- `dailyAvgWords`: "Daily Avg"
- `weeklyAvgWords`: "Weekly Avg"
- `monthlyAvgWords`: "Monthly Avg"
- `yearlyAvgWords`: "Yearly Avg"

## 响应式设计

### 小屏幕适配
- 扩展统计卡片保持 3 列布局
- 卡片内容自动换行
- 图标和数值保持可见

### 悬停效果
- 卡片上浮 2px
- 阴影加深
- 过渡时间 0.2s

## 数据计算示例

### 日视图（7天）
```
总字数：8,400 字
天数：7 天
日均字数：1,200 字
```

### 周视图（4周）
```
总字数：33,600 字
周数：4 周
周均字数：8,400 字
```

### 月视图（12个月）
```
总字数：360,000 字
月数：12 月
月均字数：30,000 字
```

### 年视图（5年）
```
总字数：1,800,000 字
年数：5 年
年均字数：360,000 字
```

## 测试要点

### 1. 扩展统计卡片
- [ ] 三个卡片并排显示
- [ ] 渐变背景正确
- [ ] 图标和数值清晰
- [ ] 悬停动画流畅

### 2. 时段平均字数
- [ ] 日视图显示"日均字数"
- [ ] 周视图显示"周均字数"
- [ ] 月视图显示"月均字数"
- [ ] 年视图显示"年均字数"
- [ ] 数值计算准确
- [ ] 格式化正确（千分位）

### 3. 响应式布局
- [ ] 窗口缩小时布局正常
- [ ] 文字不溢出
- [ ] 卡片大小合适

## 技术实现

### 计算逻辑
```typescript
const periodAvgWords = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return 0
  
  const totalWords = chartData.value.reduce((sum, item) => sum + item.words, 0)
  const days = chartData.value.length
  
  return days > 0 ? Math.round(totalWords / days) : 0
})
```

### 标签生成
```typescript
function getPeriodAvgLabel(): string {
  const labels: Record<string, string> = {
    'day': props.i18n.dailyAvgWords || '日均字数',
    'week': props.i18n.weeklyAvgWords || '周均字数',
    'month': props.i18n.monthlyAvgWords || '月均字数',
    'year': props.i18n.yearlyAvgWords || '年均字数',
  }
  return labels[viewMode.value] || props.i18n.avgWords || '平均字数'
}
```

## 视觉效果对比

### 改进前
```
今日新增: 5
今日修改: 12
平均字数: 1,234
```

### 改进后
```
┌─────────────┬─────────────┬─────────────┐
│ 📅          │ ✏️          │ 📊          │
│ 5           │ 12          │ 1,234       │
│ 今日新增     │ 今日修改     │ 平均字数     │
└─────────────┴─────────────┴─────────────┘

┌────────────────────────────────┐
│ 日均字数          1,234 字     │
└────────────────────────────────┘
```

---

**更新日期**：2024-12-02  
**版本**：v2.1  
**状态**：✅ 已完成
