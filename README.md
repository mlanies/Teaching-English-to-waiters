# 🍽️ English for Waiters Bot

> Telegram-бот для изучения английского языка официантами с использованием искусственного интеллекта

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Описание

**English for Waiters Bot** - это интерактивный Telegram-бот, который помогает официантам изучать английский язык для работы в ресторанной сфере. Бот использует AI-анализ ответов, голосовые сообщения и адаптивную систему обучения.

### ✨ Основные возможности

- 🎯 **Два типа обучения**:
  - ✍️ Текстовые ответы - пользователь пишет ответы самостоятельно
  - ☑️ Выбор ответа - быстрая проверка знаний из вариантов

- 🤖 **AI-анализ**: Персонализированная обратная связь с объяснениями на русском языке
- 🎵 **Голосовые сообщения**: Произношение фраз с помощью TTS
- 📊 **Система прогресса**: Уровни, опыт, достижения
- 🏆 **Геймификация**: Рейтинги, достижения, серии дней
- 📱 **Мобильная оптимизация**: Полная поддержка мобильных устройств

### 🎓 Категории обучения

| Категория | Описание | Уровень |
|-----------|----------|---------|
| 👋 Приветствие гостей | Базовые фразы для встречи клиентов | 1-2 |
| 📋 Работа с меню | Объяснение блюд и ингредиентов | 2-3 |
| 📝 Прием заказов | Фразы для приема заказов | 2-3 |
| 💳 Оплата и расчет | Работа с оплатой и сдачей | 3-4 |
| 🚨 Экстренные ситуации | Решение проблем и извинения | 4-5 |
| 🍷 Fine Dining | Высокая кухня и вино | 4-5 |
| 🍔 Fast Food | Быстрое обслуживание | 1-2 |
| 🍸 Бар | Коктейли и напитки | 3-4 |
| 🏨 Room Service | Обслуживание в номерах | 3-4 |
| 🌍 Культурная чувствительность | Работа с разными культурами | 4-5 |

## 🚀 Технологии

- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV
- **AI**: Cloudflare AI (Llama 2)
- **TTS**: Cloudflare AI
- **Bot API**: Telegram Bot API

## 📦 Установка и развертывание

### Предварительные требования

- Node.js 18+
- Cloudflare аккаунт
- Telegram Bot Token

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/teaching-english-to-waiters.git
cd teaching-english-to-waiters
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

Скопируйте `wrangler.example.toml` в `wrangler.toml` и настройте:

```toml
name = "english-for-waiters-bot"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
BOT_NAME = "English for Waiters Bot"
MAX_LESSONS_PER_DAY = "5"

[[kv_namespaces]]
binding = "USER_SESSIONS"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "LESSON_CACHE"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "AI_CONTEXT"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DB"
database_name = "english-waiters-db"
database_id = "your-d1-database-id"

[ai]
binding = "AI"
```

### 4. Создание ресурсов Cloudflare

```bash
# Создание D1 базы данных
wrangler d1 create english-waiters-db

# Создание KV пространств имен
wrangler kv:namespace create "USER_SESSIONS"
wrangler kv:namespace create "LESSON_CACHE"
wrangler kv:namespace create "AI_CONTEXT"
```

### 5. Настройка секретов

```bash
# Telegram Bot Token
wrangler secret put TELEGRAM_BOT_TOKEN

# Опционально: Cloudflare AI Token
wrangler secret put CLOUDFLARE_AI_TOKEN
```

### 6. Инициализация базы данных

```bash
# Применение миграций
wrangler d1 execute english-waiters-db --file=./migrations/0000_initial_schema.sql
wrangler d1 execute english-waiters-db --file=./migrations/0001_social_features.sql
```

### 7. Развертывание

```bash
wrangler deploy
```

### 8. Настройка Telegram Webhook

```bash
# Установите webhook для вашего бота
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-worker-subdomain.workers.dev"}'
```

## 🏗️ Архитектура проекта

```
src/
├── index.js                 # Точка входа Worker
├── handlers/
│   └── telegram.js          # Обработчик Telegram webhook
├── services/
│   ├── aiService.js         # Интеграция с Cloudflare AI
│   ├── lessonService.js     # Логика уроков
│   ├── userService.js       # Управление пользователями
│   ├── messageProcessor.js  # Обработка сообщений
│   ├── callbackProcessor.js # Обработка кнопок
│   ├── telegram.js          # Telegram API
│   ├── ttsService.js        # Text-to-Speech
│   └── ...
├── commands/
│   ├── start.js             # Команда /start
│   ├── lesson.js            # Команды уроков
│   ├── profile.js           # Профиль пользователя
│   └── ...
├── database/
│   └── init.js              # Инициализация БД
└── config/
    └── config.js            # Конфигурация
```

## 🎮 Использование

### Основные команды

- `/start` - Начать работу с ботом
- `/profile` - Посмотреть профиль
- `/help` - Помощь
- `/lesson` - Начать урок

### Типы уроков

#### ✍️ Текстовые ответы
- Пользователь пишет ответ самостоятельно
- AI анализирует грамматику, контекст и профессиональность
- Подробная обратная связь с объяснениями

#### ☑️ Выбор ответа
- Быстрая проверка знаний
- 4 варианта ответа (1 правильный + 3 неправильных)
- Мгновенная обратная связь

### Система прогресса

- **Уровни**: От 1 до ∞ (на основе опыта)
- **Опыт (XP)**: За правильные ответы
- **Достижения**: За различные milestone'ы
- **Серии дней**: За ежедневное обучение

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `BOT_NAME` | Название бота | "English for Waiters Bot" |
| `MAX_LESSONS_PER_DAY` | Лимит уроков в день | 5 |

### Секреты

| Секрет | Описание | Обязательный |
|--------|----------|--------------|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | ✅ |
| `CLOUDFLARE_AI_TOKEN` | Токен Cloudflare AI | ❌ |

## 📊 Мониторинг

### Логи

Бот логирует основные события:
- Регистрация пользователей
- Прохождение уроков
- Ошибки AI
- Performance метрики

### Метрики

- Активные пользователи
- Количество уроков
- Accuracy AI анализа
- Response time

## 🤝 Участие в разработке

### Добавление новых уроков

1. Откройте `src/services/lessonData.js`
2. Добавьте новый урок в массив `lessons`:

```javascript
{
  id: 13,
  title: "Ваш новый урок",
  description: "Описание урока",
  category: "категория",
  difficulty_level: 2,
  content: {
    questions: [
      {
        id: 1,
        text: "Вопрос на русском?",
        type: "text",
        correctAnswer: "Correct answer",
        correctAnswers: ["Correct answer", "Alternative answer"],
        topic: "тема",
        explanation: "Объяснение на русском"
      }
    ]
  }
}
```

### Структура базы данных

Основные таблицы:
- `users` - Профили пользователей
- `lessons` - Уроки (дублирует статические данные)
- `progress` - Прогресс обучения
- `achievements` - Система достижений
- `user_achievements` - Достижения пользователей

## 🐛 Известные проблемы

- ~~Ошибка парсинга JSON от AI~~ ✅ Исправлено
- ~~FOREIGN KEY constraint при сохранении прогресса~~ ✅ Исправлено
- ~~Неполное меню при команде /start~~ ✅ Исправлено

## 📄 Лицензия

MIT License. См. [LICENSE](LICENSE) для подробностей.

## 🙏 Благодарности

- [Cloudflare](https://cloudflare.com/) за платформу Workers
- [Telegram](https://telegram.org/) за Bot API
- Сообществу разработчиков за feedback

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-username/teaching-english-to-waiters/issues)
2. Создайте новый Issue с подробным описанием
3. Свяжитесь с автором

---

**Автор**: [Ваше имя](https://github.com/your-username)  
**Версия**: 1.0.0  
**Статус**: ✅ Готов к использованию