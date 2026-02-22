-- LAC Backend Migration 003: Courses and Content
-- 创建课程和内容相关表

-- ==========================================
-- 1. COURSES TABLE (课程主表)
-- ==========================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1, -- 1-4 (入门/进阶/高级/专家)
    estimated_duration INTEGER, -- 预计学习时长(分钟)
    
    -- 奖励设置
    base_lac_reward INTEGER DEFAULT 100,
    
    -- 课程状态
    status TEXT DEFAULT 'draft', -- draft, published, archived
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计数据
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- 创建者和时间
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    -- 约束
    CONSTRAINT courses_difficulty_check CHECK (difficulty >= 1 AND difficulty <= 4),
    CONSTRAINT courses_status_check CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT courses_rating_check CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT courses_duration_check CHECK (estimated_duration > 0)
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(featured DESC);
CREATE INDEX idx_courses_rating ON courses(rating DESC);
CREATE INDEX idx_courses_enrollment ON courses(enrollment_count DESC);
CREATE INDEX idx_courses_author ON courses(author_id);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- RLS策略
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看已发布的课程
CREATE POLICY "课程查看" ON courses
    FOR SELECT USING (
        status = 'published' OR 
        author_id = auth.uid()
    );

-- 只有课程作者可以更新
CREATE POLICY "课程更新" ON courses
    FOR UPDATE USING (author_id = auth.uid());

-- ==========================================
-- 2. COURSE_LESSONS TABLE (课程章节)
-- ==========================================
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- markdown或HTML内容
    video_url TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- 预计学习时间(分钟)
    
    -- 测验设置
    quiz_questions JSONB DEFAULT '[]',
    passing_score INTEGER DEFAULT 70,
    
    -- 状态
    is_free BOOLEAN DEFAULT FALSE, -- 是否免费章节
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, order_index),
    CONSTRAINT course_lessons_order_check CHECK (order_index > 0),
    CONSTRAINT course_lessons_duration_check CHECK (duration > 0),
    CONSTRAINT course_lessons_score_check CHECK (passing_score >= 0 AND passing_score <= 100)
);

CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON course_lessons(course_id, order_index);

-- RLS策略
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

-- 基于课程的访问权限
CREATE POLICY "课程章节查看" ON course_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_lessons.course_id 
            AND (courses.status = 'published' OR courses.author_id = auth.uid())
        )
    );

-- ==========================================
-- 3. USER_COURSES TABLE (用户课程关系)
-- ==========================================
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- 进度状态
    progress DECIMAL(5,2) DEFAULT 0, -- 完成百分比
    completed BOOLEAN DEFAULT FALSE,
    
    -- 时间记录
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 评价
    rating INTEGER, -- 1-5星
    review_text TEXT,
    
    UNIQUE(user_id, course_id),
    CONSTRAINT user_courses_progress_check CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT user_courses_rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_courses_progress ON user_courses(progress);
CREATE INDEX idx_user_courses_completed ON user_courses(completed);

-- RLS策略
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户课程访问" ON user_courses
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 4. USER_LESSON_PROGRESS TABLE (用户章节进度)
-- ==========================================
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    
    -- 学习进度
    status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
    progress_percentage INTEGER DEFAULT 0,
    
    -- 学习记录
    time_spent INTEGER DEFAULT 0, -- 总学习时间(秒)
    attempts INTEGER DEFAULT 0, -- 尝试次数
    best_score INTEGER, -- 最好测验成绩
    last_score INTEGER, -- 最近测验成绩
    
    -- 时间记录
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id),
    CONSTRAINT user_lesson_progress_status_check CHECK (status IN ('not_started', 'in_progress', 'completed')),
    CONSTRAINT user_lesson_progress_percentage_check CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT user_lesson_progress_score_check CHECK (best_score >= 0 AND best_score <= 100 AND last_score >= 0 AND last_score <= 100)
);

CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(status);

-- RLS策略
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "学习进度访问" ON user_lesson_progress
    FOR ALL USING (user_id = auth.uid());

-- ==========================================
-- 5. TEACHING_CONTENTS TABLE (教学内容)
-- ==========================================
CREATE TABLE teaching_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown', -- markdown, html, video
    
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty INTEGER DEFAULT 1, -- 1-4
    
    -- 媒体资源
    thumbnail_url TEXT,
    video_url TEXT,
    attachments JSONB DEFAULT '[]', -- 附件列表
    
    -- 状态
    status TEXT DEFAULT 'published', -- draft, published, archived, removed
    featured BOOLEAN DEFAULT FALSE,
    
    -- 统计数据
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- 评分
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- 挖矿奖励(T+7结算机制)
    pending_lac_reward DECIMAL(20, 6) DEFAULT 0,
    settled_lac_reward DECIMAL(20, 6) DEFAULT 0,
    settlement_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT teaching_contents_difficulty_check CHECK (difficulty >= 1 AND difficulty <= 4),
    CONSTRAINT teaching_contents_status_check CHECK (status IN ('draft', 'published', 'archived', 'removed')),
    CONSTRAINT teaching_contents_content_type_check CHECK (content_type IN ('markdown', 'html', 'video')),
    CONSTRAINT teaching_contents_rating_check CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_teaching_contents_author ON teaching_contents(author_id);
CREATE INDEX idx_teaching_contents_category ON teaching_contents(category);
CREATE INDEX idx_teaching_contents_status ON teaching_contents(status);
CREATE INDEX idx_teaching_contents_created_at ON teaching_contents(created_at DESC);
CREATE INDEX idx_teaching_contents_like_count ON teaching_contents(like_count DESC);
CREATE INDEX idx_teaching_contents_view_count ON teaching_contents(view_count DESC);
CREATE INDEX idx_teaching_contents_settlement ON teaching_contents(settlement_date) WHERE settlement_date IS NULL;

-- RLS策略
ALTER TABLE teaching_contents ENABLE ROW LEVEL SECURITY;

-- 已发布内容所有人可见，草稿只有作者可见
CREATE POLICY "教学内容查看" ON teaching_contents
    FOR SELECT USING (
        status = 'published' OR 
        author_id = auth.uid()
    );

-- 只有作者可以管理自己的内容
CREATE POLICY "教学内容管理" ON teaching_contents
    FOR ALL USING (author_id = auth.uid());

-- ==========================================
-- 6. CONTENT_INTERACTIONS TABLE (内容互动)
-- ==========================================
CREATE TABLE content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES teaching_contents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    interaction_type TEXT NOT NULL, -- like, bookmark, share, comment, view, rating
    
    -- 评论相关
    comment_text TEXT,
    parent_comment_id UUID REFERENCES content_interactions(id),
    
    -- 评分相关
    rating_score INTEGER, -- 1-5
    
    -- IP和元数据(防刷)
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(content_id, user_id, interaction_type),
    CONSTRAINT content_interactions_type_check CHECK (interaction_type IN ('like', 'bookmark', 'share', 'comment', 'view', 'rating')),
    CONSTRAINT content_interactions_rating_check CHECK (rating_score >= 1 AND rating_score <= 5)
);

CREATE INDEX idx_content_interactions_content ON content_interactions(content_id);
CREATE INDEX idx_content_interactions_user ON content_interactions(user_id);
CREATE INDEX idx_content_interactions_type ON content_interactions(interaction_type);
CREATE INDEX idx_content_interactions_created_at ON content_interactions(created_at DESC);

-- RLS策略
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有互动，但只能管理自己的
CREATE POLICY "内容互动查看" ON content_interactions
    FOR SELECT USING (TRUE);

CREATE POLICY "内容互动管理" ON content_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "内容互动更新" ON content_interactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "内容互动删除" ON content_interactions
    FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- 7. COURSE FUNCTIONS (课程相关函数)
-- ==========================================

-- 计算课程完成进度
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress DECIMAL(5,2);
BEGIN
    -- 获取课程总章节数
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons
    WHERE course_id = p_course_id;
    
    -- 获取用户已完成章节数
    SELECT COUNT(*) INTO completed_lessons
    FROM user_lesson_progress ulp
    JOIN course_lessons cl ON cl.id = ulp.lesson_id
    WHERE cl.course_id = p_course_id 
    AND ulp.user_id = p_user_id 
    AND ulp.status = 'completed';
    
    -- 计算进度百分比
    IF total_lessons > 0 THEN
        progress := (completed_lessons::DECIMAL / total_lessons) * 100;
    ELSE
        progress := 0;
    END IF;
    
    -- 更新用户课程进度
    UPDATE user_courses 
    SET progress = calculate_course_progress.progress,
        completed = (progress = 100),
        completed_at = CASE WHEN progress = 100 AND completed = FALSE THEN NOW() ELSE completed_at END,
        updated_at = NOW()
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- 更新内容互动统计
CREATE OR REPLACE FUNCTION update_content_stats(p_content_id UUID, p_interaction_type TEXT, p_increment INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE teaching_contents
    SET 
        view_count = CASE WHEN p_interaction_type = 'view' THEN view_count + p_increment ELSE view_count END,
        like_count = CASE WHEN p_interaction_type = 'like' THEN like_count + p_increment ELSE like_count END,
        comment_count = CASE WHEN p_interaction_type = 'comment' THEN comment_count + p_increment ELSE comment_count END,
        share_count = CASE WHEN p_interaction_type = 'share' THEN share_count + p_increment ELSE share_count END,
        bookmark_count = CASE WHEN p_interaction_type = 'bookmark' THEN bookmark_count + p_increment ELSE bookmark_count END,
        updated_at = NOW()
    WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql;

-- 更新内容评分
CREATE OR REPLACE FUNCTION update_content_rating(p_content_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_count INTEGER;
BEGIN
    -- 计算平均评分
    SELECT 
        COALESCE(AVG(rating_score), 0),
        COUNT(rating_score)
    INTO avg_rating, rating_count
    FROM content_interactions
    WHERE content_id = p_content_id AND interaction_type = 'rating';
    
    -- 更新内容评分
    UPDATE teaching_contents
    SET 
        rating = avg_rating,
        rating_count = rating_count,
        updated_at = NOW()
    WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql;

-- 检查用户是否可以发布教学内容
CREATE OR REPLACE FUNCTION can_publish_teaching_content(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_level INTEGER;
BEGIN
    SELECT level INTO user_level FROM users WHERE id = p_user_id;
    RETURN user_level >= 3; -- 需要3级以上才能发布教学内容
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. TRIGGERS (触发器)
-- ==========================================

-- 课程更新时间触发器
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teaching_contents_updated_at BEFORE UPDATE ON teaching_contents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 内容互动统计触发器
CREATE OR REPLACE FUNCTION trigger_update_content_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_content_stats(NEW.content_id, NEW.interaction_type, 1);
        
        -- 如果是评分，更新平均评分
        IF NEW.interaction_type = 'rating' THEN
            PERFORM update_content_rating(NEW.content_id);
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_content_stats(OLD.content_id, OLD.interaction_type, -1);
        
        -- 如果是评分，更新平均评分
        IF OLD.interaction_type = 'rating' THEN
            PERFORM update_content_rating(OLD.content_id);
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_interactions_stats_trigger
    AFTER INSERT OR DELETE ON content_interactions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_content_stats();

-- 课程进度更新触发器
CREATE OR REPLACE FUNCTION trigger_update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
        -- 当章节完成时，更新课程总进度
        PERFORM calculate_course_progress(
            NEW.user_id, 
            (SELECT course_id FROM course_lessons WHERE id = NEW.lesson_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_lesson_progress_trigger
    AFTER UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION trigger_update_course_progress();

-- ==========================================
-- 9. VIEWS (视图)
-- ==========================================

-- 课程统计视图
CREATE VIEW course_stats_view AS
SELECT 
    c.id,
    c.title,
    c.category,
    c.difficulty,
    c.enrollment_count,
    c.completion_count,
    c.rating,
    c.rating_count,
    CASE 
        WHEN c.enrollment_count > 0 
        THEN ROUND((c.completion_count::DECIMAL / c.enrollment_count) * 100, 2)
        ELSE 0 
    END as completion_rate,
    u.username as author_name,
    c.created_at
FROM courses c
LEFT JOIN users u ON u.id = c.author_id
WHERE c.status = 'published';

-- 热门教学内容视图
CREATE VIEW popular_teaching_contents AS
SELECT 
    tc.id,
    tc.title,
    tc.category,
    tc.view_count,
    tc.like_count,
    tc.comment_count,
    tc.rating,
    tc.rating_count,
    u.username as author_name,
    tc.created_at,
    -- 热度计算公式
    (tc.view_count * 0.1 + tc.like_count * 2 + tc.comment_count * 3 + tc.bookmark_count * 5) as popularity_score
FROM teaching_contents tc
JOIN users u ON u.id = tc.author_id
WHERE tc.status = 'published'
ORDER BY popularity_score DESC;

-- ==========================================
-- 10. COMMENTS
-- ==========================================
COMMENT ON TABLE courses IS 'LAC课程主表';
COMMENT ON TABLE course_lessons IS '课程章节内容表';
COMMENT ON TABLE user_courses IS '用户课程注册和进度表';
COMMENT ON TABLE user_lesson_progress IS '用户章节学习进度表';
COMMENT ON TABLE teaching_contents IS '用户发布的教学内容表';
COMMENT ON TABLE content_interactions IS '内容互动记录表(点赞/评论/收藏等)';

COMMENT ON COLUMN courses.difficulty IS '课程难度 1-4 (入门/进阶/高级/专家)';
COMMENT ON COLUMN courses.base_lac_reward IS '课程完成基础奖励LAC';
COMMENT ON COLUMN course_lessons.quiz_questions IS 'JSON格式测验题目';
COMMENT ON COLUMN teaching_contents.settlement_date IS '教导挖矿T+7结算日期';
COMMENT ON COLUMN content_interactions.interaction_type IS '互动类型: like/bookmark/share/comment/view/rating';