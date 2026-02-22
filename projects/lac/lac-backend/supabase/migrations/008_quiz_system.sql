-- LAC Backend Migration 007: Quiz System
-- 创建测验系统相关表

-- ==========================================
-- 1. QUIZ_QUESTIONS TABLE (题目表)
-- ==========================================
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- ["选项A", "选项B", "选项C", "选项D"]
    correct_answer INTEGER NOT NULL, -- 正确答案索引 (0-based)
    difficulty INTEGER DEFAULT 1, -- 1-3 (简单/中等/困难)
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT quiz_questions_difficulty_check CHECK (difficulty >= 1 AND difficulty <= 3),
    CONSTRAINT quiz_questions_correct_answer_check CHECK (correct_answer >= 0)
);

CREATE INDEX idx_quiz_questions_course_id ON quiz_questions(course_id);
CREATE INDEX idx_quiz_questions_lesson_id ON quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);

-- RLS策略
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 所有人可以读取题目（通过Edge Function控制访问）
CREATE POLICY "quiz_questions_select" ON quiz_questions
    FOR SELECT USING (true);

-- 只有service_role可以插入/更新
CREATE POLICY "quiz_questions_insert" ON quiz_questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "quiz_questions_update" ON quiz_questions
    FOR UPDATE USING (true);

-- ==========================================
-- 2. QUIZ_ATTEMPTS TABLE (答题记录)
-- ==========================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}', -- 每题详情 [{question_id, selected, correct, is_correct}]
    passed BOOLEAN DEFAULT FALSE,
    lac_reward NUMERIC(20, 6) DEFAULT 0,
    suspicious BOOLEAN DEFAULT FALSE, -- 反作弊标记
    suspicious_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT quiz_attempts_score_check CHECK (score >= 0),
    CONSTRAINT quiz_attempts_total_check CHECK (total_questions > 0),
    CONSTRAINT quiz_attempts_time_check CHECK (time_spent_seconds >= 0)
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_course_id ON quiz_attempts(course_id);
CREATE INDEX idx_quiz_attempts_user_course ON quiz_attempts(user_id, course_id);
CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at DESC);
CREATE INDEX idx_quiz_attempts_passed ON quiz_attempts(passed);

-- RLS策略
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的答题记录
CREATE POLICY "quiz_attempts_select" ON quiz_attempts
    FOR SELECT USING (true);

CREATE POLICY "quiz_attempts_insert" ON quiz_attempts
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- 3. 从 course_lessons.quiz_questions 导入现有题目
-- ==========================================
INSERT INTO quiz_questions (course_id, lesson_id, question_text, options, correct_answer, difficulty, category)
SELECT 
    cl.course_id,
    cl.id AS lesson_id,
    q->>'question' AS question_text,
    q->'options' AS options,
    (q->>'correct')::INTEGER AS correct_answer,
    COALESCE(c.difficulty, 1) AS difficulty,
    COALESCE(c.category, 'general') AS category
FROM course_lessons cl
JOIN courses c ON c.id = cl.course_id
CROSS JOIN LATERAL jsonb_array_elements(cl.quiz_questions) AS q
WHERE cl.quiz_questions IS NOT NULL 
  AND jsonb_array_length(cl.quiz_questions) > 0;

COMMENT ON TABLE quiz_questions IS '测验题目表';
COMMENT ON TABLE quiz_attempts IS '用户答题记录表';
COMMENT ON COLUMN quiz_questions.options IS 'JSON数组格式的选项列表';
COMMENT ON COLUMN quiz_questions.correct_answer IS '正确答案索引(0-based)';
COMMENT ON COLUMN quiz_attempts.details IS '每题详情: [{question_id, selected, correct, is_correct}]';
COMMENT ON COLUMN quiz_attempts.suspicious IS '反作弊标记：true表示该次答题被检测为可疑';
