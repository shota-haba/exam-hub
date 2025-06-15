import { supabase, SessionMode, ExamSet, UserProgress, SessionResult } from './supabase';

// Helper function to get exam sets for a user
export async function getUserExamSetss(userId: string) {
  const { data, error } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Helper function to get a single exam set
export async function getExamSets(ExamSetsId: string, userId: string) {
  const { data, error } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('id', ExamSetsId)
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Import a new exam set
export async function importExamSets(userId: string, title: string, examData: any) {
  const { data, error } = await supabase
    .from('exam_sets')
    .insert({
      title,
      user_id: userId,
      data: examData,
    })
    .select();
  
  if (error) throw error;
  return data[0];
}

// Update user progress after answering a question
export async function updateUserProgress(
  userId: string, 
  ExamSetsId: string, 
  questionId: string, 
  isCorrect: boolean
) {
  // First check if record exists
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();
  
  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('user_progress')
      .update({
        last_result: isCorrect,
        attempt_count: existing.attempt_count + 1,
        last_attempted: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('question_id', questionId);
    
    if (error) throw error;
  } else {
    // Insert new record
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        exam_set_id: ExamSetsId,
        question_id: questionId,
        last_result: isCorrect,
        attempt_count: 1,
        last_attempted: new Date().toISOString(),
      });
    
    if (error) throw error;
  }
}

// Save session results
export async function saveSessionResults(
  userId: string,
  ExamSetsId: string,
  sessionMode: SessionMode,
  startTime: Date,
  endTime: Date,
  score: number,
  totalQuestions: number,
  questionsData: any
) {
  const { data, error } = await supabase
    .from('session_results')
    .insert({
      user_id: userId,
      exam_set_id: ExamSetsId,
      session_mode: sessionMode,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      score,
      total_questions: totalQuestions,
      questions_data: questionsData,
    })
    .select();
  
  if (error) throw error;
  return data[0];
}

// Get user statistics
export async function getUserStats(userId: string) {
  // Get total time spent
  const { data: sessions, error: sessionsError } = await supabase
    .from('session_results')
    .select('start_time, end_time')
    .eq('user_id', userId);
  
  if (sessionsError) throw sessionsError;
  
  const totalTimeInSeconds = sessions?.reduce((total, session) => {
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    return total + (end - start) / 1000;
  }, 0) || 0;
  
  // Get total sessions
  const totalSessions = sessions?.length || 0;
  
  // Get daily sessions (last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const dailySessions = sessions?.filter(session => 
    new Date(session.end_time) > oneDayAgo
  ).length || 0;
  
  // Get daily time (last 24 hours)
  const dailyTimeInSeconds = sessions?.filter(session => 
    new Date(session.end_time) > oneDayAgo
  ).reduce((total, session) => {
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    return total + (end - start) / 1000;
  }, 0) || 0;
  
  return {
    totalTime: Math.round(totalTimeInSeconds / 3600 * 10) / 10, // Convert to hours with 1 decimal
    dailyTime: Math.round(dailyTimeInSeconds / 3600 * 10) / 10, // Convert to hours with 1 decimal
    totalSessions,
    dailySessions,
    streak: 0, // In a real app, calculate this based on user's daily activity
  };
}