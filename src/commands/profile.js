import { getUserStats } from '../services/userService.js';

export async function handleProfileCommand(user, session, env) {
  try {
    const stats = await getUserStats(env.DB, user.id);
    
    // Проверяем, что получили данные пользователя
    if (!stats.user) {
      return {
        message: `👤 <b>Профиль: ${user.first_name}</b>\n\n` +
          `📊 <b>Базовая информация:</b>\n` +
          `• Уровень: ${user.level}\n` +
          `• Опыт: ${user.experience_points} XP\n` +
          `• Завершено уроков: ${user.total_lessons_completed}\n` +
          `• Серия дней: ${user.streak_days}\n\n` +
          `📅 Дата регистрации: ${new Date(user.created_at).toLocaleDateString('ru-RU')}\n` +
          `🕐 Последняя активность: ${new Date(user.last_activity).toLocaleDateString('ru-RU')}\n\n` +
          `💡 <i>Детальная статистика временно недоступна</i>`,
        keyboard: {
          inline_keyboard: [
            [
              { text: '📈 Детальная статистика', callback_data: 'detailed_stats' },
              { text: '🎯 Цели обучения', callback_data: 'learning_goals' }
            ],
            [
              { text: '🔙 Назад', callback_data: 'back_to_main' }
            ]
          ]
        },
        newSession: { ...session, state: 'profile' }
      };
    }
    
    const message = `👤 <b>Профиль: ${user.first_name}</b>\n\n` +
      `📊 <b>Статистика:</b>\n` +
      `• Уровень: ${user.level}\n` +
      `• Опыт: ${user.experience_points} XP\n` +
      `• Завершено уроков: ${user.total_lessons_completed}\n` +
      `• Средний балл: ${stats.progress.average_score ? Math.round(stats.progress.average_score) : 0}%\n` +
      `• Общее время обучения: ${Math.round((stats.progress.total_time || 0) / 60)} мин\n` +
      `• Достижений: ${stats.achievements.total_achievements}\n` +
      `• Серия дней: ${user.streak_days}\n\n` +
      `📅 Дата регистрации: ${new Date(user.created_at).toLocaleDateString('ru-RU')}\n` +
      `🕐 Последняя активность: ${new Date(user.last_activity).toLocaleDateString('ru-RU')}`;

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📈 Детальная статистика', callback_data: 'detailed_stats' },
            { text: '🎯 Цели обучения', callback_data: 'learning_goals' }
          ],
          [
            { text: '🔙 Назад', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: { ...session, state: 'profile' }
    };
  } catch (error) {
    console.error('Error in handleProfileCommand:', error);
    return {
      message: `👤 <b>Профиль: ${user.first_name}</b>\n\n` +
        `📊 <b>Базовая информация:</b>\n` +
        `• Уровень: ${user.level}\n` +
        `• Опыт: ${user.experience_points} XP\n` +
        `• Завершено уроков: ${user.total_lessons_completed}\n` +
        `• Серия дней: ${user.streak_days}\n\n` +
        `💡 <i>Детальная статистика временно недоступна</i>`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📈 Детальная статистика', callback_data: 'detailed_stats' },
            { text: '🎯 Цели обучения', callback_data: 'learning_goals' }
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
