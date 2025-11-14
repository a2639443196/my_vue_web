# Repository Guidelines

## Project Structure & Module Organization
`backend/` houses Django settings in `wellness_hub/`, feature apps under `apps/*`, and entry points such as `manage.py`. `frontend/` keeps the Vue 3 + Vite client with modules in `src/` (API wrappers, components, Pinia stores, views, styles) plus assets in `public/`; root configs (`docker-compose.yml`, `frontend-nginx.conf`, `nginx/`) orchestrate deployments. Store backend tests inside each app’s `tests/` package and colocate frontend specs with the component they exercise.

## Build, Test, and Development Commands
- `cd backend && python manage.py migrate && python manage.py runserver` — run migrations then serve :8000.
- `cd backend && python manage.py test apps.<module>` — run Django/DRF suites per app or omit the module for all tests.
- `cd frontend && npm install && npm run dev` — start the Vite dev server on :5173.
- `npm run build`, `npm run lint`, `npm run type-check` — bundle, lint, and type-check (CI gates).
- `docker-compose up --build` — launch Django, Vue, Postgres, Redis, and Nginx together.

## Coding Style & Naming Conventions
Use two-space indentation for Vue/TypeScript, PascalCase component filenames, camelCase composables, and Pinia stores named `useXStore`. Backend code follows Django norms: snake_case modules, `CamelCase` classes, and per-app URL/serializer definitions. Run `npm run lint`, `npm run type-check`, and `python manage.py check` before committing, and keep build artifacts (`frontend/dist`, collected media) out of git.

## Testing Guidelines
Use Django’s runner with `TestCase`/`APITestCase` classes per app under `tests/`, mocking Redis, Celery, or APIs to stay deterministic; keep coverage near 80% on serializers and core logic. Frontend automation currently leans on linting plus types, but when behavior tests are needed add Vitest + Vue Test Utils specs under `src/__tests__` or beside the module to cover Pinia actions and API adapters. Before PRs, run backend tests plus `npm run lint && npm run type-check`.

## Commit & Pull Request Guidelines
History shows short imperative subjects (`update-glm`), so keep titles concise and consider `type(scope): subject` for cross-cutting work. Reference the related issue, call out migrations or env additions in the body, and avoid bundling unrelated edits. Each PR needs a summary, verification commands, linked tickets, and screenshots or GIFs for UI changes.

## Security & Configuration Tips
Bootstrap configs from `.env.example` files but keep real JWT keys, database URLs, and API tokens outside the repo. For Docker runs, set `VITE_API_URL=/api`, restrict Postgres/Redis to the compose network, and manage production `ALLOWED_HOSTS`, TLS, and storage credentials through infrastructure tooling.
