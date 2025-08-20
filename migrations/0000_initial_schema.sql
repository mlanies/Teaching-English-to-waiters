-- Users table - профили пользователей
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    language_code TEXT DEFAULT 'ru',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    preferences JSON
);

-- Lessons table - уроки и задания
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'greeting', 'menu', 'ordering', 'payment', 'emergency'
    difficulty_level INTEGER NOT NULL, -- 1-5
    content JSON NOT NULL, -- структурированный контент урока
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Progress table - прогресс обучения
CREATE TABLE progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL, -- 0-100
    time_spent INTEGER, -- в секундах
    mistakes_count INTEGER DEFAULT 0,
    accuracy_percentage REAL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    UNIQUE(user_id, lesson_id)
);

-- Achievements table - система достижений
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL, -- 'lessons_completed', 'streak_days', 'score', 'level'
    requirement_value INTEGER NOT NULL,
    experience_reward INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements table - достижения пользователей
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
);

-- AI Analysis table - результаты AI-анализа
CREATE TABLE ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER,
    analysis_type TEXT NOT NULL, -- 'response_quality', 'pronunciation', 'grammar', 'vocabulary'
    input_text TEXT,
    ai_feedback TEXT,
    score REAL,
    suggestions JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- User Sessions table - активные сессии
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_data JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Индексы для оптимизации
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_lessons_category ON lessons(category);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty_level);
CREATE INDEX idx_achievements_type ON achievements(requirement_type);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
