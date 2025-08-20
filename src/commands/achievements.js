import { checkAndAwardAchievements } from '../achievements/setup.js';

export async function handleAchievementsCommand(user, session, env) {
  try {
    // Получаем достижения пользователя
    const userAchievements = await env.DB.prepare(`
      SELECT a.*, ua.earned_at 
      FROM achievements a
      INNER JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.earned_at DESC
    `).bind(user.id).all();

    // Получаем все доступные достижения
    const allAchievements = await env.DB.prepare(`
      SELECT * FROM achievements ORDER BY requirement_value ASC
    `).all();

    const earnedIds = userAchievements.results.map(ua => ua.id);
    const unearnedAchievements = allAchievements.results.filter(a => !earnedIds.includes(a.id));

    let message = `🏆 <b>Достижения: ${user.first_name}</b>\n\n`;
    message += `📊 <b>Статистика:</b>\n`;
    message += `• Получено: ${userAchievements.results.length}/${allAchievements.results.length}\n`;
    message += `• Прогресс: ${Math.round((userAchievements.results.length / allAchievements.results.length) * 100)}%\n\n`;

    if (userAchievements.results.length > 0) {
      message += `✅ <b>Полученные достижения:</b>\n`;
      userAchievements.results.slice(0, 5).forEach(achievement => {
        message += `${achievement.icon} <b>${achievement.name}</b>\n`;
        message += `└ ${achievement.description}\n`;
        message += `└ Получено: ${new Date(achievement.earned_at).toLocaleDateString('ru-RU')}\n\n`;
      });

      if (userAchievements.results.length > 5) {
        message += `... и еще ${userAchievements.results.length - 5} достижений\n\n`;
      }
    }

    if (unearnedAchievements.length > 0) {
      message += `🎯 <b>Следующие цели:</b>\n`;
      unearnedAchievements.slice(0, 3).forEach(achievement => {
        message += `${achievement.icon} <b>${achievement.name}</b>\n`;
        message += `└ ${achievement.description}\n`;
        message += `└ Награда: +${achievement.experience_reward} XP\n\n`;
      });
    }

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📊 Все достижения', callback_data: 'all_achievements' },
            { text: '🎯 Цели', callback_data: 'achievement_goals' }
          ],
          [
            { text: '🔙 Назад', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: { ...session, state: 'achievements' }
    };

  } catch (error) {
    console.error('Error in handleAchievementsCommand:', error);
    return {
      message: '❌ Ошибка при загрузке достижений. Попробуйте позже.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      },
      newSession: session
    };
  }
}

export async function handleAllAchievementsCommand(user, session, env) {
  try {
    const allAchievements = await env.DB.prepare(`
      SELECT a.*, 
             CASE WHEN ua.user_id IS NOT NULL THEN 1 ELSE 0 END as earned,
             ua.earned_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY a.requirement_value ASC
    `).bind(user.id).all();

    let message = `🏆 <b>Все достижения</b>\n\n`;

    allAchievements.results.forEach(achievement => {
      const status = achievement.earned ? '✅' : '⏳';
      message += `${status} <b>${achievement.name}</b>\n`;
      message += `└ ${achievement.description}\n`;
      message += `└ Награда: +${achievement.experience_reward} XP\n`;
      
      if (achievement.earned) {
        message += `└ Получено: ${new Date(achievement.earned_at).toLocaleDateString('ru-RU')}\n`;
      }
      message += '\n';
    });

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '🔙 К достижениям', callback_data: 'achievements' },
            { text: '🏠 Главное меню', callback_data: 'back_to_main' }
          ]
        ]
      },
      newSession: { ...session, state: 'all_achievements' }
    };

  } catch (error) {
    console.error('Error in handleAllAchievementsCommand:', error);
    return {
      message: '❌ Ошибка при загрузке всех достижений.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'achievements' }]
        ]
      },
      newSession: session
    };
  }
}
