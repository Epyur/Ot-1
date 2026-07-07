# Customer Survey App

Контейнеризированное веб-приложение для сбора анкет заказчиков организации.

## Функциональность

- **Заказчик** — заполняет HTML-форму (ФИО, дата рождения, телефон, email, организация)
- **Сотрудник** — просматривает все сохранённые ответы и выгружает их в Excel

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| Frontend | React 18 + Vite + TypeScript + Axios |
| Backend | Node.js 20 + Express + TypeScript |
| Хранилище | JSON-файл (`data/surveys.json`) |
| Экспорт Excel | `exceljs` |
| Контейнеризация | Docker + Docker Compose |
| Прокси | Nginx (единая точка входа) |

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd customer-survey-app
```

### 2. Создать .env файлы

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Задать секретный токен в `backend/.env`

```
ADMIN_TOKEN=my-super-secret-token
```

### 4. Запустить контейнеры

```bash
docker-compose up --build -d
```

### 5. Открыть в браузере

- `http://localhost:8080` — форма для заказчика
- `http://localhost:8080/admin` — дашборд сотрудника (требуется токен)

## Структура проекта

```
customer-survey-app/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/          # Express API сервер
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── src/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── storage/
│   │   └── middleware/
│   └── data/
│       └── surveys.json
├── frontend/         # React клиент
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── nginx.conf
├── nginx/            # Nginx reverse proxy
│   ├── Dockerfile
│   └── nginx.conf
└── scripts/          # Вспомогательные скрипты
    ├── build.sh
    └── deploy.sh
```

## API Endpoints

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| POST | `/api/survey` | Заказчик | Сохранение анкеты в JSON-файл |
| GET | `/api/admin/responses` | Сотрудник | Получение всех записей (JSON) |
| GET | `/api/admin/export` | Сотрудник | Скачивание Excel-файла |

Аутентификация для сотрудника: заголовок `X-Admin-Token: <секретный_токен>`

## Важные замечания

- JSON-файл не теряется при перезапуске — благодаря монтированию volume
- Данные хранятся в `backend/data/surveys.json`
- Для доступа к админке требуется токен, заданный в `backend/.env`

## Разработка

Ответственный разработчик: [Е. Полищук](https://github.com/Epyur)

Репозиторий: [https://github.com/Epyur/Ot-1](https://github.com/Epyur/Ot-1)