import { handleTelegramWebhook } from './handlers/telegram.js';
import { initializeDatabase } from './database/init.js';
import { setupAchievements } from './achievements/setup.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Инициализация базы данных при первом запуске
      await initializeDatabase(env.DB);
      await setupAchievements(env.DB);

      // Обработка Telegram webhook
      if (request.method === 'POST') {
        return await handleTelegramWebhook(request, env, ctx);
      }

      // Health check
      return new Response('English for Waiters Bot is running! 🍽️', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      console.error('Error in main handler:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
