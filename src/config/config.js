// Конфигурация приложения

export const config = {
  // Настройки бота
  bot: {
    name: 'English for Waiters Bot',
    version: '1.0.0',
    maxMessageLength: 4096,
    maxInlineKeyboardButtons: 8
  },

  // Настройки обучения
  learning: {
    maxLessonsPerDay: 10,
    experiencePerLesson: 10,
    levelUpThreshold: 100,
    streakBonus: 5,
    minScoreForLevelUp: 80
  },

  // Настройки AI
  ai: {
    model: '@cf/meta/llama-3.1-8b-instruct',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000
  },

  // Настройки кэширования
  cache: {
    lessonTTL: 7200, // 2 часа
    userTTL: 1800,   // 30 минут
    aiTTL: 3600      // 1 час
  },

  // Настройки безопасности
  security: {
    maxRequestsPerMinute: 10,
    maxTextLength: 1000,
    allowedCommands: ['start', 'help', 'profile', 'lesson', 'achievements', 'stats']
  },

  // Настройки базы данных
  database: {
    maxConnections: 10,
    queryTimeout: 5000
  },

  // Настройки уведомлений
  notifications: {
    dailyReminder: true,
    achievementNotification: true,
    levelUpNotification: true
  }
};

export function getConfig(env) {
  return {
    ...config,
    env: {
      NODE_ENV: env.NODE_ENV || 'production',
      DEBUG: env.DEBUG === 'true',
      LOG_LEVEL: env.LOG_LEVEL || 'info'
    }
  };
}
