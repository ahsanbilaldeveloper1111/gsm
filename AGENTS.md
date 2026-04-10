<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project file and folder conventions

- **Kebab-case** for all file names: `api-routes.ts`, `use-expense-mutations.ts`, `expenses-module-view.tsx`. Do not use camelCase file names (e.g. ~~`apiRoutes.ts`~~).
- **`app/`** — Next.js routes only (`page.tsx`, `layout.tsx`, route groups).
- **`components/views/`** — Page-level UI for those routes (lists, module JSON explorers, forms). Not named `pages` to avoid clashing with `app/**/page.tsx`.
- **`components/layout/`**, **`components/providers/`**, **`components/dashboard/`**, **`components/ui/`** — shared chrome and widgets.
- **`hooks/<domain>/`** — One folder per API domain; hook files `use-*.ts` (e.g. `hooks/expenses/use-expenses.ts`).
- **`services/*.service.ts`** — API clients; **`models/*.ts`** — TypeScript types aligned with Laravel resources.
- **`lib/routes/api-routes.ts`** — Central Laravel API path builders (`apiRoutes` export).
