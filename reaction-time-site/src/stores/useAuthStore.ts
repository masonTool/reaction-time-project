import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user, loading: false }),

      initialize: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          set({ user: session?.user ?? null, loading: false })

          // 监听认证状态变化
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null })
          })
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({ user: null, loading: false })
        }
      },

      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error
        if (data.user) {
          set({ user: data.user })
          // 创建用户记录
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
          })
        }
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        set({ user: data.user })
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
