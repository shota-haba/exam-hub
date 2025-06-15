import { createClient } from './server'
import { ExamSet, DashboardStats, SharedExamsOptions, UserProgress, SessionResult } from '@/lib/types'

/**
 * DB操作サービス層 - 全DBクエリを集約
 */

/**
 * ユーザーの試験一覧を取得
 */
export async function getUserExams(userId: string): Promise<ExamSet[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

/**
 * 共有試験一覧を取得（いいね状態付き）
 */
export async function getSharedExams(
  userId: string, 
  options: SharedExamsOptions = {}
): Promise<ExamSet[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('exam_sets')
    .select(`
      *,
      likes!inner(user_id)
    `)
    .eq('is_shared', true)
    .neq('user_id', userId) // 自分の試験は除外
  
  // 検索条件
  if (options.searchTerm) {
    query = query.ilike('title', `%${options.searchTerm}%`)
  }
  
  // ソート条件
  if (options.sortBy === 'likes') {
    query = query.order('likes_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // いいね状態を付与
  const examsWithLikes = (data || []).map(exam => ({
    ...exam,
    isLiked: exam.likes?.some((like: any) => like.user_id === userId) || false
  }))
  
  return examsWithLikes
}

/**
 * 単一試験セットを取得
 */
export async function getExamSet(examId: string, userId: string): Promise<ExamSet | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('id', examId)
    .eq('user_id', userId)
    .single()
  
  if (error) return null
  return data
}

/**
 * ダッシュボード統計を取得
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient()
  
  // 試験数と問題数
  const { data: exams } = await supabase
    .from('exam_sets')
    .select('data')
    .eq('user_id', userId)
  
  const totalExams = exams?.length || 0
  const totalQuestions = exams?.reduce((sum, exam) => 
    sum + (exam.data?.questions?.length || 0), 0) || 0
  
  // セッション統計
  const { data: sessions } = await supabase
    .from('session_results')
    .select('start_time, end_time, score, total_questions')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  const totalSessionTime = sessions?.reduce((total, session) => {
    const start = new Date(session.start_time).getTime()
    const end = new Date(session.end_time).getTime()
    return total + (end - start) / 1000 / 60 // 分単位
  }, 0) || 0
  
  const recentSessions = sessions?.length || 0
  
  // 平均進捗（仮の計算）
  const averageProgress = sessions?.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.score / s.total_questions * 100), 0) / sessions.length
    : 0
  
  return {
    totalExams,
    totalQuestions,
    averageProgress: Math.round(averageProgress),
    totalSessionTime: Math.round(totalSessionTime),
    recentSessions,
    weeklyStreak: 7 // 仮の値
  }
}

/**
 * 試験をインポート
 */
export async function importExamSet(
  userId: string, 
  title: string, 
  examData: any
): Promise<ExamSet> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('exam_sets')
    .insert({
      title,
      user_id: userId,
      data: examData,
      is_shared: false,
      likes_count: 0
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 試験の共有状態を更新
 */
export async function updateExamShared(
  examId: string, 
  userId: string, 
  isShared: boolean
): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('exam_sets')
    .update({ is_shared: isShared })
    .eq('id', examId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * 試験のいいね状態を切り替え
 */
export async function toggleExamLike(
  examId: string, 
  userId: string, 
  hasLiked: boolean
): Promise<void> {
  const supabase = await createClient()
  
  if (hasLiked) {
    // いいねを削除
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('exam_id', examId)
      .eq('user_id', userId)
    
    if (deleteError) throw deleteError
    
    // カウントを減らす
    const { error: updateError } = await supabase
      .from('exam_sets')
      .update({ likes_count: supabase.raw('likes_count - 1') })
      .eq('id', examId)
    
    if (updateError) throw updateError
  } else {
    // いいねを追加
    const { error: insertError } = await supabase
      .from('likes')
      .insert({ exam_id: examId, user_id: userId })
    
    if (insertError) throw insertError
    
    // カウントを増やす
    const { error: updateError } = await supabase
      .from('exam_sets')
      .update({ likes_count: supabase.raw('likes_count + 1') })
      .eq('id', examId)
    
    if (updateError) throw updateError
  }
}

/**
 * セッション結果を保存
 */
export async function saveSessionResult(
  userId: string,
  examId: string,
  sessionMode: string,
  startTime: Date,
  endTime: Date,
  score: number,
  totalQuestions: number,
  questionsData: any
): Promise<SessionResult> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('session_results')
    .insert({
      user_id: userId,
      exam_set_id: examId,
      session_mode: sessionMode,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      score,
      total_questions: totalQuestions,
      questions_data: questionsData
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 試験を削除
 */
export async function deleteExamSet(examId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('exam_sets')
    .delete()
    .eq('id', examId)
    .eq('user_id', userId)
  
  if (error) throw error
}