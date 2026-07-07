# Инструкция по запуску проекта в Docker

## Системные требования

- **Docker Desktop** (Windows/Mac) или **Docker Engine** (Linux)
- **Docker Compose** (входит в состав Docker Desktop)
- **Git** (для клонирования репозитория)

Проверьте установку:

```bash
docker --version
docker-compose --version
```

---

## 1. Клонирование репозитория

```bash
git clone https://github.com/Epyur/Ot-1.git
cd Ot-1
```

---

## 2. Настройка переменных окружения

Файлы `.env` уже созданы в проекте. При необходимости измените:

### Backend (`backend/.env`)

```
PORT=5000
ADMIN_TOKEN=my-super-secret-token
```

> **Важно:** Замените `my-super-secret-token` на свой секретный токен для доступа к админ-панели.

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

> Для продакшена через Nginx прокси менять не нужно — запросы идут через `/api`.

---

## 3. Сборка и запуск контейнеров

### Вариант A: Полная сборка (рекомендуется)

```bash
docker-compose up --build -d
```

### Вариант B: Быстрый запуск (если образы уже собраны)

```bash
docker-compose up -d
```

### Что произойдёт:

1. **Backend** — Node.js 20 сервер на порту 5000
2. **Frontend** — React статика через nginx:alpine на порту 80
3. **Nginx** — Reverse proxy на порту 8080 (единая точка входа)

---

## 4. Проверка работы

### Откройте в браузере:

| URL | Описание |
|-----|----------|
| `http://localhost:8080` | Форма для заполнения анкеты заказчиком |
| `http://localhost:8080/admin` | Панель сотрудника (требуется токен) |

### Проверка статуса контейнеров:

```bash
docker-compose ps
```

Ожидаемый вывод:

```
     Name                    Command               State          Ports
-------------------------------------------------------------------------------------
survey-backend    docker-entrypoint.sh node ...   Up      0.0.0.0:5000->5000/tcp
survey-frontend   /docker-entrypoint.sh ngin ...   Up      0.0.0.0:3000->80/tcp
survey-nginx      /docker-entrypoint.sh ngin ...   Up      0.0.0.0:8080->80/tcp
```

---

## 5. Тестовые сценарии

### 5.1. Отправка анкеты

1. Откройте `http://localhost:8080`
2. Заполните все поля формы:
   - **Фамилия** (обязательно)
   - **Имя** (обязательно)
   - **Отчество** (необязательно)
   - **Дата рождения** (формат ГГГГ-ММ-ДД)
   - **Телефон** (обязательно)
   - **Email** (обязательно, проверка формата)
   - **Организация** (обязательно)
3. Нажмите **"Отправить анкету"**
4. Дождитесь зелёного сообщения об успехе

### 5.2. Проверка данных в JSON-файле

```bash
# Посмотреть содержимое JSON-хранилища
docker-compose exec backend cat /app/data/surveys.json
```

Или откройте файл `backend/data/surveys.json` в редакторе.

### 5.3. Просмотр списка сотрудником

1. Откройте `http://localhost:8080/admin`
2. Введите токен из `backend/.env` (по умолчанию: `my-super-secret-token`)
3. Нажмите **"Войти"**
4. Убедитесь, что отправленная анкета отображается в таблице

### 5.4. Выгрузка Excel

1. В админ-панели нажмите **"Скачать Excel"**
2. Откройте скачанный файл `.xlsx`
3. Проверьте заголовки (на русском языке) и данные

---

## 6. Доступ из локальной сети

Чтобы другие устройства в локальной сети могли открыть приложение:

### Шаг 1. Узнайте IP-адрес компьютера

```bash
# Windows
ipconfig

# Linux/Mac
ip addr show
```

Найдите IPv4-адрес (например, `192.168.1.100`).

### Шаг 2. Откройте с другого устройства

```
http://<IP-адрес>:8080
```

Например: `http://192.168.1.100:8080`

> **Примечание:** Убедитесь, что брандмауэр Windows разрешает входящие подключения на порт 8080.

---

## 7. Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Перезапуск контейнеров

```bash
docker-compose restart
```

### Пересборка после изменений

```bash
docker-compose up --build -d
```

### Остановка контейнеров

```bash
# Остановить (сохраняет данные)
docker-compose stop

# Остановить и удалить контейнеры (данные сохраняются)
docker-compose down

# Полная очистка (удаляет тома с данными)
docker-compose down -v
```

### Очистка неиспользуемых образов

```bash
docker image prune -a
```

---

## 8. Структура данных

### JSON-хранилище

Файл: `backend/data/surveys.json`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
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

- ID генерируется автоматически через `crypto.randomUUID()`
- Все поля обязательные, кроме `patronymic`
- Файл сохраняется при перезапуске контейнеров (volume)

---

## 9. Устранение неполадок

### Проблема: Порт 8080 уже занят

Измените порт в `docker-compose.yml`:

```yaml
ports:
  - "${NGINX_PORT:-8081}:80"  # Замените 8080 на 8081
```

### Проблема: Не удаётся подключиться к админке

1. Проверьте, что вводите правильный токен из `backend/.env`
2. Проверьте логи backend: `docker-compose logs backend`
3. Убедитесь, что контейнеры запущены: `docker-compose ps`

### Проблема: Ошибка при отправке формы

1. Проверьте, что backend запущен: `docker-compose ps`
2. Проверьте логи backend: `docker-compose logs backend`
3. Проверьте формат даты (ГГГГ-ММ-ДД) и email

### Проблема: Брандмауэр блокирует доступ

**Windows:**
1. Откройте **"Брандмауэр Защитника Windows"**
2. Нажмите **"Дополнительные параметры"**
3. Создайте **"Правило для входящего подключения"** для порта 8080

---

## 10. API Endpoints (для разработчиков)

| Метод | Путь | Заголовки | Описание |
|-------|------|-----------|----------|
| POST | `/api/survey` | — | Сохранение анкеты |
| GET | `/api/admin/responses` | `X-Admin-Token: <token>` | Получение всех записей |
| GET | `/api/admin/export` | `X-Admin-Token: <token>` | Скачивание Excel |

Пример запроса через curl:

```bash
# Отправка анкеты
curl -X POST http://localhost:8080/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "lastName": "Иванов",
    "firstName": "Иван",
    "patronymic": "Иванович",
    "birthDate": "1990-01-01",
    "phone": "+7-999-123-45-67",
    "email": "ivan@example.com",
    "organization": "ООО Ромашка"
  }'

# Получение списка (с токеном)
curl -H "X-Admin-Token: my-super-secret-token" \
  http://localhost:8080/api/admin/responses

# Скачивание Excel
curl -H "X-Admin-Token: my-super-secret-token" \
  http://localhost:8080/api/admin/export \
  --output surveys.xlsx
```

---

## 11. Контакты

**Разработчик:** [Е. Полищук](https://github.com/Epyur)  
**Репозиторий:** [https://github.com/Epyur/Ot-1](https://github.com/Epyur/Ot-1)