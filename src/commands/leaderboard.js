import { createSocialService } from '../services/socialService.js';

export async function handleLeaderboardCommand(user, env) {
  try {
    const socialService = createSocialService(env.DB);
    
    // Получаем рейтинг за все время
    const leaderboard = await socialService.getLeaderboard(10, 'all');
    const userRank = await socialService.getUserRank(user.id);
    
    let message = '🏆 <b>Топ-10 игроков</b>\n\n';
    
    leaderboard.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const name = player.username ? `@${player.username}` : player.first_name;
      
      message += `${medal} <b>${name}</b>\n`;
      message += `   Уровень: ${player.level} | XP: ${player.experience_points}\n`;
      message += `   Уроков: ${player.lessons_completed} | Средний балл: ${Math.round(player.average_score || 0)}\n\n`;
    });
    
    if (userRank) {
      message += `\n📊 <b>Ваша позиция:</b> ${userRank} место`;
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📅 За неделю', callback_data: 'leaderboard_week' },
          { text: '📅 За месяц', callback_data: 'leaderboard_month' }
        ],
        [
          { text: '🏆 Все время', callback_data: 'leaderboard_all' },
          { text: '📊 Мой профиль', callback_data: 'profile' }
        ],
        [
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
    
    return { message, keyboard };
    
  } catch (error) {
    console.error('Error in leaderboard command:', error);
    return {
      message: '❌ Произошла ошибка при загрузке рейтинга. Попробуйте позже.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

export async function handleLeaderboardCallback(user, period, env) {
  try {
    const socialService = createSocialService(env.DB);
    const leaderboard = await socialService.getLeaderboard(10, period);
    
    const periodNames = {
      'week': 'за неделю',
      'month': 'за месяц',
      'all': 'за все время'
    };
    
    let message = `🏆 <b>Топ-10 игроков (${periodNames[period]})</b>\n\n`;
    
    leaderboard.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const name = player.username ? `@${player.username}` : player.first_name;
      
      message += `${medal} <b>${name}</b>\n`;
      message += `   Уровень: ${player.level} | XP: ${player.experience_points}\n`;
      message += `   Уроков: ${player.lessons_completed} | Средний балл: ${Math.round(player.average_score || 0)}\n\n`;
    });
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📅 За неделю', callback_data: 'leaderboard_week' },
          { text: '📅 За месяц', callback_data: 'leaderboard_month' }
        ],
        [
          { text: '🏆 Все время', callback_data: 'leaderboard_all' },
          { text: '📊 Мой профиль', callback_data: 'profile' }
        ],
        [
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
    
    return { message, keyboard };
    
  } catch (error) {
    console.error('Error in leaderboard callback:', error);
    return {
      message: '❌ Произошла ошибка при загрузке рейтинга.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}
