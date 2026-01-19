# 测试页面集成指南

## 概述

现有的每个测试页面（如 `src/pages/tests/color-change/index.tsx`）已使用了 `ResultPanel` 组件来显示成绩。现在需要集成新的优化功能，主要是传递额外的 props 来显示百分位和恭喜提示。

## 快速集成步骤

### 1. 导入新工具函数

在测试页面顶部添加导入：

```typescript
import { 
  generateCongratulations,
  getKeyMetricName,
} from '@/utils/score-formatter'
```

### 2. 保存成绩时获取增强数据

当测试完成，保存成绩时的代码示例：

```typescript
// 创建成绩对象
const result: TestResult = {
  id: generateId(),
  type: 'color-change',
  timestamp: Date.now(),
  averageTime: avgTime,
  // ... 其他指标
}

// 保存成绩（会自动计算百分位和判断是否为个人最优）
await addResult(result, user?.id)

// 注意：addResult 是异步的，会等待百分位计算完成
```

### 3. 更新 ResultPanel 调用

在显示成绩时，添加新的 props：

**之前：**
```typescript
<ResultPanel
  title="成绩完成"
  success={true}
  stats={[
    { label: '平均反应时间', value: avgTime, highlight: true },
    // ... 其他统计
  ]}
  onRetry={handleRetry}
  onHome={handleHome}
  testType="color-change"
  scoreForDistribution={{
    value: avgTime,
    key: 'averageTime',
  }}
/>
```

**之后：**
```typescript
// 假设你已保存成绩并获取到了结果
const savedResult = await addResult(result, user?.id)

// 判断是否为首次测试（可选）
const isFirstTest = reactionTimes.length === 0 // 示例逻辑
const isNewPB = result.isPersonalBest

// 生成恭喜文案
const congratulations = isNewPB 
  ? generateCongratulations(isFirstTest, isNewPB)
  : undefined

<ResultPanel
  title="成绩完成"
  success={true}
  stats={[
    { label: '平均反应时间', value: avgTime, highlight: true },
    // ... 其他统计
  ]}
  onRetry={handleRetry}
  onHome={handleHome}
  testType="color-change"
  scoreForDistribution={{
    value: avgTime,
    key: getKeyMetricName(result),  // 使用工具函数确定指标类型
  }}
  // 新增 props
  percentile={result.percentile}
  isPersonalBest={result.isPersonalBest}
  congratulationsText={congratulations}
  showCompletedTime={true}
/>
```

### 4. 处理异步百分位计算

由于百分位计算涉及数据库查询，是异步的，建议添加加载态：

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleFinish = async () => {
  setIsSubmitting(true)
  try {
    const result: TestResult = {
      id: generateId(),
      type: 'color-change',
      timestamp: Date.now(),
      averageTime: avgTime,
      // ...
    }
    
    // 保存成绩（等待百分位计算）
    await addResult(result, user?.id)
    
    // 显示结果
    setGameState('finished')
  } finally {
    setIsSubmitting(false)
  }
}
```

## 各测试类型的关键指标配置

### color-change / audio-react
```typescript
{
  value: averageTime,
  key: 'averageTime',
}
```

### click-tracker
```typescript
{
  value: totalClicks,
  key: 'totalClicks',
}
```

### direction-react
```typescript
{
  value: accuracy > 0 ? accuracy : averageTime,
  key: accuracy > 0 ? 'accuracy' : 'averageTime',
}
```
或使用工具函数：
```typescript
{
  value: getKeyMetricValue(result),
  key: getKeyMetricName(result),
}
```

### number-flash / sequence-memory
```typescript
{
  value: score,
  key: 'score',
}
```

## 完整示例：color-change 测试页面

```typescript
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { randomInt, generateId } from '@/utils/random'
import type { TestResult } from '@/types/test'
import { generateCongratulations, getKeyMetricName } from '@/utils/score-formatter'

const TOTAL_ROUNDS = 5

export function ColorChangeTest() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const addResult = useHistoryStore((s) => s.addResult)
  const user = useAuthStore((s) => s.user)

  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'waiting' | 'ready' | 'failed' | 'finished'>('idle')
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ... 其他状态和函数

  const handleGameFinish = async () => {
    const avgTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const minTime = Math.min(...reactionTimes)
    const maxTime = Math.max(...reactionTimes)

    // 创建成绩对象
    const result: TestResult = {
      id: generateId(),
      type: 'color-change',
      timestamp: Date.now(),
      averageTime: avgTime,
      fastestTime: minTime,
      slowestTime: maxTime,
    }

    setIsSubmitting(true)
    try {
      // 保存成绩
      await addResult(result, user?.id)
      
      // 状态转换为显示结果
      setGameState('finished')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (gameState === 'finished') {
    const avgTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const minTime = Math.min(...reactionTimes)
    const maxTime = Math.max(...reactionTimes)
    
    // 获取保存的成绩（需要从 store 中重新获取）
    const savedResult = useHistoryStore((s) => s.getBestResult('color-change'))
    
    const isFirstTest = !savedResult
    const isNewPB = savedResult?.isPersonalBest ?? false

    return (
      <ResultPanel
        title="颜色变化 - 测试完成"
        success={true}
        stats={[
          { label: '平均反应时间', value: avgTime, highlight: true },
          { label: '最快反应时间', value: minTime },
          { label: '最慢反应时间', value: maxTime },
          { label: '总尝试次数', value: reactionTimes.length },
        ]}
        onRetry={() => {
          setGameState('idle')
          setReactionTimes([])
        }}
        onHome={() => navigate('/')}
        testType="color-change"
        scoreForDistribution={{
          value: avgTime,
          key: getKeyMetricName(savedResult || { type: 'color-change' } as TestResult),
        }}
        // 新增优化部分
        percentile={savedResult?.percentile}
        isPersonalBest={savedResult?.isPersonalBest}
        congratulationsText={
          isNewPB 
            ? generateCongratulations(isFirstTest, isNewPB)
            : undefined
        }
        showCompletedTime={true}
      />
    )
  }

  // ... 其他 UI
}
```

## 常见问题

### Q1：为什么 addResult 是异步的？
**答**：因为百分位计算需要查询 Supabase 数据库，获取所有用户的成绩数据来计算排名，所以必须是异步操作。

### Q2：如何处理添加成绩失败的情况？
**答**：添加 try-catch 块并设置加载态：
```typescript
try {
  await addResult(result, user?.id)
  setGameState('finished')
} catch (error) {
  console.error('Failed to save result:', error)
  alert('保存成绩失败，请重试')
} finally {
  setIsSubmitting(false)
}
```

### Q3：如何获取保存的成绩数据？
**答**：保存后，从 store 中重新查询：
```typescript
const savedResult = useHistoryStore((s) => s.getBestResult('color-change'))
console.log(savedResult.percentile)  // 百分位
console.log(savedResult.isPersonalBest)  // 是否为个人最优
```

### Q4：oldResult 中的 grade 字段还会保留吗？
**答**：会保留以支持向后兼容，但页面上不再显示。如果需要完全移除，需要进行数据迁移。

### Q5：如何测试百分位显示？
**答**：需要有足够的用户数据才能计算有意义的百分位。在测试环境中，可以：
1. 手动添加多个测试记录
2. 使用 Mock 数据
3. 查看 calculatePercentile 函数的默认返回值（无数据时为 50%）
