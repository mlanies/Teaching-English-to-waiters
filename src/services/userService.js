export async function getUserOrCreate(db, userData) {
  try {
    // Пытаемся найти существующего пользователя
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE telegram_id = ?'
    ).bind(userData.telegram_id).first();

    if (existingUser) {
      // Обновляем время последней активности
      await db.prepare(`
        UPDATE users 
        SET last_activity = CURRENT_TIMESTAMP, 
            username = ?, 
            first_name = ?, 
            last_name = ?
        WHERE telegram_id = ?
      `).bind(
        userData.username,
        userData.first_name,
        userData.last_name,
        userData.telegram_id
      ).run();

      return existingUser;
    }

    // Создаем нового пользователя
    const result = await db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, last_name, language_code)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      userData.telegram_id,
      userData.username,
      userData.first_name,
      userData.last_name,
      userData.language_code || 'ru'
    ).run();

    return {
      id: result.meta.last_row_id,
      telegram_id: userData.telegram_id,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      language_code: userData.language_code || 'ru',
      level: 1,
      experience_points: 0,
      total_lessons_completed: 0,
      streak_days: 0
    };

  } catch (error) {
    console.error('Error in getUserOrCreate:', error);
    throw error;
  }
}

export async function updateUserProgress(db, userId, lessonId, score, timeSpent, mistakesCount) {
  try {
    // Проверяем, существует ли урок в базе данных
    const lessonExists = await db.prepare(`
      SELECT id FROM lessons WHERE id = ?
    `).bind(lessonId).first();

    if (!lessonExists) {
      console.log(`Lesson ${lessonId} not found in database, skipping FOREIGN KEY constraint`);
      // Просто обновляем статистику пользователя без сохранения прогресса
      await db.prepare(`
        UPDATE users 
        SET total_lessons_completed = total_lessons_completed + 1,
            experience_points = experience_points + ?,
            level = (experience_points + ?) / 100 + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(score, score, userId).run();
      
      return true;
    }

    // Добавляем запись о прогрессе
    await db.prepare(`
      INSERT OR REPLACE INTO progress (user_id, lesson_id, score, time_spent, mistakes_count, accuracy_percentage)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, lessonId, score, timeSpent, mistakesCount, (100 - mistakesCount * 10)).run();

    // Обновляем статистику пользователя
    await db.prepare(`
      UPDATE users 
      SET total_lessons_completed = total_lessons_completed + 1,
          experience_points = experience_points + ?,
          level = (experience_points + ?) / 100 + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(score, score, userId).run();

    return true;
  } catch (error) {
    console.error('Error in updateUserProgress:', error);
    throw error;
  }
}

export async function getUserStats(db, userId) {
  try {
    // Проверяем, что db - это объект D1
    if (!db || typeof db.prepare !== 'function') {
      console.error('Invalid database object:', typeof db);
      throw new Error('Database not available');
    }

    const user = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    const progress = await db.prepare(`
      SELECT COUNT(*) as total_lessons,
             AVG(score) as average_score,
             SUM(time_spent) as total_time
      FROM progress 
      WHERE user_id = ?
    `).bind(userId).first();

    const achievements = await db.prepare(`
      SELECT COUNT(*) as total_achievements
      FROM user_achievements 
      WHERE user_id = ?
    `).bind(userId).first();

    return {
      user,
      progress: progress || { total_lessons: 0, average_score: 0, total_time: 0 },
      achievements: achievements || { total_achievements: 0 }
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    // Возвращаем базовые данные в случае ошибки
    return {
      user: null,
      progress: { total_lessons: 0, average_score: 0, total_time: 0 },
      achievements: { total_achievements: 0 }
    };
  }
}
