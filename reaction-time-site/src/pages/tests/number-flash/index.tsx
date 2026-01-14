import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ResultPanel } from '@/components/common/ResultPanel'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { randomInt } from '@/utils/random'

type GameState = 'idle' | 'countdown' | 'showing' | 'input' | 'feedback' | 'finished'

const DIGITS_PER_ROUND = 5
const INITIAL_FLASH_DURATION = 500 // 初始 500ms
const MIN_FLASH_DURATION = 10 // 最短 10ms
const DURATION_DECREASE = 50 // 每轮减少 50ms
const DURATION_DECREASE_SLOW = 10 // 到达 50ms 后每轮减少 10ms
const SLOW_THRESHOLD = 50 // 减速阈值

export function NumberFlashTest() {
  const navigate = useNavigate()
  const addResult = useHistoryStore((s) => s.addResult)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [round, setRound] = useState(0)
  const [currentNumber, setCurrentNumber] = useState('')
  const [userInput, setUserInput] = useState('')
  const [flashDuration, setFlashDuration] = useState(INITIAL_FLASH_DURATION)
  const [feedback, setFeedback] = useState<{
    correct: boolean
    answer: string
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputStartRef = useRef<number>(0)

  const generateNumber = useCallback(() => {
    let num = ''
    for (let i = 0; i < DIGITS_PER_ROUND; i++) {
      num += randomInt(0, 9).toString()
    }
    return num
  }, [])

  const getFlashDuration = useCallback((r: number) => {
    let duration = INITIAL_FLASH_DURATION
    
    for (let i = 1; i < r; i++) {
      if (duration > SLOW_THRESHOLD) {
        // 大于 50ms 时，每次减 50ms
        duration -= DURATION_DECREASE
      } else {
        // 小于等于 50ms 时，每次减 10ms
        duration -= DURATION_DECREASE_SLOW
      }
    }
    
    return Math.max(duration, MIN_FLASH_DURATION)
  }, [])

  const showNumber = useCallback(() => {
    const num = generateNumber()
    const duration = getFlashDuration(round)
    setCurrentNumber(num)
    setFlashDuration(duration)
    setGameState('countdown')
  }, [round, generateNumber, getFlashDuration])

  const startShowing = useCallback(() => {
    setGameState('showing')
    
    // 显示数字
    setTimeout(() => {
      setGameState('input')
      setUserInput('')
      inputStartRef.current = performance.now()
      setTimeout(() => inputRef.current?.focus(), 50)
    }, flashDuration)
  }, [flashDuration])

  const startCountdown = useCallback(() => {
    setRound(1)
    setFeedback(null)
    setGameState('idle')
  }, [])

  useEffect(() => {
    if (round > 0 && gameState === 'idle') {
      showNumber()
    }
  }, [round, gameState, showNumber])

  const handleSubmit = useCallback(() => {
    if (gameState !== 'input') return

    const isCorrect = userInput === currentNumber

    setFeedback({ correct: isCorrect, answer: currentNumber })
    setGameState('feedback')

    if (!isCorrect) {
      // 答错立即结束
      setTimeout(() => {
        setGameState('finished')
      }, 1500)
    } else {
      // 答对继续下一轮
      setTimeout(() => {
        setRound((r) => r + 1)
        setGameState('idle')
        setFeedback(null)
      }, 800)
    }
  }, [gameState, userInput, currentNumber])

  useEffect(() => {
    // 不记录成绩，数字闪现是无尽模式
  }, [gameState, round, addResult])

  const score = round - 1 // 成功通过的轮数

  if (gameState === 'finished') {
    return (
      <ResultPanel
        title="数字闪现测试"
        success={false}
        stats={[
          { label: '失败原因', value: '输入错误', highlight: true },
          { label: '通过轮数', value: `${score} 轮` },
          { label: '最终显示时间', value: `${flashDuration}ms` },
          { label: '每轮数字个数', value: `${DIGITS_PER_ROUND} 位` },
        ]}
        onRetry={startCountdown}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">数字闪现测试</h1>
        <p className="text-gray-500">记住闪现的 {DIGITS_PER_ROUND} 位数字并输入</p>
      </div>

      {round === 0 ? (
        <div className="text-center py-20">
          <Button size="lg" onClick={startCountdown}>
            开始测试
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">第 {round} 轮</span>
            <span className="text-gray-600">显示时间: {flashDuration}ms</span>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-[500px] flex items-center justify-center">
            {gameState === 'countdown' && <Countdown onComplete={startShowing} />}

            {gameState === 'showing' && (
              <span className="text-8xl font-bold text-blue-500 tracking-widest">
                {currentNumber}
              </span>
            )}

            {gameState === 'input' && (
              <div className="text-center w-full px-8">
                <p className="text-gray-500 mb-6 text-lg">输入你看到的数字</p>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={DIGITS_PER_ROUND}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full text-center text-6xl font-bold p-6 border-2 rounded-lg focus:outline-none focus:border-blue-500 tracking-widest"
                  autoFocus
                />
                <Button onClick={handleSubmit} size="lg" className="mt-6 w-full">
                  确认
                </Button>
              </div>
            )}

            {gameState === 'feedback' && feedback && (
              <div className="text-center">
                <span
                  className={`text-5xl font-bold ${feedback.correct ? 'text-green-500' : 'text-red-500'}`}
                >
                  {feedback.correct ? '✓ 正确！' : '✗ 错误！'}
                </span>
                {!feedback.correct && (
                  <p className="text-2xl text-gray-500 mt-4">
                    答案是: <span className="font-bold">{feedback.answer}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
