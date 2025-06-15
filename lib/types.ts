/**
 * 学習モード定義
 */
export enum SessionMode {
  Warmup = "warmup",      // 予習 - 未学習問題
  Review = "review",      // 復習 - 間違えた問題
  Repetition = "repetition", // 反復 - 正解問題
  Comprehensive = "comprehensive" // 総合 - 全問題
}

/**
 * 試験設定
 */
export interface ExamConfig {
  mode: SessionMode;
  maxQuestions: number;
  timePerQuestion: number; // 秒数、0で無制限
}

/**
 * 選択肢
 */
export interface Choice {
  id: string;
  text: string;
  identifier: string;
  isCorrect: boolean;
}

/**
 * 問題
 */
export interface Question {
  id: string;
  text: string;
  explanation: string | null;
  choices: Choice[];
}

/**
 * 試験セット
 */
export interface ExamSet {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  data: {
    questions: Question[];
    tags?: Array<{
      項目名: string;
      値: string;
    }>;
  };
}

/**
 * ユーザー進捗
 */
export interface UserProgress {
  user_id: string;
  question_id: string;
  exam_set_id: string;
  last_result: boolean | null; // null=未回答, true=正解, false=不正解
  attempt_count: number;
  last_attempted: string | null;
}

/**
 * 問題結果
 */
export interface QuestionResult {
  question: Question;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

/**
 * セッション結果
 */
export interface SessionResult {
  id?: string;
  user_id: string;
  exam_set_id: string;
  session_mode: SessionMode;
  start_time: string;
  end_time: string;
  score: number;
  total_questions: number;
  questions_data: QuestionResult[];
}

/**
 * 試験統計
 */
export interface ExamStats {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  overallProgress: number; // パーセンテージ
  accuracyRate: number; // パーセンテージ
  lastStudied: string | null;
  sessionStreak: number;
}

/**
 * ユーザー統計
 */
export interface UserStats {
  totalExams: number;
  totalQuestions: number;
  totalAttempted: number;
  overallAccuracy: number;
  sessionTime: number; // 分
  sessionStreak: number;
  weeklyProgress: number[];
}