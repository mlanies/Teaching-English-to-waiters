import { 
  getAllCategories, 
  getExamplesByCategory, 
  getExampleById, 
  getRandomExample,
  searchExamples 
} from '../services/examplesService.js';
import { createTTSService } from '../services/ttsService.js';
import { createTelegramService } from '../services/telegram.js';

export async function handleExamplesCommand(user, session, env) {
  try {
    const categories = getAllCategories();
    
    // Создаем кнопки для каждой категории
    const categoryButtons = categories.map(category => ({
      text: `${getCategoryIcon(category.id)} ${category.title} (${category.count})`,
      callback_data: `examples_category_${category.id}`
    }));

    // Группируем кнопки по 2 в ряд
    const keyboardRows = [];
    for (let i = 0; i < categoryButtons.length; i += 2) {
      const row = categoryButtons.slice(i, i + 2);
      keyboardRows.push(row);
    }

    // Добавляем дополнительные кнопки
    keyboardRows.push([
      { text: '🎲 Случайный пример', callback_data: 'examples_random' },
      { text: '🔍 Поиск', callback_data: 'examples_search' }
    ]);
    keyboardRows.push([{ text: '🔙 Главное меню', callback_data: 'main_menu' }]);

    const message = `📚 <b>Готовые примеры фраз</b>\n\n` +
      `Выберите категорию, чтобы изучить готовые фразы и диалоги для работы с иностранными гостями.\n\n` +
      `🎯 <b>Цель:</b> Быстро освоить необходимые фразы для работы официантом\n\n` +
      `🔊 <b>Функции:</b>\n` +
      `• Озвучивание фраз\n` +
      `• Медленное произношение\n` +
      `• По слогам для изучения\n` +
      `• Повторение для запоминания`;

    return {
      message: message,
      keyboard: {
        inline_keyboard: keyboardRows
      },
      newSession: { ...session, state: 'examples_menu' }
    };

  } catch (error) {
    console.error('Error in examples command:', error);
    return {
      message: '❌ Ошибка при загрузке примеров.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

export async function handleExamplesCategoryCommand(user, categoryId, session, env) {
  try {
    const categoryExamples = getExamplesByCategory(categoryId);
    
    if (!categoryExamples) {
      return {
        message: '❌ Категория не найдена.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
          ]
        }
      };
    }

    // Создаем кнопки для каждого примера
    const exampleButtons = categoryExamples.examples.map(example => ({
      text: `${getDifficultyIcon(example.difficulty)} ${example.title}`,
      callback_data: `example_${categoryId}_${example.id}`
    }));

    // Группируем кнопки по 1 в ряд для лучшей читаемости
    const keyboardRows = exampleButtons.map(button => [button]);
    
    // Добавляем навигационные кнопки
    keyboardRows.push([
      { text: '🔙 Назад к категориям', callback_data: 'examples' },
      { text: '🎲 Случайный', callback_data: `examples_random_${categoryId}` }
    ]);

    const message = `📚 <b>${categoryExamples.title}</b>\n\n` +
      `Выберите пример для изучения:\n\n` +
      `📝 Всего примеров: ${categoryExamples.examples.length}\n` +
      `🎯 Сложность: от 1 до 5\n\n` +
      `🔊 Каждый пример можно прослушать в разных режимах`;

    return {
      message: message,
      keyboard: {
        inline_keyboard: keyboardRows
      },
      newSession: { ...session, state: 'examples_category', currentCategory: categoryId }
    };

  } catch (error) {
    console.error('Error in examples category command:', error);
    return {
      message: '❌ Ошибка при загрузке категории.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
        ]
      }
    };
  }
}

export async function handleExampleCommand(user, categoryId, exampleId, session, env) {
  try {
    const example = getExampleById(categoryId, exampleId);
    
    if (!example) {
      return {
        message: '❌ Пример не найден.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к категории', callback_data: `examples_category_${categoryId}` }]
          ]
        }
      };
    }

    let message = `📚 <b>${example.title}</b>\n\n`;
    
    if (Array.isArray(example.english)) {
      // Для диалогов
      message += `🇷🇺 <b>Русский:</b>\n`;
      example.russian.forEach((line, index) => {
        message += `${index + 1}. ${line}\n`;
      });
      
      message += `\n🇺🇸 <b>English:</b>\n`;
      example.english.forEach((line, index) => {
        message += `${index + 1}. ${line}\n`;
      });
    } else {
      // Для одиночных фраз
      message += `🇷🇺 <b>Русский:</b>\n${example.russian}\n\n`;
      message += `🇺🇸 <b>English:</b>\n${example.english}\n\n`;
    }
    
    message += `\n📝 <b>Контекст:</b> ${example.context}\n`;
    message += `🎯 <b>Сложность:</b> ${example.difficulty}/5\n\n`;
    message += `🔊 <b>Нажмите кнопку для прослушивания:</b>`;

    // Создаем кнопки для озвучивания
    const ttsButtons = [
      [
        { text: '🔊 Озвучить', callback_data: `tts_${categoryId}_${exampleId}_normal` },
        { text: '🐌 Медленно', callback_data: `tts_${categoryId}_${exampleId}_slow` }
      ],
      [
        { text: '📖 По слогам', callback_data: `tts_${categoryId}_${exampleId}_pronunciation` },
        { text: '🔄 Повторить', callback_data: `tts_${categoryId}_${exampleId}_repeat` }
      ]
    ];

    // Добавляем навигационные кнопки
    ttsButtons.push([
      { text: '🔙 Назад к категории', callback_data: `examples_category_${categoryId}` },
      { text: '📚 Следующий', callback_data: `example_next_${categoryId}_${exampleId}` }
    ]);

    return {
      message: message,
      keyboard: {
        inline_keyboard: ttsButtons
      },
      newSession: { ...session, state: 'viewing_example', currentExample: { categoryId, exampleId } }
    };

  } catch (error) {
    console.error('Error in example command:', error);
    return {
      message: '❌ Ошибка при загрузке примера.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
        ]
      }
    };
  }
}

export async function handleTTSCommand(user, categoryId, exampleId, ttsType, session, env) {
  try {
    const example = getExampleById(categoryId, exampleId);
    
    if (!example) {
      return {
        message: '❌ Пример не найден.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: `examples_category_${categoryId}` }]
          ]
        }
      };
    }

    // Создаем сервисы
    const telegramService = createTelegramService(env.TELEGRAM_BOT_TOKEN);
    const ttsService = createTTSService(env.AI, telegramService);
    
    let ttsResult;
    const chatId = user.telegram_id;

    switch (ttsType) {
      case 'slow':
        ttsResult = await ttsService.speakSlowlyAndSend(chatId, example.english);
        break;
      case 'pronunciation':
        ttsResult = await ttsService.speakWithPronunciationAndSend(chatId, example.english);
        break;
      case 'repeat':
        ttsResult = await ttsService.speakWithRepeatAndSend(chatId, example.english);
        break;
      default:
        ttsResult = await ttsService.speakEnglishAndSend(chatId, example.english);
    }

    if (ttsResult.success) {
      const message = `🔊 <b>Голосовое сообщение отправлено!</b>\n\n` +
        `📚 ${example.title}\n` +
        `🇺🇸 ${example.english}\n\n` +
        `✅ Аудио файл сгенерирован и отправлен\n` +
        `🎵 Тип: ${getTTSTypeName(ttsType)}\n\n` +
        `💡 <b>Совет:</b> Прослушайте несколько раз для лучшего запоминания`;

      return {
        message: message,
        keyboard: {
          inline_keyboard: [
            [
              { text: '🔊 Озвучить', callback_data: `tts_${categoryId}_${exampleId}_normal` },
              { text: '🐌 Медленно', callback_data: `tts_${categoryId}_${exampleId}_slow` }
            ],
            [
              { text: '📖 По слогам', callback_data: `tts_${categoryId}_${exampleId}_pronunciation` },
              { text: '🔄 Повторить', callback_data: `tts_${categoryId}_${exampleId}_repeat` }
            ],
            [
              { text: '🔙 Назад к примеру', callback_data: `example_${categoryId}_${exampleId}` }
            ]
          ]
        }
      };
    } else {
      return {
        message: `❌ Ошибка при генерации аудио: ${ttsResult.error}\n\nПопробуйте еще раз или выберите другой тип озвучивания.`,
        keyboard: {
          inline_keyboard: [
            [
              { text: '🔊 Попробовать снова', callback_data: `tts_${categoryId}_${exampleId}_normal` },
              { text: '🔙 Назад', callback_data: `example_${categoryId}_${exampleId}` }
            ]
          ]
        }
      };
    }

  } catch (error) {
    console.error('Error in TTS command:', error);
    return {
      message: '❌ Ошибка при генерации аудио. Попробуйте позже.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад к примеру', callback_data: `example_${categoryId}_${exampleId}` }]
        ]
      }
    };
  }
}

export async function handleRandomExampleCommand(user, categoryId = null, session, env) {
  try {
    const example = getRandomExample(categoryId);
    
    if (!example) {
      return {
        message: '❌ Не удалось найти пример.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
          ]
        }
      };
    }

    // Определяем категорию, если не указана
    const actualCategoryId = categoryId || findCategoryByExample(example);
    
    return await handleExampleCommand(user, actualCategoryId, example.id, session, env);

  } catch (error) {
    console.error('Error in random example command:', error);
    return {
      message: '❌ Ошибка при выборе случайного примера.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
        ]
      }
    };
  }
}

// Вспомогательные функции
function getCategoryIcon(categoryId) {
  const icons = {
    'greeting': '👋',
    'menu': '📋',
    'ordering': '📝',
    'payment': '💳',
    'problems': '🚨',
    'fine_dining': '🍷',
    'fast_food': '🍔',
    'dialogues': '💬'
  };
  return icons[categoryId] || '📚';
}

function getDifficultyIcon(difficulty) {
  const icons = {
    1: '🟢',
    2: '🟡',
    3: '🟠',
    4: '🔴',
    5: '🟣'
  };
  return icons[difficulty] || '⚪';
}

function getTTSTypeName(type) {
  const names = {
    'normal': 'Обычная скорость',
    'slow': 'Медленная скорость',
    'pronunciation': 'По слогам',
    'repeat': 'С повторением'
  };
  return names[type] || 'Обычная скорость';
}

function findCategoryByExample(example) {
  // Ищем категорию по ID примера
  const idPrefix = example.id.split('_')[0];
  const categoryMap = {
    'greet': 'greeting',
    'menu': 'menu',
    'order': 'ordering',
    'pay': 'payment',
    'problem': 'problems',
    'fine': 'fine_dining',
    'fast': 'fast_food',
    'dialogue': 'dialogues'
  };
  return categoryMap[idPrefix] || 'greeting';
}
