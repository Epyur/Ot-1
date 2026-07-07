# Agents.md — План реализации мини-приложения для анкетирования заказчиков

## 1. Цель проекта
Разработать контейнеризированное веб-приложение для сбора анкет заказчиков организации с двумя ролями:
- **Заказчик** — заполняет HTML-форму (ФИО, дата рождения, телефон, email, организация).
- **Сотрудник** — просматривает все сохранённые ответы и выгружает их в Excel.

**Ключевое требование:** данные хранятся в **JSON-файле** (без СУБД).  
Приложение работает в локальной сети через Docker Compose.

---

## 2. Технологический стек

| Компонент       | Технология                              |
|-----------------|-----------------------------------------|
| **Frontend**    | React 18 + Vite + TypeScript + Axios    |
| **Backend**     | Node.js 20 + Express + TypeScript       |
| **Хранилище**   | JSON-файл (`data/surveys.json`)         |
| **Экспорт Excel** | `exceljs`                             |
| **Контейнеризация** | Docker + Docker Compose             |
| **Прокси**      | Nginx (единая точка входа)              |

---

## 3. Структура проекта (текущее состояние)

```
Ot-1/
├── docker-compose.yml          # ✅ 3 сервиса: backend, frontend, nginx
├── .env.example                # ✅ Документация переменных окружения
├── README.md                   # ✅ Полная документация проекта
├── AGENTS.md                   # ✅ Текущий файл
│
├── backend/                    # ✅ Express API сервер
│   ├── Dockerfile              # ✅ Многостадийная сборка
│   ├── package.json            # ✅ Зависимости: express, cors, zod, exceljs, dotenv
│   ├── tsconfig.json           # ✅ TypeScript конфиг
│   ├── .env                    # ✅ PORT=5000, ADMIN_TOKEN=my-super-secret-token
│   ├── src/
│   │   ├── index.ts            # ✅ Точка входа (dotenv + запуск сервера)
│   │   ├── server.ts           # ✅ Express app (CORS, JSON, роуты, ошибки)
│   │   ├── routes/
│   │   │   ├── survey.routes.ts   # ✅ POST /api/survey
│   │   │   └── admin.routes.ts    # ✅ GET /api/admin/responses, GET /api/admin/export
│   │   ├── controllers/
│   │   │   ├── survey.controller.ts  # ✅ Валидация Zod, возврат 201
│   │   │   └── admin.controller.ts   # ✅ JSON-ответ + Excel-выгрузка
│   │   ├── services/
│   │   │   ├── survey.service.ts     # ✅ submitSurvey() + getAllSurveys()
│   │   │   └── excel.service.ts      # ✅ Генерация .xlsx с русскими заголовками
│   │   ├── models/
│   │   │   └── survey.model.ts       # ✅ IAnswer, IAnswerInput
│   │   ├── storage/
│   │   │   └── jsonStorage.ts        # ✅ readData, writeData, addRecord
│   │   └── middleware/
│   │       ├── auth.middleware.ts     # ✅ X-Admin-Token проверка
│   │       └── error.middleware.ts    # ✅ Глобальный обработчик ошибок
│   └── data/
│       └── surveys.json              # ✅ Пустой массив []
│
├── frontend/                   # ✅ React клиент
│   ├── Dockerfile              # ✅ Многостадийная: Vite build → nginx:alpine
│   ├── package.json            # ✅ React 18, Vite, TypeScript, Axios, react-router-dom
│   ├── vite.config.ts          # ✅ Прокси /api → backend:5000
│   ├── tsconfig.json           # ✅ Strict TypeScript
│   ├── .env                    # ✅ VITE_API_URL
│   ├── index.html              # ✅ HTML entry
│   ├── nginx.conf              # ✅ SPA fallback
│   ├── src/
│   │   ├── main.tsx            # ✅ React root
│   │   ├── App.tsx             # ✅ Router: / и /admin + навигация
│   │   ├── App.css             # ✅ Полная стилизация
│   │   ├── vite-env.d.ts       # ✅ Vite типы
│   │   ├── pages/
│   │   │   ├── ClientForm.tsx      # ✅ Форма с валидацией
│   │   │   └── AdminDashboard.tsx  # ✅ Дашборд с авторизацией
│   │   ├── components/
│   │   │   ├── FormInput.tsx       # ✅ Переиспользуемый input
│   │   │   └── SurveyTable.tsx     # ✅ Таблица данных
│   │   ├── api/
│   │   │   ├── client.api.ts       # ✅ POST /api/survey
│   │   │   └── admin.api.ts        # ✅ GET /api/admin/responses + export
│   │   ├── hooks/
│   │   │   └── useAuth.ts          # ✅ Управление токеном (localStorage)
│   │   ├── types/
│   │   │   └── survey.types.ts     # ✅ TypeScript интерфейсы
│   │   └── utils/
│   │       └── validation.ts       # ✅ Функции валидации
│
├── nginx/                      # ✅ Reverse proxy
│   ├── Dockerfile              # ✅ nginx:alpine
│   └── nginx.conf              # ✅ / → frontend, /api/ → backend
│
└── scripts/                    # ✅ Вспомогательные скрипты
    ├── build.sh                # ✅ Сборка проекта
    └── deploy.sh               # ✅ Деплой через docker-compose
```

---

## 4. Модель данных (JSON-формат)

**Файл:** `backend/data/surveys.json`

```json
[
  {
    "id": "uuid-или-инкремент",
    "lastName": "Иванов",
    "firstName": "Иван",
    "patronymic": "Иванович",
    "birthDate": "1990-01-01",
    "phone": "+7-999-123-45-67",
    "email": "ivan@example.com",
    "organization": "ООО Ромашка",
    "createdAt": "2026-07-07T12:00:00.000Z"
  }
]
```

**Примечание:**
- ID генерируется через `crypto.randomUUID()`.
- Все поля обязательные, кроме `patronymic` (может быть пустым).

---

## 5. API Endpoints

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| POST | `/api/survey` | Заказчик | Сохранение анкеты в JSON-файл |
| GET | `/api/admin/responses` | Сотрудник | Получение всех записей (JSON) |
| GET | `/api/admin/export` | Сотрудник | Скачивание Excel-файла |

**Аутентификация для сотрудника:**
- Заголовок `X-Admin-Token: <секретный_токен>`
- Токен задаётся в `backend/.env` (`ADMIN_TOKEN=your-secret-token`)

---

## 6. Текущий статус реализации

### ✅ Выполнено (Этапы 0–5)

| Этап | Статус | Описание |
|------|--------|----------|
| **0. Подготовка окружения** | ✅ | Структура папок, docker-compose.yml, .env.example, сеть app-network |
| **1. Backend — JSON-хранилище** | ✅ | jsonStorage.ts: readData, writeData, addRecord, автосоздание файла |
| **2. Backend — API и валидация** | ✅ | Zod-валидация, survey.controller, admin.controller, auth middleware, error middleware |
| **3. Frontend — форма заказчика** | ✅ | ClientForm.tsx, FormInput.tsx, валидация, отправка, сообщения об успехе/ошибке |
| **4. Frontend — дашборд сотрудника** | ✅ | AdminDashboard.tsx, SurveyTable.tsx, useAuth.ts, Excel-выгрузка |
| **5. Интеграция с Nginx** | ✅ | Dockerfile для всех сервисов, nginx.conf reverse proxy |

### ⏳ Ожидает выполнения (Этапы 6–7)

| Этап | Статус | Описание |
|------|--------|----------|
| **6. Настройка для локальной сети** | ⏳ | Проброс порта, статический IP, проверка доступа |
| **7. Тестирование и документация** | ⏳ | Ручное тестирование, README.md (готов), финальная проверка |

---

## 7. Инструкция по дальнейшим действиям

### Шаг 1. Установить зависимости (локально для разработки)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Шаг 2. Настроить переменные окружения

Файлы `.env` уже созданы. При необходимости измените:

- `backend/.env` — задайте свой `ADMIN_TOKEN`
- `frontend/.env` — укажите `VITE_API_URL` (если нужно)

### Шаг 3. Запустить через Docker Compose

```bash
# Из корня проекта
docker-compose up --build -d
```

### Шаг 4. Проверить работу

| URL | Описание |
|-----|----------|
| `http://localhost:8080` | Форма для заказчика |
| `http://localhost:8080/admin` | Дашборд сотрудника (требуется токен) |

### Шаг 5. Тестовые сценарии

1. **Отправка анкеты:**
   - Заполнить все поля формы
   - Нажать "Отправить анкету"
   - Проверить сообщение об успехе
   - Проверить `backend/data/surveys.json` — должна появиться запись

2. **Просмотр списка сотрудником:**
   - Перейти на `/admin`
   - Ввести токен из `backend/.env`
   - Нажать "Войти"
   - Убедиться, что отправленная анкета отображается в таблице

3. **Выгрузка Excel:**
   - В админ-панели нажать "Скачать Excel"
   - Открыть скачанный файл
   - Проверить заголовки и данные

### Шаг 6. Настройка для локальной сети

```bash
# Узнать IP-адрес компьютера
ipconfig

# Открыть с другого устройства в локальной сети:
# http://<IP-адрес>:8080
```

### Шаг 7. Остановка

```bash
docker-compose down
```

---

## 8. Важные замечания

- **JSON-файл не теряется** при перезапуске — благодаря монтированию volume в `docker-compose.yml`
- **Блокировка файла** — при одновременной записи используется `fs.promises` с `await`
- **Безопасность** — в реальной сети замените токен на более надёжный механизм (basic auth или JWT)
- **Excel-выгрузка** — заголовки на русском языке, настроена ширина колонок

---

## 9. Возможные улучшения (Tech Debt)

- [ ] Добавить логирование (winston/pino) для отслеживания ошибок
- [ ] Реализовать пагинацию для большого количества записей
- [ ] Внедрить компрессию ответов (compression middleware)
- [ ] Сделать Docker-образы минимального размера (уже multistage + alpine)
- [ ] Добавить поиск/фильтрацию по организации или дате в админ-панели
- [ ] Написать unit-тесты для storage и сервисов
- [ ] Добавить .gitignore (node_modules, dist, .env)

---

## 10. Контакты и поддержка

**Ответственный разработчик:** [Е. Полищук](https://github.com/Epyur)  
**Репозиторий:** [https://github.com/Epyur/Ot-1](https://github.com/Epyur/Ot-1)
