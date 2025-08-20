// Расширенные данные уроков для официантов

const lessons = [
  // Существующие уроки
  {
    id: 1,
    title: "Приветствие гостей",
    description: "Изучите основные фразы для приветствия иностранных гостей",
    category: "greeting",
    difficulty_level: 1,
    content: {
      questions: [
        {
          id: 1,
          text: "Как правильно поприветствовать гостя?",
          type: "text",
          correctAnswer: "Hello, welcome to our restaurant!",
          correctAnswers: ["Hello, welcome to our restaurant!", "Welcome to our restaurant!", "Hello, welcome!"],
          topic: "greeting",
          explanation: "Используйте вежливое приветствие с приглашением в ресторан"
        },
        {
          id: 2,
          text: "Переведите: 'Добро пожаловать в наш ресторан'",
          type: "text",
          correctAnswer: "Welcome to our restaurant",
          correctAnswers: ["Welcome to our restaurant", "Welcome to the restaurant", "Welcome to our place"],
          topic: "greeting",
          explanation: "Правильный перевод приветственной фразы"
        },
        {
          id: 3,
          text: "Как спросить 'Сколько вас?'",
          type: "text",
          correctAnswer: "How many people are in your party?",
          correctAnswers: ["How many people are in your party?", "How many are you?", "How many people?"],
          topic: "greeting",
          explanation: "Вежливый способ узнать количество гостей"
        }
      ]
    }
  },
  {
    id: 2,
    title: "Работа с меню",
    description: "Научитесь объяснять блюда и ингредиенты",
    category: "menu",
    difficulty_level: 2,
    content: {
      questions: [
        {
          id: 4,
          text: "Как сказать 'Это наше фирменное блюдо'?",
          type: "text",
          correctAnswer: "This is our signature dish",
          correctAnswers: ["This is our signature dish", "This is our special dish", "This is our house specialty"],
          topic: "menu",
          explanation: "Signature dish - фирменное блюдо"
        },
        {
          id: 5,
          text: "Переведите: 'Блюдо содержит орехи'",
          type: "text",
          correctAnswer: "The dish contains nuts",
          correctAnswers: ["The dish contains nuts", "This dish has nuts", "Nuts are included"],
          topic: "menu",
          explanation: "Важно предупреждать об аллергенах"
        },
        {
          id: 6,
          text: "Как спросить 'Что вы порекомендуете?'",
          type: "text",
          correctAnswer: "What do you recommend?",
          correctAnswers: ["What do you recommend?", "What would you suggest?", "What's your recommendation?"],
          topic: "menu",
          explanation: "Все варианты корректны для запроса рекомендации"
        }
      ]
    }
  },
  {
    id: 3,
    title: "Прием заказов",
    description: "Изучите фразы для приема заказов от гостей",
    category: "ordering",
    difficulty_level: 2,
    content: {
      questions: [
        {
          id: 7,
          text: "Как спросить 'Что вы будете заказывать?'",
          type: "text",
          correctAnswer: "What would you like to order?",
          correctAnswers: ["What would you like to order?", "What can I get you?", "What will you have?"],
          topic: "ordering",
          explanation: "Все варианты вежливые и профессиональные"
        },
        {
          id: 8,
          text: "Переведите: 'Я принесу ваш заказ через 15 минут'",
          type: "text",
          correctAnswer: "I'll bring your order in 15 minutes",
          correctAnswers: ["I'll bring your order in 15 minutes", "Your order will be ready in 15 minutes"],
          topic: "ordering",
          explanation: "Важно информировать о времени ожидания"
        }
      ]
    }
  },
  {
    id: 4,
    title: "Оплата и расчет",
    description: "Научитесь работать с оплатой и сдачей",
    category: "payment",
    difficulty_level: 3,
    content: {
      questions: [
        {
          id: 9,
          text: "Как сказать 'Счет, пожалуйста'?",
          type: "text",
          correctAnswer: "The bill, please",
          correctAnswers: ["The bill, please", "Check, please", "Could I have the bill?"],
          topic: "payment",
          explanation: "Все варианты корректны"
        }
      ]
    }
  },
  {
    id: 5,
    title: "Экстренные ситуации",
    description: "Изучите фразы для решения проблем",
    category: "emergency",
    difficulty_level: 4,
    content: {
      questions: [
        {
          id: 10,
          text: "Как извиниться за долгое ожидание?",
          type: "text",
          correctAnswer: "I apologize for the wait",
          correctAnswers: ["I apologize for the wait", "Sorry for keeping you waiting", "Thank you for your patience"],
          topic: "emergency",
          explanation: "Важно извиняться за неудобства"
        }
      ]
    }
  },

  // НОВЫЕ УРОКИ И КАТЕГОРИИ

  // Категория: Fine Dining (Высокая кухня)
  {
    id: 6,
    title: "Fine Dining - Вино и напитки",
    description: "Изучите профессиональную подачу вина и напитков",
    category: "fine_dining",
    difficulty_level: 4,
    content: {
      questions: [
        {
          id: 11,
          text: "Как правильно подать вино гостю?",
          type: "text",
          correctAnswer: "Would you like to taste the wine first?",
          correctAnswers: ["Would you like to taste the wine first?", "Let me pour you a sample", "Please taste the wine before I serve"],
          topic: "wine_service",
          explanation: "В fine dining важно предложить дегустацию вина"
        },
        {
          id: 12,
          text: "Переведите: 'Это вино отлично сочетается с вашим блюдом'",
          type: "text",
          correctAnswer: "This wine pairs perfectly with your dish",
          correctAnswers: ["This wine pairs perfectly with your dish", "This wine complements your meal beautifully"],
          topic: "wine_service",
          explanation: "Знание сочетаний вина и блюд - важный навык"
        }
      ]
    }
  },

  // Категория: Fast Food (Фастфуд)
  {
    id: 7,
    title: "Fast Food - Быстрое обслуживание",
    description: "Изучите фразы для быстрого обслуживания",
    category: "fast_food",
    difficulty_level: 1,
    content: {
      questions: [
        {
          id: 13,
          text: "Как спросить 'На вынос или здесь?'",
          type: "text",
          correctAnswer: "For here or to go?",
          correctAnswers: ["For here or to go?", "Eat in or take away?", "Dine in or take out?"],
          topic: "fast_service",
          explanation: "Стандартный вопрос в фастфуде"
        },
        {
          id: 14,
          text: "Переведите: 'Ваш заказ будет готов через 5 минут'",
          type: "text",
          correctAnswer: "Your order will be ready in 5 minutes",
          correctAnswers: ["Your order will be ready in 5 minutes", "It will take 5 minutes"],
          topic: "fast_service",
          explanation: "В фастфуде важно быстрое обслуживание"
        }
      ]
    }
  },

  // Категория: Bar Service (Бар)
  {
    id: 8,
    title: "Бар - Коктейли и напитки",
    description: "Изучите профессиональное обслуживание в баре",
    category: "bar_service",
    difficulty_level: 3,
    content: {
      questions: [
        {
          id: 15,
          text: "Как спросить 'Какой коктейль вы предпочитаете?'",
          type: "text",
          correctAnswer: "What cocktail would you like?",
          correctAnswers: ["What cocktail would you like?", "Do you have a preference for cocktails?", "What's your favorite cocktail?"],
          topic: "cocktails",
          explanation: "Важно узнать предпочтения гостя"
        },
        {
          id: 16,
          text: "Переведите: 'Этот коктейль содержит алкоголь'",
          type: "text",
          correctAnswer: "This cocktail contains alcohol",
          correctAnswers: ["This cocktail contains alcohol", "This drink has alcohol in it"],
          topic: "cocktails",
          explanation: "Обязательно предупреждать об алкоголе"
        }
      ]
    }
  },

  // Категория: Room Service (Обслуживание в номерах)
  {
    id: 9,
    title: "Room Service - Обслуживание в номерах",
    description: "Изучите фразы для обслуживания в отелях",
    category: "room_service",
    difficulty_level: 3,
    content: {
      questions: [
        {
          id: 17,
          text: "Как сказать 'Доброе утро, это room service'?",
          type: "text",
          correctAnswer: "Good morning, this is room service",
          correctAnswers: ["Good morning, this is room service", "Hello, room service calling"],
          topic: "room_service",
          explanation: "Стандартное приветствие в room service"
        },
        {
          id: 18,
          text: "Переведите: 'Я принесу ваш завтрак в номер'",
          type: "text",
          correctAnswer: "I'll bring your breakfast to your room",
          correctAnswers: ["I'll bring your breakfast to your room", "I'll deliver your breakfast to your room"],
          topic: "room_service",
          explanation: "Важно уточнить доставку в номер"
        }
      ]
    }
  },

  // Категория: Cultural Sensitivity (Культурная чувствительность)
  {
    id: 10,
    title: "Культурная чувствительность",
    description: "Изучите фразы для работы с гостями разных культур",
    category: "cultural",
    difficulty_level: 4,
    content: {
      questions: [
        {
          id: 19,
          text: "Как спросить о диетических ограничениях?",
          type: "text",
          correctAnswer: "Do you have any dietary restrictions?",
          correctAnswers: ["Do you have any dietary restrictions?", "Are there any foods you cannot eat?", "Do you follow any special diet?"],
          topic: "dietary_restrictions",
          explanation: "Важно учитывать культурные и религиозные особенности"
        },
        {
          id: 20,
          text: "Переведите: 'У нас есть вегетарианские блюда'",
          type: "text",
          correctAnswer: "We have vegetarian options",
          correctAnswers: ["We have vegetarian options", "We offer vegetarian dishes"],
          topic: "dietary_restrictions",
          explanation: "Важно знать о диетических предпочтениях"
        }
      ]
    }
  },

  // Интерактивные диалоги
  {
    id: 11,
    title: "Интерактивный диалог - Приветствие",
    description: "Практикуйте полный диалог приветствия гостя",
    category: "interactive",
    difficulty_level: 2,
    content: {
      type: "dialogue",
      scenario: "greeting_scenario",
      questions: [
        {
          id: 21,
          text: "Гость входит в ресторан. Ваши первые слова:",
          type: "dialogue_start",
          correctAnswers: ["hello, welcome to our restaurant", "good evening, welcome"],
          topic: "greeting_dialogue",
          explanation: "Начните с приветствия и приглашения"
        },
        {
          id: 22,
          text: "Гость отвечает: 'Thank you, we are 4 people'. Ваш ответ:",
          type: "dialogue_response",
          correctAnswers: ["perfect, i'll show you to a table for 4", "great, let me find you a table for 4 people"],
          topic: "greeting_dialogue",
          explanation: "Подтвердите количество и предложите помощь"
        },
        {
          id: 23,
          text: "Гость спрашивает: 'Do you have a table by the window?'. Ваш ответ:",
          type: "dialogue_response",
          correctAnswers: ["let me check for you", "i'll see what's available"],
          topic: "greeting_dialogue",
          explanation: "Проявите готовность помочь"
        }
      ]
    }
  },

  // Ролевые игры
  {
    id: 12,
    title: "Ролевая игра - Сложный гость",
    description: "Практикуйте работу с требовательным гостем",
    category: "roleplay",
    difficulty_level: 5,
    content: {
      type: "roleplay",
      scenario: "difficult_customer",
      questions: [
        {
          id: 24,
          text: "Гость жалуется: 'This food is cold!'. Ваш ответ:",
          type: "roleplay_response",
          correctAnswers: ["i apologize for that, let me bring you a fresh dish", "i'm very sorry, i'll fix this immediately"],
          topic: "complaint_handling",
          explanation: "Извинитесь и предложите решение"
        },
        {
          id: 25,
          text: "Гость говорит: 'I want to speak to the manager'. Ваш ответ:",
          type: "roleplay_response",
          correctAnswers: ["of course, i'll get the manager for you right away", "absolutely, let me call the manager"],
          topic: "complaint_handling",
          explanation: "Согласитесь и выполните просьбу"
        }
      ]
    }
  }
];

// Категории уроков
export const lessonCategories = [
  {
    id: "greeting",
    name: "Приветствие гостей",
    description: "Базовые фразы для встречи клиентов",
    icon: "👋",
    difficulty_range: [1, 2]
  },
  {
    id: "menu",
    name: "Работа с меню",
    description: "Объяснение блюд и ингредиентов",
    icon: "📋",
    difficulty_range: [2, 3]
  },
  {
    id: "ordering",
    name: "Прием заказов",
    description: "Фразы для приема заказов",
    icon: "📝",
    difficulty_range: [2, 3]
  },
  {
    id: "payment",
    name: "Оплата и расчет",
    description: "Работа с оплатой и сдачей",
    icon: "💳",
    difficulty_range: [3, 4]
  },
  {
    id: "emergency",
    name: "Экстренные ситуации",
    description: "Решение проблем и извинения",
    icon: "🚨",
    difficulty_range: [4, 5]
  },
  {
    id: "fine_dining",
    name: "Fine Dining",
    description: "Высокая кухня и вино",
    icon: "🍷",
    difficulty_range: [4, 5]
  },
  {
    id: "fast_food",
    name: "Fast Food",
    description: "Быстрое обслуживание",
    icon: "🍔",
    difficulty_range: [1, 2]
  },
  {
    id: "bar_service",
    name: "Бар",
    description: "Коктейли и напитки",
    icon: "🍸",
    difficulty_range: [3, 4]
  },
  {
    id: "room_service",
    name: "Room Service",
    description: "Обслуживание в номерах",
    icon: "🏨",
    difficulty_range: [3, 4]
  },
  {
    id: "cultural",
    name: "Культурная чувствительность",
    description: "Работа с разными культурами",
    icon: "🌍",
    difficulty_range: [4, 5]
  },
  {
    id: "interactive",
    name: "Интерактивные диалоги",
    description: "Практика полных диалогов",
    icon: "💬",
    difficulty_range: [2, 4]
  },
  {
    id: "roleplay",
    name: "Ролевые игры",
    description: "Сложные ситуации",
    icon: "🎭",
    difficulty_range: [4, 5]
  }
];

export function getLessonById(id) {
  return lessons.find(lesson => lesson.id === parseInt(id));
}

export function getRandomLesson(category = null, difficulty = null) {
  let filteredLessons = lessons;
  
  if (category) {
    filteredLessons = filteredLessons.filter(lesson => lesson.category === category);
  }
  
  if (difficulty) {
    filteredLessons = filteredLessons.filter(lesson => lesson.difficulty_level === difficulty);
  }
  
  if (filteredLessons.length === 0) {
    return lessons[Math.floor(Math.random() * lessons.length)];
  }
  
  return filteredLessons[Math.floor(Math.random() * filteredLessons.length)];
}

export function getLessonsByCategory(category) {
  return lessons.filter(lesson => lesson.category === category);
}

export function getLessonsByDifficulty(difficulty) {
  return lessons.filter(lesson => lesson.difficulty_level === difficulty);
}

export function getAllLessons() {
  return lessons;
}

export function getCategories() {
  return lessonCategories;
}
