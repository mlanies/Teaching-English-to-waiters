export async function handleAboutCommand(user, session, env) {
  const aboutMessage = `
🤖 **English for Waiters Bot**

**О проекте:**
Этот бот создан специально для обучения официантов английскому языку с использованием искусственного интеллекта и интерактивных уроков.

**👨‍💻 Разработчик:**
• **Ланиес Максим**
• Telegram: @mlanies
• GitHub: [mlanies](https://github.com/mlanies)

**📋 Заказчик:**
• **Ланиес Маргарита**
• Проект реализован по специальному запросу

**🛠️ Технологии:**
• Cloudflare Workers
• Cloudflare AI (Llama 2)
• Telegram Bot API
• Cloudflare D1 Database

**📚 Возможности:**
• 2 типа уроков (текст + выбор ответа)
• 12 категорий обучения
• AI-анализ ответов
• Голосовые сообщения
• Система прогресса и достижений

**📄 Лицензия:** MIT License

---
*Версия: 1.0.3*
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
