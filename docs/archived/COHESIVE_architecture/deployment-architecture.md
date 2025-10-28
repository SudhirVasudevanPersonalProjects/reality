# Deployment Architecture

## 12.1: Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm build --filter=web`
- **Output Directory:** `apps/web/.next`
- **CDN/Edge:** Vercel global edge network
- **Environment:** Production (main), Preview (PRs)

**Backend Deployment:**
- **Platform:** Supabase (managed PostgreSQL + Edge Functions)
- **Database:** PostgreSQL hosted by Supabase
- **Edge Functions:** `supabase functions deploy`

## 12.2: CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm test:a11y  # Accessibility tests with axe-playwright
      - run: pnpm build
```

## 12.3: Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:54321 | Local development |
| Staging | https://reality-staging.vercel.app | https://xxx-staging.supabase.co | Pre-production testing |
| Production | https://reality.app | https://xxx.supabase.co | Live environment |

---

