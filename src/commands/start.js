import { getMainMenuKeyboard } from '../services/lessonService.js';

export async function handleStartCommand(user, session) {
  // Если это новый пользователь, запрашиваем имя
  if (!user.first_name || user.first_name === 'Unknown') {
    return {
      message: `👋 Добро пожаловать в <b>English for Waiters</b>!\n\nЯ помогу вам выучить английский язык для работы официантом.\n\n💡 <i>Разработано: Ланиес Максим | По запросу: Ланиес Маргарита</i>\n\nКак вас зовут?`,
      keyboard: null,
      newSession: { 
        ...session, 
        state: 'waiting_for_name',
        isNewUser: true 
      }
    };
  }

  // Если пользователь уже существует - показываем полное меню
  return {
    message: `👋 С возвращением, <b>${user.first_name}</b>!\n\n🍽️ <b>English for Waiters</b> - ваш персональный помощник в изучении английского для работы официантом.\n\n📊 Ваш уровень: <b>${user.level}</b>\n⭐ Опыт: <b>${user.experience_points}</b> XP\n📚 Завершено уроков: <b>${user.total_lessons_completed}</b>\n\nВыберите действие:`,
    keyboard: getMainMenuKeyboard(),
    newSession: { 
      ...session, 
      state: 'main_menu',
      lastActivity: Date.now()
    }
  };
}
