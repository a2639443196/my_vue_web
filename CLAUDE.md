# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:5173)
npm run build           # Production build with TypeScript checking
npm run preview         # Preview production build
npm run lint            # Run ESLint with auto-fix
npm run type-check      # Run TypeScript type checking
```

### Backend Development
```bash
cd backend
python -m venv venv                    # Create virtual environment
source venv/bin/activate               # Activate venv (Linux/Mac)
pip install -r requirements.txt        # Install dependencies
python manage.py runserver             # Start dev server (http://localhost:8000)
python manage.py makemigrations        # Create migrations
python manage.py migrate               # Apply migrations
python manage.py createsuperuser       # Create admin user
python manage.py collectstatic         # Collect static files
```

### Docker Commands
```bash
docker-compose up               # Start all services in development
docker-compose up -d           # Start services in background
docker-compose down           # Stop all services
docker-compose build          # Rebuild images
```

## Architecture Overview

### Full-Stack Architecture
- **Frontend**: Vue 3 SPA with TypeScript, Vite, Pinia state management
- **Backend**: Django 4.2 REST API with WebSocket support via Django Channels
- **Database**: PostgreSQL (production) / SQLite (development)
- **Real-time**: Redis for Django Channels WebSocket connections
- **Deployment**: Docker Compose with Nginx reverse proxy

### Frontend Structure
- **`/src/api/`**: Centralized API service layer using Axios
- **`/src/stores/`**: Pinia stores for reactive state management
- **`/src/router/`**: Vue Router configuration with lazy loading
- **`/src/components/`**: Reusable Vue components
- **`/src/views/`**: Page-level components
- **`/src/composables/`**: Vue 3 Composition API utilities
- **`/src/types/`**: TypeScript type definitions
- **`/src/utils/`**: Utility functions and helpers

### Backend Structure
- **`/apps/`**: Django applications following modular design
  - `authentication/`: JWT-based authentication
  - `users/`: User profile management
  - `activities/`: Health tracking features (water, bowel, smoking, slack)
  - `games/`: Training games records
  - `chat/`: Real-time chat functionality
- **`/wellness_hub/`**: Main Django project configuration
  - `settings.py`: Environment-aware Django settings
  - `asgi.py`: ASGI config for WebSocket support
  - `urls.py`: Root URL configuration

### Key Configuration Files
- **Frontend**: `vite.config.ts` (Vite build config), `tailwind.config.js` (Tailwind CSS)
- **Backend**: `wellness_hub/settings.py` (Django settings), `requirements.txt` (Python deps)
- **Docker**: `docker-compose.yml` (development), `nginx.conf` (reverse proxy)

## Development Guidelines

### Frontend Development
- Uses Vue 3 Composition API exclusively
- TypeScript strict mode enabled
- Auto-imports configured for Vue, Router, Pinia, and i18n
- UI components from Vuetify 3 and Naive UI
- State management via Pinia stores
- API calls centralized in `/src/api/` with error handling
- WebSocket client for real-time features

### Backend Development
- Django REST Framework for API endpoints
- JWT authentication with tokens stored in HTTP-only cookies
- Django Channels for WebSocket support (chat, online users)
- Celery for background tasks (configured but not actively used)
- PostgreSQL for production with SQLite for development
- CORS configured for frontend-backend communication

### Testing
- No test framework currently configured
- TypeScript checking replaces frontend type tests
- Backend tests would use Django's test framework

### Database Management
- Django migrations handle schema changes
- Run `makemigrations` after model changes
- PostgreSQL persistence in Docker via volumes

## Key Features Implementation

### Authentication Flow
1. JWT tokens stored in HTTP-only cookies
2. Frontend API service includes auth headers automatically
3. Protected routes require authentication via `requireAuth` composable
4. Token refresh handled transparently

### Real-time Features
- WebSocket connections for chat and online user status
- Django Channels + Redis for WebSocket scalability
- Socket.io client on frontend with automatic reconnection

### Health Tracking
- Activity records: water intake, bowel movements, smoking cessation, slack time
- Statistics API with Chart.js visualization
- Export functionality for activity data

### Training Games
- Schulte Grid (attention training)
- Memory Flip (memory training)
- Reaction Time testing
- Sudoku with difficulty levels
- Score tracking and leaderboards

## Build & Deployment

### Development Workflow
1. Backend runs on port 8000 with Django dev server
2. Frontend runs on port 5173 with Vite dev server
3. Vite proxies API calls to backend to avoid CORS
4. Hot reload enabled for both frontend and backend

### Production Build
1. Frontend: `npm run build` creates static files in `/dist/`
2. Backend: `python manage.py collectstatic` gathers static files
3. Nginx serves frontend static files and proxies API requests
4. Gunicorn serves Django WSGI application
5. Daphne serves Django ASGI for WebSocket connections

## Environment Variables
Backend uses `.env` file (not in repo) for:
- Database URLs
- Redis connection
- JWT settings
- CORS origins

## API Patterns
- RESTful endpoints following `/api/` prefix
- Consistent response format with `data` and `error` fields
- HTTP status codes for errors (400, 401, 403, 404, 500)
- Paginated responses for lists
- UUIDs for primary keys