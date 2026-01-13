import { useRef, useCallback } from 'react'

export function useReactionTimer() {
  const startTimeRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now()
  }, [])

  const getReactionTime = useCallback(() => {
    if (startTimeRef.current === 0) return 0
    return performance.now() - startTimeRef.current
  }, [])

  const reset = useCallback(() => {
    startTimeRef.current = 0
  }, [])

  return {
    startTimer,
    getReactionTime,
    reset,
  }
}
