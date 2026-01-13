import type { GradeLevel } from '@/types/test'

export interface GradeInfo {
  level: GradeLevel
  name: string
  color: string
  textColor: string
}

export const GRADE_THRESHOLDS = {
  elite: 150,
  pro: 200,
  advanced: 300,
  intermediate: 400,
} as const

export const GRADE_INFO: Record<GradeLevel, GradeInfo> = {
  SSS: {
    level: 'SSS',
    name: 'SSS',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    textColor: 'text-yellow-500',
  },
  SS: {
    level: 'SS',
    name: 'SS',
    color: 'bg-gradient-to-r from-purple-400 to-pink-500',
    textColor: 'text-purple-500',
  },
  S: {
    level: 'S',
    name: 'S',
    color: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    textColor: 'text-blue-500',
  },
  A: {
    level: 'A',
    name: 'A',
    color: 'bg-gradient-to-r from-green-400 to-emerald-500',
    textColor: 'text-green-500',
  },
  B: {
    level: 'B',
    name: 'B',
    color: 'bg-gradient-to-r from-cyan-400 to-teal-500',
    textColor: 'text-cyan-500',
  },
  C: {
    level: 'C',
    name: 'C',
    color: 'bg-gradient-to-r from-orange-400 to-amber-500',
    textColor: 'text-orange-500',
  },
  D: {
    level: 'D',
    name: 'D',
    color: 'bg-gradient-to-r from-gray-400 to-gray-500',
    textColor: 'text-gray-500',
  },
  elite: {
    level: 'elite',
    name: '精英',
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-500',
  },
  pro: {
    level: 'pro',
    name: '专业',
    color: 'bg-gradient-to-r from-purple-400 to-purple-600',
    textColor: 'text-purple-500',
  },
  advanced: {
    level: 'advanced',
    name: '高级',
    color: 'bg-gradient-to-r from-blue-400 to-blue-600',
    textColor: 'text-blue-500',
  },
  intermediate: {
    level: 'intermediate',
    name: '中级',
    color: 'bg-gradient-to-r from-green-400 to-green-600',
    textColor: 'text-green-500',
  },
  beginner: {
    level: 'beginner',
    name: '初级',
    color: 'bg-gradient-to-r from-gray-400 to-gray-600',
    textColor: 'text-gray-500',
  },
}

export function getGradeFromTime(averageTimeMs: number): GradeLevel {
  if (averageTimeMs < GRADE_THRESHOLDS.elite) return 'elite'
  if (averageTimeMs < GRADE_THRESHOLDS.pro) return 'pro'
  if (averageTimeMs < GRADE_THRESHOLDS.advanced) return 'advanced'
  if (averageTimeMs < GRADE_THRESHOLDS.intermediate) return 'intermediate'
  return 'beginner'
}

export function getGradeInfo(grade: GradeLevel): GradeInfo {
  return GRADE_INFO[grade]
}

export function formatTime(ms: number): string {
  return `${Math.round(ms)}ms`
}
