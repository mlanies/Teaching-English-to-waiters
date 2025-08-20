import { getLessonById, getRandomLesson } from './lessonData.js';
import { updateUserProgress } from './userService.js';
import { analyzeWithAI } from './aiService.js';
import { createTTSService } from './ttsService.js';
import { createTelegramService } from './telegram.js';

// Функция завершения урока
async function completeLesson(user, lesson, session, env) {
  try {
    // Обновляем прогресс пользователя
    const finalScore = Math.round(lesson.totalScore / lesson.questions.length);
    await updateUserProgress(env.DB, user.id, lesson.id, finalScore, 
      Date.now() - lesson.startTime, lesson.answers.filter(a => !a.isCorrect).length);

    const message = `🎉 <b>Урок завершен!</b>\n\n` +
      `📊 <b>Результаты:</b>\n` +
      `• Финальный балл: ${finalScore}/100\n` +
      `• Правильных ответов: ${lesson.answers.filter(a => a.isCorrect).length}/${lesson.questions.length}\n` +
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
    
    const summaryText = `Lesson completed! Your final score is ${finalScore} out of 100. ` +
      `You answered ${lesson.answers.filter(a => a.isCorrect).length} out of ${lesson.questions.length} questions correctly. ` +
      `Great job! Keep practicing to improve your English skills.`;
    
    await ttsService.speakEnglishAndSend(
      user.telegram_id,
      summaryText,
      `🎉 <b>Итоги урока</b>\n\n📊 Финальный балл: ${finalScore}/100\n✅ Правильных ответов: ${lesson.answers.filter(a => a.isCorrect).length}/${lesson.questions.length}`
    );
  } catch (error) {
    console.error('Error sending lesson summary voice:', error);
  }
}

function checkAnswer(userAnswer, question) {
  const correctAnswers = question.correctAnswers || [question.correctAnswer];
  const userAnswerLower = userAnswer.toLowerCase().trim();
  
  return correctAnswers.some(answer => 
    userAnswerLower.includes(answer.toLowerCase()) ||
    answer.toLowerCase().includes(userAnswerLower)
  );
}

function calculateScore(isCorrect, aiScore) {
  if (isCorrect) {
    return Math.max(10, Math.round(aiScore * 20)); // 10-20 баллов за правильный ответ
  }
  return Math.round(aiScore * 5); // 0-5 баллов за неправильный ответ
}

function formatQuestionFeedback(isCorrect, aiAnalysis, nextQuestion) {
  let message = '';
  
  if (isCorrect) {
    message = `✅ <b>Правильно!</b>\n\n` +
      `💡 <b>Объяснение:</b> ${aiAnalysis.explanation}\n\n` +
      `📝 <b>Следующий вопрос:</b>\n${nextQuestion.text}`;
  } else {
    message = `❌ <b>Неправильно</b>\n\n` +
      `✅ <b>Правильный ответ:</b> ${aiAnalysis.correct_answer}\n\n` +
      `💡 <b>Объяснение:</b> ${aiAnalysis.explanation}\n\n` +
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

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📚 Начать урок', callback_data: 'start_lesson' },
        { text: '📊 Мой профиль', callback_data: 'profile' }
      ],
      [
        { text: '🏆 Достижения', callback_data: 'achievements' },
        { text: '🏅 Рейтинг', callback_data: 'leaderboard' }
      ],
      [
        { text: '📖 Готовые примеры', callback_data: 'examples' },
        { text: '🎯 Соревнования', callback_data: 'competitions' }
      ],
      [
        { text: '👥 Группы', callback_data: 'study_groups' },
        { text: '❓ Помощь', callback_data: 'help' }
      ]
    ]
  };
}

export async function processLessonAnswer(text, user, session, env) {
  try {
    const currentLesson = session.currentLesson;
    const currentQuestion = currentLesson.questions[currentLesson.currentQuestionIndex];
    
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
    if (updatedLesson.currentQuestionIndex >= currentLesson.questions.length) {
      return await completeLesson(user, updatedLesson, session, env);
    }

    // Показываем следующий вопрос
    const nextQuestion = currentLesson.questions[updatedLesson.currentQuestionIndex];
    const feedback = formatQuestionFeedback(isCorrect, aiAnalysis, nextQuestion);
    
    // Отправляем голосовое сообщение с анализом, если пользователь включил эту функцию
    if (session.settings && session.settings.voiceFeedback) {
      await sendVoiceAnalysis(user, currentQuestion, text, aiAnalysis, env);
    }
    
    return {
      message: feedback.message,
      keyboard: feedback.keyboard,
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
    // Получаем случайный урок
    const lesson = getRandomLesson();
    
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
        questions: lesson.questions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        totalScore: 0,
        answers: []
      }
    };

    const firstQuestion = lesson.questions[0];
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
