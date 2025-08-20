export async function handleStartCommand(user, session) {
  // Если это новый пользователь, запрашиваем имя
  if (!user.first_name || user.first_name === 'Unknown') {
    return {
      message: `👋 Добро пожаловать в <b>English for Waiters</b>!\n\nЯ помогу вам выучить английский язык для работы официантом.\n\nКак вас зовут?`,
      keyboard: null,
      newSession: { 
        ...session, 
        state: 'waiting_for_name',
        isNewUser: true 
      }
    };
  }

  // Если пользователь уже существует
  return {
    message: `👋 С возвращением, <b>${user.first_name}</b>!\n\n🍽️ <b>English for Waiters</b> - ваш персональный помощник в изучении английского для работы официантом.\n\n📊 Ваш уровень: <b>${user.level}</b>\n⭐ Опыт: <b>${user.experience_points}</b> XP\n📚 Завершено уроков: <b>${user.total_lessons_completed}</b>\n\nВыберите действие:`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '📚 Начать урок', callback_data: 'start_lesson' },
          { text: '📊 Мой профиль', callback_data: 'profile' }
        ],
        [
          { text: '🏆 Достижения', callback_data: 'achievements' },
          { text: '❓ Помощь', callback_data: 'help' }
        ],
        [
          { text: '🎯 Ежедневная цель', callback_data: 'daily_goal' }
        ]
      ]
    },
    newSession: { 
      ...session, 
      state: 'main_menu',
      lastActivity: Date.now()
    }
  };
}
