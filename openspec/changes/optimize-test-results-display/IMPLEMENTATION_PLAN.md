# 优化测试结果展示 - 详细实施计划

## 现状分析

### 已有功能
✅ 成绩数据存储在 `useHistoryStore` 中
✅ 支持多种指标（averageTime, totalClicks, accuracy, score）
✅ 百分位计算已存在在 `calculatePercentile()` 函数
✅ 历史记录页面已有基本框架
✅ 删除功能已实现

### 需要改进的地方
❌ 等级系统（grade）仍被保存和显示
❌ 历史页面未显示百分位信息
❌ 历史页面未显示完成日期
❌ 结算页面（测试完成后）不存在，需要新建
❌ 无法判断是否为个人最优成绩
❌ 无"恭喜"提示

## 实施阶段

### Phase 1: 数据层与类型定义调整

#### 1.1 更新 TestResult 类型
**文件**: `src/types/test.ts`

改动：
- 添加 `percentile` 字段（百分位排名）
- 添加 `isPersonalBest` 布尔字段
- 保留 `grade` 字段但标记为可选（向后兼容）
- 添加 `keyMetrics` 对象存储每种测试的关键指标

```typescript
interface TestResult {
  id: string
  type: TestType
  timestamp: number
  
  // 原有指标
  averageTime?: number
  totalClicks?: number
  fastestTime?: number
  slowestTime?: number
  accuracy?: number
  score?: number
  
  // 新增字段
  percentile?: number           // 百分位排名 0-100
  isPersonalBest?: boolean      // 是否为个人最优
  grade?: GradeLevel            // 弃用，向后兼容
  keyMetrics?: {                // 关键指标缓存
    [key: string]: string | number
  }
}
```

#### 1.2 添加类型转换工具
**文件**: 新建 `src/utils/score-formatter.ts`

功能：
- `getKeyMetrics(result: TestResult)`: 根据测试类型返回关键指标
- `formatPercentile(percentile: number)`: 格式化百分位显示
- `displayPercentileLabel(percentile: number)`: 生成"超过X%的用户"文本

### Phase 2: 工具函数开发

#### 2.1 新增百分位格式化工具
**文件**: `src/utils/score-formatter.ts`

```typescript
// 格式化百分位，>99时显示小数点后两位
function formatPercentile(percentile: number): string {
  if (percentile > 99) {
    return percentile.toFixed(2)
  }
  return Math.round(percentile).toString()
}

// 生成显示文本 "超过 X% 的用户"
function displayPercentileLabel(percentile: number): string {
  return `超过 ${formatPercentile(percentile)}% 的用户`
}

// 获取测试的关键指标对象
function getKeyMetrics(result: TestResult): Record<string, string | number> {
  const metrics: Record<string, string | number> = {}
  
  switch (result.type) {
    case 'color-change':
    case 'audio-react':
      if (result.averageTime !== undefined) {
        metrics['平均反应时间'] = `${Math.round(result.averageTime)}ms`
      }
      break
      
    case 'click-tracker':
      if (result.totalClicks !== undefined) {
        metrics['总点击数'] = result.totalClicks
      }
      break
      
    case 'direction-react':
      if (result.accuracy !== undefined) {
        metrics['准确率'] = `${result.accuracy.toFixed(0)}%`
      }
      if (result.averageTime !== undefined) {
        metrics['平均反应时间'] = `${Math.round(result.averageTime)}ms`
      }
      break
      
    case 'number-flash':
    case 'sequence-memory':
      if (result.score !== undefined) {
        metrics['分数'] = result.score
      }
      break
  }
  
  return metrics
}

// 判断是否为个人最优
function isPersonalBest(
  currentScore: TestResult,
  previousBestScore?: TestResult
): boolean {
  if (!previousBestScore) return true
  
  // 使用现有的 compareResults 逻辑
  return compareScores(currentScore, previousBestScore) > 0
}

// 生成恭喜文案
function generateCongratulations(
  isFirstTest: boolean,
  isNewPB: boolean
): string {
  if (isFirstTest) {
    return '恭喜！这是你第一次测试成绩'
  }
  if (isNewPB) {
    return '恭喜！你刷新了个人最高纪录'
  }
  return ''
}
```

#### 2.2 更新 grading.ts
**文件**: `src/utils/grading.ts`

改动：
- 标记等级系统为弃用但保留
- 添加专用的成绩对比函数（不基于等级）

```typescript
// 原有的成绩对比逻辑，抽取到通用函数
export function compareScores(a: TestResult, b: TestResult): number {
  switch (a.type) {
    case 'color-change':
    case 'audio-react':
      return (b.averageTime ?? Infinity) - (a.averageTime ?? Infinity)
    case 'click-tracker':
      return (a.totalClicks ?? 0) - (b.totalClicks ?? 0)
    case 'direction-react':
      const accDiff = (a.accuracy ?? 0) - (b.accuracy ?? 0)
      if (Math.abs(accDiff) > 0.01) return accDiff
      return (b.averageTime ?? Infinity) - (a.averageTime ?? Infinity)
    case 'number-flash':
    case 'sequence-memory':
      return (a.score ?? 0) - (b.score ?? 0)
    default:
      return 0
  }
}
```

### Phase 3: 状态管理增强

#### 3.1 更新 useHistoryStore
**文件**: `src/stores/useHistoryStore.ts`

新增方法：
- `getPersonalBestResult(type)`: 获取个人最优成绩
- `isNewPersonalBest(result, type)`: 判断新成绩是否为个人最优
- `calculatePercentileForResult(result)`: 计算单条成绩的百分位

```typescript
// 添加新方法到 HistoryState interface
interface HistoryState {
  // ... 原有方法
  
  // 新增方法
  getPersonalBestResult: (type: TestType) => TestResult | undefined
  isNewPersonalBest: (result: TestResult) => boolean
  calculatePercentileForResult: (result: TestResult) => Promise<number>
}

// 实现新方法
getPersonalBestResult: (type) => {
  const results = get().getResultsByType(type)
  return results[0] // 已按成绩排序
},

isNewPersonalBest: (result) => {
  const previousBest = get().getPersonalBestResult(result.type)
  return !previousBest || compareScores(result, previousBest) > 0
},

calculatePercentileForResult: async (result) => {
  return await calculatePercentile(
    result.type,
    getKeyMetricValue(result),
    getKeyMetricName(result)
  )
}
```

### Phase 4: 前端组件开发

#### 4.1 创建 TestScoreBrief 组件
**文件**: 新建 `src/components/common/TestScoreBrief.tsx`

显示简化的成绩卡片：
- 测试图标和名称
- 关键指标（1-2个）
- 百分位排名
- 完成日期
- 点击事件触发详情

#### 4.2 创建 TestScoreDetail 组件
**文件**: 新建 `src/components/common/TestScoreDetail.tsx`

显示详细信息：
- 完整的关键指标
- 所有支持的指标（平均时间、最快、最慢等）
- 百分位排名
- 完成日期和时间
- 删除按钮

#### 4.3 创建 PercentileRank 组件
**文件**: 新建 `src/components/common/PercentileRank.tsx`

显示百分位信息：
- "超过 X% 的用户" 文本
- 可选的百分位条形图

### Phase 5: 历史页面重构

**文件**: `src/pages/history/index.tsx`

改动：
1. 使用新的 `TestScoreBrief` 组件替代现有卡片
2. 添加百分位排名显示
3. 优化完成日期格式
4. 使用新的 `TestScoreDetail` 组件展示详情
5. 改进删除确认对话框（用原生对话框或 Modal）

新UI逻辑：
```
历史记录页面
├─ 每种测试一个卡片（最优成绩）
│  ├─ 测试名称和图标
│  ├─ 关键指标 (e.g., "233ms")
│  ├─ 百分位 (e.g., "超过 94% 的用户")
│  └─ 完成日期 (e.g., "2024-01-15")
│
├─ 点击卡片 ↓
│
└─ 详情模态框
   ├─ 关键指标详情
   ├─ 百分位信息
   ├─ 完成时间戳
   ├─ 成绩分布图表
   └─ 清除按钮
```

### Phase 6: 结算页面创建

**文件**: 新建 `src/pages/tests/result/index.tsx`

显示测试完成后的成绩：
1. 恭喜提示（如适用）
2. 关键指标展示
3. 百分位排名
4. 是否为个人最优的提示
5. 完成日期和时间
6. "返回首页"和"再来一次"按钮

### Phase 7: 测试页面集成

**文件**: `src/pages/tests/*/index.tsx` (各个测试页面)

改动：
- 测试完成后，跳转到 `/result?testType=xxx&resultId=xxx`
- 在结果页面显示成绩和百分位

### Phase 8: 国际化文本

**文件**: `src/i18n/locales/zh-CN.json`

添加新文本：
```json
{
  "result": {
    "title": "成绩完成",
    "congratulations": "恭喜！这是你第一次测试成绩",
    "personalBest": "恭喜！你刷新了个人最高纪录",
    "percentile": "超过 {value}% 的用户",
    "completedAt": "完成于",
    "details": "成绩详情",
    "keyMetrics": "关键指标"
  }
}
```

## 技术细节

### 百分位计算逻辑调整

当前 `calculatePercentile` 的问题：
- 仅支持3种指标类型
- 需要手动判断哪个指标是"更好"

新逻辑：
```typescript
function getIsTimeBased(scoreKey: string): boolean {
  return ['averageTime', 'fastestTime', 'slowestTime'].includes(scoreKey)
}

function calculatePercentile(
  testType: string,
  userScore: number,
  scoreKey: string
): number {
  const isTimeBased = getIsTimeBased(scoreKey)
  const betterCount = allScores.filter(s =>
    isTimeBased ? userScore < s : userScore > s
  ).length
  
  const percentile = (betterCount / totalCount) * 100
  return percentile > 99 
    ? parseFloat(percentile.toFixed(2))
    : Math.round(percentile)
}
```

## 实施顺序

1. ✅ Phase 1: 类型定义和工具函数
2. ✅ Phase 2: 工具函数开发
3. ✅ Phase 3: 状态管理增强
4. ✅ Phase 4: 组件开发
5. ✅ Phase 5: 历史页面重构
6. ✅ Phase 6: 结算页面创建
7. ✅ Phase 7: 测试页面集成
8. ✅ Phase 8: 国际化和测试

## 注意事项

1. **向后兼容**：保留 `grade` 字段但不显示，旧数据可继续工作
2. **百分位缓存**：为性能考虑，可在 `TestResult` 中缓存百分位
3. **异步加载**：百分位计算涉及数据库查询，需要异步处理
4. **无数据情况**：若无对标数据，显示默认百分位或"暂无对标"
