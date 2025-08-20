import { getAllLessons } from '../services/lessonData.js';

export async function initializeDatabase(db) {
  try {
    // Проверяем, существует ли таблица users
    const tableExists = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).first();

    if (!tableExists) {
      console.log('Initializing database...');
      
      // Создаем таблицы если они не существуют
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
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
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS lessons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          difficulty_level INTEGER NOT NULL,
          content JSON NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          lesson_id INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          score INTEGER NOT NULL,
          time_spent INTEGER,
          mistakes_count INTEGER DEFAULT 0,
          accuracy_percentage REAL,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (lesson_id) REFERENCES lessons(id),
          UNIQUE(user_id, lesson_id)
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT NOT NULL,
          requirement_type TEXT NOT NULL,
          requirement_value INTEGER NOT NULL,
          experience_reward INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          achievement_id INTEGER NOT NULL,
          earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (achievement_id) REFERENCES achievements(id),
          UNIQUE(user_id, achievement_id)
        )
      `).run();

      await db.prepare(`
        CREATE TABLE IF NOT EXISTS ai_analysis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          lesson_id INTEGER,
          analysis_type TEXT NOT NULL,
          input_text TEXT,
          ai_feedback TEXT,
          score REAL,
          suggestions JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `).run();

      // Создаем индексы
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty_level)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(requirement_type)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id)').run();

      console.log('Database initialized successfully');
    } else {
      console.log('Database already exists');
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function initializeLessonsData(db) {
  try {
    // Проверяем, есть ли уже данные уроков
    const existingLessons = await db.prepare('SELECT COUNT(*) as count FROM lessons').first();
    
    if (existingLessons.count > 0) {
      console.log(`Database already contains ${existingLessons.count} lessons`);
      return;
    }

    console.log('Initializing lessons data...');
    
    // Получаем все уроки из lessonData.js
    const lessons = getAllLessons();
    
    // Вставляем уроки в базу данных
    for (const lesson of lessons) {
      await db.prepare(`
        INSERT INTO lessons (id, title, description, category, difficulty_level, content, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        lesson.id,
        lesson.title,
        lesson.description,
        lesson.category,
        lesson.difficulty_level,
        JSON.stringify(lesson.content),
        1
      ).run();
    }
    
    console.log(`Successfully initialized ${lessons.length} lessons`);
  } catch (error) {
    console.error('Error initializing lessons data:', error);
    throw error;
  }
}
