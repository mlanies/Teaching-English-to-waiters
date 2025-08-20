export async function sendTelegramMessage(botToken, chatId, text, keyboard = null) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      payload.reply_markup = JSON.stringify(keyboard);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

export async function editTelegramMessage(botToken, chatId, messageId, text, keyboard = null) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
    
    const payload = {
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      payload.reply_markup = JSON.stringify(keyboard);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error editing Telegram message:', error);
    throw error;
  }
}

export async function answerCallbackQuery(botToken, callbackQueryId, text = null) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    
    const payload = {
      callback_query_id: callbackQueryId
    };

    if (text) {
      payload.text = text;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error answering callback query:', error);
    throw error;
  }
}

// Отправка голосового сообщения
export async function sendVoice(botToken, chatId, audioBuffer, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendVoice`;
    
    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('chat_id', chatId);
    
    // Создаем Blob из аудио буфера
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('voice', audioBlob, 'pronunciation.ogg');
    
    // Добавляем опциональные параметры
    if (options.caption) {
      formData.append('caption', options.caption);
    }
    
    if (options.parse_mode) {
      formData.append('parse_mode', options.parse_mode);
    }
    
    if (options.title) {
      formData.append('title', options.title);
    }
    
    if (options.performer) {
      formData.append('performer', options.performer);
    }
    
    if (options.duration) {
      formData.append('duration', options.duration);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
}

// Отправка аудио файла
export async function sendAudio(botToken, chatId, audioBuffer, options = {}) {
  try {
    console.log('sendAudio: Audio buffer length:', audioBuffer?.length || 'undefined');
    console.log('sendAudio: Audio buffer type:', typeof audioBuffer);
    
    const url = `https://api.telegram.org/bot${botToken}/sendAudio`;
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    
    // Пробуем разные типы аудио
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('audio', audioBlob, 'pronunciation.ogg');
    
    if (options.caption) {
      formData.append('caption', options.caption);
    }
    
    if (options.parse_mode) {
      formData.append('parse_mode', options.parse_mode);
    }
    
    if (options.title) {
      formData.append('title', options.title);
    }
    
    if (options.performer) {
      formData.append('performer', options.performer);
    }
    
    if (options.duration) {
      formData.append('duration', options.duration);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending audio file:', error);
    throw error;
  }
}

// Отправка документа (для больших аудио файлов)
export async function sendDocument(botToken, chatId, audioBuffer, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    
    const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('document', audioBlob, options.filename || 'pronunciation.ogg');
    
    if (options.caption) {
      formData.append('caption', options.caption);
    }
    
    if (options.parse_mode) {
      formData.append('parse_mode', options.parse_mode);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending document:', error);
    throw error;
  }
}

// Класс для удобной работы с Telegram API
export class TelegramService {
  constructor(botToken) {
    this.botToken = botToken;
  }

  async sendMessage(chatId, text, keyboard = null) {
    return await sendTelegramMessage(this.botToken, chatId, text, keyboard);
  }

  async editMessage(chatId, messageId, text, keyboard = null) {
    return await editTelegramMessage(this.botToken, chatId, messageId, text, keyboard);
  }

  async answerCallback(callbackQueryId, text = null) {
    return await answerCallbackQuery(this.botToken, callbackQueryId, text);
  }

  async sendVoice(chatId, audioBuffer, options = {}) {
    return await sendAudio(this.botToken, chatId, audioBuffer, options);
  }

  async sendAudio(chatId, audioBuffer, options = {}) {
    return await sendAudio(this.botToken, chatId, audioBuffer, options);
  }

  async sendDocument(chatId, audioBuffer, options = {}) {
    return await sendDocument(this.botToken, chatId, audioBuffer, options);
  }
}

export function createTelegramService(botToken) {
  return new TelegramService(botToken);
}
