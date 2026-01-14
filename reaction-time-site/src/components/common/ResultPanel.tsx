import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreDistribution } from './ScoreDistribution'
import { formatTime } from '@/utils/grading'
import { cn } from '@/lib/utils'
import type { TestType } from '@/types/test'

interface ResultPanelProps {
  title: string
  success?: boolean
  stats: {
    label: string
    value: string | number
    highlight?: boolean
  }[]
  onRetry: () => void
  onHome: () => void
  testType?: TestType
  scoreForDistribution?: {
    value: number
    key: 'averageTime' | 'totalClicks' | 'accuracy'
  }
}

export function ResultPanel({
  title,
  success = true,
  stats,
  onRetry,
  onHome,
  testType,
  scoreForDistribution,
}: ResultPanelProps) {
  const { t } = useTranslation()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        {!success && (
          <div className="mt-4 inline-block px-6 py-2 rounded-full bg-red-500 text-white font-bold text-lg">
            测试失败
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'flex justify-between items-center py-2 px-3 rounded-lg',
                stat.highlight && 'bg-blue-50 dark:bg-blue-950'
              )}
            >
              <span className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  stat.highlight && 'text-blue-600 dark:text-blue-400 text-lg'
                )}
              >
                {typeof stat.value === 'number'
                  ? formatTime(stat.value)
                  : stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* 成绩分布图 */}
        {success && testType && scoreForDistribution && (
          <ScoreDistribution
            testType={testType}
            userScore={scoreForDistribution.value}
            scoreKey={scoreForDistribution.key}
          />
        )}

        <div className="flex gap-3 mt-6">
          <Button onClick={onRetry} className="flex-1">
            {t('button.retry')}
          </Button>
          <Button onClick={onHome} variant="secondary" className="flex-1">
            {t('button.backHome')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
