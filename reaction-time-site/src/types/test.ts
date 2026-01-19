export type TestType =
  | 'click-tracker'
  | 'color-change'
  | 'sequence-memory'
  | 'number-flash'
  | 'direction-react'
  | 'audio-react'

export type GradeLevel = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'elite' | 'pro' | 'advanced' | 'intermediate' | 'beginner'

export interface TestResult {
  id: string
  type: TestType
  timestamp: number
  averageTime?: number
  totalClicks?: number
  fastestTime?: number
  slowestTime?: number
  accuracy?: number
  score?: number
  grade?: GradeLevel  // 弃用，仅向后兼容
  percentile?: number  // 百分位排名 0-100
  isPersonalBest?: boolean  // 是否为个人最优
  keyMetrics?: Record<string, string | number>  // 关键指标缓存
}

export interface TestInfo {
  id: TestType
  name: string
  description: string
  i18nKey: string
  icon: string
  color: string
}

export const TEST_INFO: Record<TestType, TestInfo> = {
  'click-tracker': {
    id: 'click-tracker',
    name: '点击追踪',
    description: '30秒内点击随机出现的目标，测试反应速度',
    i18nKey: 'clickTracker',
    icon: '🎯',
    color: 'bg-blue-500',
  },
  'color-change': {
    id: 'color-change',
    name: '颜色变化',
    description: '检测颜色变化后快速点击，测试视觉反应',
    i18nKey: 'colorChange',
    icon: '🔴',
    color: 'bg-red-500',
  },

  'sequence-memory': {
    id: 'sequence-memory',
    name: '序列记忆',
    description: '记住并重复点击序列，测试短期记忆',
    i18nKey: 'sequenceMemory',
    icon: '🧠',
    color: 'bg-purple-500',
  },
  'number-flash': {
    id: 'number-flash',
    name: '数字闪现',
    description: '记住闪现的数字并输入，测试视觉处理',
    i18nKey: 'numberFlash',
    icon: '🔢',
    color: 'bg-yellow-500',
  },
  'direction-react': {
    id: 'direction-react',
    name: '方向反应',
    description: '根据箭头方向快速按键，测试决策反应',
    i18nKey: 'directionReact',
    icon: '⬆️',
    color: 'bg-cyan-500',
  },
  'audio-react': {
    id: 'audio-react',
    name: '声音反应',
    description: '听到声音后快速点击，测试听觉反应',
    i18nKey: 'audioReact',
    icon: '🔊',
    color: 'bg-orange-500',
  },
}
