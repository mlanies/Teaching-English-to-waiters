import { getRandomLesson, getCategories, getLessonsByCategory } from '../services/lessonData.js';

export async function handleLessonCommand(user, session, env) {
  try {
    // Получаем случайный урок подходящий для уровня пользователя
    const lesson = getRandomLesson(null, user.level);
    
    if (!lesson) {
      return {
        message: '❌ К сожалению, нет доступных уроков для вашего уровня. Попробуйте позже.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'main_menu' }]
          ]
        },
        newSession: session
      };
    }

    // Создаем новую сессию урока
    const lessonSession = {
      ...session,
      currentLesson: {
        id: lesson.id,
        title: lesson.title,
        category: lesson.category,
        questions: lesson.content.questions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        totalScore: 0,
        answers: [],
        skippedQuestions: []
      },
      state: 'in_lesson'
    };

    const firstQuestion = lesson.content.questions[0];
    
    const message = `📚 <b>Урок: ${lesson.title}</b>\n\n` +
      `📝 ${lesson.description}\n\n` +
      `📊 Уровень сложности: ${lesson.difficulty_level}/5\n` +
      `🎯 Вопросов в уроке: ${lesson.content.questions.length}\n\n` +
      `📝 <b>Вопрос 1:</b>\n${firstQuestion.text}`;

    // Создаем кнопки для ответов
    let keyboard = null;
    
    if (firstQuestion.type === 'multiple_choice') {
      // Для вопросов с вариантами ответов
      keyboard = {
        inline_keyboard: firstQuestion.options.map(option => 
          [{ text: option, callback_data: `answer:${option}` }]
        )
      };
    } else {
      // Для текстовых вопросов создаем подсказки
      keyboard = {
        inline_keyboard: [
          [{ text: '💡 Показать подсказки', callback_data: 'show_hints' }],
          [{ text: '📝 Написать ответ', callback_data: 'text_answer' }]
        ]
      };
    }

    return {
      message: message,
      keyboard: keyboard,
      newSession: lessonSession
    };

  } catch (error) {
    console.error('Error in handleLessonCommand:', error);
    return {
      message: '❌ Ошибка при загрузке урока. Попробуйте позже.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'main_menu' }]
        ]
      },
      newSession: session
    };
  }
}

export async function handleLessonCategoryCommand(user, session, env) {
  try {
    const categories = getCategories();
    
    // Создаем кнопки для каждой категории
    const categoryButtons = categories.map(category => ({
      text: `${category.icon} ${category.name}`,
      callback_data: `category_${category.id}`
    }));

    // Группируем кнопки по 2 в ряд
    const keyboardRows = [];
    for (let i = 0; i < categoryButtons.length; i += 2) {
      const row = categoryButtons.slice(i, i + 2);
      keyboardRows.push(row);
    }

    // Добавляем кнопку "Назад"
    keyboardRows.push([{ text: '🔙 Главное меню', callback_data: 'main_menu' }]);

    const message = `📚 <b>Выберите категорию уроков:</b>\n\n` +
      `Выберите интересующую вас категорию, и мы подберем подходящий урок для вашего уровня (${user.level}).`;

    return {
      message: message,
      keyboard: {
        inline_keyboard: keyboardRows
      },
      newSession: { ...session, state: 'selecting_category' }
    };

  } catch (error) {
    console.error('Error in handleLessonCategoryCommand:', error);
    return {
      message: '❌ Ошибка при загрузке категорий. Попробуйте позже.',
      keyboard: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'main_menu' }]
        ]
      },
      newSession: session
    };
  }
}

// Функция для получения информации о категории
export function getCategoryInfo(categoryId) {
  const categories = getCategories();
  return categories.find(cat => cat.id === categoryId);
}

// Функция для получения доступных уроков в категории
export function getAvailableLessonsInCategory(categoryId, userLevel) {
  const lessons = getLessonsByCategory(categoryId);
  return lessons.filter(lesson => lesson.difficulty_level <= userLevel + 1);
}
