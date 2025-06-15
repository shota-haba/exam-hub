import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が不足しています。.env.localファイルを確認してください。')
}

/**
 * ブラウザ用Supabaseクライアント
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)