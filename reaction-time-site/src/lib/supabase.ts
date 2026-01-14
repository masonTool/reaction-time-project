import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 单例模式创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          language?: string
          updated_at?: string
        }
      }
      test_records: {
        Row: {
          id: string
          user_id: string
          test_type: string
          score: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_type: string
          score: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_type?: string
          score?: Record<string, any>
        }
      }
      public_records: {
        Row: {
          id: string
          test_type: string
          score: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          test_type: string
          score: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          test_type?: string
          score?: Record<string, any>
        }
      }
    }
  }
}
