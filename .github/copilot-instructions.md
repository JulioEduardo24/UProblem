<!-- Copilot Instructions for UProblem (Node.js + Express + EJS) -->
# UProblem — Assistant guidelines

This file gives concise, repository-specific guidance for AI coding agents working on UProblem.

1) Quick summary
- Node.js Express app (entry: [index.js](index.js)).
- Server-side rendering with EJS templates under [views](views). Frontend assets in [public](public).
- Data access uses Supabase/Postgres via [config/supabase.js](config/supabase.js) and local model wrappers in [models](models).
- Routing lives in [routes](routes); business logic in [controllers](controllers); small utilities in [utils](utils).

2) Architecture & request flow (what to read first)
- Request -> route ([routes/*.js](routes)) -> optional `authMiddleware` ([middleware/authMiddleware.js](middleware/authMiddleware.js)) -> controller ([controllers/*.js](controllers)) -> model ([models/*.js](models)) -> Supabase/PG client ([config/supabase.js](config/supabase.js)).
- Views are rendered by controllers using EJS files in [views/main](views/main) and [views/auth](views/auth).

3) Key integration points & libraries
- Supabase client: [config/supabase.js](config/supabase.js). Use this file for DB connection details.
- JWT auth & password hashing: `jsonwebtoken` and `bcrypt` used across `models/Auth.js` and `controllers/authController.js`.
- Categorization uses the `natural` library and helpers in [utils/categorizador.js](utils/categorizador.js) and [public/js/categorizador.js].
- Charts use `chart.js` in [public/js/dashboard-charts.js].

4) Developer workflows
- Install deps: `npm install`.
- Run locally (dev): `npm run dev` (nodemon). Production: `npm start`.
- Environment: the app uses `dotenv` — expect a `.env` (not checked in). Check [config/supabase.js](config/supabase.js) for required env vars.

5) Project-specific conventions & gotchas
- Controllers export handler functions used directly by routes (follow existing patterns in `controllers/*`).
- Numeric values: some monetary fields (e.g., `monto_total`) may be stored as strings in the DB — templates often call `parseFloat(...)` before formatting (see [views/main/presupuestos.ejs](views/main/presupuestos.ejs)).
- Spanish UX: UI text and templates are in Spanish — preserve language and currency formatting (S/).
- Templates use inline logic for alerts/progress bars; keep presentation logic minimal and prefer controller-side preprocessing for complex calculations.
- Confirm routes that require authentication use `authMiddleware` — new routes should follow the same pattern.

6) Suggested guardrails for code changes
- When changing data shapes, update controllers, models, and any EJS templates that read those fields (search for `.monto_total`, `.presupuesto_categorias`, etc.).
- If adding DB queries, prefer using the Supabase client import from [config/supabase.js] to stay consistent.
- Avoid changing global theme or layout without updating `views` and `public/js/theme.js` together.

7) Files to inspect for common tasks (examples)
- Add auth-protected API: [routes/presupuestoRoutes.js](routes/presupuestoRoutes.js) + [controllers/presupuestoController.js](controllers/presupuestoController.js) + `authMiddleware`.
- Adjust budget calculations: [controllers/presupuestoController.js](controllers/presupuestoController.js) and [views/main/presupuestos.ejs](views/main/presupuestos.ejs).
- Update categorization logic: [utils/categorizador.js](utils/categorizador.js) + frontend [public/js/categorizador.js](public/js/categorizador.js).

8) Tests & CI
- There are no automated tests or CI config detected. Keep changes small and test locally with `npm run dev` and manual UI flows.

9) When uncertain, ask these quick questions
- Does this change affect persisted fields read by EJS templates? If yes, update templates.
- Will this route need authentication? If yes, add `authMiddleware`.
- Does the change require Supabase credentials or schema changes? If yes, coordinate DB changes and env vars.

If any of the above points are unclear or you want an expanded section (e.g., a migration checklist or code snippets for adding a new route), tell me which area to expand.
