import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { getGradeFromTime } from '@/utils/grading'
import { randomInt, generateId } from '@/utils/random'
import { cn } from '@/lib/utils'

type GameState = 'idle' | 'prepare' | 'waiting' | 'ready' | 'failed' | 'finished'

const TOTAL_ROUNDS = 5

export function ColorChangeTest() {
  const navigate = useNavigate()
  const addResult = useHistoryStore((s) => s.addResult)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const [prepareCountdown, setPrepareCountdown] = useState(3)
  const colorChangedRef = useRef<number>(0)
  const timeoutRef = useRef<number | null>(null)

  const startRound = useCallback(() => {
    // 先显示 3-2-1 倒计时
    setGameState('prepare')
    setPrepareCountdown(3)
    
    let countdown = 3
    const countdownInterval = setInterval(() => {
      countdown -= 1
      setPrepareCountdown(countdown)
      
      if (countdown <= 0) {
        clearInterval(countdownInterval)
        
        // 倒计时结束后进入等待状态
        setGameState('waiting')
        const delay = randomInt(1000, 5000)
        
        timeoutRef.current = window.setTimeout(() => {
          setGameState('ready')
          colorChangedRef.current = performance.now()
        }, delay)
      }
    }, 1000)
  }, [])

  const startCountdown = useCallback(() => {
    setRound(1)
    setReactionTimes([])
    setLastReaction(null)
    setGameState('idle')
  }, [])

  const startGame = useCallback(() => {
    // 不需要了，直接从 idle 进入第一轮
  }, [])

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      // 点早了，直接失败
      setGameState('failed')
    } else if (gameState === 'ready') {
      const reactionTime = performance.now() - colorChangedRef.current
      const newTimes = [...reactionTimes, reactionTime]
      setReactionTimes(newTimes)
      setLastReaction(reactionTime)

      if (round >= TOTAL_ROUNDS) {
        setGameState('finished')
      } else {
        setRound((r) => r + 1)
        setGameState('idle')
      }
    }
  }, [gameState, reactionTimes, round])

  const handleTooEarlyRetry = useCallback(() => {
    // 已改为直接失败，不需要重试
  }, [])

  useEffect(() => {
    if (round > 0 && gameState === 'idle') {
      startRound()
    }
  }, [round, gameState, startRound])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState === 'finished' && reactionTimes.length > 0) {
      const avg =
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      const grade = getGradeFromTime(avg)
      addResult({
        id: generateId(),
        type: 'color-change',
        timestamp: Date.now(),
        averageTime: avg,
        totalClicks: reactionTimes.length,
        fastestTime: Math.min(...reactionTimes),
        slowestTime: Math.max(...reactionTimes),
        grade,
      })
    } else if (gameState === 'failed') {
      // 失败也记录结果，但评分为最低
      addResult({
        id: generateId(),
        type: 'color-change',
        timestamp: Date.now(),
        averageTime: 9999,
        totalClicks: reactionTimes.length,
        fastestTime: reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0,
        slowestTime: reactionTimes.length > 0 ? Math.max(...reactionTimes) : 0,
        grade: 'beginner',
      })
    }
  }, [gameState, reactionTimes, addResult])

  const averageTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0

  if (gameState === 'failed') {
    return (
      <ResultPanel
        title="测试失败"
        grade="beginner"
        stats={[
          { label: '失败原因', value: '点击过早', highlight: true },
          { label: '完成轮数', value: `${reactionTimes.length} / ${TOTAL_ROUNDS}` },
          {
            label: '已完成反应时间',
            value: reactionTimes.length > 0 ? averageTime : 0,
          },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title="颜色变化测试完成"
        grade={getGradeFromTime(averageTime)}
        stats={[
          { label: '平均反应时间', value: averageTime, highlight: true },
          { label: '测试次数', value: `${reactionTimes.length} 次` },
          {
            label: '最快反应',
            value: reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0,
          },
          {
            label: '最慢反应',
            value: reactionTimes.length > 0 ? Math.max(...reactionTimes) : 0,
          },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">颜色变化反应测试</h1>
        <p className="text-gray-500">
          当红色变为绿色时，尽快点击屏幕
        </p>
      </div>

      {round === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">
            等待颜色从红色变为绿色后点击，共 {TOTAL_ROUNDS} 轮
          </p>
          <Button size="lg" onClick={startCountdown}>
            开始测试
          </Button>
        </div>
      ) : gameState === 'prepare' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-9xl font-bold text-red-600 animate-pulse">
            {prepareCountdown}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              第 {round} / {TOTAL_ROUNDS} 轮
            </span>
            <div className="text-lg text-gray-600">
              {lastReaction !== null ? `${Math.round(lastReaction)}ms` : '-'}
            </div>
          </div>

          <div
            onClick={handleClick}
            className={cn(
              'h-[400px] rounded-xl flex items-center justify-center transition-colors cursor-pointer',
              gameState === 'waiting' && 'bg-red-500',
              gameState === 'ready' && 'bg-green-500'
            )}
          >
            {gameState === 'waiting' && (
              <p className="text-white text-2xl font-bold">等待颜色变化...</p>
            )}
            
            {gameState === 'ready' && (
              <p className="text-white text-2xl font-bold">点击！</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
