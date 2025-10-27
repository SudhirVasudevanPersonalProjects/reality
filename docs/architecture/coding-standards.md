# Coding Standards

## 15.1: Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `packages/shared/src/types` and import from `@reality/shared`. Never duplicate types.

- **API Calls:** Never make direct HTTP calls in components - use service layer (`services/*.service.ts`).

- **Environment Variables:** Access via config objects in `src/config/env.ts`, never `process.env` directly.

- **Error Handling:** All API routes must use standardized error handling. Never throw raw errors to client.

- **State Updates:** Never mutate Zustand state directly - use store actions. Use `invalidateQueries()` for TanStack Query.

- **Server vs Client Components:** Mark client components with `'use client'`. Never import client-only code in server components.

- **Database Queries:** Always filter by `user_id` to respect RLS.

- **Supabase Client:** Use correct client type: `createClientComponentClient` (client), `createServerComponentClient` (server), `createRouteHandlerClient` (API routes).

- **Image Handling:** Always use Next.js `<Image>` with `width`, `height`, `alt`.

- **Form Validation:** Use React Hook Form + Zod. Define schema in `*.schema.ts`.

## 15.2: Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | `useAuth.ts` |
| Services | camelCase + '.service' | `experiences.service.ts` |
| API Routes | kebab-case | `/api/user-profile` |
| Database Tables | snake_case | `user_profiles` |
| Types/Interfaces | PascalCase | `Experience` |
| Zustand Stores | camelCase + '.store' | `ui.store.ts` |

---

