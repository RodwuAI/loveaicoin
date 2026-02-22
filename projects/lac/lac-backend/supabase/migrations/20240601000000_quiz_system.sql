-- Quiz System tables
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer int NOT NULL,
  difficulty int DEFAULT 1,
  category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  course_id uuid REFERENCES courses(id),
  score int NOT NULL,
  total_questions int NOT NULL,
  time_spent_seconds int,
  details jsonb,
  passed boolean DEFAULT false,
  lac_reward numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_course ON quiz_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course_date ON quiz_attempts(user_id, course_id, created_at);

-- Import quiz data from courses metadata
INSERT INTO quiz_questions (course_id, question_text, options, correct_answer, difficulty, category)
SELECT c.id, q->>'question', q->'options',
  CASE
    WHEN q->>'answer' ~ '^[0-9]+$' THEN (q->>'answer')::int
    ELSE (
      SELECT i FROM generate_series(0, jsonb_array_length(q->'options')-1) AS i
      WHERE q->'options'->i #>>'{}'  = q->>'answer' LIMIT 1
    )
  END,
  c.difficulty, 'course_quiz'
FROM courses c, jsonb_array_elements(c.metadata->'quiz') AS q
WHERE c.metadata->'quiz' IS NOT NULL
  AND jsonb_array_length(c.metadata->'quiz') > 0
  AND (
    q->>'answer' ~ '^[0-9]+$'
    OR EXISTS (
      SELECT 1 FROM generate_series(0, jsonb_array_length(q->'options')-1) AS i
      WHERE q->'options'->i #>>'{}'  = q->>'answer'
    )
  )
ON CONFLICT DO NOTHING;
