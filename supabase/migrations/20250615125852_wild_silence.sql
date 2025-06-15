/*
  # Add sharing and likes features

  1. New Columns
    - `exam_sets.is_shared` (boolean) - Whether exam is publicly shared
    - `exam_sets.likes_count` (integer) - Number of likes for the exam
  
  2. New Tables
    - `likes` - Track user likes for shared exams
      - `user_id` (uuid, references auth.users)
      - `exam_id` (uuid, references exam_sets)
      - `created_at` (timestamp)
  
  3. Security
    - Enable RLS on `likes` table
    - Add policies for authenticated users to manage their own likes
    - Add policies for reading shared exams
*/

-- Add sharing columns to exam_sets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_sets' AND column_name = 'is_shared'
  ) THEN
    ALTER TABLE exam_sets ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_sets' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE exam_sets ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, exam_id)
);

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Users can manage their own likes"
  ON likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Update exam_sets RLS to allow reading shared exams
DROP POLICY IF EXISTS exam_sets_policy ON exam_sets;

CREATE POLICY "Users can manage their own exams"
  ON exam_sets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read shared exams"
  ON exam_sets
  FOR SELECT
  TO authenticated
  USING (is_shared = true OR auth.uid() = user_id);