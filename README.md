# 🍽️ English for Waiters Bot

Telegram бот для обучения официантов английскому языку с использованием AI и интерактивных уроков.

## 🚀 Возможности

### 📚 Обучение
- **Интерактивные уроки** с разными категориями и уровнями сложности
- **AI-анализ ответов** с персонализированной обратной связью
- **Система достижений** и прогресса обучения
- **Персонализированные цели** обучения

### 🎯 Готовые примеры
- **Категории фраз**: приветствие, заказ, обслуживание, оплата
- **Text-to-Speech (TTS)** с разными режимами:
  - 🔊 Обычная скорость
  - 🐌 Медленная скорость  
  - 📖 По слогам
  - 🔄 С повторением
- **Практические диалоги** для реальных ситуаций

### 🏆 Социальные функции
- **Рейтинг пользователей** и лидерборд
- **Соревнования** между участниками
- **Групповое обучение** и чаты
- **Система друзей** и уведомления

### 🤖 AI-функции
- **Анализ произношения** и грамматики
- **Персонализированные рекомендации**
- **Адаптивная сложность** уроков
- **Text-to-Speech** для правильного произношения

## 🛠️ Технологии

- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **AI**: Cloudflare AI (OpenAI, MeloTTS)
- **Bot API**: Telegram Bot API
- **Language**: JavaScript/Node.js

## 📦 Установка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd Teaching-English-to-waiters
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка Cloudflare
```bash
# Установка Wrangler CLI
npm install -g wrangler

# Авторизация в Cloudflare
wrangler login
```

### 4. Создание ресурсов Cloudflare
```bash
# Создание D1 базы данных
wrangler d1 create english-waiters-db

# Создание KV пространств
wrangler kv namespace create USER_SESSIONS
wrangler kv namespace create LESSON_CACHE
wrangler kv namespace create AI_CONTEXT
```

### 5. Настройка конфигурации
Скопируйте `wrangler.example.toml` в `wrangler.toml` и заполните:
- ID базы данных D1
- ID KV пространств
- Telegram Bot Token
- Другие переменные окружения

### 6. Применение миграций
```bash
wrangler d1 execute english-waiters-db --file=./migrations/0000_initial_schema.sql
wrangler d1 execute english-waiters-db --file=./migrations/0001_social_features.sql
```

### 7. Развертывание
```bash
wrangler deploy
```

## 🏗️ Архитектура

```
src/
├── commands/          # Команды бота
│   ├── achievements.js
│   ├── detailedStats.js
│   ├── examples.js
│   ├── help.js
│   ├── leaderboard.js
│   ├── learningGoals.js
│   ├── lesson.js
│   ├── profile.js
│   └── start.js
├── database/          # Инициализация БД
│   └── init.js
├── handlers/          # Обработчики
│   └── telegram.js
├── services/          # Бизнес-логика
│   ├── aiService.js
│   ├── callbackProcessor.js
│   ├── examplesService.js
│   ├── lessonData.js
│   ├── lessonService.js
│   ├── messageProcessor.js
│   ├── sessionService.js
│   ├── socialService.js
│   ├── telegram.js
│   ├── ttsService.js
│   └── userService.js
└── index.js           # Точка входа
```

## 📊 База данных

### Основные таблицы:
- `users` - пользователи и их прогресс
- `lessons` - уроки и результаты
- `achievements` - достижения пользователей
- `social_features` - социальные функции
- `leaderboard` - рейтинги пользователей
- `competitions` - соревнования
- `study_groups` - учебные группы

## 🎮 Использование

### Основные команды:
- `/start` - начало работы с ботом
- `/help` - справка по командам
- `/lesson` - начать урок
- `/examples` - готовые примеры фраз
- `/profile` - профиль пользователя
- `/leaderboard` - рейтинг пользователей
- `/achievements` - достижения

### Навигация:
- Используйте кнопки для навигации по меню
- Выбирайте категории уроков и примеров
- Настройте TTS режимы для озвучивания
- Участвуйте в соревнованиях и группах

## 🔧 Разработка

### Запуск тестов:
```bash
npm test
```

### Линтинг:
```bash
npm run lint
```

### Форматирование:
```bash
npm run format
```

### Локальная разработка:
```bash
wrangler dev
```

## 📝 Документация

Подробная документация находится в папке `docs/`:
- `API.md` - API документация
- `NEW_FEATURES.md` - новые функции
- `VOICE_FEATURES.md` - голосовые функции

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 👥 Авторы

- Разработка: [Ваше имя]
- Идея: Обучение официантов английскому языку

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи в Cloudflare Dashboard
2. Убедитесь в правильности конфигурации
3. Создайте Issue в репозитории

---

**English for Waiters Bot** - ваш помощник в обучении английскому языку для работы с иностранными гостями! 🍽️🇬🇧
