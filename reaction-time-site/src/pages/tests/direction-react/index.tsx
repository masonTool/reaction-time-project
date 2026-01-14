import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { randomInt, generateId } from '@/utils/random'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

type Direction = 'up' | 'down' | 'left' | 'right'
type GameState = 'idle' | 'countdown' | 'playing' | 'finished'

const GAME_DURATION = 30
const PENALTY_TIME = 1000 // 罚时1000ms (1秒)
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']
const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

const DirectionIcon = ({ direction }: { direction: Direction }) => {
  const icons = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  }
  const Icon = icons[direction]
  return <Icon size={180} strokeWidth={3} />
}

export function DirectionReactTest() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const addResult = useHistoryStore((s) => s.addResult)
  const user = useAuthStore((s) => s.user)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [lastReaction, setLastReaction] = useState<number | null>(null)
  const [showPenalty, setShowPenalty] = useState(false)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const directionShownRef = useRef<number>(0)

  const showDirection = useCallback((prevDir?: Direction | null) => {
    let dir: Direction
    do {
      dir = DIRECTIONS[randomInt(0, 3)]
    } while (prevDir && dir === prevDir)
    
    setCurrentDirection(dir)
    directionShownRef.current = performance.now()
  }, [])

  const startCountdown = useCallback(() => {
    setGameState('countdown')
    setTimeLeft(GAME_DURATION)
    setCorrectCount(0)
    setWrongCount(0)
    setTotalCount(0)
    setLastReaction(null)
    setShowPenalty(false)
    setReactionTimes([])
    setCurrentDirection(null)
  }, [])

  const startGame = useCallback(() => {
    setGameState('playing')
    showDirection()
  }, [showDirection])

  const handleInput = useCallback(
    (inputDir: Direction) => {
      if (gameState !== 'playing' || !currentDirection) return

      const reactionTime = performance.now() - directionShownRef.current
      const isCorrect = inputDir === currentDirection

      setTotalCount((prev) => prev + 1)
      
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1)
        setReactionTimes((prev) => [...prev, reactionTime])
        setLastReaction(reactionTime)
        setShowPenalty(false)
      } else {
        // 错误，罚时1000ms
        setWrongCount((prev) => prev + 1)
        setReactionTimes((prev) => [...prev, reactionTime + PENALTY_TIME])
        setLastReaction(reactionTime)
        setShowPenalty(true)
      }

      // 立刻显示下一个，且保证与当前方向不同
      showDirection(currentDirection)
    },
    [gameState, currentDirection, showDirection]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = DIRECTION_KEYS[e.key]
      if (dir) {
        e.preventDefault()
        handleInput(dir)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInput])

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
    if (gameState === 'finished' && correctCount > 0) {
      const avgTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0
      const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

      addResult({
        id: generateId(),
        type: 'direction-react',
        timestamp: Date.now(),
        averageTime: avgTime,
        accuracy,
        grade: 'intermediate',
      }, user?.id)
    }
  }, [gameState, correctCount, totalCount, reactionTimes, addResult])

  const averageTime = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 0
  const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title={t('result.title')}
        testType="direction-react"
        scoreForDistribution={{
          value: accuracy,
          key: 'accuracy',
        }}
        stats={[
          { label: t('result.correctRate'), value: `${accuracy.toFixed(0)}%`, highlight: true },
          { label: t('result.avgReactionTime'), value: averageTime },
          { label: '正确次数', value: `${correctCount}` },
          { label: '错误次数', value: `${wrongCount}` },
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
        <h1 className="text-2xl font-bold mb-2">方向反应测试</h1>
        <p className="text-gray-500">按下对应的方向键（或 WASD）</p>
      </div>

      {gameState === 'idle' ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">
            在 {GAME_DURATION} 秒内尽可能多地正确响应箭头方向
          </p>
          <Button size="lg" onClick={startCountdown}>
            开始测试
          </Button>
        </div>
      ) : gameState === 'playing' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">
              正确: {correctCount} / {totalCount}
            </div>
            <div className="text-lg text-gray-600">
              {lastReaction !== null ? (
                showPenalty ? (
                  <span className="text-red-600">
                    {Math.round(lastReaction)}ms + 1000ms罚时
                  </span>
                ) : (
                  `${Math.round(lastReaction)}ms`
                )
              ) : (
                '-'
              )}
            </div>
            <div className="text-2xl font-bold text-cyan-600">{timeLeft}s</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-[500px] flex items-center justify-center">
            {currentDirection && (
              <div className="text-cyan-500">
                <DirectionIcon direction={currentDirection} />
              </div>
            )}
          </div>

          {/* Mobile direction buttons */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden">
            <div />
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleInput('up')}
              className="aspect-square"
            >
              <ArrowUp size={24} />
            </Button>
            <div />
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleInput('left')}
              className="aspect-square"
            >
              <ArrowLeft size={24} />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleInput('down')}
              className="aspect-square"
            >
              <ArrowDown size={24} />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleInput('right')}
              className="aspect-square"
            >
              <ArrowRight size={24} />
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-4 hidden sm:block">
            使用方向键或 WASD 键
          </p>
        </>
      ) : null}
    </div>
  )
}
