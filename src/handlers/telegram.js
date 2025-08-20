import { processMessage } from '../services/messageProcessor.js';
import { processCallbackData } from '../services/callbackProcessor.js';
import { sendTelegramMessage, answerCallbackQuery } from '../services/telegram.js';
import { getUserOrCreate } from '../services/userService.js';
import { getSession, updateSession } from '../services/sessionService.js';

export async function handleTelegramWebhook(request, env, ctx) {
  try {
    const update = await request.json();
    
    // Обрабатываем callback query
    if (update.callback_query) {
      return await handleCallbackQuery(update.callback_query, env);
    }
    
    // Проверяем, что это сообщение от пользователя
    if (!update.message) {
      return new Response('OK', { status: 200 });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text || '';
    const username = message.from.username;
    const firstName = message.from.first_name;
    const lastName = message.from.last_name;

    // Получаем или создаем пользователя
    const user = await getUserOrCreate(env.DB, {
      telegram_id: userId,
      username,
      first_name: firstName,
      last_name: lastName
    });

    // Получаем текущую сессию пользователя
    const session = await getSession(env.USER_SESSIONS, userId);

    // Обрабатываем сообщение
    const response = await processMessage(text, user, session, env);

    // Обновляем сессию
    await updateSession(env.USER_SESSIONS, userId, response.newSession);

    // Отправляем ответ
    await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, response.message, response.keyboard);

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return new Response('Error', { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery, env) {
  try {
    const { id, from, data, message } = callbackQuery;
    const userId = from.id;
    const chatId = message.chat.id;
    
    // Отвечаем на callback query
    await answerCallbackQuery(env.TELEGRAM_BOT_TOKEN, id, 'Обрабатываем...');
    
    // Получаем пользователя
    const user = await getUserOrCreate(env.DB, {
      telegram_id: userId,
      username: from.username,
      first_name: from.first_name,
      last_name: from.last_name
    });
    
    // Получаем сессию
    const session = await getSession(env.USER_SESSIONS, userId);
    
    // Обрабатываем callback data
    const response = await processCallbackData(data, user, session, env);
    
    // Обновляем сессию
    await updateSession(env.USER_SESSIONS, userId, response.newSession);
    
    // Отправляем ответ
    await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, response.message, response.keyboard);
    
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Error handling callback query:', error);
    return new Response('Error', { status: 500 });
  }
}
