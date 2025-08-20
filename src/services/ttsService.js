// Сервис озвучивания текста (Text-to-Speech) с отправкой в Telegram

export class TTSService {
  constructor(ai, telegramService) {
    this.ai = ai;
    this.telegram = telegramService;
  }

  // Озвучивание английского текста и отправка в Telegram
  async speakEnglishAndSend(chatId, text, caption = null) {
    try {
      console.log('TTS: Generating audio for text:', text);
      
      // Используем простой текст для тестирования
      const testText = text.length > 50 ? text.substring(0, 50) + '...' : text;
      console.log('TTS: Using test text:', testText);
      
      // Пробуем разные TTS модели
      let response;
      try {
        console.log('TTS: Trying MeloTTS model...');
        response = await this.ai.run('@cf/myshell-ai/melotts', {
          prompt: testText,
          lang: 'en'
        });
      } catch (error) {
        console.log('TTS: MeloTTS failed, trying OpenAI TTS...');
        response = await this.ai.run('@cf/openai/tts-1', {
          text: testText,
          voice: 'alloy'
        });
      }

      console.log('TTS: Response received, type:', typeof response);
      console.log('TTS: Response keys:', Object.keys(response || {}));
      console.log('TTS: Response is array:', Array.isArray(response));
      console.log('TTS: Response length:', response?.length || 'undefined');
      
      if (Array.isArray(response)) {
        console.log('TTS: Array elements:', response.length);
        response.forEach((item, index) => {
          console.log(`TTS: Element ${index} type:`, typeof item);
          console.log(`TTS: Element ${index} length:`, item?.length || 'undefined');
        });
      }

      // Проверяем, что получили валидные данные
      if (!response) {
        throw new Error('Empty audio response from TTS model');
      }

      // MeloTTS возвращает объект с аудио данными
      const audioData = response[0] || response; // Берем первый элемент или сам объект
      
      if (!audioData) {
        throw new Error('No audio data in TTS response');
      }

      console.log('TTS: Audio data type:', typeof audioData);
      console.log('TTS: Audio data length:', audioData?.length || 'undefined');
      console.log('TTS: Audio data constructor:', audioData?.constructor?.name);
      
      // Проверяем, что это действительно буфер или ArrayBuffer
      if (audioData instanceof ArrayBuffer) {
        console.log('TTS: Audio data is ArrayBuffer, converting to Uint8Array');
        const uint8Array = new Uint8Array(audioData);
        console.log('TTS: Uint8Array length:', uint8Array.length);
        console.log('TTS: First 10 bytes:', Array.from(uint8Array.slice(0, 10)));
      }

      // Отправляем аудио файл как документ (обходит ограничения voice)
      const audioResult = await this.telegram.sendDocument(chatId, audioData, {
        caption: caption || `🔊 "${text}"`,
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        lang: 'en',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  // Озвучивание с медленной скоростью для обучения
  async speakSlowlyAndSend(chatId, text, caption = null) {
    try {
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: text,
        lang: 'en' // Медленнее для лучшего понимания
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: caption || `🐌 Медленно: "${text}"`,
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        lang: 'en',
        speed: 'slow',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in slow TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  // Озвучивание с произношением по слогам
  async speakWithPronunciationAndSend(chatId, text, caption = null) {
    try {
      // Добавляем паузы для лучшего произношения
      const words = text.split(' ');
      const slowText = words.join(' ... ');
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: slowText,
        lang: 'en'
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: caption || `📖 По слогам: "${text}"`,
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        slowText: slowText,
        lang: 'en',
        speed: 'pronunciation',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in pronunciation TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  // Озвучивание диалога
  async speakDialogueAndSend(chatId, dialogue, caption = null) {
    try {
      const fullText = Array.isArray(dialogue) ? dialogue.join('\n\n') : dialogue;
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: fullText,
        lang: 'en'
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: caption || `💬 Диалог: "${fullText.substring(0, 100)}..."`,
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: fullText,
        lang: 'en',
        type: 'dialogue',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in dialogue TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: dialogue
      };
    }
  }

  // Озвучивание примера с переводом
  async speakExampleAndSend(chatId, example) {
    try {
      let textToSpeak = '';
      let caption = '';
      
      if (Array.isArray(example.english)) {
        // Для диалогов
        textToSpeak = example.english.join('\n\n');
        caption = `💬 ${example.title}\n\n🇷🇺 ${example.russian.join('\n')}\n\n🇺🇸 ${example.english.join('\n')}`;
      } else {
        // Для одиночных фраз
        textToSpeak = example.english;
        caption = `📚 ${example.title}\n\n🇷🇺 ${example.russian}\n\n🇺🇸 ${example.english}\n\n📝 ${example.context}`;
      }

      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: textToSpeak,
        lang: 'en'
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: caption,
        title: example.title,
        performer: 'English for Waiters'
      });

      return {
        success: true,
        audio: response,
        prompt: textToSpeak,
        russian: example.russian,
        conprompt: example.context,
        lang: 'en',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in example TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: example.english
      };
    }
  }

  // Озвучивание с повторением
  async speakWithRepeatAndSend(chatId, text, repeatCount = 2) {
    try {
      const repeatedText = Array(repeatCount).fill(text).join('\n\n');
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: repeatedText,
        lang: 'en'
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: `🔄 Повторение (${repeatCount}x): "${text}"`,
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        repeatedText: repeatedText,
        lang: 'en',
        repeatCount: repeatCount,
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in repeat TTS and send:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  // Озвучивание урока с AI-анализом
  async speakLessonWithAnalysis(chatId, question, userAnswer, aiAnalysis) {
    try {
      let textToSpeak = '';
      let caption = '';

      if (aiAnalysis.correct_answer) {
        textToSpeak = `Correct answer: ${aiAnalysis.correct_answer}. Your answer: ${userAnswer}`;
        caption = `📝 <b>Анализ ответа</b>\n\n` +
          `❓ <b>Вопрос:</b> ${question.text}\n\n` +
          `✅ <b>Правильный ответ:</b> ${aiAnalysis.correct_answer}\n` +
          `💬 <b>Ваш ответ:</b> ${userAnswer}\n\n` +
          `📊 <b>Оценка:</b> ${Math.round(aiAnalysis.score * 100)}%\n` +
          `💡 <b>Объяснение:</b> ${aiAnalysis.explanation}`;
      } else {
        textToSpeak = `Question: ${question.text}. Your answer: ${userAnswer}`;
        caption = `📝 <b>Анализ ответа</b>\n\n` +
          `❓ <b>Вопрос:</b> ${question.text}\n\n` +
          `💬 <b>Ваш ответ:</b> ${userAnswer}\n\n` +
          `📊 <b>Оценка:</b> ${Math.round(aiAnalysis.score * 100)}%\n` +
          `💡 <b>Рекомендации:</b> ${aiAnalysis.suggestions}`;
      }

      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: textToSpeak,
        lang: 'en'
      });

      const audioResult = await this.telegram.sendDocument(chatId, response[0] || response, {
        caption: caption,
        parse_mode: 'HTML',
        filename: 'pronunciation.mp3'
      });

      return {
        success: true,
        audio: response,
        prompt: textToSpeak,
        lang: 'en',
        telegramResult: audioResult
      };
    } catch (error) {
      console.error('Error in lesson TTS and send:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }



  // Старые методы для совместимости (без отправки)
  async speakEnglish(text) {
    try {
      // Используем простой текст для тестирования
      const testText = text.length > 50 ? text.substring(0, 50) + '...' : text;
      console.log('TTS: Using test text:', testText);
      
      // Пробуем разные TTS модели
      let response;
      try {
        console.log('TTS: Trying MeloTTS model...');
        response = await this.ai.run('@cf/myshell-ai/melotts', {
          prompt: testText,
          lang: 'en'
        });
      } catch (error) {
        console.log('TTS: MeloTTS failed, trying OpenAI TTS...');
        response = await this.ai.run('@cf/openai/tts-1', {
          text: testText,
          voice: 'alloy'
        });
      }

      return {
        success: true,
        audio: response,
        prompt: text,
        lang: 'en'
      };
    } catch (error) {
      console.error('Error in TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  async speakSlowly(text) {
    try {
      // Используем простой текст для тестирования
      const testText = text.length > 50 ? text.substring(0, 50) + '...' : text;
      console.log('TTS: Using test text:', testText);
      
      // Пробуем разные TTS модели
      let response;
      try {
        console.log('TTS: Trying MeloTTS model...');
        response = await this.ai.run('@cf/myshell-ai/melotts', {
          prompt: testText,
          lang: 'en'
        });
      } catch (error) {
        console.log('TTS: MeloTTS failed, trying OpenAI TTS...');
        response = await this.ai.run('@cf/openai/tts-1', {
          text: testText,
          voice: 'alloy'
        });
      }

      return {
        success: true,
        audio: response,
        prompt: text,
        lang: 'en',
        speed: 'slow'
      };
    } catch (error) {
      console.error('Error in slow TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  async speakWithPronunciation(text) {
    try {
      const words = text.split(' ');
      const slowText = words.join(' ... ');
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: slowText,
        lang: 'en'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        slowText: slowText,
        lang: 'en',
        speed: 'pronunciation'
      };
    } catch (error) {
      console.error('Error in pronunciation TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }

  async speakDialogue(dialogue) {
    try {
      const fullText = Array.isArray(dialogue) ? dialogue.join('\n\n') : dialogue;
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: fullText,
        lang: 'en'
      });

      return {
        success: true,
        audio: response,
        prompt: fullText,
        lang: 'en',
        type: 'dialogue'
      };
    } catch (error) {
      console.error('Error in dialogue TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: dialogue
      };
    }
  }

  async speakExample(example) {
    try {
      let textToSpeak = '';
      
      if (Array.isArray(example.english)) {
        textToSpeak = example.english.join('\n\n');
      } else {
        textToSpeak = example.english;
      }

      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: textToSpeak,
        lang: 'en'
      });

      return {
        success: true,
        audio: response,
        prompt: textToSpeak,
        russian: example.russian,
        conprompt: example.context,
        voice: voice
      };
    } catch (error) {
      console.error('Error in example TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: example.english
      };
    }
  }

  async speakWithRepeat(text, repeatCount = 2) {
    try {
      const repeatedText = Array(repeatCount).fill(text).join('\n\n');
      
      const response = await this.ai.run('@cf/myshell-ai/melotts', {
        prompt: repeatedText,
        lang: 'en'
      });

      return {
        success: true,
        audio: response,
        prompt: text,
        repeatedText: repeatedText,
        lang: 'en',
        repeatCount: repeatCount
      };
    } catch (error) {
      console.error('Error in repeat TTS:', error);
      return {
        success: false,
        error: error.message,
        prompt: text
      };
    }
  }
}

export function createTTSService(ai, telegramService) {
  return new TTSService(ai, telegramService);
}
