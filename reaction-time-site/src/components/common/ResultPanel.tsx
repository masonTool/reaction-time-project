import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGradeInfo, formatTime } from '@/utils/grading'
import { cn } from '@/lib/utils'
import type { GradeLevel } from '@/types/test'

interface ResultPanelProps {
  title: string
  grade: GradeLevel
  stats: {
    label: string
    value: string | number
    highlight?: boolean
  }[]
  onRetry: () => void
  onHome: () => void
}

export function ResultPanel({
  title,
  grade,
  stats,
  onRetry,
  onHome,
}: ResultPanelProps) {
  const gradeInfo = getGradeInfo(grade)

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <div
          className={cn(
            'mt-4 inline-block px-6 py-2 rounded-full text-white font-bold text-lg',
            gradeInfo.color
          )}
        >
          {gradeInfo.name}
        </div>
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
        <div className="flex gap-3">
          <Button onClick={onRetry} className="flex-1">
            再试一次
          </Button>
          <Button onClick={onHome} variant="secondary" className="flex-1">
            返回首页
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
