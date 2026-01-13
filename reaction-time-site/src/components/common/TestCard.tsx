import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { TestInfo } from '@/types/test'

interface TestCardProps {
  test: TestInfo
}

export function TestCard({ test }: TestCardProps) {
  return (
    <Link
      to={`/test/${test.id}`}
      className={cn(
        'block rounded-xl p-6 transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        'bg-white dark:bg-gray-900 border shadow-sm'
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4',
          test.color
        )}
      >
        {test.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{test.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {test.description}
      </p>
    </Link>
  )
}
