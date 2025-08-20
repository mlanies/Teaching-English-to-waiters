import { getUserStats } from '../services/userService.js';

export async function handleDetailedStatsCommand(user, session, env) {
  try {
    const stats = await getUserStats(env.DB, user.id);
    
    let message = `📊 <b>Детальная статистика: ${user.first_name}</b>\n\n`;
    
    // Базовая информация
    message += `👤 <b>Основная информация:</b>\n`;
    message += `• ID пользователя: ${user.id}\n`;
    message += `• Telegram ID: ${user.telegram_id}\n`;
    message += `• Имя: ${user.first_name}\n`;
    message += `• Фамилия: ${user.last_name || 'Не указана'}\n`;
    message += `• Username: @${user.username || 'Не указан'}\n`;
    message += `• Язык: ${user.language_code}\n\n`;
    
    // Прогресс обучения
    message += `📚 <b>Прогресс обучения:</b>\n`;
    message += `• Уровень: ${user.level}\n`;
    message += `• Опыт: ${user.experience_points} XP\n`;
    message += `• Завершено уроков: ${user.total_lessons_completed}\n`;
    message += `• Серия дней: ${user.streak_days}\n\n`;
    
    // Детальная статистика уроков
    if (stats.progress) {
      message += `📈 <b>Статистика уроков:</b>\n`;
      message += `• Всего уроков: ${stats.progress.total_lessons || 0}\n`;
      message += `• Средний балл: ${stats.progress.average_score ? Math.round(stats.progress.average_score) : 0}%\n`;
      message += `• Общее время: ${Math.round((stats.progress.total_time || 0) / 60)} мин\n`;
      message += `• Среднее время на урок: ${stats.progress.total_lessons > 0 ? Math.round((stats.progress.total_time || 0) / stats.progress.total_lessons / 60) : 0} мин\n\n`;
    }
    
    // Достижения
    if (stats.achievements) {
      message += `🏆 <b>Достижения:</b>\n`;
      message += `• Получено: ${stats.achievements.total_achievements || 0}\n`;
      message += `• Прогресс: ${Math.round(((stats.achievements.total_achievements || 0) / 16) * 100)}% (16 всего)\n\n`;
    }
    
    // Даты
    message += `📅 <b>Даты:</b>\n`;
    message += `• Регистрация: ${new Date(user.created_at).toLocaleDateString('ru-RU')} ${new Date(user.created_at).toLocaleTimeString('ru-RU')}\n`;
    message += `• Последняя активность: ${new Date(user.last_activity).toLocaleDateString('ru-RU')} ${new Date(user.last_activity).toLocaleTimeString('ru-RU')}\n`;
    message += `• Обновление профиля: ${new Date(user.updated_at).toLocaleDateString('ru-RU')} ${new Date(user.updated_at).toLocaleTimeString('ru-RU')}\n\n`;
    
    // Рекомендации
    message += `💡 <b>Рекомендации:</b>\n`;
    if (user.total_lessons_completed === 0) {
      message += `• Начните с первого урока!\n`;
    } else if (user.total_lessons_completed < 5) {
      message += `• Продолжайте обучение для получения достижений\n`;
    } else if (user.total_lessons_completed < 20) {
      message += `• Отличный прогресс! Попробуйте более сложные уроки\n`;
    } else {
      message += `• Вы опытный ученик! Помогите другим\n`;
    }
    
    if (user.streak_days < 3) {
      message += `• Занимайтесь ежедневно для увеличения серии\n`;
    }

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📊 Профиль', callback_data: 'profile' },
            { text: '🏆 Достижения', callback_data: 'achievements' }
          ],
          [
            { text: '📚 Начать урок', callback_data: 'start_lesson' },
            { text: '🔙 Назад', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: { ...session, state: 'detailed_stats' }
    };

  } catch (error) {
    console.error('Error in handleDetailedStatsCommand:', error);
    return {
      message: `📊 <b>Детальная статистика: ${user.first_name}</b>\n\n` +
        `❌ Ошибка при загрузке детальной статистики.\n\n` +
        `👤 <b>Базовая информация:</b>\n` +
        `• Уровень: ${user.level}\n` +
        `• Опыт: ${user.experience_points} XP\n` +
        `• Завершено уроков: ${user.total_lessons_completed}\n` +
        `• Серия дней: ${user.streak_days}\n\n` +
        `💡 Попробуйте позже или обратитесь к администратору.`,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📊 Профиль', callback_data: 'profile' },
            { text: '🔙 Назад', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: session
    };
  }
}
