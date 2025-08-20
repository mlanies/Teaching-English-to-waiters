import { handleStartCommand } from '../commands/start.js';
import { handleLessonCommand } from '../commands/lesson.js';
import { handleProfileCommand } from '../commands/profile.js';
import { handleAchievementsCommand } from '../commands/achievements.js';
import { handleHelpCommand } from '../commands/help.js';
import { processLessonAnswer } from '../services/lessonService.js';
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

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📚 Начать урок', callback_data: 'start_lesson' },
        { text: '📊 Мой профиль', callback_data: 'profile' }
      ],
      [
        { text: '🏆 Достижения', callback_data: 'achievements' },
        { text: '❓ Помощь', callback_data: 'help' }
      ]
    ]
  };
}
