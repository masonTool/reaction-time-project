import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreDistribution } from '@/components/common/ScoreDistribution'
import { TestScoreBrief } from '@/components/common/TestScoreBrief'
import { TestScoreDetail } from '@/components/common/TestScoreDetail'
import { TEST_INFO, type TestType } from '@/types/test'
import { Trash2 } from 'lucide-react'
import { getKeyMetricName } from '@/utils/score-formatter'

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

  const selectedTestResults = selectedTest ? getResultsByType(selectedTest) : []
  const selectedBestResult = selectedTest ? selectedTestResults[0] : null

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
              完成测试后，结果会显示在这里
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestResults.map(({ test, result }) => {
            if (!result) return null

            return (
              <TestScoreBrief
                key={test.id}
                result={result}
                testType={test.id}
                onClick={() => setSelectedTest(test.id)}
                className="cursor-pointer"
              />
            )
          })}
        </div>
      )}

      {/* 详细记录浮层 */}
      {selectedTest && selectedBestResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardContent className="py-6">
              <TestScoreDetail
                result={selectedBestResult}
                testType={selectedTest}
                onDelete={deleteResult}
                onClose={() => setSelectedTest(null)}
                showScoreDistribution={
                  selectedTestResults.length > 0 ? (
                    <ScoreDistribution
                      testType={selectedTest}
                      userScore={
                        selectedBestResult.averageTime ??
                        selectedBestResult.totalClicks ??
                        selectedBestResult.accuracy ??
                        selectedBestResult.score ??
                        0
                      }
                      scoreKey={getKeyMetricName(selectedBestResult)}
                    />
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
