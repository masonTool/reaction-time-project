import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { History, User, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuthStore } from '@/stores/useAuthStore'

export function Layout() {
  const { t } = useTranslation()
  const { user, signOut } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">⚡</span>
            <span>{t('app.title')}</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/history"
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <History size={18} />
              <span className="hidden sm:inline">{t('nav.history')}</span>
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t('button.logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User size={18} />
                <span className="hidden sm:inline">{t('button.login')}</span>
              </button>
            )}

            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        <p>{t('app.footer')}</p>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}
