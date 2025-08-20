import { handleStartCommand } from '../commands/start.js';
import { handleLessonCommand } from '../commands/lesson.js';
import { handleProfileCommand } from '../commands/profile.js';
import { handleAchievementsCommand } from '../commands/achievements.js';
import { handleHelpCommand } from '../commands/help.js';
import { processLessonAnswer, getMainMenuKeyboard } from '../services/lessonService.js';
import { analyzeWithAI } from '../services/aiService.js';

export async function processMessage(text, user, session, env) {
  const lowerText = text.toLowerCase().trim();

  // Обработка команд
  if (lowerText === '/start' || lowerText === 'старт') {
    return await handleStartCommand(user, session);
  }

  if (lowerText === '/profile' || lowerText === 'профиль') {
    return await handleProfileCommand(user, session);
  }

  if (lowerText === '/achievements' || lowerText === 'достижения') {
    return await handleAchievementsCommand(user, session, env);
  }

  if (lowerText === '/help' || lowerText === 'помощь') {
    return await handleHelpCommand(user, session);
  }

  if (lowerText === '/lesson' || lowerText === 'урок') {
    return await handleLessonCommand(user, session, env);
  }

  // Обработка ввода имени для новых пользователей
  if (session && session.state === 'waiting_for_name') {
    return {
      message: `🎉 Приятно познакомиться, <b>${text}</b>!\n\n🍽️ <b>English for Waiters</b> - ваш персональный помощник в изучении английского для работы официантом.\n\n📊 Ваш уровень: <b>1</b>\n⭐ Опыт: <b>0</b> XP\n📚 Завершено уроков: <b>0</b>\n\n🎯 Давайте начнем обучение! Выберите действие:`,
      keyboard: getMainMenuKeyboard(),
      newSession: { 
        ...session, 
        state: 'main_menu',
        lastActivity: Date.now(),
        userName: text
      }
    };
  }

  // Обработка ответов на уроки
  if (session && session.currentLesson) {
    return await processLessonAnswer(text, user, session, env);
  }

  // Обработка обычных сообщений с AI-анализом
  if (text.length > 10) {
    const aiAnalysis = await analyzeWithAI(env.AI, text, user);
    
    return {
      message: `🤖 AI-анализ вашего сообщения:\n\n${aiAnalysis.feedback}\n\n💡 Рекомендации: ${aiAnalysis.suggestions}`,
      keyboard: getMainMenuKeyboard(),
      newSession: { ...session, lastAIInteraction: Date.now() }
    };
  }

  // Дефолтный ответ
  return {
    message: `Привет, ${user.first_name}! 👋\n\nЯ помогу вам выучить английский для работы официантом. Выберите действие:`,
    keyboard: getMainMenuKeyboard(),
    newSession: session || {}
  };
}


