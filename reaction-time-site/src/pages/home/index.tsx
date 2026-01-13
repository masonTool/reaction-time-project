import { TestCard } from '@/components/common/TestCard'
import { TEST_INFO } from '@/types/test'

export function HomePage() {
  const tests = Object.values(TEST_INFO)

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">游戏反应能力测试</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          通过多种专业测试工具，了解并提升你的反应速度、准确性和认知能力
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  )
}
