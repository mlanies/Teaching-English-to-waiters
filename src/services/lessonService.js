import { getLessonById, getRandomLesson } from './lessonData.js';
import { updateUserProgress } from './userService.js';
import { analyzeWithAI } from './aiService.js';
import { createTTSService } from './ttsService.js';
import { createTelegramService } from './telegram.js';

// Функция завершения урока
export async function completeLesson(user, lesson, session, env) {
  try {
    // Получаем вопросы из урока (они могут быть в questions или content.questions)
    const questions = lesson.questions || (lesson.content && lesson.content.questions);
    const questionsCount = questions ? questions.length : 1;
    
    // Обновляем прогресс пользователя
    const finalScore = Math.round(lesson.totalScore / questionsCount);
    await updateUserProgress(env.DB, user.id, lesson.id, finalScore, 
      Date.now() - lesson.startTime, lesson.answers.filter(a => !a.isCorrect).length);

    const message = `🎉 <b>Урок завершен!</b>\n\n` +
      `📊 <b>Результаты:</b>\n` +
      `• Финальный балл: ${finalScore}/100\n` +
      `• Правильных ответов: ${lesson.answers.filter(a => a.isCorrect).length}/${questionsCount}\n` +
      `• Время выполнения: ${Math.round((Date.now() - lesson.startTime) / 1000)} сек\n\n` +
      `⭐ Получено XP: ${finalScore}\n` +
      `📈 Новый уровень: ${user.level + (finalScore >= 80 ? 1 : 0)}\n\n` +
      `💡 <b>Рекомендации:</b>\n` +
      formatLessonRecommendations(lesson);

    // Отправляем голосовое сообщение с итогами урока
    if (session.settings && session.settings.voiceFeedback) {
      await sendLessonSummaryVoice(user, lesson, finalScore, env);
    }

    return {
      message: message,
      keyboard: {
        inline_keyboard: [
          [
            { text: '📚 Следующий урок', callback_data: 'next_lesson' },
            { text: '📊 Мой профиль', callback_data: 'profile' }
          ],
          [
            { text: '🔙 Главное меню', callback_data: 'main_menu' }
          ]
        ]
      },
      newSession: { ...session, state: 'lesson_completed' }
    };

  } catch (error) {
    console.error('Error completing lesson:', error);
    return {
      message: '❌ Ошибка при завершении урока.',
      keyboard: getMainMenuKeyboard(),
      newSession: session
    };
  }
}

// Функция для отправки голосового анализа
async function sendVoiceAnalysis(user, question, userAnswer, aiAnalysis, env) {
  try {
    const telegramService = createTelegramService(env.TELEGRAM_BOT_TOKEN);
    const ttsService = createTTSService(env.AI, telegramService);
    
    await ttsService.speakLessonWithAnalysis(
      user.telegram_id,
      question,
      userAnswer,
      aiAnalysis
    );
  } catch (error) {
    console.error('Error sending voice analysis:', error);
    // Не прерываем основной поток, если голосовой анализ не удался
  }
}

// Функция для отправки голосового итога урока
async function sendLessonSummaryVoice(user, lesson, finalScore, env) {
  try {
    const telegramService = createTelegramService(env.TELEGRAM_BOT_TOKEN);
    const ttsService = createTTSService(env.AI, telegramService);
    
    // Получаем количество вопросов
    const questions = lesson.questions || (lesson.content && lesson.content.questions);
    const questionsCount = questions ? questions.length : 1;
    
    const summaryText = `Lesson completed! Your final score is ${finalScore} out of 100. ` +
      `You answered ${lesson.answers.filter(a => a.isCorrect).length} out of ${questionsCount} questions correctly. ` +
      `Great job! Keep practicing to improve your English skills.`;
    
    await ttsService.speakEnglishAndSend(
      user.telegram_id,
      summaryText,
      `🎉 <b>Итоги урока</b>\n\n📊 Финальный балл: ${finalScore}/100\n✅ Правильных ответов: ${lesson.answers.filter(a => a.isCorrect).length}/${questionsCount}`
    );
  } catch (error) {
    console.error('Error sending lesson summary voice:', error);
  }
}

export function checkAnswer(userAnswer, question) {
  // Получаем все возможные правильные ответы
  const correctAnswers = question.correctAnswers || [question.correctAnswer];
  const userAnswerLower = userAnswer.toLowerCase().trim();
  
  // Проверяем точное совпадение
  if (correctAnswers.some(answer => userAnswerLower === answer.toLowerCase().trim())) {
    return true;
  }
  
  // Проверяем частичное совпадение (если ответ содержит ключевые слова)
  return correctAnswers.some(answer => {
    const answerLower = answer.toLowerCase().trim();
    const answerWords = answerLower.split(' ').filter(word => word.length > 2);
    const userWords = userAnswerLower.split(' ').filter(word => word.length > 2);
    
    // Если пользователь использовал большинство ключевых слов из правильного ответа
    const matchingWords = answerWords.filter(word => userWords.includes(word));
    
    // Более мягкая проверка для коротких фраз
    if (answerWords.length <= 3) {
      return matchingWords.length >= Math.max(1, Math.floor(answerWords.length * 0.6));
    }
    
    return matchingWords.length >= Math.max(1, Math.floor(answerWords.length * 0.7));
  });
}

function calculateScore(isCorrect, aiScore) {
  if (isCorrect) {
    return Math.max(10, Math.round(aiScore * 20)); // 10-20 баллов за правильный ответ
  }
  return Math.round(aiScore * 5); // 0-5 баллов за неправильный ответ
}

export function formatQuestionFeedback(isCorrect, aiAnalysis, nextQuestion) {
  let message = '';
  
  // Получаем правильный ответ из анализа ИИ или из вопроса
  const correctAnswer = aiAnalysis.correct_answer || aiAnalysis.correctAnswer || 'Правильный ответ не найден';
  const explanation = aiAnalysis.explanation || 'Объяснение не доступно';
  
  if (isCorrect) {
    message = `✅ <b>Правильно!</b>\n\n` +
      `💡 <b>Объяснение:</b> ${explanation}\n\n` +
      `📝 <b>Следующий вопрос:</b>\n${nextQuestion.text}`;
  } else {
    message = `❌ <b>Неправильно</b>\n\n` +
      `✅ <b>Правильный ответ:</b> ${correctAnswer}\n\n` +
      `💡 <b>Объяснение:</b> ${explanation}\n\n` +
      `📝 <b>Следующий вопрос:</b>\n${nextQuestion.text}`;
  }

  const keyboard = getNextQuestionKeyboard(nextQuestion);
  
  return { message, keyboard };
}

function formatLessonRecommendations(lesson) {
  const wrongAnswers = lesson.answers.filter(a => !a.isCorrect);
  
  if (wrongAnswers.length === 0) {
    return "🎯 Отличная работа! Все ответы правильные.";
  }
  
  const recommendations = wrongAnswers.map(answer => 
    `• Обратите внимание на: ${answer.aiFeedback}`
  ).join('\n');
  
  return recommendations;
}

function getQuestionKeyboard(question) {
  if (question.type === 'multiple_choice') {
    return {
      inline_keyboard: question.options.map(option => 
        [{ text: option, callback_data: `answer:${option}` }]
      )
    };
  }
  
  return null; // Для текстовых ответов
}

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

export function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '✍️ Текстовые ответы', callback_data: 'text_lessons' },
        { text: '☑️ Выбор ответа', callback_data: 'choice_lessons' }
      ],
      [
        { text: '📊 Мой профиль', callback_data: 'profile' },
        { text: '🏆 Достижения', callback_data: 'achievements' }
      ],
      [
        { text: '🏅 Рейтинг', callback_data: 'leaderboard' },
        { text: '📖 Готовые примеры', callback_data: 'examples' }
      ],
      [
        { text: '🎯 Соревнования', callback_data: 'competitions' },
        { text: '👥 Группы', callback_data: 'study_groups' }
      ],
      [
        { text: '❓ Помощь', callback_data: 'help' },
        { text: 'ℹ️ О проекте', callback_data: 'about' }
      ]
    ]
  };
}

// Функция для генерации вариантов ответов
export function generateChoicesForQuestion(question) {
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

export async function processLessonAnswer(text, user, session, env) {
  try {
    const currentLesson = session.currentLesson;
    
    // Получаем вопросы из урока (они могут быть в questions или content.questions)
    const questions = currentLesson.questions || (currentLesson.content && currentLesson.content.questions);
    
    // Проверяем, что урок существует и имеет вопросы
    if (!currentLesson || !questions || !Array.isArray(questions)) {
      console.error('Invalid lesson structure:', currentLesson);
      return {
        message: '❌ Ошибка структуры урока. Попробуйте начать урок заново.',
        keyboard: getMainMenuKeyboard(),
        newSession: { ...session, currentLesson: null, state: 'main_menu' }
      };
    }
    
    const currentQuestion = questions[currentLesson.currentQuestionIndex];
    
    // Проверяем, что вопрос существует
    if (!currentQuestion) {
      console.error('Question not found at index:', currentLesson.currentQuestionIndex);
      return {
        message: '❌ Вопрос не найден. Попробуйте начать урок заново.',
        keyboard: getMainMenuKeyboard(),
        newSession: { ...session, currentLesson: null, state: 'main_menu' }
      };
    }
    
    // Анализируем ответ с помощью AI
    const aiAnalysis = await analyzeWithAI(env.AI, text, user, currentQuestion);
    
    // Проверяем правильность ответа
    const isCorrect = checkAnswer(text, currentQuestion);
    const score = calculateScore(isCorrect, aiAnalysis.score);
    
    // Обновляем прогресс урока
    const updatedLesson = {
      ...currentLesson,
      answers: [...(currentLesson.answers || []), {
        question: currentLesson.currentQuestionIndex,
        userAnswer: text,
        isCorrect,
        aiScore: aiAnalysis.score,
        aiFeedback: aiAnalysis.feedback
      }],
      currentQuestionIndex: currentLesson.currentQuestionIndex + 1,
      totalScore: (currentLesson.totalScore || 0) + score
    };

    // Проверяем, завершен ли урок
    if (updatedLesson.currentQuestionIndex >= questions.length) {
      return await completeLesson(user, updatedLesson, session, env);
    }

    // Показываем следующий вопрос
    const nextQuestion = questions[updatedLesson.currentQuestionIndex];
    const feedback = formatQuestionFeedback(isCorrect, aiAnalysis, nextQuestion);
    
    // Создаем клавиатуру в зависимости от типа урока
    let keyboard = feedback.keyboard;
    
    if (currentLesson.lessonType === 'choice') {
      // Для choice уроков создаем варианты ответов
      const choices = generateChoicesForQuestion(nextQuestion);
      const choiceButtons = choices.map(choice => 
        [{ text: choice, callback_data: `answer:${choice}` }]
      );
      
      choiceButtons.push([
        { text: '⏭️ Пропустить', callback_data: 'skip_question' },
        { text: '🔙 Выйти', callback_data: 'main_menu' }
      ]);
      
      keyboard = {
        inline_keyboard: choiceButtons
      };
    } else {
      // Для текстовых уроков используем стандартную клавиатуру
      keyboard = {
        inline_keyboard: [
          [{ text: '💡 Показать подсказки', callback_data: 'show_hints' }],
          [
            { text: '⏭️ Пропустить', callback_data: 'skip_question' },
            { text: '🔙 Выйти', callback_data: 'main_menu' }
          ]
        ]
      };
    }
    
    // Отправляем голосовое сообщение с анализом, если пользователь включил эту функцию
    if (session.settings && session.settings.voiceFeedback) {
      await sendVoiceAnalysis(user, currentQuestion, text, aiAnalysis, env);
    }
    
    return {
      message: feedback.message,
      keyboard: keyboard,
      newSession: {
        ...session,
        currentLesson: updatedLesson
      }
    };

  } catch (error) {
    console.error('Error processing lesson answer:', error);
    return {
      message: '❌ Произошла ошибка при обработке ответа. Попробуйте еще раз.',
      keyboard: getMainMenuKeyboard(),
      newSession: session
    };
  }
}

export async function startLesson(user, session, env) {
  try {
    // Сначала пытаемся получить урок из базы данных
    let lesson = null;
    
    try {
      const dbLesson = await env.DB.prepare(`
        SELECT * FROM lessons 
        WHERE is_active = 1 
        ORDER BY RANDOM() 
        LIMIT 1
      `).first();
      
      if (dbLesson) {
        lesson = {
          id: dbLesson.id,
          title: dbLesson.title,
          description: dbLesson.description,
          category: dbLesson.category,
          difficulty_level: dbLesson.difficulty_level,
          content: JSON.parse(dbLesson.content)
        };
      }
    } catch (dbError) {
      console.log('Database lesson not found, using static data');
    }
    
    // Если урок не найден в БД, используем статические данные
    if (!lesson) {
      lesson = getRandomLesson();
    }
    
    if (!lesson) {
      return {
        message: '❌ Не удалось найти подходящий урок. Попробуйте позже.',
        keyboard: getMainMenuKeyboard(),
        newSession: session
      };
    }

    // Создаем новую сессию урока
    const lessonSession = {
      ...session,
      state: 'in_lesson',
      currentLesson: {
        id: lesson.id,
        title: lesson.title,
        questions: lesson.content.questions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        totalScore: 0,
        answers: []
      }
    };

    const firstQuestion = lesson.content.questions[0];
    const keyboard = getQuestionKeyboard(firstQuestion);

    return {
      message: `📚 <b>${lesson.title}</b>\n\n${firstQuestion.text}`,
      keyboard: keyboard,
      newSession: lessonSession
    };

  } catch (error) {
    console.error('Error starting lesson:', error);
    return {
      message: '❌ Ошибка при запуске урока. Попробуйте еще раз.',
      keyboard: getMainMenuKeyboard(),
      newSession: session
    };
  }
}
