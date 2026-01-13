import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { getGradeFromTime } from '@/utils/grading'
import { randomInt, generateId } from '@/utils/random'
import { Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type GameState = 'idle' | 'prepare' | 'waiting' | 'played' | 'tooEarly' | 'finished'

const TOTAL_ROUNDS = 5

function playBeep() {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'
  gainNode.gain.value = 0.3

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.15)
}

export function AudioReactTest() {
  const navigate = useNavigate()
  const addResult = useHistoryStore((s) => s.addResult)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [prepareCountdown, setPrepareCountdown] = useState(3)
  const soundPlayedRef = useRef<number>(0)
  const timeoutRef = useRef<number | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const playSound = useCallback(() => {
    playBeep()
    // 声音播放时不改变游戏状态，保持 'waiting' 状态
    // 只记录时间戳
    soundPlayedRef.current = performance.now()
  }, [])

  const startWaiting = useCallback(() => {
    setGameState('waiting')
    const delay = randomInt(1000, 4000)
    timeoutRef.current = window.setTimeout(playSound, delay)
  }, [playSound])

  const startRound = useCallback(() => {
    setGameState('prepare')
    setPrepareCountdown(3)
    
    let countdown = 3
    countdownIntervalRef.current = setInterval(() => {
      countdown -= 1
      setPrepareCountdown(countdown)
      
      if (countdown <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        startWaiting()
      }
    }, 1000)
  }, [startWaiting])

  const startGame = useCallback(() => {
    setRound(1)
    setReactionTimes([])
    startRound()
  }, [startRound])

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      // 检查声音是否已经播放
      const timeSinceSoundPlayed = performance.now() - soundPlayedRef.current
      
      // 如果声音还没播放（soundPlayedRef.current === 0 或很小的值）
      if (soundPlayedRef.current === 0 || timeSinceSoundPlayed < 100) {
        // 太早了，声音还没播放
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setGameState('tooEarly')
      } else {
        // 声音已经播放，这是正确的反应
        const reactionTime = timeSinceSoundPlayed
        const newTimes = [...reactionTimes, reactionTime]
        setReactionTimes(newTimes)

        if (round >= TOTAL_ROUNDS) {
          setGameState('finished')
        } else {
          setRound((r) => r + 1)
          soundPlayedRef.current = 0  // 重置
          startRound()
        }
      }
    }
  }, [gameState, reactionTimes, round, startRound])

  const handleTooEarlyRetry = useCallback(() => {
    soundPlayedRef.current = 0
    startRound()
  }, [startRound])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
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
        type: 'audio-react',
        timestamp: Date.now(),
        averageTime: avg,
        totalClicks: reactionTimes.length,
        fastestTime: Math.min(...reactionTimes),
        slowestTime: Math.max(...reactionTimes),
        grade,
      })
    }
  }, [gameState, reactionTimes, addResult])

  const averageTime =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title="声音反应测试完成"
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
        onRetry={startGame}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">声音反应测试</h1>
        <p className="text-gray-500">听到声音后尽快点击屏幕</p>
      </div>

      {gameState === 'idle' ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">
            听到蜂鸣声后快速点击，共 {TOTAL_ROUNDS} 轮
          </p>
          <Button size="lg" onClick={startGame}>
            开始测试
          </Button>
        </div>
      ) : gameState === 'prepare' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-9xl font-bold text-orange-600 animate-pulse">
            {prepareCountdown}
          </div>
        </div>
      ) : gameState === 'tooEarly' ? (
        <div
          className="h-[400px] rounded-xl flex flex-col items-center justify-center bg-yellow-500 cursor-pointer"
          onClick={handleTooEarlyRetry}
        >
          <p className="text-white text-3xl font-bold mb-4">太早了！</p>
          <p className="text-white text-lg">点击重试本轮</p>
        </div>
      ) : gameState === 'waiting' ? (
        <>
          <div className="text-center mb-4">
            <span className="text-lg font-semibold">
              第 {round} / {TOTAL_ROUNDS} 轮
            </span>
          </div>

          <div
            onClick={handleClick}
            className="h-[400px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-orange-100 dark:bg-orange-900/30"
          >
            <Volume2 size={80} className="text-orange-400" />
            <p className="text-xl font-bold mt-4 text-orange-400">
              等待声音...
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
