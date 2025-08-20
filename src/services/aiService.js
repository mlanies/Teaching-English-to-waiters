export async function analyzeWithAI(ai, text, user, question = null) {
  try {
    let prompt = '';
    let context = '';

    if (question) {
      // Определяем тип вопроса для специфичного анализа
      const questionType = question.type || 'text';
      
      if (questionType === 'dialogue_start' || questionType === 'dialogue_response') {
        // Анализ диалоговых ответов
        context = `Контекст: Пользователь участвует в интерактивном диалоге для официантов.
Тип ответа: ${questionType === 'dialogue_start' ? 'Начало диалога' : 'Ответ в диалоге'}
Вопрос: ${question.text}
Правильный ответ: ${question.correctAnswers ? question.correctAnswers.join(', ') : question.correctAnswer}
Тема: ${question.topic}
Уровень пользователя: ${user.level}`;

        prompt = `${context}

Проанализируйте ответ пользователя в контексте диалога: "${text}"

Оцените:
1. Правильность ответа (0-1)
2. Естественность диалога (0-1)
3. Профессиональность (0-1)
4. Вежливость (0-1)

ВСЕГДА дайте подробный анализ на русском языке:
- Правильный ответ (обязательно)
- Объяснение почему это правильно (обязательно)
- Оценка ответа пользователя
- Что можно улучшить
- Практические советы для диалога

Формат ответа:
{
  "score": 0.85,
  "feedback": "Отличный ответ для начала диалога! Вы использовали профессиональную фразу...",
  "correct_answer": "Hello, welcome to our restaurant!",
  "explanation": "Эта фраза идеальна для начала диалога с гостем...",
  "suggestions": "Продолжайте использовать такие естественные диалоговые фразы!",
  "grammar_score": 0.9,
  "dialogue_score": 0.85,
  "professional_score": 0.8,
  "politeness_score": 0.85
}`;
      } else if (questionType === 'roleplay_response') {
        // Анализ ролевых игр
        context = `Контекст: Пользователь участвует в ролевой игре - сложная ситуация с гостем.
Сценарий: ${question.topic}
Вопрос: ${question.text}
Правильный ответ: ${question.correctAnswers ? question.correctAnswers.join(', ') : question.correctAnswer}
Уровень пользователя: ${user.level}`;

        prompt = `${context}

Проанализируйте ответ пользователя в сложной ситуации: "${text}"

Оцените:
1. Правильность решения проблемы (0-1)
2. Профессиональность в сложной ситуации (0-1)
3. Эмпатию и понимание (0-1)
4. Эффективность решения (0-1)

ВСЕГДА дайте подробный анализ на русском языке:
- Правильный ответ (обязательно)
- Объяснение стратегии решения (обязательно)
- Оценка ответа пользователя
- Альтернативные решения
- Советы для подобных ситуаций

Формат ответа:
{
  "score": 0.8,
  "feedback": "Хороший подход к решению проблемы! Вы проявили профессионализм...",
  "correct_answer": "I apologize for that, let me fix this immediately",
  "explanation": "В сложных ситуациях важно сначала извиниться, затем предложить решение...",
  "suggestions": "Попробуйте также предложить компенсацию за неудобства",
  "grammar_score": 0.8,
  "problem_solving_score": 0.85,
  "professional_score": 0.8,
  "empathy_score": 0.75
}`;
      } else {
        // Стандартный анализ ответа на вопрос урока
        context = `Контекст: Пользователь отвечает на вопрос урока для официантов.
Вопрос: ${question.text}
Правильный ответ: ${question.correctAnswers ? question.correctAnswers.join(', ') : question.correctAnswer}
Тема: ${question.topic}
Уровень пользователя: ${user.level}`;

        prompt = `${context}

Проанализируйте ответ пользователя: "${text}"

Оцените:
1. Правильность ответа (0-1)
2. Грамматическую корректность (0-1)
3. Соответствие контексту работы официанта (0-1)
4. Вежливость и профессиональность (0-1)

ВСЕГДА дайте подробный анализ на русском языке:
- Правильный ответ (обязательно)
- Объяснение почему это правильно (обязательно)
- Оценка ответа пользователя
- Что можно улучшить
- Практические советы

Если ответ правильный - похвалите и объясните почему он хороший.
Если ответ неправильный - покажите правильный вариант и объясните почему.

Формат ответа:
{
  "score": 0.85,
  "feedback": "Ваш ответ правильный! Вы использовали отличную фразу 'Hello, welcome to our restaurant!' Это показывает профессионализм и дружелюбие.",
  "correct_answer": "Hello, welcome to our restaurant!",
  "explanation": "Эта фраза идеальна для приветствия гостей в ресторане. Она сочетает приветствие 'Hello' с официальным приглашением 'welcome to our restaurant', что создает дружелюбную и профессиональную атмосферу.",
  "suggestions": "Продолжайте использовать такие полные и вежливые фразы!",
  "grammar_score": 0.9,
  "context_score": 0.8,
  "politeness_score": 0.85
}`;
      }
    } else {
      // Общий анализ текста пользователя
      context = `Контекст: Пользователь изучает английский для работы официантом.
Уровень пользователя: ${user.level}
Опыт: ${user.experience_points} XP`;

      prompt = `${context}

Проанализируйте текст пользователя: "${text}"

Оцените:
1. Общее качество английского (0-1)
2. Соответствие профессиональному контексту официанта (0-1)
3. Грамматическую корректность (0-1)
4. Словарный запас (0-1)

Дайте конструктивный фидбек на русском языке.

Формат ответа:
{
  "score": 0.75,
  "feedback": "Ваш английский хороший! Особенно хорошо...",
  "suggestions": "Рекомендую обратить внимание на...",
  "grammar_score": 0.8,
  "vocabulary_score": 0.7,
  "professional_score": 0.75
}`;
    }

    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по английскому языку для официантов. Анализируй ответы пользователей и давай конструктивный фидбек. Всегда отвечай на русском языке.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    });

    // Парсим JSON ответ
    try {
      // Пытаемся извлечь JSON из ответа, если есть дополнительный текст
      let jsonString = response.response.trim();
      
      // Ищем начало и конец JSON объекта
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
      
      const aiResponse = JSON.parse(jsonString);
      return {
        score: aiResponse.score || 0.5,
        feedback: aiResponse.feedback || 'Спасибо за ответ!',
        correct_answer: aiResponse.correct_answer || null,
        explanation: aiResponse.explanation || null,
        suggestions: aiResponse.suggestions || 'Продолжайте практиковаться!',
        grammar_score: aiResponse.grammar_score || 0.5,
        vocabulary_score: aiResponse.vocabulary_score || 0.5,
        context_score: aiResponse.context_score || 0.5,
        politeness_score: aiResponse.politeness_score || 0.5,
        dialogue_score: aiResponse.dialogue_score || 0.5,
        problem_solving_score: aiResponse.problem_solving_score || 0.5,
        professional_score: aiResponse.professional_score || 0.5,
        empathy_score: aiResponse.empathy_score || 0.5
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', response.response);
      
      // Если не удалось распарсить JSON, возвращаем базовый анализ
      const correctAnswer = question ? (question.correctAnswer || question.correctAnswers?.[0] || 'Правильный ответ не найден') : 'Правильный ответ не найден';
      const explanation = question ? `Это правильный ответ для вопроса: "${question.text}". Используйте эту фразу в работе с гостями.` : 'Объяснение не доступно';
      
      return {
        score: 0.7,
        feedback: response.response || 'Спасибо за ответ!',
        correct_answer: correctAnswer,
        explanation: explanation,
        suggestions: 'Продолжайте практиковаться!',
        grammar_score: 0.7,
        vocabulary_score: 0.7,
        context_score: 0.7,
        politeness_score: 0.7,
        dialogue_score: 0.7,
        problem_solving_score: 0.7,
        professional_score: 0.7,
        empathy_score: 0.7
      };
    }

  } catch (error) {
    console.error('Error in AI analysis:', error);
    
    // Возвращаем базовый ответ в случае ошибки
    const correctAnswer = question ? (question.correctAnswer || question.correctAnswers?.[0] || 'Правильный ответ не найден') : 'Правильный ответ не найден';
    const explanation = question ? `Это правильный ответ для вопроса: "${question.text}". Используйте эту фразу в работе с гостями.` : 'Объяснение не доступно';
    
    return {
      score: 0.5,
      feedback: 'Спасибо за ответ! Продолжайте практиковаться.',
      correct_answer: correctAnswer,
      explanation: explanation,
      suggestions: 'Рекомендую больше практиковаться с носителями языка.',
      grammar_score: 0.5,
      vocabulary_score: 0.5,
      context_score: 0.5,
      politeness_score: 0.5,
      dialogue_score: 0.5,
      problem_solving_score: 0.5,
      professional_score: 0.5,
      empathy_score: 0.5
    };
  }
}

export async function generatePersonalizedLesson(ai, user, weakAreas = []) {
  try {
    const prompt = `Пользователь изучает английский для работы официантом.
Уровень: ${user.level}
Опыт: ${user.experience_points} XP
Слабые области: ${weakAreas.join(', ') || 'нет данных'}

Создайте персонализированный вопрос для урока, учитывая:
1. Уровень сложности пользователя
2. Слабые области, которые нужно улучшить
3. Практическую применимость в работе официанта

Формат ответа:
{
  "question": "Как правильно поприветствовать гостя, который пришел в ресторан в 8 вечера?",
  "correct_answers": ["good evening", "welcome", "hello"],
  "explanation": "В вечернее время лучше использовать 'Good evening'...",
  "topic": "greeting",
  "difficulty": 2
}`;

    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по созданию учебных материалов для официантов. Создавай практичные и полезные вопросы.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    });

    try {
      return JSON.parse(response.response);
    } catch (parseError) {
      return {
        question: "Как поприветствовать гостя?",
        correct_answers: ["hello", "welcome"],
        explanation: "Используйте дружелюбные приветствия",
        topic: "greeting",
        difficulty: 1
      };
    }

  } catch (error) {
    console.error('Error generating personalized lesson:', error);
    return null;
  }
}

// Новая функция для анализа прогресса пользователя
export async function analyzeUserProgress(ai, user, progressData) {
  try {
    const prompt = `Проанализируйте прогресс пользователя в изучении английского для официантов:

Данные пользователя:
- Уровень: ${user.level}
- Опыт: ${user.experience_points} XP
- Завершено уроков: ${user.total_lessons_completed}
- Серия дней: ${user.streak_days}

Статистика прогресса:
${JSON.stringify(progressData, null, 2)}

Дайте рекомендации по улучшению обучения.

Формат ответа:
{
  "strengths": ["Хорошо дается грамматика", "Отличная мотивация"],
  "weak_areas": ["Нужно улучшить произношение", "Слабая лексика в области меню"],
  "recommendations": ["Практикуйте больше диалогов", "Изучите категорию 'меню'"],
  "next_goals": ["Достичь уровня 3", "Завершить 10 уроков"]
}`;

    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по анализу прогресса обучения. Давай конструктивные рекомендации.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    });

    try {
      return JSON.parse(response.response);
    } catch (parseError) {
      return {
        strengths: ["Хорошая мотивация"],
        weak_areas: ["Нужно больше практики"],
        recommendations: ["Продолжайте регулярные занятия"],
        next_goals: ["Повысить уровень"]
      };
    }

  } catch (error) {
    console.error('Error analyzing user progress:', error);
    return null;
  }
}
