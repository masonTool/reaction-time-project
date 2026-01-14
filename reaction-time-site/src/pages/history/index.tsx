import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreDistribution } from '@/components/common/ScoreDistribution'
import { TEST_INFO, type TestType } from '@/types/test'
import { formatTime } from '@/utils/grading'
import { cn } from '@/lib/utils'
import { Trash2, X } from 'lucide-react'

export function HistoryPage() {
  const { t } = useTranslation()
  const { getBestResult, getResultsByType, clearHistory, deleteResult } = useHistoryStore()
  const user = useAuthStore((s) => s.user)
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null)

  const tests = Object.values(TEST_INFO)
  const bestResults = tests.map((test) => ({
    test,
    result: getBestResult(test.id),
  }))

  const handleClearAll = async () => {
    if (window.confirm(t('history.clearConfirm'))) {
      await clearHistory(user?.id)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm(t('history.deleteConfirm'))) {
      await deleteResult(id)
    }
  }

  const selectedTestResults = selectedTest ? getResultsByType(selectedTest) : []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('history.title')}</h1>
        {bestResults.some((r) => r.result) && (
          <Button variant="ghost" onClick={handleClearAll} className="text-red-500">
            <Trash2 size={18} className="mr-1" />
            {t('button.clearAll')}
          </Button>
        )}
      </div>

      {!bestResults.some((r) => r.result) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">{t('history.noRecords')}</p>
            <p className="text-sm text-gray-400 mt-2">
              完成测试后,结果会显示在这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestResults.map(({ test, result }) => {
            if (!result) return null

            return (
              <Card
                key={test.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTest(test.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0',
                        test.color
                      )}
                    >
                      {test.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{t(`test.${test.i18nKey}.name`)}</h3>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {result.averageTime !== undefined && (
                          <div>
                            {t('result.avgReactionTime')}: {formatTime(result.averageTime)}
                          </div>
                        )}
                        {result.totalClicks !== undefined && (
                          <div>
                            {t('result.totalClicks')}: {result.totalClicks}
                          </div>
                        )}
                        {result.accuracy !== undefined && (
                          <div>
                            {t('result.accuracy')}: {result.accuracy.toFixed(0)}%
                          </div>
                        )}
                        {result.score !== undefined && (
                          <div>
                            得分: {result.score}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 详细记录浮层 */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto relative">
            <button
              onClick={() => setSelectedTest(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>

            <CardContent className="py-6">
              <h2 className="text-xl font-bold mb-4">
                {t(`test.${TEST_INFO[selectedTest].i18nKey}.name`)} - {t('history.allRecords')}
              </h2>

              <div className="space-y-3 mb-6">
                {selectedTestResults.map((result, index) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">#{index + 1}</span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            {t('history.bestScore')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        {result.averageTime !== undefined && (
                          <div>
                            {t('result.avgReactionTime')}: {formatTime(result.averageTime)}
                          </div>
                        )}
                        {result.fastestTime !== undefined && (
                          <div>
                            {t('result.fastestTime')}: {formatTime(result.fastestTime)}
                          </div>
                        )}
                        {result.totalClicks !== undefined && (
                          <div>
                            {t('result.totalClicks')}: {result.totalClicks}
                          </div>
                        )}
                        {result.accuracy !== undefined && (
                          <div>
                            {t('result.accuracy')}: {result.accuracy.toFixed(0)}%
                          </div>
                        )}
                        {result.score !== undefined && (
                          <div>
                            得分: {result.score}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRecord(result.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* 最佳成绩的分布图 */}
              {selectedTestResults.length > 0 && (() => {
                const bestResult = selectedTestResults[0]
                let scoreValue: number | undefined
                let scoreKey: 'averageTime' | 'totalClicks' | 'accuracy' = 'averageTime'

                if (selectedTest === 'click-tracker') {
                  scoreValue = bestResult.totalClicks
                  scoreKey = 'totalClicks'
                } else if (selectedTest === 'direction-react') {
                  scoreValue = bestResult.accuracy
                  scoreKey = 'accuracy'
                } else {
                  scoreValue = bestResult.averageTime
                  scoreKey = 'averageTime'
                }

                return scoreValue !== undefined ? (
                  <ScoreDistribution
                    testType={selectedTest}
                    userScore={scoreValue}
                    scoreKey={scoreKey}
                  />
                ) : null
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
