import { Link, Outlet } from 'react-router-dom'
import { Home, History } from 'lucide-react'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">⚡</span>
            <span>反应测试</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Home size={18} />
              <span className="hidden sm:inline">首页</span>
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <History size={18} />
              <span className="hidden sm:inline">历史</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        <p>游戏反应能力测试 - 提升你的反应速度</p>
      </footer>
    </div>
  )
}
