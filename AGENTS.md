<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project file and folder conventions

- **Kebab-case** for domain folders only (`hooks/expenses/`, `components/views/`). **Utility/helper modules under `lib/`** use **camelCase** file names: `queryKeys.ts`, `extractApiData.ts`, `apiRoutes.ts`, `tokenStore.ts`, `navConfig.ts`, `appPaths.ts`, `routeModules.ts`, `defaultValues.ts`, `axiosClient.ts`.
- **camelCase hook files** — `useExpenses.ts`, `useAuthSessionMutations.ts` (name matches the exported hook: `useExpenses`, `useAuthSessionMutations`).
- **PascalCase component files** — `ExpensesModuleView.tsx`, `AppShell.tsx`, `PageFrame.tsx` (matches the exported component name).
- **`app/`** — Next.js routes only (`page.tsx`, `layout.tsx`, route groups).
- **`components/views/`** — Page-level UI for those routes. Not named `pages` (avoids clashing with `app/**/page.tsx`).
- **`components/layout/`**, **`components/providers/`**, **`components/dashboard/`**, **`components/ui/`** — shared chrome and widgets.
- **`hooks/<domain>/`** — API domain subfolders; each hook is `useXxx.ts` in camelCase.
- **`services/*.service.ts`** — API clients; **`models/*.ts`** — TypeScript types aligned with Laravel resources.
- **`lib/routes/apiRoutes.ts`** — Central Laravel API path builders (`apiRoutes` export).
