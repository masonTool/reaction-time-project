export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomPosition(
  containerWidth: number,
  containerHeight: number,
  elementSize: number,
  padding = 20
): { x: number; y: number } {
  const maxX = containerWidth - elementSize - padding
  const maxY = containerHeight - elementSize - padding
  return {
    x: randomInt(padding, Math.max(padding, maxX)),
    y: randomInt(padding, Math.max(padding, maxY)),
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
