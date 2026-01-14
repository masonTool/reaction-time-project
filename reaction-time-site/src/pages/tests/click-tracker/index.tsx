import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { randomPosition, generateId } from '@/utils/random'
import { cn } from '@/lib/utils'

type GameState = 'idle' | 'countdown' | 'playing' | 'finished'

const GAME_DURATION = 30
const TARGET_SIZE = 50

export function ClickTrackerTest() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const addResult = useHistoryStore((s) => s.addResult)
  const user = useAuthStore((s) => s.user)
  const containerRef = useRef<HTMLDivElement>(null)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const targetAppearedRef = useRef<number>(0)

  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos = randomPosition(rect.width, rect.height, TARGET_SIZE)
    setTargetPosition(pos)
    targetAppearedRef.current = performance.now()
  }, [])

  const startCountdown = useCallback(() => {
    setGameState('countdown')
    setTimeLeft(GAME_DURATION)
    setReactionTimes([])
    setLastReaction(null)
    setTargetPosition(null)
  }, [])

  const startGame = useCallback(() => {
    setGameState('playing')
    requestAnimationFrame(() => {
      spawnTarget()
    })
  }, [spawnTarget])

  const handleTargetClick = useCallback(() => {
    if (gameState !== 'playing') return
    const reactionTime = performance.now() - targetAppearedRef.current
    setReactionTimes((prev) => [...prev, reactionTime])
    setLastReaction(reactionTime)
    spawnTarget()
  }, [gameState, spawnTarget])

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState === 'finished' && reactionTimes.length > 0) {
      const avg =
        reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      addResult({
        id: generateId(),
        type: 'click-tracker',
        timestamp: Date.now(),
        averageTime: avg,
        totalClicks: reactionTimes.length,
        fastestTime: Math.min(...reactionTimes),
        accuracy: reactionTimes.length > 0 ? 100 : 0,
        grade: 'intermediate',
      }, user?.id)
    }
  }, [gameState, reactionTimes, addResult])

  const averageTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title={t('result.title')}
        testType="click-tracker"
        scoreForDistribution={{
          value: reactionTimes.length,
          key: 'totalClicks',
        }}
        stats={[
          { label: t('result.totalClicks'), value: `${reactionTimes.length}`, highlight: true },
          { label: t('result.avgReactionTime'), value: averageTime },
          { label: t('result.fastestTime'), value: reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0 },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {gameState === 'countdown' && <Countdown onComplete={startGame} />}

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">点击追踪测试</h1>
        <p className="text-gray-500">
          点击随机出现的目标，测试你的反应速度
        </p>
      </div>

      {gameState === 'idle' ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">
            在 {GAME_DURATION} 秒内尽可能多地点击目标
          </p>
          <Button size="lg" onClick={startCountdown}>
            开始测试
          </Button>
        </div>
      ) : gameState === 'playing' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              点击数: {reactionTimes.length}
            </div>
            <div className="text-lg text-gray-600">
              {lastReaction !== null ? `${Math.round(lastReaction)}ms` : '-'}
            </div>
            <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gray-100 dark:bg-gray-800 rounded-xl h-[400px] overflow-hidden cursor-crosshair"
          >
            {targetPosition && (
              <button
                onClick={handleTargetClick}
                className={cn(
                  'absolute rounded-full bg-blue-500 hover:bg-blue-600',
                  'transition-transform hover:scale-110',
                  'focus:outline-none focus:ring-4 focus:ring-blue-300'
                )}
                style={{
                  width: TARGET_SIZE,
                  height: TARGET_SIZE,
                  left: targetPosition.x,
                  top: targetPosition.y,
                }}
                aria-label="目标"
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
