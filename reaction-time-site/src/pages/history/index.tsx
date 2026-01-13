import { useHistoryStore } from '@/stores/useHistoryStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TEST_INFO } from '@/types/test'
import { getGradeInfo, formatTime } from '@/utils/grading'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export function HistoryPage() {
  const { results, clearHistory } = useHistoryStore()

  const handleClear = () => {
    if (window.confirm('确定要清除所有历史记录吗？')) {
      clearHistory()
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">测试历史</h1>
        {results.length > 0 && (
          <Button variant="ghost" onClick={handleClear} className="text-red-500">
            <Trash2 size={18} className="mr-1" />
            清除记录
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">暂无测试记录</p>
            <p className="text-sm text-gray-400 mt-2">
              完成测试后，结果会显示在这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const testInfo = TEST_INFO[result.type]
            const gradeInfo = getGradeInfo(result.grade)

            return (
              <Card key={result.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0',
                        testInfo.color
                      )}
                    >
                      {testInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{testInfo.name}</h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full text-white',
                            gradeInfo.color
                          )}
                        >
                          {gradeInfo.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.averageTime !== undefined && (
                          <span>平均: {formatTime(result.averageTime)}</span>
                        )}
                        {result.score !== undefined && (
                          <span>得分: {result.score}</span>
                        )}
                        {result.accuracy !== undefined && (
                          <span className="ml-3">
                            正确率: {result.accuracy.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 shrink-0">
                      {new Date(result.timestamp).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
