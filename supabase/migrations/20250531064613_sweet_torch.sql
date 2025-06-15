-- Schema for Exam Learning App

-- Users table is handled by Supabase Auth

-- Exam Sets
CREATE TABLE exam_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Store the entire exam set data as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  exam_set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
  last_result BOOLEAN NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- Session Results
CREATE TABLE session_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
  session_mode TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_data JSONB NOT NULL, -- Store detailed question results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
-- Allow users to only see their own exam sets
CREATE POLICY exam_sets_policy ON exam_sets
  FOR ALL USING (auth.uid() = user_id);

-- Allow users to only see their own progress
CREATE POLICY user_progress_policy ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Allow users to only see their own session results
CREATE POLICY session_results_policy ON session_results
  FOR ALL USING (auth.uid() = user_id);

-- Triggers to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exam_sets_updated_at
BEFORE UPDATE ON exam_sets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();