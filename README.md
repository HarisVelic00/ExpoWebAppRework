# ExpoWebApp

A web-based exhibition management platform that allows users to discover exhibitions, manage events, and handle ticket purchases.

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Development Tools
- Docker
- Docker Compose
- pgAdmin
- uv

## Features

- User registration and authentication
- Role-based access control
- Three user roles: Visitor, Organizer, and Admin
- Exhibition creation and management
- Exhibition locations and industries
- Ticket type management
- Ticket purchasing
- Manual ticket issuance
- Ticket management
- Notifications
- User profile management
- Dashboard with role-specific information

## Project Structure

```text
ExpoWebApp/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── crud/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── migrations/
│   └── alembic.ini
│
├── frontend/
│   └── src/
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Python
- uv
- Node.js and npm
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd ExpoWebApp
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts the PostgreSQL database and pgAdmin services.

### 3. Configure the backend

Create the backend environment file using the project's environment configuration.

Set the PostgreSQL connection URL and other required settings.

Install dependencies and apply database migrations:

```bash
cd backend
uv sync
uv run python -m alembic upgrade head
```

Start the backend:

```bash
uv run python -m uvicorn app.main:app --reload
```

The API will be available at:

- API: http://localhost:8000
- API documentation: http://localhost:8000/docs

### 4. Configure the frontend

Create the frontend environment file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Install dependencies and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at the local address displayed by Vite.

## User Roles

| Role | Permissions |
|---|---|
| Visitor | Browse exhibitions and purchase tickets |
| Organizer | Manage exhibitions, ticket types, and issued tickets |
| Admin | Administrative access and management |

## Database

The application uses PostgreSQL with SQLAlchemy for database operations and Alembic for schema migrations.

## License

This project is available for educational and portfolio purposes.
