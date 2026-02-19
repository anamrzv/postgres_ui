# PostgreSQL UI - Frontend

Современный веб-интерфейс для управления PostgreSQL базой данных.

## Структура проекта

```
frontend/
├── src/
│   ├── api/             # API клиенты и запросы
│   ├── assets/          # Статические ресурсы (изображения, стили)
│   ├── components/      # Переиспользуемые компоненты
│   ├── layouts/         # Layouts (MainLayout с sidebar и header)
│   ├── router/          # Vue Router конфигурация
│   ├── stores/          # Pinia stores (состояние приложения)
│   ├── views/           # Страницы приложения
│   ├── App.vue          # Корневой компонент
│   └── main.js          # Точка входа приложения
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Технологии

- **Vue 3** - Progressive JavaScript Framework
- **Vite** - Быстрый сборщик и dev-сервер
- **Vue Router** - Официальный роутер для Vue
- **Pinia** - Управление состоянием
- **Element Plus** - UI библиотека компонентов
- **Axios** - HTTP клиент
- **Chart.js + vue-chartjs** - Графики и диаграммы

## Установка

```bash
# Установить зависимости
npm install
```

## Запуск

```bash
# Development режим с hot-reload
npm run dev

# Сборка для production
npm run build

# Preview production build
npm run preview
```

## Основные возможности

### 1. Dashboard
- Статистика по базе данных
- Быстрый доступ к таблицам
- Недавние операции

### 2. Управление таблицами
- Список всех таблиц с поиском
- Просмотр и редактирование данных
- Добавление новых записей
- Удаление записей
- Фильтрация и сортировка
- Пагинация

### 3. Аналитика
- Визуализация данных
- Графики и диаграммы
- Статистика по таблицам
- Кастомные запросы

## Компоненты

### Layouts
- `MainLayout.vue` - Основной layout с sidebar и header

### Views
- `Dashboard.vue` - Главная страница с общей статистикой
- `TablesList.vue` - Список всех таблиц
- `TableEditor.vue` - Редактор таблицы с CRUD операциями
- `Analytics.vue` - Страница аналитики
- `TableAnalytics.vue` - Аналитика для конкретной таблицы

### API
- `axios.js` - Настроенный Axios instance с interceptors
- `tables.js` - API методы для работы с таблицами
- `analytics.js` - API методы для аналитики

## Разработка

Приложение использует proxy для API запросов:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

Все запросы к `/api` автоматически проксируются на backend.
