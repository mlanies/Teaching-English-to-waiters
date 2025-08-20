# API Documentation

## Обзор архитектуры

### Основные компоненты

#### 1. Handlers
- `telegram.js` - обработка webhook от Telegram

#### 2. Services
- `messageProcessor.js` - обработка входящих сообщений
- `userService.js` - управление пользователями
- `sessionService.js` - управление сессиями
- `lessonService.js` - логика уроков
- `aiService.js` - AI-анализ ответов
- `telegram.js` - Telegram API клиент

#### 3. Commands
- `start.js` - команда /start
- `lesson.js` - команда /lesson
- `profile.js` - команда /profile
- `achievements.js` - команда /achievements
- `help.js` - команда /help

## API Endpoints

### Telegram Webhook
```
POST / (root)
Content-Type: application/json
```

**Request Body:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 123,
    "from": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "/start"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "result": {
    "message_id": 124,
    "text": "Добро пожаловать!",
    "reply_markup": {
      "inline_keyboard": [...]
    }
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    language_code TEXT DEFAULT 'ru',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    preferences JSON
);
```

### Lessons Table
```sql
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL,
    content JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

## Error Handling

### Стандартные коды ошибок
- `400` - Bad Request (неверные данные)
- `401` - Unauthorized (неавторизованный доступ)
- `403` - Forbidden (доступ запрещен)
- `404` - Not Found (ресурс не найден)
- `429` - Too Many Requests (превышен лимит запросов)
- `500` - Internal Server Error (внутренняя ошибка сервера)

### Формат ошибки
```json
{
  "error": {
    "code": 400,
    "message": "Invalid input data",
    "details": {
      "field": "telegram_id",
      "reason": "Required field missing"
    }
  }
}
```

## Rate Limiting

- **Пользователи**: 10 запросов в минуту
- **AI-анализ**: 5 запросов в минуту
- **Уроки**: 3 урока в минуту

## Caching Strategy

### KV Storage Namespaces
- `USER_SESSIONS` - активные сессии пользователей
- `LESSON_CACHE` - кэш уроков и контента
- `AI_CONTEXT` - контекст AI-анализа

### TTL (Time To Live)
- Сессии: 30 минут
- Уроки: 2 часа
- AI-анализ: 1 час

## Security

### Валидация входных данных
- Санитизация текста
- Проверка длины сообщений
- Валидация Telegram webhook

### Аутентификация
- Проверка секретного токена Telegram
- Валидация пользовательских данных

## Monitoring

### Логирование
- Все запросы логируются
- Ошибки с полным стектрейсом
- Метрики производительности

### Метрики
- Количество активных пользователей
- Время выполнения запросов
- Успешность AI-анализа
- Статистика уроков
