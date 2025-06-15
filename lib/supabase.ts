import { createBrowserClient } from '@supabase/ssr'

// Supabase環境変数の取得と検証
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数が設定されていない場合のエラーハンドリング
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が見つかりません:', {
    NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey
  })
  throw new Error('Supabase環境変数が不足しています。.env.localファイルを確認してください。')
}

/**
 * ブラウザ用Supabaseクライアント（SSR対応）
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * 試験セット
 */
export interface ExamSet {
  id: string
  title: string
  user_id: string
  created_at: string
  data: {
    questions: Question[]
    tags?: Array<{
      key: string
      value: string
    }>
  }
}

/**
 * 問題
 */
export interface Question {
  id: string
  text: string
  explanation: string | null
  choices: Choice[]
}

/**
 * 選択肢
 */
export interface Choice {
  id: string
  text: string
  identifier: string
  isCorrect: boolean
}

/**
 * ユーザー進捗
 */
export interface UserProgress {
  user_id: string
  question_id: string
  exam_set_id: string
  last_result: boolean | null
  attempt_count: number
  last_attempted: string | null
}

/**
 * セッション結果
 */
export interface SessionResult {
  id: string
  user_id: string
  exam_set_id: string
  session_mode: string
  start_time: string
  end_time: string
  score: number
  total_questions: number
  questions_data: any
}

/**
 * 学習モード定義
 */
export enum SessionMode {
  Warmup = "warmup",
  Review = "review", 
  Repetition = "repetition",
  Comprehensive = "comprehensive"
}