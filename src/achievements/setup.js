export async function setupAchievements(db) {
  try {
    // Проверяем, есть ли уже достижения в базе
    const achievementsCount = await db.prepare(
      'SELECT COUNT(*) as count FROM achievements'
    ).first();

    if (achievementsCount.count > 0) {
      console.log('Achievements already set up');
      return;
    }

    console.log('Setting up achievements...');

    // Создаем базовые достижения
    const achievements = [
      {
        name: "Первые шаги",
        description: "Завершите свой первый урок",
        icon: "🎯",
        requirement_type: "lessons_completed",
        requirement_value: 1,
        experience_reward: 50
      },
      {
        name: "Начинающий официант",
        description: "Завершите 5 уроков",
        icon: "🍽️",
        requirement_type: "lessons_completed",
        requirement_value: 5,
        experience_reward: 100
      },
      {
        name: "Опытный официант",
        description: "Завершите 20 уроков",
        icon: "👨‍🍳",
        requirement_type: "lessons_completed",
        requirement_value: 20,
        experience_reward: 300
      },
      {
        name: "Мастер сервиса",
        description: "Завершите 50 уроков",
        icon: "🏆",
        requirement_type: "lessons_completed",
        requirement_value: 50,
        experience_reward: 500
      },
      {
        name: "Отличник",
        description: "Получите 100% за урок",
        icon: "⭐",
        requirement_type: "score",
        requirement_value: 100,
        experience_reward: 200
      },
      {
        name: "Быстрый ученик",
        description: "Завершите урок менее чем за 2 минуты",
        icon: "⚡",
        requirement_type: "time_spent",
        requirement_value: 120,
        experience_reward: 150
      },
      {
        name: "Упорный",
        description: "Занимайтесь 3 дня подряд",
        icon: "🔥",
        requirement_type: "streak_days",
        requirement_value: 3,
        experience_reward: 100
      },
      {
        name: "Преданный ученик",
        description: "Занимайтесь 7 дней подряд",
        icon: "💎",
        requirement_type: "streak_days",
        requirement_value: 7,
        experience_reward: 300
      },
      {
        name: "Новичок",
        description: "Достигните 2 уровня",
        icon: "📈",
        requirement_type: "level",
        requirement_value: 2,
        experience_reward: 100
      },
      {
        name: "Продвинутый",
        description: "Достигните 5 уровня",
        icon: "🚀",
        requirement_type: "level",
        requirement_value: 5,
        experience_reward: 400
      },
      {
        name: "Эксперт",
        description: "Достигните 10 уровня",
        icon: "👑",
        requirement_type: "level",
        requirement_value: 10,
        experience_reward: 1000
      },
      {
        name: "Приветливый",
        description: "Завершите все уроки по приветствию",
        icon: "👋",
        requirement_type: "category_completed",
        requirement_value: 1, // greeting category
        experience_reward: 200
      },
      {
        name: "Знаток меню",
        description: "Завершите все уроки по работе с меню",
        icon: "📋",
        requirement_type: "category_completed",
        requirement_value: 2, // menu category
        experience_reward: 200
      },
      {
        name: "Мастер заказов",
        description: "Завершите все уроки по приему заказов",
        icon: "📝",
        requirement_type: "category_completed",
        requirement_value: 3, // ordering category
        experience_reward: 200
      },
      {
        name: "Кассир",
        description: "Завершите все уроки по оплате",
        icon: "💳",
        requirement_type: "category_completed",
        requirement_value: 4, // payment category
        experience_reward: 200
      },
      {
        name: "Спасатель",
        description: "Завершите все уроки по экстренным ситуациям",
        icon: "🚨",
        requirement_type: "category_completed",
        requirement_value: 5, // emergency category
        experience_reward: 200
      }
    ];

    // Добавляем достижения в базу данных
    for (const achievement of achievements) {
      await db.prepare(`
        INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, experience_reward)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        achievement.name,
        achievement.description,
        achievement.icon,
        achievement.requirement_type,
        achievement.requirement_value,
        achievement.experience_reward
      ).run();
    }

    console.log(`Created ${achievements.length} achievements`);
    return true;

  } catch (error) {
    console.error('Error setting up achievements:', error);
    throw error;
  }
}

export async function checkAndAwardAchievements(db, userId, userStats) {
  try {
    // Получаем все достижения
    const achievements = await db.prepare(
      'SELECT * FROM achievements ORDER BY requirement_value ASC'
    ).all();

    // Получаем уже полученные достижения пользователя
    const userAchievements = await db.prepare(`
      SELECT achievement_id FROM user_achievements WHERE user_id = ?
    `).bind(userId).all();

    const earnedAchievementIds = userAchievements.results.map(ua => ua.achievement_id);
    const newAchievements = [];

    for (const achievement of achievements.results) {
      // Пропускаем уже полученные достижения
      if (earnedAchievementIds.includes(achievement.id)) {
        continue;
      }

      let shouldAward = false;

      switch (achievement.requirement_type) {
        case 'lessons_completed':
          shouldAward = userStats.total_lessons_completed >= achievement.requirement_value;
          break;
        case 'level':
          shouldAward = userStats.level >= achievement.requirement_value;
          break;
        case 'streak_days':
          shouldAward = userStats.streak_days >= achievement.requirement_value;
          break;
        case 'score':
          // Для достижений по баллам нужно проверять последний урок
          shouldAward = userStats.last_lesson_score >= achievement.requirement_value;
          break;
        case 'time_spent':
          // Для достижений по времени нужно проверять последний урок
          shouldAward = userStats.last_lesson_time <= achievement.requirement_value;
          break;
      }

      if (shouldAward) {
        // Награждаем достижением
        await db.prepare(`
          INSERT INTO user_achievements (user_id, achievement_id)
          VALUES (?, ?)
        `).bind(userId, achievement.id).run();

        // Добавляем опыт
        await db.prepare(`
          UPDATE users 
          SET experience_points = experience_points + ?
          WHERE id = ?
        `).bind(achievement.experience_reward, userId).run();

        newAchievements.push(achievement);
      }
    }

    return newAchievements;

  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}
