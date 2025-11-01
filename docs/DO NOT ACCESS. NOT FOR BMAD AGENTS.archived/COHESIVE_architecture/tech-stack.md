# Tech Stack

This is the DEFINITIVE technology selection for the entire Reality project. All development must use these exact technologies and versions.

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | ^5.6 | Type-safe JavaScript for all frontend code | Latest stable with improved type inference and performance |
| Frontend Framework | Next.js | ^15.0 | React framework with App Router, RSC, file-based routing | Latest stable with improved App Router, Turbopack stability, React 19 support |
| UI Component Library | Radix UI | ^1.1 | Unstyled accessible components | Latest stable with improved keyboard navigation and ARIA support |
| State Management | Zustand | ^5.0 | Lightweight global client state | Latest version with improved TypeScript inference and devtools |
| Server State | TanStack Query | ^5.59 | Server state caching, background sync | Latest v5 with improved TypeScript, suspense support, better devtools |
| Backend Language | TypeScript (Deno) | Deno ^2.0 | Type-safe serverless functions | Latest Deno with npm compatibility, faster runtime, improved Node compat |
| Backend Framework | Supabase Edge Functions | Latest stable | Serverless function runtime | Use Supabase's latest stable Deno runtime version |
| API Style | REST + Realtime | Supabase PostgREST v12 + Realtime v2 | Database access and live subscriptions | Latest Supabase API with improved performance and WebSocket stability |
| Database | PostgreSQL (Supabase) | 16.x | Primary relational database | Latest PostgreSQL with improved query performance and JSONB operators |
| Cache | TanStack Query (client-side) | ^5.59 | Client-side query cache | Built-in stale-while-revalidate caching |
| File Storage | Supabase Storage | Latest stable | Photo/video storage with CDN | S3-compatible with automatic image optimization |
| Authentication | Supabase Auth | Latest stable | JWT-based auth with email/password + OAuth | Managed auth with PKCE flow, MFA support, session refresh |
| Frontend Testing | Vitest | ^2.1 | Unit and component tests | Latest with improved watch mode and browser mode |
| Testing Library | React Testing Library | ^16.0 | Component testing | Latest with React 19 support and improved async utilities |
| Backend Testing | Vitest + Supabase Test Helpers | ^2.1 | Edge Function and database tests | Same test runner for consistency |
| E2E Testing | Manual (Playwright deferred) | N/A | Manual browser testing | MVP validation, automation post-PMF |
| Build Tool | Turbo (Turborepo) | ^2.2 | Monorepo build orchestration | Latest with improved caching and remote cache support |
| Bundler | Next.js (Turbopack) | Built-in | JavaScript bundling and optimization | Turbopack now stable in Next.js 15 for dev and production |
| IaC Tool | Supabase CLI | ^1.200 | Database migrations as code | Latest CLI with improved local dev and branching |
| CI/CD | GitHub Actions + Vercel | Latest | Automated testing and deployment | GitHub Actions for tests, Vercel for deployment |
| Monitoring | Sentry | ^8.35 | Error tracking and performance | Latest SDK with improved source maps and performance insights |
| Logging | Supabase Logs + Vercel Logs | Built-in | Application and function logs | Integrated logging, no separate infrastructure |
| Analytics | PostHog | ^3.7 | Privacy-focused product analytics | Latest with improved session replay and feature flags |
| CSS Framework | Tailwind CSS | ^3.4 | Utility-first styling | Latest v3 (v4 in alpha, staying on stable) |
| Maps | Mapbox GL JS | ^3.7 | Interactive web maps | Latest with improved performance and smaller bundle size |
| Geocoding | Mapbox Geocoding API | v6 | Reverse geocoding and search | Current stable API version |
| SMS/MMS | Twilio Programmable SMS | Latest API | SMS webhook ingestion | Current stable Twilio API |
| AI/LLM | OpenAI GPT-4 | gpt-4-turbo-2024-04-09 | Pookie chat and pattern recognition | Latest stable model (gpt-4o available as upgrade path) |
| Animation | Framer Motion | ^11.11 | UI animations and page transitions | Latest with improved layout animations and performance |
| Graph Visualization | D3.js | ^7.9 | Knowledge graph rendering | Latest v7 with ESM support |
| Date/Time | date-fns | ^4.1 | Date manipulation and formatting | Latest with improved tree-shaking and TypeScript |
| Image Processing | Sharp | ^0.33 | MMS photo compression | Latest with improved AVIF support and performance |
| Validation | Zod | ^3.23 | Runtime type validation | Latest with improved error messages and performance |
| HTTP Client | Fetch API (native) | Built-in | API requests | Native browser/Deno API, no dependencies |

**Version Strategy Notes:**
- **^ (caret) versioning:** Allows automatic patch and minor version updates (e.g., ^5.6 allows 5.6.x and 5.7.x but not 6.0.0)
- **Latest stable:** For managed services (Supabase, Vercel) where the platform controls the version
- **Specific versions:** For APIs with versioned endpoints (Mapbox Geocoding v6, OpenAI model names)

**Dependency Update Strategy:**
- Monthly dependency updates via Dependabot
- Test suite runs on all updates before merging
- Major version updates evaluated case-by-case (breaking changes require code review)

## 3.1: Technology Alternatives Considered

This section documents major technology decisions and why alternatives were not chosen. This provides context for future architectural reviews and helps prevent revisiting settled decisions.

| Decision Category | Chosen Technology | Alternative(s) Considered | Why Chosen Over Alternatives |
|-------------------|-------------------|---------------------------|------------------------------|
| **Frontend Framework** | Next.js 15 | Remix, Vite + React Router, Astro | Next.js provides SSR/SSG out-of-box with App Router, Vercel integration for free hosting, largest ecosystem. Remix too new, Vite requires manual SSR setup, Astro better for content sites. |
| **Backend/Database** | Supabase | Firebase, AWS Amplify, Planetscale + tRPC | Supabase offers PostgreSQL (vs Firebase NoSQL), open-source (self-hostable), RLS for security, Realtime subscriptions. Firebase locks into NoSQL, AWS Amplify complex, Planetscale+tRPC requires more setup. |
| **State Management** | Zustand + TanStack Query | Redux Toolkit, Jotai, Recoil, MobX | Zustand has minimal boilerplate, perfect for app scale. Redux too heavy, Jotai/Recoil experimental. TanStack Query handles server state (caching, invalidation) better than manual Redux. |
| **Styling** | Tailwind CSS | CSS Modules, Styled Components, Emotion, Vanilla Extract | Tailwind enables rapid development with utility classes, excellent IDE support, tree-shaking removes unused styles. CSS Modules verbose, Styled Components runtime overhead, Emotion/VE overkill for app scale. |
| **Component Library** | Radix UI (Headless UI alternative) | Shadcn/ui, Material-UI, Chakra UI, Ant Design | Radix UI provides unstyled accessible primitives without design opinions. Shadcn/ui builds on Radix (can use later), Material-UI/Chakra opinionated styles fight with brand, Ant Design too heavy. |
| **Testing Framework** | Vitest | Jest, uvu, Mocha + Chai | Vitest is fastest (Vite-powered), Jest-compatible API (easy migration), native ESM support, better watch mode. Jest slower with ESM, uvu too minimal, Mocha requires more config. |
| **E2E Testing** | Playwright (deferred) | Cypress, Puppeteer, TestCafe | Playwright has better multi-browser support, faster execution, more reliable auto-waiting. Deferred to post-MVP due to time constraints, manual testing suffices for MVP. |
| **Monorepo Tool** | Turborepo | Nx, Lerna, pnpm workspaces only | Turborepo simpler than Nx (no generators), faster than Lerna, built by Vercel (good Next.js integration). pnpm workspaces alone lacks build orchestration. |
| **Animation Library** | Framer Motion | React Spring, GSAP, Motion One | Framer Motion has declarative API (fits React), excellent gestures, layout animations. React Spring imperative, GSAP not React-first, Motion One too new. |
| **SMS Provider** | Twilio | Plivo, Vonage, AWS SNS, MessageBird | Twilio is industry standard, excellent webhook reliability, best documentation, generous free tier ($15 credit). Plivo cheaper but less reliable, Vonage complex, AWS SNS requires more setup. |
| **Maps Provider** | Mapbox | Google Maps, Leaflet + OpenStreetMap, Apple Maps | Mapbox offers custom styling (dark blue theme), vector tiles (performance), generous free tier (50K loads). Google Maps expensive, Leaflet lacks styling, Apple Maps web SDK limited. |
| **LLM Provider** | OpenAI GPT-4 | Anthropic Claude, Google Gemini, Llama 3 (open-source) | OpenAI GPT-4 Turbo has best function calling, proven reliability, streaming support. Claude excellent but pricier, Gemini inconsistent, Llama requires self-hosting. |
| **Error Tracking** | Sentry | LogRocket, Rollbar, Bugsnag, Datadog | Sentry has best React integration, source maps, breadcrumbs, performance monitoring. LogRocket expensive, Rollbar limited features, Bugsnag UI outdated, Datadog overkill. |
| **Analytics** | PostHog | Mixpanel, Amplitude, Google Analytics 4, Plausible | PostHog is open-source, privacy-focused, includes session replay and feature flags. Mixpanel/Amplitude expensive at scale, GA4 privacy concerns, Plausible too basic (no events). |

**Key Decision Principles:**
1. **Proven over bleeding-edge** - Chose stable, widely-adopted technologies (Next.js, Supabase, Twilio)
2. **Developer experience** - Prioritized ergonomics (Zustand, Tailwind, Vitest) for AI agent implementation
3. **Cost efficiency** - Leveraged free tiers (Vercel, Supabase, Mapbox) to hit $35/month target
4. **Future flexibility** - Open-source where possible (Supabase, PostHog) to avoid vendor lock-in
5. **TypeScript-first** - All choices have excellent TypeScript support for type safety

**When to Revisit:**
- **Scale (10K+ users):** Consider switching from Supabase free tier to Pro, evaluate dedicated PostgreSQL
- **Cost (>$500/month):** Re-evaluate Twilio (consider Plivo), Mapbox (consider self-hosted tiles), OpenAI (consider Claude or Llama)
- **Performance issues:** Consider adding Redis cache, moving to edge database (Turso, Planetscale)
- **Team growth (5+ developers):** Consider adding Nx for better tooling, Storybook for component docs

---

