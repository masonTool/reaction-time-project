import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Countdown } from '@/components/common/Countdown'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { randomInt } from '@/utils/random'
import { cn } from '@/lib/utils'

type GameState = 'idle' | 'countdown' | 'showing' | 'input' | 'finished'

const GRID_SIZE = 9
const HIGHLIGHT_DURATION = 500
const HIGHLIGHT_GAP = 200

export function SequenceMemoryTest() {
  const navigate = useNavigate()
  const addResult = useHistoryStore((s) => s.addResult)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null)
  const [level, setLevel] = useState(1)
  const showingRef = useRef(false)

  const generateSequence = useCallback((length: number) => {
    const seq: number[] = []
    for (let i = 0; i < length; i++) {
      seq.push(randomInt(0, GRID_SIZE - 1))
    }
    return seq
  }, [])

  const showSequence = useCallback(async (seq: number[]) => {
    showingRef.current = true
    setGameState('showing')
    
    for (let i = 0; i < seq.length; i++) {
      if (!showingRef.current) break
      setHighlightedCell(seq[i])
      await new Promise((r) => setTimeout(r, HIGHLIGHT_DURATION))
      setHighlightedCell(null)
      if (i < seq.length - 1) {
        await new Promise((r) => setTimeout(r, HIGHLIGHT_GAP))
      }
    }
    
    if (showingRef.current) {
      setGameState('input')
    }
    showingRef.current = false
  }, [])

  const startRound = useCallback((nextLevel: number) => {
    setGameState('countdown')
    const newSeq = generateSequence(nextLevel)
    setSequence(newSeq)
  }, [generateSequence])

  const startShowing = useCallback(() => {
    showSequence(sequence)
  }, [sequence, showSequence])

  const startGame = useCallback(() => {
    setLevel(1)
    setUserInput([])
    startRound(1)
  }, [startRound])

  const handleCellClick = useCallback(
    (index: number) => {
      if (gameState !== 'input') return

      const newInput = [...userInput, index]
      setUserInput(newInput)

      const isCorrect = sequence
        .slice(0, newInput.length)
        .every((v, i) => v === newInput[i])

      if (!isCorrect) {
        setGameState('finished')
        // 不记录成绩
        return
      }

      if (newInput.length === sequence.length) {
        const nextLevel = level + 1
        setLevel(nextLevel)
        setUserInput([])
        setTimeout(() => startRound(nextLevel), 500)
      }
    },
    [gameState, userInput, sequence, level, startRound, addResult]
  )

  useEffect(() => {
    return () => {
      showingRef.current = false
    }
  }, [])

  if (gameState === 'finished') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>序列记忆测试</CardTitle>
          <div className="mt-4 inline-block px-6 py-2 rounded-full bg-red-500 text-white font-bold text-lg">
            测试失败
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <span className="text-gray-600 dark:text-gray-400">失败原因</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">点击错误</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">完成等级</span>
              <span className="font-semibold">{level} 级</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={startGame} className="flex-1">
              再试一次
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="flex-1"
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">序列记忆测试</h1>
        <p className="text-gray-500">记住闪烁的顺序，然后重复点击</p>
      </div>

      {gameState === 'idle' ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">记住格子闪烁的顺序并重复</p>
          <Button size="lg" onClick={startGame}>
            开始测试
          </Button>
        </div>
      ) : gameState === 'countdown' ? (
        <Countdown onComplete={startShowing} />
      ) : gameState === 'showing' || gameState === 'input' ? (
        <>
          <div className="text-center mb-4">
            <span className="text-lg font-semibold">等级: {level}</span>
            {gameState === 'showing' && (
              <p className="text-gray-500 mt-1">观察序列...</p>
            )}
            {gameState === 'input' && (
              <p className="text-purple-600 font-semibold mt-1 animate-pulse">
                现在点击: {userInput.length} / {sequence.length}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={gameState !== 'input'}
                className={cn(
                  'aspect-square rounded-lg transition-none',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500',
                  highlightedCell === index && 'bg-purple-500',
                  highlightedCell !== index && gameState === 'showing' && 'bg-gray-200 dark:bg-gray-700',
                  gameState === 'input' && highlightedCell !== index && 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer border-2 border-purple-400',
                  gameState !== 'input' && highlightedCell !== index && 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50'
                )}
                aria-label={`格子 ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
