import { displayPercentileLabel, formatPercentile } from '@/utils/score-formatter'
import { cn } from '@/lib/utils'

interface PercentileRankProps {
  percentile: number | undefined
  showBar?: boolean
  className?: string
}

/**
 * 百分位排名显示组件
 * 显示用户超过多少百分比的其他用户
 */
export function PercentileRank({
  percentile,
  showBar = false,
  className,
}: PercentileRankProps) {
  if (percentile === undefined) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        暂无排名数据
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 排名文本 */}
      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
        {displayPercentileLabel(percentile)}
      </div>

      {/* 可选的百分位条 */}
      {showBar && (
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{ width: `${percentile}%` }}
          />
        </div>
      )}

      {/* 百分位数字 */}
      <div className="text-xs text-gray-500 mt-1">
        {formatPercentile(percentile)}%
      </div>
    </div>
  )
}
