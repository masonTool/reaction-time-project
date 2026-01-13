import { useState, useRef, useCallback } from 'react'

interface UseTimerOptions {
  duration?: number
  onEnd?: () => void
}

export function useTimer({ duration, onEnd }: UseTimerOptions = {}) {
  const [timeLeft, setTimeLeft] = useState(duration ?? 0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const start = useCallback(() => {
    if (intervalRef.current) return
    
    setIsRunning(true)
    startTimeRef.current = performance.now()
    
    if (duration) {
      setTimeLeft(duration)
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setIsRunning(false)
            onEnd?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [duration, onEnd])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTimeLeft(duration ?? 0)
  }, [duration, stop])

  const getElapsedTime = useCallback(() => {
    return performance.now() - startTimeRef.current
  }, [])

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
    getElapsedTime,
  }
}
