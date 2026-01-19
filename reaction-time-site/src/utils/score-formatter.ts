import type { TestResult, TestType } from '@/types/test'

/**
 * 格式化百分位
 * - 当百分位 > 99 时，显示小数点后两位
 * - 否则显示整数
 */
export function formatPercentile(percentile: number): string {
  if (percentile > 99) {
    return percentile.toFixed(2)
  }
  return Math.round(percentile).toString()
}

/**
 * 生成百分位排名文本
 * 例如：95% → "超过 95% 的用户"
 */
export function displayPercentileLabel(percentile: number | undefined): string {
  if (percentile === undefined) {
    return '暂无数据'
  }
  return `超过 ${formatPercentile(percentile)}% 的用户`
}

/**
 * 获取测试的关键指标对象
 * 根据测试类型返回该测试的关键展示指标
 */
export function getKeyMetrics(result: TestResult): Record<string, string | number> {
  const metrics: Record<string, string | number> = {}

  switch (result.type) {
    case 'color-change':
    case 'audio-react':
      // 这两个测试关注反应时间
      if (result.averageTime !== undefined) {
        metrics['平均反应时间'] = `${Math.round(result.averageTime)}ms`
      }
      break

    case 'click-tracker':
      // 点击追踪关注总点击数
      if (result.totalClicks !== undefined) {
        metrics['总点击数'] = result.totalClicks
      }
      break

    case 'direction-react':
      // 方向反应关注准确率和时间
      if (result.accuracy !== undefined) {
        metrics['准确率'] = `${result.accuracy.toFixed(0)}%`
      }
      if (result.averageTime !== undefined) {
        metrics['平均反应时间'] = `${Math.round(result.averageTime)}ms`
      }
      break

    case 'number-flash':
    case 'sequence-memory':
      // 这两个测试关注分数
      if (result.score !== undefined) {
        metrics['分数'] = result.score
      }
      break
  }

  return metrics
}

/**
 * 获取单条成绩的关键指标值
 * 用于百分位对标
 */
export function getKeyMetricValue(result: TestResult): number {
  switch (result.type) {
    case 'color-change':
    case 'audio-react':
      return result.averageTime ?? 0

    case 'click-tracker':
      return result.totalClicks ?? 0

    case 'direction-react':
      // 优先用准确率，其次用反应时间
      return result.accuracy ?? result.averageTime ?? 0

    case 'number-flash':
    case 'sequence-memory':
      return result.score ?? 0

    default:
      return 0
  }
}

/**
 * 获取单条成绩的关键指标名称
 * 用于百分位计算时确定指标类型
 */
export function getKeyMetricName(
  result: TestResult
): 'averageTime' | 'totalClicks' | 'accuracy' | 'score' {
  switch (result.type) {
    case 'color-change':
    case 'audio-react':
      return 'averageTime'

    case 'click-tracker':
      return 'totalClicks'

    case 'direction-react':
      // 若有准确率则用准确率，否则用反应时间
      return result.accuracy !== undefined ? 'accuracy' : 'averageTime'

    case 'number-flash':
    case 'sequence-memory':
      return 'score'

    default:
      return 'averageTime'
  }
}

/**
 * 判断指标是否基于时间（越小越好）
 */
export function isTimeBasedMetric(
  metricName: 'averageTime' | 'totalClicks' | 'accuracy' | 'score'
): boolean {
  return metricName === 'averageTime' || metricName === 'fastestTime' || metricName === 'slowestTime'
}

/**
 * 生成恭喜文案
 */
export function generateCongratulations(isFirstTest: boolean, isNewPB: boolean): string {
  if (isFirstTest) {
    return '恭喜！这是你第一次测试成绩'
  }
  if (isNewPB) {
    return '恭喜！你刷新了个人最高纪录'
  }
  return ''
}

/**
 * 格式化完成时间
 */
export function formatCompletedTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 格式化完成日期（仅日期，不含时间）
 */
export function formatCompletedDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
