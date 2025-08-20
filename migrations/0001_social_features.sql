-- Миграция для социальных функций

-- Таблица соревнований
CREATE TABLE competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    rules JSON,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Участники соревнований
CREATE TABLE competition_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    UNIQUE(user_id, competition_id)
);

-- Группы обучения
CREATE TABLE study_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    max_members INTEGER DEFAULT 10,
    category TEXT, -- категория уроков для группы
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Участники групп
CREATE TABLE study_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member', -- 'member', 'admin'
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES study_groups(id),
    UNIQUE(user_id, group_id)
);

-- Сообщения в группах
CREATE TABLE group_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Друзья пользователей
CREATE TABLE user_friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
);

-- Уведомления
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'competition', 'group', 'friend', 'achievement'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- дополнительные данные
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Индексы для оптимизации
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX idx_study_groups_category ON study_groups(category);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_sent ON group_messages(sent_at);
CREATE INDEX idx_user_friends_user ON user_friends(user_id);
CREATE INDEX idx_user_friends_status ON user_friends(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Вставка тестовых данных

-- Тестовые соревнования
INSERT INTO competitions (name, description, start_date, end_date, rules, status) VALUES
('Неделя английского', 'Соревнование за лучший результат в изучении английского за неделю', 
 datetime('now', '+1 day'), datetime('now', '+8 days'), 
 '{"max_lessons": 20, "min_score": 70}', 'active'),
('Мастер меню', 'Соревнование по изучению работы с меню', 
 datetime('now', '+2 days'), datetime('now', '+15 days'), 
 '{"category": "menu", "min_lessons": 5}', 'active');

-- Тестовые группы
INSERT INTO study_groups (name, description, max_members, category) VALUES
('Начинающие официанты', 'Группа для новичков в ресторанном бизнесе', 15, 'greeting'),
('Мастера Fine Dining', 'Группа для опытных официантов высокой кухни', 10, 'fine_dining'),
('Бармены', 'Группа для изучения барного обслуживания', 12, 'bar_service'),
('Fast Food Heroes', 'Группа для быстрого обслуживания', 20, 'fast_food');
