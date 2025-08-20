import { getUserStats } from '../services/userService.js';

export async function handleLearningGoalsCommand(user, session, env) {
  try {
    const stats = await getUserStats(env.DB, user.id);
    
    let message = `🎯 <b>Цели обучения: ${user.first_name}</b>\n\n`;
    
    // Текущий уровень и прогресс
    message += `📊 <b>Текущий статус:</b>\n`;
    message += `• Уровень: ${user.level}\n`;
    message += `• Опыт: ${user.experience_points} XP\n`;
    message += `• Завершено уроков: ${user.total_lessons_completed}\n`;
    message += `• Серия дней: ${user.streak_days}\n\n`;
    
    // Ближайшие цели
    message += `🎯 <b>Ближайшие цели:</b>\n`;
    
    // Цель по урокам
    const nextLessonGoal = Math.ceil(user.total_lessons_completed / 5) * 5;
    if (nextLessonGoal > user.total_lessons_completed) {
      message += `• 📚 Завершить ${nextLessonGoal} уроков (${user.total_lessons_completed}/${nextLessonGoal})\n`;
    }
    
    // Цель по уровню
    const nextLevelXP = user.level * 100;
    const currentLevelXP = (user.level - 1) * 100;
    const progressToNextLevel = user.experience_points - currentLevelXP;
    const xpNeeded = nextLevelXP - user.experience_points;
    
    if (xpNeeded > 0) {
      message += `• 📈 Достичь уровня ${user.level + 1} (+${xpNeeded} XP)\n`;
    }
    
    // Цель по серии дней
    const nextStreakGoal = Math.ceil(user.streak_days / 3) * 3;
    if (nextStreakGoal > user.streak_days) {
      message += `• 🔥 Заниматься ${nextStreakGoal} дней подряд (${user.streak_days}/${nextStreakGoal})\n`;
    }
    
    // Цель по достижениям
    const currentAchievements = stats.achievements?.total_achievements || 0;
    const nextAchievementGoal = Math.ceil(currentAchievements / 5) * 5;
    if (nextAchievementGoal > currentAchievements) {
      message += `• 🏆 Получить ${nextAchievementGoal} достижений (${currentAchievements}/${nextAchievementGoal})\n`;
    }
    
    message += '\n';
    
    // Долгосрочные цели
    message += `🌟 <b>Долгосрочные цели:</b>\n`;
    message += `• 🎓 Достичь уровня 10 (мастер официант)\n`;
    message += `• 💎 Завершить 50 уроков\n`;
    message += `• 🔥 Заниматься 30 дней подряд\n`;
    message += `• 🏆 Получить все 16 достижений\n`;
    message += `• ⭐ Получить 100% за сложный урок\n\n`;
    
    // Рекомендации
    message += `💡 <b>Рекомендации:</b>\n`;
    
    if (user.total_lessons_completed === 0) {
      message += `• Начните с первого урока сегодня!\n`;
      message += `• Установите цель: 1 урок в день\n`;
    } else if (user.total_lessons_completed < 5) {
      message += `• Завершите 5 уроков для первого достижения\n`;
      message += `• Занимайтесь регулярно для увеличения серии\n`;
    } else if (user.total_lessons_completed < 20) {
      message += `• Попробуйте более сложные уроки\n`;
      message += `• Стремитесь к 100% результату\n`;
    } else {
      message += `• Помогите другим ученикам\n`;
      message += `• Попробуйте все категории уроков\n`;
    }
    
    if (user.streak_days < 3) {
      message += `• Занимайтесь ежедневно для увеличения серии\n`;
    }
    
    if (user.experience_points < 100) {
      message += `• Выполняйте больше уроков для получения XP\n`;
    }

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📚 Начать урок', callback_data: 'start_lesson' },
            { text: '📊 Статистика', callback_data: 'detailed_stats' }
          ],
          [
            { text: '🏆 Достижения', callback_data: 'achievements' },
            { text: '🔙 Назад', callback_data: 'profile' }
          ]
        ]
      },
      newSession: { ...session, state: 'learning_goals' }
    };

  } catch (error) {
    console.error('Error in handleLearningGoalsCommand:', error);
    return {
      message: `🎯 <b>Цели обучения: ${user.first_name}</b>\n\n` +
        `❌ Ошибка при загрузке целей обучения.\n\n` +
        `📊 <b>Базовые цели:</b>\n` +
        `• Завершить первый урок\n` +
        `• Достичь уровня 2\n` +
        `• Заниматься 3 дня подряд\n` +
        `• Получить первое достижение\n\n` +
        `💡 Начните с простого урока!`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📚 Начать урок', callback_data: 'start_lesson' },
            { text: '📊 Профиль', callback_data: 'profile' }
          ],
          [
            { text: '🔙 Назад', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: session
    };
  }
}
