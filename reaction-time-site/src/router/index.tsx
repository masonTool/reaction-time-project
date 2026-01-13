import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Layout } from '@/components/common/Layout'
import { HomePage } from '@/pages/home'
import { HistoryPage } from '@/pages/history'
import { ClickTrackerTest } from '@/pages/tests/click-tracker'
import { ColorChangeTest } from '@/pages/tests/color-change'
import { SequenceMemoryTest } from '@/pages/tests/sequence-memory'
import { NumberFlashTest } from '@/pages/tests/number-flash'
import { DirectionReactTest } from '@/pages/tests/direction-react'
import { AudioReactTest } from '@/pages/tests/audio-react'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'test/click-tracker', element: <ClickTrackerTest /> },
      { path: 'test/color-change', element: <ColorChangeTest /> },
      { path: 'test/sequence-memory', element: <SequenceMemoryTest /> },
      { path: 'test/number-flash', element: <NumberFlashTest /> },
      { path: 'test/direction-react', element: <DirectionReactTest /> },
      { path: 'test/audio-react', element: <AudioReactTest /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
