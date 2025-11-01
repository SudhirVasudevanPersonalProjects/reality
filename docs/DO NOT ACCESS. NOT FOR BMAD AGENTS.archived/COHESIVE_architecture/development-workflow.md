# Development Workflow

## 11.1: Local Development Setup

**Prerequisites:**

```bash
# Node.js 18+
node --version  # v18.0.0 or higher

# pnpm
npm install -g pnpm

# Supabase CLI
npm install -g supabase

# Twilio CLI (optional for SMS testing)
npm install -g twilio-cli
```

**Initial Setup:**

```bash
# Clone repository
git clone <repo-url>
cd reality

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your keys

# Start Supabase locally (optional)
supabase start

# Run migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > packages/shared/src/types/supabase.ts
```

**Development Commands:**

```bash
# Start all services
pnpm dev

# Start web app only
pnpm --filter web dev

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build
pnpm build
```

## 11.2: Environment Configuration

**Required Environment Variables:**

```bash
# Frontend (.env.local in apps/web/)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJxxx...

# Backend (API routes)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Twilio
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1555...

# OpenAI (in Supabase Edge Function secrets)
OPENAI_API_KEY=sk-xxx...
```

---

