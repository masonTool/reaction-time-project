import { useState } from 'react'
import type { TestResult, TestType } from '@/types/test'
import { TEST_INFO } from '@/types/test'
import { cn } from '@/lib/utils'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PercentileRank } from './PercentileRank'
import {
  getKeyMetrics,
  formatCompletedTime,
} from '@/utils/score-formatter'

interface TestScoreDetailProps {
  result: TestResult
  testType: TestType
  onDelete?: (resultId: string) => Promise<void>
  onClose?: () => void
  showScoreDistribution?: React.ReactNode
}

/**
 * 成绩详细信息组件
 * 显示完整的成绩数据和百分位信息
 */
export function TestScoreDetail({
  result,
  testType,
  onDelete,
  onClose,
  showScoreDistribution,
}: TestScoreDetailProps) {
  const test = TEST_INFO[testType]
  const metrics = getKeyMetrics(result)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(result.id)
      setShowDeleteConfirm(false)
      onClose?.()
    } catch (error) {
      console.error('Failed to delete result:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-xl',
              test.color
            )}
          >
            {test.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{test.name}</h2>
            {result.isPersonalBest && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                🏆 个人最优成绩
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* 关键指标 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          成绩详情
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">{key}</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 百分位排名 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          排名信息
        </h3>
        <PercentileRank percentile={result.percentile} showBar={true} />
      </div>

      {/* 完成时间 */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">完成时间</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCompletedTime(result.timestamp)}
        </span>
      </div>

      {/* 分布图表 */}
      {showScoreDistribution && (
        <div className="border-t pt-4">
          {showScoreDistribution}
        </div>
      )}

      {/* 删除按钮 */}
      {onDelete && (
        <div className="pt-4 border-t">
          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={18} className="mr-2" />
              清除这条记录
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                确定要删除这条成绩记录吗？此操作无法撤销。
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="ghost"
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
