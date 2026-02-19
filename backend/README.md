# PostgreSQL UI - Backend

Backend API для управления PostgreSQL базой данных.

## Структура проекта

```
backend/
├── src/
│   ├── config/           # Конфигурация (БД, и т.д.)
│   ├── controllers/      # Контроллеры (бизнес-логика)
│   ├── routes/          # Маршруты API
│   ├── middleware/      # Промежуточные обработчики
│   └── server.js        # Точка входа приложения
├── .env.example         # Пример переменных окружения
├── .gitignore
├── package.json
└── README.md
```

## Установка

```bash
# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env

# Настроить переменные окружения в .env
```

## Запуск

```bash
# Development режим с автоперезагрузкой
npm run dev

# Production режим
npm start
```

## API Endpoints

### Tables
- `GET /api/tables` - Получить список всех таблиц
- `GET /api/tables/:tableName/schema` - Получить схему таблицы
- `GET /api/tables/:tableName/metadata` - Получить метаданные таблицы

### Data
- `GET /api/data/:tableName` - Получить данные с пагинацией
- `GET /api/data/:tableName/:id` - Получить одну запись
- `POST /api/data/:tableName` - Создать запись
- `PUT /api/data/:tableName/:id` - Обновить запись
- `DELETE /api/data/:tableName/:id` - Удалить запись
- `POST /api/data/:tableName/bulk` - Массовое создание

### Analytics
- `POST /api/analytics/aggregate` - Агрегированные данные
- `POST /api/analytics/chart` - Данные для графиков
- `POST /api/analytics/query` - Выполнить custom query
- `GET /api/analytics/:tableName/stats` - Статистика таблицы

## Технологии

- Node.js + Express
- PostgreSQL (pg)
- Express Validator
- Helmet (security)
- Morgan (logging)
- CORS
