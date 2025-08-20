// Тесты для AI сервиса

import { analyzeWithAI } from '../../src/services/aiService.js';

// Мок для Cloudflare AI
const mockAI = {
  run: jest.fn()
};

// Мок для пользователя
const mockUser = {
  id: 1,
  level: 2,
  experience_points: 150
};

// Мок для вопроса
const mockQuestion = {
  text: "Как поприветствовать гостя?",
  correctAnswers: ["Hello, welcome!", "Good evening!"],
  topic: "greeting"
};

describe('AI Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should analyze correct answer', async () => {
    const mockResponse = {
      response: JSON.stringify({
        score: 0.9,
        feedback: "Отличный ответ!",
        correct_answer: "Hello, welcome!",
        explanation: "Правильное приветствие",
        suggestions: "Продолжайте в том же духе!",
        grammar_score: 0.9,
        context_score: 0.9,
        politeness_score: 0.9
      })
    };

    mockAI.run.mockResolvedValue(mockResponse);

    const result = await analyzeWithAI(mockAI, "Hello, welcome!", mockUser, mockQuestion);

    expect(result.score).toBe(0.9);
    expect(result.feedback).toBe("Отличный ответ!");
    expect(result.correct_answer).toBe("Hello, welcome!");
  });

  test('should handle AI errors gracefully', async () => {
    mockAI.run.mockRejectedValue(new Error('AI service unavailable'));

    const result = await analyzeWithAI(mockAI, "Hello", mockUser, mockQuestion);

    expect(result.score).toBe(0.5);
    expect(result.feedback).toBe('Спасибо за ответ!');
  });

  test('should handle invalid JSON response', async () => {
    const mockResponse = {
      response: "Invalid JSON"
    };

    mockAI.run.mockResolvedValue(mockResponse);

    const result = await analyzeWithAI(mockAI, "Hello", mockUser, mockQuestion);

    expect(result.score).toBe(0.5);
    expect(result.feedback).toBe('Спасибо за ответ!');
  });
});
