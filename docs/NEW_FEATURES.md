# 🚀 Новые функции - Расширение контента и социальные возможности

## 📚 Готовые примеры фраз

### 🎯 Цель
Быстрое обучение официантов необходимым фразам для работы с иностранными гостями через готовые примеры с озвучиванием.

### 📖 Категории примеров

#### 1. 👋 Приветствие гостей
- Стандартные приветствия
- Приветствие по времени суток
- Уточнение количества гостей
- Предложение столиков

#### 2. 📋 Работа с меню
- Представление меню
- Рекомендации блюд
- Объяснение ингредиентов
- Предупреждения об аллергенах

#### 3. 📝 Прием заказов
- Готовность к заказу
- Уточнение деталей
- Степень прожарки мяса
- Заказ напитков

#### 4. 💳 Оплата и расчет
- Запрос счета
- Озвучивание суммы
- Способ оплаты
- Возврат сдачи

#### 5. 🚨 Решение проблем
- Извинения за задержки
- Предложение замен
- Вызов менеджера
- Компенсации

#### 6. 🍷 Fine Dining
- Представление вина
- Детальное описание блюд
- Профессиональная сервировка

#### 7. 🍔 Fast Food
- Быстрые заказы
- Уточнение на вынос
- Время готовности

#### 8. 💬 Полные диалоги
- Встреча гостя
- Прием заказа
- Полные сценарии общения

### 🔊 Функции озвучивания

#### Типы озвучивания:
1. **Обычная скорость** - для понимания
2. **Медленная скорость** - для изучения
3. **По слогам** - для произношения
4. **С повторением** - для запоминания

#### Доступные голоса:
- **Alloy** - Нейтральный голос
- **Echo** - Мужской голос
- **Fable** - Детский голос
- **Onyx** - Глубокий мужской
- **Nova** - Женский голос
- **Shimmer** - Мягкий женский

## 🏅 Социальные функции

### 📊 Рейтинг пользователей
- Топ-10 игроков
- Фильтрация по периодам (неделя/месяц/все время)
- Позиция пользователя в рейтинге
- Статистика по уровням и опыту

### 🎯 Соревнования
- Временные турниры
- Специальные правила
- Система очков
- Призы и достижения

### 👥 Группы обучения
- Создание групп по интересам
- Совместное изучение
- Обмен опытом
- Групповые достижения

## 🗄️ Структура базы данных

### Новые таблицы:

#### competitions
```sql
CREATE TABLE competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    rules JSON,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### competition_participants
```sql
CREATE TABLE competition_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### study_groups
```sql
CREATE TABLE study_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    max_members INTEGER DEFAULT 10,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### study_group_members
```sql
CREATE TABLE study_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### group_messages
```sql
CREATE TABLE group_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### notifications
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Техническая реализация

### Новые сервисы:

#### examplesService.js
- Управление готовыми примерами
- Категоризация контента
- Поиск по примерам
- Фильтрация по сложности

#### ttsService.js
- Озвучивание текста через Cloudflare AI
- Различные режимы произношения
- Поддержка диалогов
- Настройка голосов

#### socialService.js
- Рейтинги пользователей
- Управление соревнованиями
- Группы обучения
- Система уведомлений

### Новые команды:

#### examples.js
- `handleExamplesCommand` - главное меню примеров
- `handleExamplesCategoryCommand` - категории примеров
- `handleExampleCommand` - просмотр примера
- `handleTTSCommand` - озвучивание
- `handleRandomExampleCommand` - случайный пример

#### leaderboard.js
- `handleLeaderboardCommand` - отображение рейтинга
- `handleLeaderboardCallback` - фильтрация по периодам

## 🎯 Преимущества новых функций

### Для обучения:
1. **Быстрый старт** - готовые фразы для немедленного использования
2. **Аудио поддержка** - правильное произношение
3. **Практичность** - реальные ситуации из работы
4. **Прогрессия** - от простого к сложному

### Для мотивации:
1. **Соревнование** - рейтинги и турниры
2. **Социализация** - группы и друзья
3. **Достижения** - система наград
4. **Прогресс** - отслеживание результатов

### Для работодателей:
1. **Быстрая подготовка** - сотрудники готовы к работе
2. **Стандартизация** - единые фразы и подходы
3. **Качество обслуживания** - профессиональное общение
4. **Экономия времени** - сокращение обучения

## 🚀 Планы развития

### Краткосрочные (1-2 недели):
- [ ] Интеграция TTS в уроки
- [ ] Добавление больше примеров
- [ ] Улучшение поиска
- [ ] Мобильная оптимизация

### Среднесрочные (1 месяц):
- [ ] Видео примеры
- [ ] Интерактивные диалоги
- [ ] Персонализация контента
- [ ] Аналитика прогресса

### Долгосрочные (2-3 месяца):
- [ ] AR/VR симуляции
- [ ] Интеграция с POS системами
- [ ] Многоязычная поддержка
- [ ] Корпоративные аккаунты
