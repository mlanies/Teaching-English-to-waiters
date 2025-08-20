// TTS Service для Deepgram API в Cloudflare Workers
// Использует секреты для API ключа

// Функция для подготовки текста к синтезу (исправляет проблему с проглатыванием слов)
function prepareTextForTTS(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let prepared = text.trim();
  
  // Добавляем паузы для лучшего произношения
  prepared = prepared
    // Паузы после запятых
    .replace(/,/g, ', ...')
    // Паузы после двоеточий
    .replace(/:/g, ': ...')
    // Паузы после точек с запятой
    .replace(/;/g, '; ...')
    // Паузы в конце предложений
    .replace(/\./g, '...')
    .replace(/!/g, '...!')
    .replace(/\?/g, '...?')
    // Убираем лишние пробелы
    .replace(/\s+/g, ' ')
    .trim();

  // Добавляем финальную паузу, если её нет
  if (!prepared.endsWith('...')) {
    prepared += '...';
  }

  return prepared;
}

// Основная функция синтеза речи через Deepgram API
export async function synthesizeSpeech(text, options = {}) {
  const {
    voice = "nova",
    model = "aura-asteria-en",
    env = null // Добавляем параметр env
  } = options;

  try {
    // Проверяем наличие API ключа
    const apiKey = env?.DEEPGRAM_API_KEY || globalThis.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY не найден в секретах');
    }
    
    // Проверяем наличие Telegram токена
    const telegramToken = env?.TELEGRAM_BOT_TOKEN || globalThis.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не найден в секретах');
    }

    // Подготавливаем текст
    const preparedText = prepareTextForTTS(text);
    
    console.log(`🎤 Синтезируем: "${text}"`);
    console.log(`📝 Подготовленный текст: "${preparedText}"`);
    console.log(`🎭 Голос: ${voice}`);

    // Вызываем Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/speak', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: preparedText
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
    }

    // Получаем аудио данные
    const audioBuffer = await response.arrayBuffer();
    
    console.log(`✅ Аудио синтезировано: ${(audioBuffer.byteLength / 1024).toFixed(2)} KB`);

    return {
      success: true,
      buffer: audioBuffer,
      size: audioBuffer.byteLength,
      contentType: response.headers.get('content-type') || 'audio/mpeg'
    };

  } catch (error) {
    console.error(`❌ Ошибка при синтезе "${text}":`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Функция для отправки аудио в Telegram
export async function sendAudioToTelegram(chatId, audioBuffer, caption = '', options = {}) {
  try {
    const {
      filename = 'speech.mp3',
      contentType = 'audio/mpeg',
      env = null // Добавляем параметр env
    } = options;

    // Создаем FormData для отправки файла
    const formData = new FormData();
    
    // Создаем Blob из ArrayBuffer
    const audioBlob = new Blob([audioBuffer], { type: contentType });
    
    // Добавляем файл в FormData для audio
    formData.append('audio', audioBlob, filename);
    formData.append('chat_id', chatId);
    
    if (caption) {
      formData.append('caption', caption);
      // Добавляем поддержку HTML-форматирования
      formData.append('parse_mode', 'HTML');
    }

    // Отправляем в Telegram
    const telegramToken = env?.TELEGRAM_BOT_TOKEN || globalThis.TELEGRAM_BOT_TOKEN;
    
    console.log(`📤 Отправляем аудио в Telegram:`);
    console.log(`   - Chat ID: ${chatId}`);
    console.log(`   - Filename: ${filename}`);
    console.log(`   - Content-Type: ${contentType}`);
    console.log(`   - Size: ${(audioBuffer.byteLength / 1024).toFixed(2)} KB`);
    console.log(`   - Token: ${telegramToken ? '✅ Найден' : '❌ Не найден'}`);
    
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendAudio`, {
      method: 'POST',
      body: formData
    });

    console.log(`📡 Telegram API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Telegram API Error Response: ${errorText}`);
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Аудио отправлено в Telegram: ${result.ok ? 'успешно' : 'ошибка'}`);
    
    return {
      success: true,
      messageId: result.ok ? result.result.message_id : null
    };

  } catch (error) {
    console.error(`❌ Ошибка отправки аудио в Telegram:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Комбинированная функция: синтез + отправка
export async function synthesizeAndSendSpeech(chatId, text, options = {}) {
  const {
    voice = "nova",
    caption = '',
    filename = 'speech.mp3',
    env = null // Добавляем параметр env
  } = options;

  try {
    // Синтезируем речь
    const synthesisResult = await synthesizeSpeech(text, { voice, env });
    
    if (!synthesisResult.success) {
      return {
        success: false,
        error: synthesisResult.error
      };
    }

    // Пытаемся отправить как аудио файл
    let sendResult = await sendAudioToTelegram(chatId, synthesisResult.buffer, caption, {
      filename,
      contentType: synthesisResult.contentType,
      env: env
    });

    // Если не получилось, пробуем как голосовое сообщение
    if (!sendResult.success) {
      console.log(`⚠️ Попытка отправки как аудио не удалась, пробуем как голосовое сообщение...`);
      
      sendResult = await sendVoiceToTelegram(chatId, synthesisResult.buffer, caption, {
        filename: 'voice.ogg',
        contentType: 'audio/ogg',
        env: env
      });
    }

    return {
      success: sendResult.success,
      error: sendResult.error,
      size: synthesisResult.size
    };

  } catch (error) {
    console.error(`❌ Ошибка в synthesizeAndSendSpeech:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Функция для отправки голосового сообщения в Telegram (альтернатива sendAudio)
export async function sendVoiceToTelegram(chatId, audioBuffer, caption = '', options = {}) {
  try {
    const {
      filename = 'voice.ogg',
      contentType = 'audio/ogg',
      env = null
    } = options;

    // Создаем FormData для отправки голосового сообщения
    const formData = new FormData();
    
    // Создаем Blob из ArrayBuffer
    const audioBlob = new Blob([audioBuffer], { type: contentType });
    
    // Добавляем файл в FormData для voice
    formData.append('voice', audioBlob, filename);
    formData.append('chat_id', chatId);
    
    if (caption) {
      formData.append('caption', caption);
      // Добавляем поддержку HTML-форматирования
      formData.append('parse_mode', 'HTML');
    }

    // Отправляем в Telegram
    const telegramToken = env?.TELEGRAM_BOT_TOKEN || globalThis.TELEGRAM_BOT_TOKEN;
    
    console.log(`📤 Отправляем голосовое сообщение в Telegram:`);
    console.log(`   - Chat ID: ${chatId}`);
    console.log(`   - Filename: ${filename}`);
    console.log(`   - Content-Type: ${contentType}`);
    console.log(`   - Size: ${(audioBuffer.byteLength / 1024).toFixed(2)} KB`);
    
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendVoice`, {
      method: 'POST',
      body: formData
    });

    console.log(`📡 Telegram API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Telegram API Error Response: ${errorText}`);
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Голосовое сообщение отправлено в Telegram: ${result.ok ? 'успешно' : 'ошибка'}`);
    
    return {
      success: true,
      messageId: result.ok ? result.result.message_id : null
    };

  } catch (error) {
    console.error(`❌ Ошибка отправки голосового сообщения в Telegram:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Функция для создания кнопки "Озвучить"
export function createVoiceButton(text, callbackData = null) {
  return {
    text: '🔊 Озвучить',
    callback_data: callbackData || `voice_${btoa(text).slice(0, 20)}` // Кодируем текст для callback_data
  };
}

// Функция для обработки callback данных кнопки "Озвучить"
export function parseVoiceCallback(callbackData) {
  if (callbackData.startsWith('voice_')) {
    const encodedText = callbackData.slice(6); // Убираем 'voice_'
    try {
      const text = atob(encodedText); // Декодируем текст
      return { type: 'voice', text };
    } catch (error) {
      console.error('Ошибка декодирования текста для озвучивания:', error);
      return null;
    }
  }
  return null;
}
