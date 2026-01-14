import { useTranslation } from 'react-i18next'
import { TestCard } from '@/components/common/TestCard'
import { TEST_INFO } from '@/types/test'

export function HomePage() {
  const { t } = useTranslation()
  const tests = Object.values(TEST_INFO)

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">{t('app.title')}</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          {t('app.subtitle')}
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
