export async function handleAboutCommand(user, session, env) {
  const aboutMessage = `
🤖 <b>English for Waiters Bot</b>

<b>О проекте:</b>
Этот бот создан специально для обучения официантов английскому языку с использованием искусственного интеллекта и интерактивных уроков.

<b>👨‍💻 Разработчик:</b>
• <b>Ланиес Максим</b>
• Telegram: @mlanies
• GitHub: <a href="https://github.com/mlanies">mlanies</a>

<b>📋 Заказчик:</b>
• <b>Ланиес Маргарита</b>
• Проект реализован по специальному запросу

<b>🛠️ Технологии:</b>
• Cloudflare Workers
• Cloudflare AI (Llama 2)
• Telegram Bot API
• Cloudflare D1 Database

<b>📚 Возможности:</b>
• 2 типа уроков (текст + выбор ответа)
• 12 категорий обучения
• AI-анализ ответов
• Голосовые сообщения
• Система прогресса и достижений

<b>📄 Лицензия:</b> MIT License

---
<i>Версия: 1.1.0</i>
`;

  return {
    message: aboutMessage,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🏠 Главное меню', callback_data: 'main_menu' },
          { text: '❓ Помощь', callback_data: 'help' }
        ]
      ]
    },
    newSession: { ...session, state: 'main_menu', lastActivity: Date.now() }
  };
}
