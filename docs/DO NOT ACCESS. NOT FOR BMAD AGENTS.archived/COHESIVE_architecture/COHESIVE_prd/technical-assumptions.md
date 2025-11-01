# Technical Assumptions

## Repository Structure: Monorepo

**Decision**: Single repository containing web app, backend functions, shared types, and documentation

**Structure**:
```
reality/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile-archived/  # OLD: React Native code (archived, reference only)
├── packages/
│   └── shared/           # Shared TypeScript types (auth, experiences, thoughts)
├── supabase/             # Backend: migrations, edge functions, RLS policies
├── docs/                 # PRD, architecture, stories, pivot plan
└── .bmad-core/           # BMAD agent system
```

**Rationale**: Solo founder benefits from unified codebase - easier dependency management, shared types between web and edge functions, atomic commits. Supabase functions live alongside web code for tight integration.

---

## Service Architecture: Client-Side Heavy + Serverless Functions

**Architecture**:
- **Client-side**: Next.js 14+ App Router handles UI, routing, state management (Zustand), server state (TanStack Query)
- **Serverless backend**: Supabase Edge Functions (Deno runtime) for:
  - Twilio SMS webhook processing
  - Pookie AI calls (GPT-4 API with hidden keys)
  - Image processing (compression)
  - Reverse geocoding (GPS → city names)
- **Database-as-service**: Supabase PostgreSQL with Row Level Security (RLS) for multi-tenant isolation
- **Real-time**: Supabase Realtime for live updates (no offline mode for MVP)

**NOT microservices**: Monolithic Next.js app, single database, stateless edge functions - web client with thin serverless layer.

**Rationale**:
- Solo founder cannot maintain distributed services
- Serverless scales automatically, no DevOps burden
- Supabase provides managed backend (auth, DB, storage, functions, realtime)
- Next.js App Router enables server components for SEO and performance
- Web app simplicity vs mobile's offline-first complexity

---

## Testing Requirements: Unit + Integration, Manual E2E

**Testing Strategy**:

1. **Unit Tests**: Core business logic (hierarchy ranking, pattern matching, vibe calculation)
   - Target: 70%+ coverage on utility functions and data transformations
   - Tools: Vitest for TypeScript (faster than Jest for modern web)

2. **Integration Tests**: API routes, Supabase edge functions, RLS policies
   - Target: Critical user flows tested (SMS webhook → save → retrieve → display)
   - Tools: Vitest + Supabase local dev environment (Docker)

3. **Manual E2E**: Full user journeys tested manually on real browsers
   - No automated E2E (Playwright/Cypress deferred - too complex for solo MVP)
   - Beta testers provide real-world E2E validation

4. **Visual Regression**: Deferred to post-MVP (Chromatic not essential for minimal UI)

**No Flaky Tests**:
- Async operations use proper async/await patterns
- Database tests use Supabase transactions (rollback after each test)
- No hard-coded timeouts - use event-driven assertions
- Mock external APIs (Twilio, OpenAI) in tests

**Rationale**:
- Unit + integration proves core logic works
- Manual E2E acceptable for MVP (10-50 beta users catch edge cases)
- Automated E2E has high maintenance cost for solo founder
- Can add Playwright post-PMF if needed

---

## Additional Technical Assumptions and Requests

**Frontend Stack**:
- **Next.js 14+ (App Router)**: React Server Components, file-based routing, built-in optimizations
- **React 18**: Concurrent rendering, Suspense for data fetching
- **TypeScript**: Strict mode, shared types with backend via /packages/shared
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **Framer Motion**: Page transitions, smooth animations for vibe effects
- **Mapbox GL JS**: Web map rendering (cheaper than Google Maps, better free tier)
- **Zustand**: Lightweight global state (current view, sidebar collapsed, chat history)
- **TanStack Query (React Query)**: Server state caching, optimistic updates, background sync
- **D3.js or Cytoscape.js**: Knowledge graph visualization (Epic 4)

**Backend Stack**:
- **Supabase**: PostgreSQL database, Auth (JWT), Storage, Edge Functions, Realtime subscriptions
- **Twilio Programmable SMS**: SMS/MMS webhook ingestion ($1/month + $0.0075 per SMS)
- **OpenAI API**: GPT-4 for Pookie chat, pattern recognition, bulk import classification
- **Mapbox Geocoding API**: Reverse geocoding (GPS → city/state names) and manual location search
- **Supabase Storage**: Photo/video storage with compression

**Data Architecture**:
- **Server-first**: No offline mode for MVP - all data lives in Supabase, fetched on demand
- **Real-time updates**: Supabase Realtime subscriptions for live hierarchy updates, new SMS captures
- **Optimistic UI**: Instant feedback for categorization, rollback on failure
- **No conflict resolution needed**: Single source of truth (Supabase), no local-first complexity

**AI/LLM Integration**:
- **Pookie chat**: GPT-4 conversations with user's full context (captures, hierarchies)
- **Pattern matching**: "Is this similar to existing thought?" suggestions
- **Navigation commands**: Parse user intent ("show timeline" → route change)
- **Rate limiting**: 10 Pookie interactions per user per day (cost control)
- **Streaming responses**: Use OpenAI streaming API for faster perceived latency

**Image Processing**:
- **Server-side compression**: Sharp (Node.js) in Supabase Edge Function for MMS images
- **Target size**: 500KB average per photo (from original 3-5MB MMS)
- **CDN**: Supabase Storage uses Cloudflare CDN for fast global delivery

**SMS/Twilio Integration**:
- **Webhook endpoint**: Supabase Edge Function at `/functions/sms-inbound`
- **Phone lookup**: Query `profiles.phone_number` to find user_id
- **Media download**: Fetch MMS images from Twilio MediaUrl, upload to Supabase Storage
- **Error handling**: Retry failed SMS processing, log errors to Supabase
- **Rate limiting**: 20 SMS/day per user enforced at webhook level

**Security**:
- **Row Level Security (RLS)**: Supabase policies ensure users only access their own data
- **API keys hidden**: OpenAI, Mapbox, Twilio keys in Supabase Edge Function env vars (never exposed to client)
- **JWT auth**: Supabase Auth handles token-based authentication, automatic token refresh
- **HTTPS only**: All API calls encrypted in transit
- **Phone number privacy**: Optional hashing, Twilio proxy for masking (future feature)

**Deployment**:
- **Frontend**: Vercel (free hobby tier) - automatic deployments from Git main branch
- **Backend**: Supabase cloud (Pro tier $25/month for production, free for dev)
- **Environment management**: Dev (Supabase local), Staging (Supabase cloud preview), Production (Supabase cloud)
- **CI/CD**: GitHub Actions for automated tests, Vercel handles web deployment

**Cost Optimization**:
- **Vercel free tier**: Unlimited bandwidth for non-commercial (hobby project initially)
- **Supabase Pro tier**: $25/month for 8GB database, 100GB storage, 250GB bandwidth (handles 1000+ users)
- **Twilio**: $1/month base + ~$7.50/month for 1000 SMS (20 SMS/day per user average)
- **OpenAI costs**: Rate-limited to $50/month max (10 interactions × 1000 users × $0.005/interaction)
- **Total budget**: $35/month for 1000 users vs $130/month for mobile app (73% savings per pivot plan)

**Development Environment**:
- **Local dev**: Next.js dev server + Supabase local (Docker) for full stack development
- **Hot reload**: Next.js Fast Refresh for instant UI updates
- **Type safety**: Supabase CLI generates TypeScript types from database schema
- **Git**: GitHub with feature branch workflow

**Monitoring**:
- **Error tracking**: Sentry (free tier) for web app and edge function errors
- **Analytics**: PostHog or Plausible (privacy-focused, GDPR-compliant)
- **Logs**: Supabase built-in logging for edge functions, Vercel logs for web app
- **Performance**: Vercel Analytics for Web Vitals monitoring

**Browser Support**:
- **Primary**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile web**: iOS Safari 14+, Chrome Android 90+
- **No IE11**: Modern web standards only (ES2020+, CSS Grid, Flexbox)

---

**Key Technical Decisions Summary**:

| Aspect | Decision | Why |
|--------|----------|-----|
| **Repo** | Monorepo | Solo founder, easier management |
| **Frontend** | Next.js 14 App Router | SSR, SEO, modern React features |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Managed infrastructure, no DevOps |
| **State** | Zustand + TanStack Query | Lightweight, no Redux complexity |
| **Styling** | Tailwind CSS | Rapid development, consistent design |
| **Maps** | Mapbox GL JS | Better free tier than Google Maps |
| **SMS** | Twilio | Industry standard, reliable webhooks |
| **AI** | OpenAI GPT-4 | Best conversational AI for Pookie |
| **Testing** | Unit + Integration, manual E2E | Pragmatic for solo founder MVP |
| **Deployment** | Vercel (web) + Supabase (backend) | Free/cheap tiers, automatic scaling |
| **Cost** | <$35/month for 1K users | 73% cheaper than mobile app |
