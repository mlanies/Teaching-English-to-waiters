import { handleStartCommand } from '../commands/start.js';
import { 
  handleLessonCommand, 
  handleLessonCategoryCommand,
  handleTextLessonsCommand,
  handleChoiceLessonsCommand 
} from '../commands/lesson.js';
import { handleProfileCommand } from '../commands/profile.js';
import { handleAchievementsCommand, handleAllAchievementsCommand } from '../commands/achievements.js';
import { handleHelpCommand } from '../commands/help.js';
import { handleAboutCommand } from '../commands/about.js';
import { handleLeaderboardCommand, handleLeaderboardCallback } from '../commands/leaderboard.js';
import { 
  handleExamplesCommand, 
  handleExamplesCategoryCommand, 
  handleExampleCommand, 
  handleTTSCommand,
  handleRandomExampleCommand 
} from '../commands/examples.js';
import { processLessonAnswer, completeLesson, getMainMenuKeyboard } from './lessonService.js';
import { getCategories, getLessonsByCategory } from './lessonData.js';

// Функция для генерации клавиатуры следующего вопроса
function getNextQuestionKeyboard(question) {
  if (question.type === 'multiple_choice') {
    return {
      inline_keyboard: [
        ...question.options.map(option => 
          [{ text: option, callback_data: `answer:${option}` }]
        ),
        [
          { text: '⏭️ Следующее задание', callback_data: 'next_question' },
          { text: '📊 Пропустить', callback_data: 'skip_question' }
        ]
      ]
    };
  } else {
    return {
      inline_keyboard: [
        [{ text: '💡 Показать подсказки', callback_data: 'show_hints' }],
        [{ text: '📝 Написать ответ', callback_data: 'text_answer' }],
        [
          { text: '⏭️ Следующее задание', callback_data: 'next_question' },
          { text: '📊 Пропустить', callback_data: 'skip_question' }
        ]
      ]
    };
  }
}

export async function processCallbackData(data, user, session, env) {
  try {
    console.log('Processing callback data:', data);

    // Обработка рейтинга
    if (data.startsWith('leaderboard_')) {
      const period = data.replace('leaderboard_', '');
      return await handleLeaderboardCallback(user, period, env);
    }

    // Обработка категорий уроков
    if (data.startsWith('category_')) {
      const category = data.replace('category_', '');
      return await handleCategorySelection(user, category, session, env);
    }

    // Обработка категорий текстовых уроков
    if (data.startsWith('text_category_')) {
      const category = data.replace('text_category_', '');
      return await handleTextCategorySelection(user, category, session, env);
    }

    // Обработка категорий choice уроков
    if (data.startsWith('choice_category_')) {
      const category = data.replace('choice_category_', '');
      return await handleChoiceCategorySelection(user, category, session, env);
    }

    // Обработка примеров
    if (data.startsWith('examples_')) {
      const action = data.replace('examples_', '');
      return await handleExamplesAction(user, action, session, env);
    }

    // Обработка конкретного примера
    if (data.startsWith('example_')) {
      const withoutPrefix = data.replace('example_', '');
      const firstUnderscoreIndex = withoutPrefix.indexOf('_');
      
      if (firstUnderscoreIndex !== -1) {
        const categoryId = withoutPrefix.substring(0, firstUnderscoreIndex);
        const exampleId = withoutPrefix.substring(firstUnderscoreIndex + 1);

        return await handleExampleCommand(user, categoryId, exampleId, session, env);
      } else {
        console.log('Invalid example callback format:', data);
      }
    }

    // Обработка TTS
    if (data.startsWith('tts_')) {
      const withoutPrefix = data.replace('tts_', '');
      const parts = withoutPrefix.split('_');
      
      if (parts.length >= 3) {
        const categoryId = parts[0];
        // Для exampleId нужно соединить все части кроме первой и последней
        const ttsType = parts[parts.length - 1];
        const exampleId = parts.slice(1, -1).join('_');

        return await handleTTSCommand(user, categoryId, exampleId, ttsType, session, env);
      }
    }

    // Обработка социальных функций
    if (data.startsWith('social_')) {
      const action = data.replace('social_', '');
      return await handleSocialAction(user, action, session, env);
    }

    switch (data) {
      case 'start_lesson':
        return await handleLessonCommand(user, session, env);
        
      case 'text_lessons':
        return await handleTextLessonsCommand(user, session, env);
        
      case 'choice_lessons':
        return await handleChoiceLessonsCommand(user, session, env);
        
      case 'profile':
        return await handleProfileCommand(user, session, env);
        
      case 'achievements':
        return await handleAchievementsCommand(user, session, env);
        
      case 'all_achievements':
        return await handleAllAchievementsCommand(user, session, env);
        
      case 'detailed_stats':
        return await handleDetailedStatsCommand(user, session, env);
        
      case 'learning_goals':
        return await handleLearningGoalsCommand(user, session, env);
        
      case 'help':
        return await handleHelpCommand(user, session);
        
      case 'about':
        return await handleAboutCommand(user, session, env);
        
      case 'leaderboard':
        return await handleLeaderboardCommand(user, env);
        
      case 'examples':
        return await handleExamplesCommand(user, session, env);
        
      case 'competitions':
        return await handleCompetitionsCommand(user, env);
        
      case 'study_groups':
        return await handleStudyGroupsCommand(user, env);
        
      case 'back_to_main':
        return {
          message: `👋 С возвращением, <b>${user.first_name}</b>!\n\n🍽️ <b>English for Waiters</b> - ваш персональный помощник в изучении английского для работы официантом.\n\n📊 Ваш уровень: <b>${user.level}</b>\n⭐ Опыт: <b>${user.experience_points}</b> XP\n📚 Завершено уроков: <b>${user.total_lessons_completed}</b>\n\nВыберите действие:`,
          keyboard: getMainMenuKeyboard(),
          newSession: { ...session, state: 'main_menu' }
        };
        
      case 'next_lesson':
        return await handleLessonCommand(user, session, env);
        
      case 'lesson_categories':
        return await handleLessonCategoryCommand(user, session, env);
        
      case 'main_menu':
        return {
          message: `🍽️ <b>English for Waiters</b>\n\nВыберите действие:`,
          keyboard: getMainMenuKeyboard(),
          newSession: { ...session, state: 'main_menu' }
        };
        
      default:
        // Обработка ответов на уроки
        if (data.startsWith('answer:')) {
          const answer = data.replace('answer:', '');
          return await processLessonAnswer(answer, user, session, env);
        }
        
        // Показать подсказки
        if (data === 'show_hints') {
          return {
            message: `💡 <b>Подсказки:</b>\n\n` +
              `Попробуйте использовать:\n` +
              `• Вежливые фразы\n` +
              `• Профессиональную лексику\n` +
              `• Полные предложения\n\n` +
              `Напишите ваш ответ текстом.`,
            keyboard: {
              inline_keyboard: [
                [{ text: '📝 Написать ответ', callback_data: 'text_answer' }],
                [{ text: '🔙 Назад', callback_data: 'back_to_question' }]
              ]
            }
          };
        }
        
        // Следующий вопрос
        if (data === 'next_question') {
          if (session.currentLesson && session.currentLesson.currentQuestionIndex < session.currentLesson.questions.length) {
            const nextQuestion = session.currentLesson.questions[session.currentLesson.currentQuestionIndex];
            return {
              message: `📝 <b>Вопрос ${session.currentLesson.currentQuestionIndex + 1} из ${session.currentLesson.questions.length}</b>\n\n${nextQuestion.text}`,
              keyboard: getNextQuestionKeyboard(nextQuestion),
              newSession: session
            };
          }
        }
        
        // Пропустить вопрос
        if (data === 'skip_question') {
          if (session.currentLesson) {
            const updatedLesson = {
              ...session.currentLesson,
              currentQuestionIndex: session.currentLesson.currentQuestionIndex + 1,
              skippedQuestions: [...(session.currentLesson.skippedQuestions || []), session.currentLesson.currentQuestionIndex]
            };
            
            if (updatedLesson.currentQuestionIndex >= updatedLesson.questions.length) {
              return await completeLesson(user, updatedLesson, session, env);
            }
            
            const nextQuestion = updatedLesson.questions[updatedLesson.currentQuestionIndex];
            return {
              message: `⏭️ Вопрос пропущен!\n\n📝 <b>Вопрос ${updatedLesson.currentQuestionIndex + 1} из ${updatedLesson.questions.length}</b>\n\n${nextQuestion.text}`,
              keyboard: getNextQuestionKeyboard(nextQuestion),
              newSession: { ...session, currentLesson: updatedLesson }
            };
          }
        }
        
        return {
          message: '❌ Неизвестная команда. Попробуйте еще раз.',
          keyboard: {
            inline_keyboard: [
              [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        };
    }
  } catch (error) {
    console.error('Error processing callback data:', error);
    return {
      message: '❌ Произошла ошибка. Попробуйте еще раз.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Обработка выбора категории
async function handleCategorySelection(user, category, session, env) {
  try {
    const categories = getCategories();
    const selectedCategory = categories.find(cat => cat.id === category);
    
    if (!selectedCategory) {
      return {
        message: '❌ Категория не найдена.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к категориям', callback_data: 'lesson_categories' }]
          ]
        }
      };
    }
    
    const lessons = getLessonsByCategory(category);
    const availableLessons = lessons.filter(lesson => lesson.difficulty_level <= user.level + 1);
    
    if (availableLessons.length === 0) {
      return {
        message: `📚 <b>${selectedCategory.name}</b>\n\n${selectedCategory.description}\n\n❌ Пока нет доступных уроков для вашего уровня.`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к категориям', callback_data: 'lesson_categories' }]
          ]
        }
      };
    }
    
    // Выбираем случайный урок из доступных
    const randomLesson = availableLessons[Math.floor(Math.random() * availableLessons.length)];
    
    const lessonSession = {
      ...session,
      currentLesson: {
        ...randomLesson,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        answers: [],
        skippedQuestions: []
      },
      state: 'in_lesson'
    };
    
    const firstQuestion = randomLesson.content.questions[0];
    
    return {
      message: `📚 <b>${randomLesson.title}</b>\n\n${randomLesson.description}\n\n📝 <b>Вопрос 1 из ${randomLesson.content.questions.length}</b>\n\n${firstQuestion.text}`,
      keyboard: getNextQuestionKeyboard(firstQuestion),
      newSession: lessonSession
    };
    
  } catch (error) {
    console.error('Error in category selection:', error);
    return {
      message: '❌ Произошла ошибка при выборе категории.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Обработка действий с примерами
async function handleExamplesAction(user, action, session, env) {
  try {
    if (action.startsWith('category_')) {
      const categoryId = action.replace('category_', '');
      return await handleExamplesCategoryCommand(user, categoryId, session, env);
    } else if (action.startsWith('random_')) {
      const categoryId = action.replace('random_', '');
      return await handleRandomExampleCommand(user, categoryId || null, session, env);
    } else if (action === 'random') {
      return await handleRandomExampleCommand(user, null, session, env);
    } else if (action === 'search') {
      return {
        message: '🔍 <b>Поиск примеров</b>\n\nНапишите ключевое слово для поиска фраз и диалогов.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад к примерам', callback_data: 'examples' }]
          ]
        },
        newSession: { ...session, state: 'searching_examples' }
      };
    }
    
    return await handleExamplesCommand(user, session, env);
    
  } catch (error) {
    console.error('Error in examples action:', error);
    return {
      message: '❌ Произошла ошибка при обработке действия с примерами.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Обработка социальных действий
async function handleSocialAction(user, action, session, env) {
  try {
    switch (action) {
      case 'leaderboard':
        return await handleLeaderboardCommand(user, env);
        
      case 'competitions':
        return await handleCompetitionsCommand(user, env);
        
      case 'study_groups':
        return await handleStudyGroupsCommand(user, env);
        
      default:
        return {
          message: '❌ Неизвестное социальное действие.',
          keyboard: {
            inline_keyboard: [
              [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        };
    }
  } catch (error) {
    console.error('Error in social action:', error);
    return {
      message: '❌ Произошла ошибка при обработке социального действия.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Заглушки для команд (будут реализованы позже)
async function handleDetailedStatsCommand(user, session, env) {
  return {
    message: '📊 Детальная статистика будет доступна в следующем обновлении.',
    keyboard: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'profile' }]
      ]
    }
  };
}

async function handleLearningGoalsCommand(user, session, env) {
  return {
    message: '🎯 Цели обучения будут доступны в следующем обновлении.',
    keyboard: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'profile' }]
      ]
    }
  };
}

async function handleCompetitionsCommand(user, env) {
  return {
    message: '🎯 Соревнования будут доступны в следующем обновлении.',
    keyboard: {
      inline_keyboard: [
        [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
      ]
    }
  };
}

async function handleStudyGroupsCommand(user, env) {
  return {
    message: '👥 Группы обучения будут доступны в следующем обновлении.',
    keyboard: {
      inline_keyboard: [
        [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
      ]
    }
  };
}

// Обработка выбора категории для текстовых уроков
async function handleTextCategorySelection(user, category, session, env) {
  try {
    const categories = getCategories();
    const selectedCategory = categories.find(cat => cat.id === category);
    
    if (!selectedCategory) {
      return {
        message: '❌ Категория не найдена.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'text_lessons' }]
          ]
        }
      };
    }
    
    const lessons = getLessonsByCategory(category);
    const availableLessons = lessons.filter(lesson => lesson.difficulty_level <= user.level + 1);
    
    if (availableLessons.length === 0) {
      return {
        message: `📚 <b>${selectedCategory.name}</b>\n\n${selectedCategory.description}\n\n❌ Пока нет доступных уроков для вашего уровня.`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'text_lessons' }]
          ]
        }
      };
    }
    
    // Выбираем случайный урок из доступных
    const randomLesson = availableLessons[Math.floor(Math.random() * availableLessons.length)];
    
    const lessonSession = {
      ...session,
      currentLesson: {
        ...randomLesson,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        answers: [],
        skippedQuestions: [],
        lessonType: 'text' // Указываем тип урока
      },
      state: 'in_lesson'
    };
    
    const firstQuestion = randomLesson.content.questions[0];
    
    return {
      message: `✍️ <b>${randomLesson.title}</b>\n\n${randomLesson.description}\n\n📝 <b>Вопрос 1 из ${randomLesson.content.questions.length}</b>\n\n${firstQuestion.text}\n\n💡 <i>Напишите ваш ответ текстом</i>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '💡 Показать подсказки', callback_data: 'show_hints' }],
          [
            { text: '⏭️ Пропустить', callback_data: 'skip_question' },
            { text: '🔙 Выйти', callback_data: 'main_menu' }
          ]
        ]
      },
      newSession: lessonSession
    };
    
  } catch (error) {
    console.error('Error in handleTextCategorySelection:', error);
    return {
      message: '❌ Произошла ошибка при выборе категории.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Обработка выбора категории для choice уроков (с вариантами ответов)
async function handleChoiceCategorySelection(user, category, session, env) {
  try {
    const categories = getCategories();
    const selectedCategory = categories.find(cat => cat.id === category);
    
    if (!selectedCategory) {
      return {
        message: '❌ Категория не найдена.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'choice_lessons' }]
          ]
        }
      };
    }
    
    const lessons = getLessonsByCategory(category);
    const availableLessons = lessons.filter(lesson => lesson.difficulty_level <= user.level + 1);
    
    if (availableLessons.length === 0) {
      return {
        message: `📚 <b>${selectedCategory.name}</b>\n\n${selectedCategory.description}\n\n❌ Пока нет доступных уроков для вашего уровня.`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'choice_lessons' }]
          ]
        }
      };
    }
    
    // Выбираем случайный урок из доступных
    const randomLesson = availableLessons[Math.floor(Math.random() * availableLessons.length)];
    
    // Создаем варианты ответов для первого вопроса
    const firstQuestion = randomLesson.content.questions[0];
    const choices = generateChoicesForQuestion(firstQuestion);
    
    const lessonSession = {
      ...session,
      currentLesson: {
        ...randomLesson,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        answers: [],
        skippedQuestions: [],
        lessonType: 'choice' // Указываем тип урока
      },
      state: 'in_lesson'
    };
    
    // Создаем клавиатуру с вариантами ответов
    const choiceButtons = choices.map(choice => 
      [{ text: choice, callback_data: `answer:${choice}` }]
    );
    
    choiceButtons.push([
      { text: '⏭️ Пропустить', callback_data: 'skip_question' },
      { text: '🔙 Выйти', callback_data: 'main_menu' }
    ]);
    
    return {
      message: `☑️ <b>${randomLesson.title}</b>\n\n${randomLesson.description}\n\n📝 <b>Вопрос 1 из ${randomLesson.content.questions.length}</b>\n\n${firstQuestion.text}\n\n💡 <i>Выберите правильный ответ:</i>`,
      keyboard: {
        inline_keyboard: choiceButtons
      },
      newSession: lessonSession
    };
    
  } catch (error) {
    console.error('Error in handleChoiceCategorySelection:', error);
    return {
      message: '❌ Произошла ошибка при выборе категории.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    };
  }
}

// Функция для генерации вариантов ответов
function generateChoicesForQuestion(question) {
  const correctAnswer = question.correctAnswer;
  const allChoices = question.correctAnswers || [correctAnswer];
  
  // Создаем несколько неправильных вариантов
  const wrongChoices = [
    "Good morning",
    "Thank you",
    "Please wait",
    "Excuse me",
    "Have a nice day",
    "See you later",
    "You're welcome",
    "I'm sorry"
  ];
  
  // Берем правильный ответ и 2-3 неправильных
  const choices = [correctAnswer];
  const shuffledWrong = wrongChoices.filter(choice => 
    !allChoices.some(correct => correct.toLowerCase().includes(choice.toLowerCase()))
  ).sort(() => Math.random() - 0.5).slice(0, 3);
  
  choices.push(...shuffledWrong);
  
  // Перемешиваем все варианты
  return choices.sort(() => Math.random() - 0.5);
}
