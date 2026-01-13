import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestResult } from '@/types/test'

interface HistoryState {
  results: TestResult[]
  addResult: (result: TestResult) => void
  clearHistory: () => void
  getResultsByType: (type: TestResult['type']) => TestResult[]
  getBestResult: (type: TestResult['type']) => TestResult | undefined
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],
      addResult: (result) =>
        set((state) => {
          // 找到同类型的现有最好成绩
          const existingBest = state.results.find((r) => r.type === result.type)
          
          if (!existingBest) {
            // 没有同类型记录，直接添加
            return { results: [result, ...state.results] }
          }
          
          // 判断新成绩是否更好（根据不同测试类型）
          const isNewBetter = isResultBetter(result, existingBest)
          
          if (isNewBetter) {
            // 替换旧记录
            return {
              results: [
                result,
                ...state.results.filter((r) => r.type !== result.type),
              ],
            }
          }
          
          // 新成绩不如旧成绩，不保存
          return state
        }),
      clearHistory: () => set({ results: [] }),
      getResultsByType: (type) => get().results.filter((r) => r.type === type),
      getBestResult: (type) => get().results.find((r) => r.type === type),
    }),
    {
      name: 'reaction-test-history',
    }
  )
)

// 判断新成绩是否比旧成绩更好
function isResultBetter(newResult: TestResult, oldResult: TestResult): boolean {
  switch (newResult.type) {
    case 'color-change':
    case 'click-tracker':
    case 'direction-react':
    case 'audio-react':
      // 这些测试：平均时间越短越好
      return (
        (newResult.averageTime ?? Infinity) < (oldResult.averageTime ?? Infinity)
      )
    
    case 'number-flash':
      // 数字闪现：通过轮数越多越好
      return (newResult.score ?? 0) > (oldResult.score ?? 0)
    
    case 'sequence-memory':
      // 序列记忆：记住的序列越多越好
      return (newResult.score ?? 0) > (oldResult.score ?? 0)
    
    default:
      return false
  }
}
