import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestResult } from '@/types/test'
import { uploadTestResult, deleteTestRecord, clearAllTestRecords } from '@/lib/dataSync'

interface HistoryState {
  results: TestResult[]
  addResult: (result: TestResult, userId?: string) => Promise<void>
  deleteResult: (resultId: string) => Promise<void>
  clearHistory: (userId?: string) => Promise<void>
  getResultsByType: (type: TestResult['type']) => TestResult[]
  getBestResult: (type: TestResult['type']) => TestResult | undefined
  setResults: (results: TestResult[]) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],

      addResult: async (result, userId) => {
        // 保存所有记录(不再只保存最佳记录)
        set((state) => ({
          results: [result, ...state.results],
        }))

        // 上传到Supabase
        await uploadTestResult(result, userId)
      },

      deleteResult: async (resultId) => {
        // 从本地删除
        set((state) => ({
          results: state.results.filter((r) => r.id !== resultId),
        }))

        // 从Supabase删除
        await deleteTestRecord(resultId)
      },

      clearHistory: async (userId) => {
        set({ results: [] })

        // 从Supabase清除
        if (userId) {
          await clearAllTestRecords(userId)
        }
      },

      getResultsByType: (type) => {
        const results = get().results.filter((r) => r.type === type)
        // 按成绩排序(从高到低)
        return results.sort((a, b) => {
          return compareResults(b, a) // b和a反过来,实现降序
        })
      },

      getBestResult: (type) => {
        const results = get().getResultsByType(type)
        return results[0] // 已排序,第一个就是最好的
      },

      setResults: (results) => set({ results }),
    }),
    {
      name: 'reaction-test-history',
    }
  )
)

// 比较两个成绩,返回正数表示a更好,负数表示b更好
function compareResults(a: TestResult, b: TestResult): number {
  switch (a.type) {
    case 'color-change':
    case 'audio-react':
      // 平均时间越短越好
      return (b.averageTime ?? Infinity) - (a.averageTime ?? Infinity)

    case 'click-tracker':
      // 总点击数越多越好
      return (a.totalClicks ?? 0) - (b.totalClicks ?? 0)

    case 'direction-react':
      // 准确率越高越好,准确率相同则平均时间越短越好
      const accDiff = (a.accuracy ?? 0) - (b.accuracy ?? 0)
      if (Math.abs(accDiff) > 0.01) return accDiff
      return (b.averageTime ?? Infinity) - (a.averageTime ?? Infinity)

    case 'number-flash':
    case 'sequence-memory':
      // 分数越高越好
      return (a.score ?? 0) - (b.score ?? 0)

    default:
      return 0
  }
}
