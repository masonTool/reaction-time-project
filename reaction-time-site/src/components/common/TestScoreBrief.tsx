import { useTranslation } from 'react-i18next'
import type { TestResult, TestType } from '@/types/test'
import { TEST_INFO } from '@/types/test'
import { cn } from '@/lib/utils'
import {
  getKeyMetrics,
  displayPercentileLabel,
  formatCompletedDate,
} from '@/utils/score-formatter'

interface TestScoreBriefProps {
  result: TestResult
  testType: TestType
  onClick?: () => void
  className?: string
}

/**
 * 简化的成绩卡片
 * 用于历史记录页面，只显示关键指标
 */
export function TestScoreBrief({
  result,
  testType,
  onClick,
  className,
}: TestScoreBriefProps) {
  const test = TEST_INFO[testType]
  const metrics = getKeyMetrics(result)
  const metricEntries = Object.entries(metrics).slice(0, 2) // 仅显示前两个指标

  return (
    <div
      className={cn(
        'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'hover:shadow-md transition-shadow cursor-pointer',
        onClick && 'hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 测试图标 */}
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0',
            test.color
          )}
        >
          {test.icon}
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          {/* 测试名称 */}
          <h3 className="font-semibold text-sm mb-1 truncate">{test.name}</h3>

          {/* 关键指标 */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mb-2">
            {metricEntries.map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="text-gray-500">{key}:</span> <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* 百分位和日期 */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {displayPercentileLabel(result.percentile)}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {formatCompletedDate(result.timestamp)}
            </div>
          </div>

          {/* 个人最优标签 */}
          {result.isPersonalBest && (
            <div className="mt-2 inline-block text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              🏆 个人最优
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
