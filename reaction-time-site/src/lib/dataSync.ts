import { supabase } from './supabase'
import type { TestResult } from '@/types/test'

/**
 * 上传测试结果到Supabase
 * - 如果用户已登录,保存到test_records
 * - 如果用户未登录,保存到public_records
 */
export async function uploadTestResult(
  result: TestResult,
  userId?: string
): Promise<void> {
  const scoreData = {
    averageTime: result.averageTime,
    totalClicks: result.totalClicks,
    fastestTime: result.fastestTime,
    slowestTime: result.slowestTime,
    accuracy: result.accuracy,
    score: result.score,
  }

  try {
    if (userId) {
      // 已登录用户
      const { error } = await supabase.from('test_records').insert({
        user_id: userId,
        test_type: result.type,
        score: scoreData,
      })
      if (error) throw error
    } else {
      // 未登录用户 - 上传到公共数据池
      const { error } = await supabase.from('public_records').insert({
        test_type: result.type,
        score: scoreData,
      })
      if (error) throw error
    }
  } catch (error) {
    console.error('Failed to upload test result:', error)
    // 失败时不影响用户体验,仅记录错误
  }
}

/**
 * 获取用户的测试记录
 */
export async function getUserTestRecords(
  userId: string,
  testType?: string
): Promise<TestResult[]> {
  try {
    let query = supabase
      .from('test_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (testType) {
      query = query.eq('test_type', testType)
    }

    const { data, error } = await query

    if (error) throw error

    return (
      data?.map((record) => ({
        id: record.id,
        type: record.test_type,
        timestamp: new Date(record.created_at).getTime(),
        ...record.score,
        grade: 'intermediate' as const,
      })) || []
    )
  } catch (error) {
    console.error('Failed to fetch user test records:', error)
    return []
  }
}

/**
 * 删除测试记录
 */
export async function deleteTestRecord(recordId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('test_records')
      .delete()
      .eq('id', recordId)

    if (error) throw error
  } catch (error) {
    console.error('Failed to delete test record:', error)
    throw error
  }
}

/**
 * 清除用户所有测试记录
 */
export async function clearAllTestRecords(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('test_records')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Failed to clear all test records:', error)
    throw error
  }
}

/**
 * 计算百分位排名
 */
export async function calculatePercentile(
  testType: string,
  userScore: number,
  scoreKey: 'averageTime' | 'totalClicks' | 'accuracy' = 'averageTime'
): Promise<number> {
  try {
    // 从公共数据池获取所有该类型的测试成绩
    const { data, error } = await supabase
      .from('public_records')
      .select('score')
      .eq('test_type', testType)

    if (error) throw error
    if (!data || data.length === 0) return 50 // 默认50%

    const scores = data
      .map((record) => record.score[scoreKey])
      .filter((s) => typeof s === 'number') as number[]

    if (scores.length === 0) return 50

    // 对于时间类指标,越小越好
    const isTimeMetric = scoreKey === 'averageTime'
    const betterThan = scores.filter((s) =>
      isTimeMetric ? userScore < s : userScore > s
    ).length

    const percentile = (betterThan / scores.length) * 100

    // 小于1%时保留两位小数
    return percentile < 1
      ? parseFloat(percentile.toFixed(2))
      : Math.round(percentile)
  } catch (error) {
    console.error('Failed to calculate percentile:', error)
    return 50
  }
}

/**
 * 获取成绩分布数据(用于绘制分布图)
 */
export async function getScoreDistribution(
  testType: string,
  scoreKey: 'averageTime' | 'totalClicks' | 'accuracy' = 'averageTime'
): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('public_records')
      .select('score')
      .eq('test_type', testType)

    if (error) throw error
    if (!data) return []

    const scores = data
      .map((record) => record.score[scoreKey])
      .filter((s) => typeof s === 'number') as number[]

    return scores
  } catch (error) {
    console.error('Failed to fetch score distribution:', error)
    return []
  }
}
