/**
 * プロジェクト全体の型定義
 */

import { User, Session } from '@supabase/supabase-js'

// 認証関連
export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// 学習モード
export enum SessionMode {
  Warmup = "warmup",
  Review = "review", 
  Repetition = "repetition",
  Comprehensive = "comprehensive"
}

// 選択肢
export interface Choice {
  id: string
  text: string
  identifier: string
  isCorrect: boolean
}

// 問題
export interface Question {
  id: string
  text: string
  explanation: string | null
  choices: Choice[]
}

// 試験セット
export interface ExamSet {
  id: string
  title: string
  user_id: string
  created_at: string
  is_shared: boolean
  likes_count: number
  isLiked?: boolean // UI用フラグ
  data: {
    questions: Question[]
    tags?: Array<{
      項目名: string
      値: string
    }>
  }
}

// ユーザー進捗
export interface UserProgress {
  user_id: string
  question_id: string
  exam_set_id: string
  last_result: boolean | null
  attempt_count: number
  last_attempted: string | null
}

// セッション結果
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

// 試験設定
export interface ExamConfig {
  mode: SessionMode
  maxQuestions: number
  timePerQuestion: number
}

// 問題結果
export interface QuestionResult {
  question: Question
  selectedAnswer: string | null
  isCorrect: boolean
  timeSpent: number
}

// 試験統計
export interface ExamStats {
  examId: string
  examTitle: string
  totalQuestions: number
  attemptedQuestions: number
  correctAnswers: number
  overallProgress: number
  accuracyRate: number
  lastStudied: string | null
  sessionStreak: number
}

// ユーザー統計
export interface UserStats {
  totalExams: number
  totalQuestions: number
  totalAttempted: number
  overallAccuracy: number
  sessionTime: number
  sessionStreak: number
  weeklyProgress: number[]
}

// ダッシュボード統計
export interface DashboardStats {
  totalExams: number
  totalQuestions: number
  averageProgress: number
  totalSessionTime: number
  recentSessions: number
  weeklyStreak: number
}

// 共有試験取得オプション
export interface SharedExamsOptions {
  sortBy?: 'newest' | 'likes'
  searchTerm?: string
}

// セッション保存データ
export interface SessionSaveData {
  examId: string
  mode: SessionMode
  startTime: Date
  endTime: Date
  score: number
  totalQuestions: number
  questionsData: QuestionResult[]
}