// Сервис готовых примеров для официантов

export const readyExamples = {
  // Приветствие и встреча гостей
  greeting: {
    title: "Приветствие гостей",
    examples: [
      {
        id: "greet_1",
        title: "Стандартное приветствие",
        russian: "Добро пожаловать в наш ресторан!",
        english: "Welcome to our restaurant!",
        context: "Когда гость входит в ресторан",
        difficulty: 1,
        category: "greeting"
      },
      {
        id: "greet_2",
        title: "Приветствие по времени",
        russian: "Добрый вечер! Как дела?",
        english: "Good evening! How are you?",
        context: "Вечернее приветствие",
        difficulty: 1
      },
      {
        id: "greet_3",
        title: "Приветствие с вопросом о столике",
        russian: "Здравствуйте! На сколько человек столик?",
        english: "Hello! How many people for the table?",
        context: "Уточнение количества гостей",
        difficulty: 2
      },
      {
        id: "greet_4",
        title: "Предложение столика",
        russian: "У нас есть свободный столик у окна",
        english: "We have a free table by the window",
        context: "Предложение конкретного места",
        difficulty: 2
      }
    ]
  },

  // Работа с меню
  menu: {
    title: "Работа с меню",
    examples: [
      {
        id: "menu_1",
        title: "Представление меню",
        russian: "Вот наше меню. Что вас интересует?",
        english: "Here's our menu. What interests you?",
        context: "Подача меню гостю",
        difficulty: 2
      },
      {
        id: "menu_2",
        title: "Рекомендация блюда",
        russian: "Это наше фирменное блюдо. Очень популярно",
        english: "This is our signature dish. Very popular",
        context: "Рекомендация специального блюда",
        difficulty: 3
      },
      {
        id: "menu_3",
        title: "Объяснение ингредиентов",
        russian: "Блюдо содержит морепродукты и овощи",
        english: "The dish contains seafood and vegetables",
        context: "Описание состава блюда",
        difficulty: 3
      },
      {
        id: "menu_4",
        title: "Предупреждение об аллергенах",
        russian: "В блюде есть орехи. У вас аллергия?",
        english: "The dish contains nuts. Do you have allergies?",
        context: "Важно для безопасности гостей",
        difficulty: 3
      }
    ]
  },

  // Прием заказов
  ordering: {
    title: "Прием заказов",
    examples: [
      {
        id: "order_1",
        title: "Готовность к заказу",
        russian: "Готовы ли вы сделать заказ?",
        english: "Are you ready to order?",
        context: "Стандартный вопрос перед заказом",
        difficulty: 1
      },
      {
        id: "order_2",
        title: "Уточнение заказа",
        russian: "Что вы будете заказывать?",
        english: "What would you like to order?",
        context: "Запрос заказа",
        difficulty: 1
      },
      {
        id: "order_3",
        title: "Уточнение степени прожарки",
        russian: "Как вы хотите, чтобы мясо было прожарено?",
        english: "How would you like your meat cooked?",
        context: "Для мясных блюд",
        difficulty: 3
      },
      {
        id: "order_4",
        title: "Предложение напитков",
        russian: "Что вы будете пить?",
        english: "What would you like to drink?",
        context: "Заказ напитков",
        difficulty: 1
      }
    ]
  },

  // Оплата и расчет
  payment: {
    title: "Оплата и расчет",
    examples: [
      {
        id: "pay_1",
        title: "Запрос счета",
        russian: "Счет, пожалуйста",
        english: "The bill, please",
        context: "Стандартная просьба о счете",
        difficulty: 1
      },
      {
        id: "pay_2",
        title: "Озвучивание суммы",
        russian: "С вас 25 долларов",
        english: "That will be 25 dollars",
        context: "Сообщение суммы к оплате",
        difficulty: 2
      },
      {
        id: "pay_3",
        title: "Уточнение способа оплаты",
        russian: "Вместе или отдельно?",
        english: "Together or separate?",
        context: "Для групп гостей",
        difficulty: 2
      },
      {
        id: "pay_4",
        title: "Возврат сдачи",
        russian: "Вот ваша сдача",
        english: "Here's your change",
        context: "Возврат денег",
        difficulty: 1
      }
    ]
  },

  // Решение проблем
  problems: {
    title: "Решение проблем",
    examples: [
      {
        id: "problem_1",
        title: "Извинение за задержку",
        russian: "Извините за ожидание",
        english: "Sorry for the wait",
        context: "Когда заказ задерживается",
        difficulty: 2
      },
      {
        id: "problem_2",
        title: "Предложение замены",
        russian: "Могу предложить альтернативу",
        english: "I can offer an alternative",
        context: "Когда блюдо недоступно",
        difficulty: 3
      },
      {
        id: "problem_3",
        title: "Вызов менеджера",
        russian: "Сейчас позову менеджера",
        english: "I'll get the manager now",
        context: "Для сложных ситуаций",
        difficulty: 2
      },
      {
        id: "problem_4",
        title: "Компенсация",
        russian: "Мы предлагаем компенсацию",
        english: "We offer compensation",
        context: "Для серьезных проблем",
        difficulty: 4
      }
    ]
  },

  // Fine Dining
  fine_dining: {
    title: "Fine Dining",
    examples: [
      {
        id: "fine_1",
        title: "Представление вина",
        russian: "Позвольте предложить дегустацию вина",
        english: "Let me offer you a wine tasting",
        context: "В ресторанах высокой кухни",
        difficulty: 4
      },
      {
        id: "fine_2",
        title: "Описание блюда",
        russian: "Это блюдо готовится по особому рецепту",
        english: "This dish is prepared according to a special recipe",
        context: "Детальное описание",
        difficulty: 4
      },
      {
        id: "fine_3",
        title: "Сервировка",
        russian: "Позвольте правильно сервировать стол",
        english: "Let me properly set the table",
        context: "Профессиональная сервировка",
        difficulty: 4
      }
    ]
  },

  // Быстрое обслуживание
  fast_food: {
    title: "Fast Food",
    examples: [
      {
        id: "fast_1",
        title: "Быстрый заказ",
        russian: "Что будете заказывать?",
        english: "What will you order?",
        context: "Быстрое обслуживание",
        difficulty: 1
      },
      {
        id: "fast_2",
        title: "Уточнение на вынос",
        russian: "На вынос или здесь?",
        english: "To go or for here?",
        context: "Стандартный вопрос в фастфуде",
        difficulty: 1
      },
      {
        id: "fast_3",
        title: "Время готовности",
        russian: "Будет готово через 5 минут",
        english: "It will be ready in 5 minutes",
        context: "Информация о времени",
        difficulty: 2
      }
    ]
  },

  // Полные диалоги
  dialogues: {
    title: "Полные диалоги",
    examples: [
      {
        id: "dialogue_1",
        title: "Встреча гостя",
        russian: [
          "Официант: Добро пожаловать! На сколько человек?",
          "Гость: На двоих, пожалуйста",
          "Официант: Отлично! У нас есть столик у окна",
          "Гость: Спасибо, это идеально"
        ],
        english: [
          "Waiter: Welcome! How many people?",
          "Guest: For two, please",
          "Waiter: Great! We have a table by the window",
          "Guest: Thank you, that's perfect"
        ],
        context: "Полный диалог встречи",
        difficulty: 2
      },
      {
        id: "dialogue_2",
        title: "Прием заказа",
        russian: [
          "Официант: Готовы ли вы сделать заказ?",
          "Гость: Да, я возьму стейк",
          "Официант: Какой степени прожарки?",
          "Гость: Средней прожарки, пожалуйста"
        ],
        english: [
          "Waiter: Are you ready to order?",
          "Guest: Yes, I'll have a steak",
          "Waiter: How would you like it cooked?",
          "Guest: Medium, please"
        ],
        context: "Диалог заказа",
        difficulty: 3
      }
    ]
  }
};

// Функции для работы с примерами
export function getExamplesByCategory(category) {
  return readyExamples[category] || null;
}

export function getAllCategories() {
  return Object.keys(readyExamples).map(key => ({
    id: key,
    title: readyExamples[key].title,
    count: readyExamples[key].examples.length
  }));
}

export function getExampleById(category, exampleId) {
  const categoryExamples = readyExamples[category];
  if (!categoryExamples) return null;
  
  return categoryExamples.examples.find(example => example.id === exampleId);
}

export function getRandomExample(category = null) {
  if (category) {
    const categoryExamples = readyExamples[category];
    if (!categoryExamples) return null;
    
    const randomIndex = Math.floor(Math.random() * categoryExamples.examples.length);
    return categoryExamples.examples[randomIndex];
  } else {
    // Случайная категория
    const categories = Object.keys(readyExamples);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return getRandomExample(randomCategory);
  }
}

export function searchExamples(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  Object.keys(readyExamples).forEach(category => {
    readyExamples[category].examples.forEach(example => {
      if (example.russian.toLowerCase().includes(lowerQuery) ||
          example.english.toLowerCase().includes(lowerQuery) ||
          example.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          ...example,
          category: category
        });
      }
    });
  });
  
  return results;
}

// Функция для получения примеров по сложности
export function getExamplesByDifficulty(difficulty) {
  const results = [];
  
  Object.keys(readyExamples).forEach(category => {
    readyExamples[category].examples.forEach(example => {
      if (example.difficulty === difficulty) {
        results.push({
          ...example,
          category: category
        });
      }
    });
  });
  
  return results;
}
