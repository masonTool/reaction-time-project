import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestResult } from '@/types/test'
import { uploadTestResult, deleteTestRecord, clearAllTestRecords, calculatePercentile } from '@/lib/dataSync'
import { compareScores } from '@/utils/grading'
import { getKeyMetricName } from '@/utils/score-formatter'

interface HistoryState {
  results: TestResult[]
  addResult: (result: TestResult, userId?: string) => Promise<void>
  deleteResult: (resultId: string) => Promise<void>
  clearHistory: (userId?: string) => Promise<void>
  getResultsByType: (type: TestResult['type']) => TestResult[]
  getBestResult: (type: TestResult['type']) => TestResult | undefined
  setResults: (results: TestResult[]) => void
  isNewPersonalBest: (result: TestResult) => boolean
  calculatePercentileForResult: (result: TestResult) => Promise<number>
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],

      addResult: async (result, userId) => {
        // 判断是否为个人最优
        const isPersonalBest = get().isNewPersonalBest(result)
        
        // 计算百分位
        const percentile = await get().calculatePercentileForResult(result)
        
        // 增强结果对象
        const enhancedResult: TestResult = {
          ...result,
          isPersonalBest,
          percentile,
        }

        // 保存所有记录
        set((state) => ({
          results: [enhancedResult, ...state.results],
        }))

        // 上传到 Supabase
        await uploadTestResult(enhancedResult, userId)
      },

      deleteResult: async (resultId) => {
        // 从本地删除
        set((state) => ({
          results: state.results.filter((r) => r.id !== resultId),
        }))

        // 从 Supabase 删除
        await deleteTestRecord(resultId)
      },

      clearHistory: async (userId) => {
        set({ results: [] })

        // 从 Supabase 清除
        if (userId) {
          await clearAllTestRecords(userId)
        }
      },

      getResultsByType: (type) => {
        const results = get().results.filter((r) => r.type === type)
        // 按成绩排序(从高到低)
        return results.sort((a, b) => {
          return compareScores(b, a) // b 和 a 反过来，实现降序
        })
      },

      getBestResult: (type) => {
        const results = get().getResultsByType(type)
        return results[0] // 已排序，第一个就是最好的
      },

      setResults: (results) => set({ results }),

      isNewPersonalBest: (result) => {
        const previousBest = get().getBestResult(result.type)
        // 如果没有之前的成绩，则为个人最优
        if (!previousBest) return true
        // 否则比较成绩
        return compareScores(result, previousBest) > 0
      },

      calculatePercentileForResult: async (result) => {
        try {
          const metricName = getKeyMetricName(result)
          const percentile = await calculatePercentile(result.type, result, metricName)
          return percentile
        } catch (error) {
          console.error('Failed to calculate percentile:', error)
          return 50 // 默认 50%
        }
      },
    }),
    {
      name: 'reaction-test-history',
    }
  )
)
