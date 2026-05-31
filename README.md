# Expense Tracker

A full-stack expense tracking application with reporting and data visualization. Built with Django REST Framework and React.

**Live API:** (coming soon)
**Live App:** (coming soon)

## Tech Stack

**Backend**
- Django 6, Django REST Framework
- PostgreSQL
- JWT Authentication (SimpleJWT)
- Docker, docker-compose

**Frontend**
- React 19, Vite
- Recharts (data visualization)
- Axios (API client)
- React Router

## Features

- Multi-user API with JWT authentication
- Create, edit, and delete expenses
- Categorize expenses (food, transport, housing, etc.)
- Filter expenses by category and date range
- Reporting endpoints — spending by category and monthly trends
- Dashboard with pie chart and bar chart visualizations
- Protected routes — unauthenticated users redirected to login
- Full backend test suite

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+

### Backend Setup

1. Clone the repository

```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
```

2. Create a `.env` file in the project root

```bash
   cp .env.example .env
```

3. Start the containers

```bash
   docker-compose up --build
```

4. Run migrations

```bash
   docker-compose exec web python manage.py migrate
```

5. Create a superuser

```bash
   docker-compose exec web python manage.py createsuperuser
```

6. API is available at `http://localhost:8000/api/`
7. API docs at `http://localhost:8000/api/docs/`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

### Running Tests

```bash
docker-compose exec web pytest -v
```

## API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/token/` | Obtain tokens |
| POST | `/api/token/refresh/` | Refresh access token |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses/` | List your expenses |
| POST | `/api/expenses/` | Create an expense |
| GET | `/api/expenses/{id}/` | Retrieve an expense |
| PATCH | `/api/expenses/{id}/` | Update an expense |
| DELETE | `/api/expenses/{id}/` | Delete an expense |
| GET | `/api/expenses/report/by-category/` | Spending by category |
| GET | `/api/expenses/report/monthly/` | Monthly spending totals |

### Filtering

GET /api/expenses/?category=food
GET /api/expenses/?date_from=2026-01-01&date_to=2026-04-30
GET /api/expenses/?search=groceries
GET /api/expenses/?ordering=-amount

## Environment Variables

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (True/False) |
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `ALLOWED_HOSTS` | Comma separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma separated allowed origins |
| `CSRF_TRUSTED_ORIGINS` | Comma separated trusted origins |

## License

MIT