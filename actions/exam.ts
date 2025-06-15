'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  importExamSet, 
  updateExamShared, 
  toggleExamLike, 
  saveSessionResult,
  deleteExamSet 
} from '@/lib/supabase/db'
import { SessionSaveData } from '@/lib/types'

/**
 * 試験インポートアクション
 */
export async function importExamAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('ファイルが選択されていません')
    }
    
    const fileContent = await file.text()
    const jsonData = JSON.parse(fileContent)
    
    // 簡単なバリデーション
    if (!jsonData.試験 || !jsonData.問題集) {
      throw new Error('無効なファイル形式です')
    }
    
    await importExamSet(user.id, jsonData.試験, jsonData)
    
    revalidatePath('/exams')
    return { success: true }
  } catch (error) {
    console.error('インポートエラー:', error)
    return { success: false, error: 'インポートに失敗しました' }
  }
}

/**
 * 試験共有状態更新アクション
 */
export async function updateExamSharedAction(examId: string, isShared: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  try {
    await updateExamShared(examId, user.id, isShared)
    revalidatePath('/exams')
    return { success: true }
  } catch (error) {
    console.error('共有状態更新エラー:', error)
    return { success: false, error: '更新に失敗しました' }
  }
}

/**
 * 試験いいね切り替えアクション
 */
export async function toggleExamLikeAction(examId: string, hasLiked: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  try {
    await toggleExamLike(examId, user.id, hasLiked)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('いいね切り替えエラー:', error)
    return { success: false, error: '更新に失敗しました' }
  }
}

/**
 * セッション結果保存アクション
 */
export async function saveSessionResultAction(sessionData: SessionSaveData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  try {
    await saveSessionResult(
      user.id,
      sessionData.examId,
      sessionData.mode,
      sessionData.startTime,
      sessionData.endTime,
      sessionData.score,
      sessionData.totalQuestions,
      sessionData.questionsData
    )
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('セッション結果保存エラー:', error)
    return { success: false, error: '保存に失敗しました' }
  }
}

/**
 * 試験削除アクション
 */
export async function deleteExamAction(examId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  try {
    await deleteExamSet(examId, user.id)
    revalidatePath('/exams')
    return { success: true }
  } catch (error) {
    console.error('試験削除エラー:', error)
    return { success: false, error: '削除に失敗しました' }
  }
}