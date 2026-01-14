import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { getScoreDistribution, calculatePercentile } from '@/lib/dataSync'
import type { TestType } from '@/types/test'

interface ScoreDistributionProps {
  testType: TestType
  userScore: number
  scoreKey: 'averageTime' | 'totalClicks' | 'accuracy'
}

export function ScoreDistribution({ testType, userScore, scoreKey }: ScoreDistributionProps) {
  const { t } = useTranslation()
  const [percentile, setPercentile] = useState<number | null>(null)
  const [distribution, setDistribution] = useState<{ range: string; rangeStart: number; rangeEnd: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 获取百分位
        const p = await calculatePercentile(testType, userScore, scoreKey)
        setPercentile(p)

        // 获取分布数据
        const scores = await getScoreDistribution(testType, scoreKey)
        
        if (scores.length > 0) {
          // 创建直方图数据
          const min = Math.min(...scores)
          const max = Math.max(...scores)
          const binCount = 10
          const binSize = (max - min) / binCount

          const bins = Array.from({ length: binCount }, (_, i) => {
            const rangeStart = min + i * binSize
            const rangeEnd = rangeStart + binSize
            const count = scores.filter(s => s >= rangeStart && s < rangeEnd).length
            
            return {
              range: scoreKey === 'averageTime' 
                ? `${Math.round(rangeStart)}-${Math.round(rangeEnd)}ms`
                : `${Math.round(rangeStart)}-${Math.round(rangeEnd)}`,
              rangeStart,
              rangeEnd,
              count,
            }
          }) as Array<{ range: string; rangeStart: number; rangeEnd: number; count: number }>

          setDistribution(bins)
        }
      } catch (error) {
        console.error('Failed to fetch distribution:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [testType, userScore, scoreKey])

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载分布数据...
      </div>
    )
  }

  if (!percentile || distribution.length === 0) {
    return null
  }

  // 格式化百分位显示
  const percentileText = percentile < 1 
    ? percentile.toFixed(2) 
    : Math.round(percentile)

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {t('result.betterThan', { percent: percentileText })}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          你的成绩: {scoreKey === 'averageTime' ? `${Math.round(userScore)}ms` : Math.round(userScore)}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: '人数', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-900 p-2 border rounded shadow-lg">
                      <p className="text-sm">{payload[0].payload.range}</p>
                      <p className="text-sm font-bold">{payload[0].value} 人</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" />
            <ReferenceLine 
              x={distribution.find(d => userScore >= d.rangeStart && userScore < d.rangeEnd)?.range}
              stroke="red" 
              strokeWidth={2}
              label={{ value: '你的位置', position: 'top', fill: 'red' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-gray-400 text-center mt-2">
        基于 {distribution.reduce((sum, d) => sum + d.count, 0)} 条测试数据
      </div>
    </div>
  )
}
