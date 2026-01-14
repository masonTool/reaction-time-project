import { useState, useEffect } from 'react'

interface CountdownProps {
  onComplete: () => void
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  if (count === 0) return null

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-9xl font-bold text-blue-600 animate-pulse">{count}</div>
    </div>
  )
}
