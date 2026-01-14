import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { randomInt, generateId } from '@/utils/random'
import { cn } from '@/lib/utils'

type GameState = 'idle' | 'countdown' | 'waiting' | 'ready' | 'failed' | 'finished'

const TOTAL_ROUNDS = 5

export function ColorChangeTest() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const addResult = useHistoryStore((s) => s.addResult)
  const user = useAuthStore((s) => s.user)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const colorChangedRef = useRef<number>(0)
  const timeoutRef = useRef<number | null>(null)

  const startWaiting = useCallback(() => {
    setGameState('waiting')
    const delay = randomInt(1000, 5000)
    
    timeoutRef.current = window.setTimeout(() => {
      setGameState('ready')
      colorChangedRef.current = performance.now()
    }, delay)
  }, [])

  const startRound = useCallback(() => {
    setGameState('countdown')
  }, [])

  const startCountdown = useCallback(() => {
    setRound(1)
    setReactionTimes([])
    setLastReaction(null)
    setGameState('idle')
  }, [])

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
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
    if (gameState === 'finished' && reactionTimes.length === TOTAL_ROUNDS) {
      const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      addResult({
        id: generateId(),
        type: 'color-change',
        timestamp: Date.now(),
        averageTime: avg,
        fastestTime: Math.min(...reactionTimes),
        grade: 'intermediate',
      }, user?.id)
    }
  }, [gameState, reactionTimes, addResult, user])

  const averageTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0

  if (gameState === 'failed') {
    return (
      <ResultPanel
        title={t('test.colorChange.name')}
        success={false}
        stats={[
          { label: '失败原因', value: '点击过早', highlight: true },
          { label: '完成轮数', value: `${reactionTimes.length} / ${TOTAL_ROUNDS}` },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title={t('result.title')}
        testType="color-change"
        scoreForDistribution={{
          value: averageTime,
          key: 'averageTime',
        }}
        stats={[
          { label: t('result.avgReactionTime'), value: averageTime, highlight: true },
          { label: t('result.fastestTime'), value: Math.min(...reactionTimes) },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('test.colorChange.name')}</h1>
        <p className="text-gray-500">
          {t('test.colorChange.howToPlay')}
        </p>
      </div>

      {round === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">
            等待颜色从红色变为绿色后点击，共 {TOTAL_ROUNDS} 轮
          </p>
          <Button size="lg" onClick={startCountdown}>
            {t('button.start')}
          </Button>
        </div>
      ) : gameState === 'countdown' ? (
        <Countdown onComplete={startWaiting} />
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
