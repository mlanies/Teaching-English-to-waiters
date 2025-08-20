// Функции безопасности и валидации

export function validateTelegramWebhook(request, secret) {
  const signature = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  return signature === secret;
}

export function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Удаляем потенциально опасные символы
  return text
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Ограничиваем длину
}

export function validateUserData(userData) {
  const required = ['telegram_id', 'first_name'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return {
    telegram_id: parseInt(userData.telegram_id),
    username: userData.username || null,
    first_name: sanitizeInput(userData.first_name),
    last_name: userData.last_name ? sanitizeInput(userData.last_name) : null,
    language_code: userData.language_code || 'ru'
  };
}

export function rateLimit(userId, action, env) {
  const key = `rate_limit:${userId}:${action}`;
  const limit = 10; // 10 запросов
  const window = 60; // за 60 секунд
  
  // Здесь должна быть логика проверки rate limit через KV
  // Пока возвращаем true для совместимости
  return true;
}

export function logSecurityEvent(event, userId, details = {}) {
  console.log(`[SECURITY] ${event} - User: ${userId} - ${JSON.stringify(details)}`);
}
