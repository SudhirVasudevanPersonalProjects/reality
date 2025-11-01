# My Reality - Product Requirements Document (PRD)

**Version:** v5.2 (Web-First MVP - Corrected Auth Architecture)
**Date:** 2025-11-01
**Status:** Approved
**Author:** PM John + PO Sarah + User

---

## Goals and Background Context

### Goals

1. **Instant Mind Offloading**: Record thoughts, motivations, desires, and experiences instantly to offload mental energy and map the self over time, helping people understand who they are, what they want, and how to become who they were meant to be.

2. **Visual Reality Mapping**: Create a visual, intuitive mapping of personal reality using thoughts, desires, experiences, and interpretations accessible on the web - a tool to plan the future, appreciate the past, and return to the present when uncertain.

3. **AI Reality Steward**: Provide an LLM chatbot that acts as the steward of "my reality," helping navigate and make sense of captured experiences.

4. **Shared Experiences**: Enable sharing reality with friends, starting with mutual experiences - collecting their memories and my memories (initially photos) in one place.

5. **Lightweight & Scalable**: Build with extreme simplicity for easy understanding and scaling, with future mobile app connectivity.

### Background Context

The World Health Organization identifies meaninglessness and loneliness as epidemics of our time. People are drowning in endless digital noise with no way to capture and evolve personal meaning. "My Reality" solves this by acting as a signal filter - transforming the chaos of daily experiences into coherent, meaningful self-knowledge.

For example: in the midst of a doomscrolling session, when something meaningful strikes you, you can instantly capture "oh shit that was meaningful" along with links to reels, TikToks, or any content - to revisit later. By instantly capturing thoughts, experiences, memories, and even fleeting moments of inspiration, the system creates a living map of who you are, providing clarity in moments of uncertainty and preserving meaning that would otherwise be lost to the mental fog of modern life.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-01 | v5.2 | **ARCHITECTURE CORRECTION**: SSR dashboard, CSR auth pages, unified `@supabase/ssr` pattern, removed global Auth Context. See detailed explanation below. | PO Sarah |
| 2025-10-31 | v5.1 | Pivot to web-first MVP - defer SMS/Twilio to Phase 2, implement email auth + web capture interface | PM John |
| 2025-10-27 | v5.0 | Lean PRD created - simplified focus on core capture → organize loop | PM + User |

---

## Architecture Correction Explanation (v5.2)

### What Was Wrong

The initial implementation (v5.1) had **five critical issues** that caused authentication state confusion, cookie management problems, and violated Next.js 14 best practices:

#### Issue 1: Mixed Client Creation Methods
**Problem**: Three different ways of creating Supabase clients existed simultaneously:
- `lib/supabase/client.ts` exported `createClient()` AND `createClientComponent()`
- Login page used `createClientComponent()` from our custom helper
- Signup page used `createClientComponentClient()` from deprecated `@supabase/auth-helpers-nextjs`
- Middleware used `createMiddlewareClient()` from deprecated package

**Why This Failed**:
- Different client creation methods use different cookie strategies
- `createClientComponentClient()` (deprecated) manages cookies differently than `createBrowserClient()` from `@supabase/ssr`
- Session state could become out-of-sync between pages
- Cookie conflicts caused "session not found" errors after login

#### Issue 2: No Server-Side Rendering for Dashboard
**Problem**: Dashboard was a Client Component using `useAuth()` hook:
```typescript
// ❌ WRONG: Client Component dashboard
"use client"
export default function DashboardPage() {
  const { user, signOut } = useAuth() // Client-side only
  return <div>{user.email}</div>
}
```

**Why This Failed**:
- Dashboard had to wait for client-side JavaScript to load before checking auth
- No pre-fetched user data (slow initial render)
- Violated the ChatGPT architecture guidance: "SSR dashboard → pre-populate data before rendering"
- User sees flash of loading state on every page load

#### Issue 3: Deprecated Packages
**Problem**: Used `@supabase/auth-helpers-nextjs` package which is **officially deprecated** by Supabase.

**Why This Failed**:
- Package will be removed in future Supabase versions
- Lacks modern SSR optimizations from `@supabase/ssr`
- Missing Edge Runtime support
- Security patches no longer provided

#### Issue 4: Unnecessary Global Auth Context
**Problem**: Created `AuthProvider` wrapping entire app with React Context:
```typescript
// ❌ WRONG: Global context provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  // ... complex state management
  return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>
}
```

**Why This Failed**:
- Added unnecessary complexity (120 lines of context code)
- Supabase SSR already manages session via cookies - no need for global state
- Caused re-renders across entire app when auth state changed
- Harder to debug (state spread across client/server boundaries)

#### Issue 5: Cookie Management Inconsistency
**Problem**: Different cookie handling strategies across middleware, server components, and client components.

**Why This Failed**:
- Middleware used one cookie API, pages used another
- Session tokens could be set in cookies but not read correctly
- Race conditions during login/logout (cookie updates not atomic)

---

### What Was Fixed

#### Fix 1: Unified Client Creation ✅
**Solution**: Single `createClient()` function in each environment, all using `@supabase/ssr`:

```typescript
// ✅ CORRECT: lib/supabase/client.ts (Browser - CSR)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// ✅ CORRECT: lib/supabase/server.ts (Server - SSR)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context - cookies set by middleware
          }
        },
      },
    }
  )
}
```

**Why This Works**:
- Both use `@supabase/ssr` package (unified cookie strategy)
- Browser client for CSR (login, signup, client-side mutations)
- Server client for SSR (dashboard, API routes, pre-fetching)
- Cookies managed consistently across all environments

#### Fix 2: SSR Dashboard with Pre-fetched Data ✅
**Solution**: Dashboard is now a Server Component that fetches user data before rendering:

```typescript
// ✅ CORRECT: app/dashboard/page.tsx (Server Component)
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient() // Server-side client
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login') // Server-side redirect (no flash)
  }

  const user = session.user // Pre-fetched server-side

  return <DashboardClient user={user} /> // Pass to Client Component
}
```

```typescript
// ✅ CORRECT: app/dashboard/DashboardClient.tsx (Client Component)
'use client'

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient() // Browser client
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div>
      <span>{user.email}</span> {/* Already available, no loading */}
      <button onClick={handleSignOut}>Log out</button>
    </div>
  )
}
```

**Why This Works**:
- **Server Component** (async function) runs on server, fetches user data BEFORE HTML sent to browser
- User data pre-populated in initial HTML response (instant render)
- No loading state, no flash of unauthenticated content
- Client Component handles interactivity (logout button)
- Matches ChatGPT architecture: "SSR dashboard with pre-populated data"

#### Fix 3: Migrated to `@supabase/ssr` ✅
**Solution**: Removed all usage of deprecated `@supabase/auth-helpers-nextjs`, migrated to `@supabase/ssr`:

```typescript
// ✅ CORRECT: middleware.ts (Edge Runtime)
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Route protection logic
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

**Why This Works**:
- Modern `@supabase/ssr` package maintained by Supabase
- Edge Runtime compatible (runs on Vercel Edge for <50ms auth checks)
- Correct cookie handling for Edge environment
- Future-proof (won't be deprecated)

#### Fix 4: Removed Global Auth Context ✅
**Solution**: Deleted `lib/auth/AuthProvider.tsx` entirely, removed from `app/layout.tsx`:

```typescript
// ✅ CORRECT: app/layout.tsx (No AuthProvider wrapper)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-white antialiased">
        {children} {/* No provider needed */}
      </body>
    </html>
  )
}
```

**Why This Works**:
- Supabase SSR manages session in **HTTP-only cookies** automatically
- Server Components read cookies via `createClient()` from `lib/supabase/server.ts`
- Client Components read cookies via `createClient()` from `lib/supabase/client.ts`
- No need for global state - cookies ARE the source of truth
- Simpler architecture, fewer lines of code, easier to debug

#### Fix 5: Unified Cookie Strategy ✅
**Solution**: All environments use same cookie handling pattern from `@supabase/ssr`:

- **Browser (CSR)**: `createBrowserClient()` → automatically reads/writes cookies
- **Server (SSR)**: `createServerClient()` → uses Next.js `cookies()` API with `getAll()`/`setAll()`
- **Middleware (Edge)**: `createServerClient()` → uses `request.cookies` and `response.cookies`

**Why This Works**:
- Single source of truth: HTTP-only cookies set by Supabase
- Consistent API across all environments
- No race conditions (cookies updated atomically)
- Secure (HTTP-only, SameSite, Secure flags set automatically)

---

### How the Corrected Architecture Works (Flow Diagram)

#### **Login Flow**:
```
1. User visits /login (CSR Client Component)
   ↓
2. User submits email/password
   ↓
3. Client calls createClient() from lib/supabase/client.ts (Browser Client)
   ↓
4. supabase.auth.signInWithPassword({ email, password })
   ↓
5. Supabase sets JWT token in HTTP-only cookie
   ↓
6. router.push('/dashboard') + router.refresh()
   ↓
7. Middleware intercepts request, reads cookie, allows access
   ↓
8. Dashboard Server Component runs createClient() from lib/supabase/server.ts
   ↓
9. Reads session from cookie, fetches user data server-side
   ↓
10. Renders HTML with pre-populated user data (instant, no flash)
```

#### **Dashboard Load Flow**:
```
1. User navigates to /dashboard
   ↓
2. Middleware runs (Edge Runtime)
   ↓
3. Reads session from HTTP-only cookie
   ↓
4. If no session → redirect to /login (server-side, no flash)
   ↓
5. If session exists → allow request to continue
   ↓
6. Dashboard Server Component runs (server-side)
   ↓
7. Fetches user data from Supabase using session from cookie
   ↓
8. Pre-populates user data into HTML
   ↓
9. Sends HTML to browser (user sees data immediately)
   ↓
10. Client Component hydrates (logout button becomes interactive)
```

#### **Logout Flow**:
```
1. User clicks "Log out" button (Client Component)
   ↓
2. Client calls createClient() from lib/supabase/client.ts
   ↓
3. supabase.auth.signOut()
   ↓
4. Supabase clears JWT cookie
   ↓
5. router.push('/login') + router.refresh()
   ↓
6. Middleware intercepts, sees no session, allows /login access
   ↓
7. Login page renders
```

---

### Why This Architecture is Better

| Aspect | Old (v5.1) | New (v5.2) | Benefit |
|--------|-----------|-----------|---------|
| **Dashboard Rendering** | Client Component (CSR) | Server Component (SSR) | Instant data, no loading flash |
| **Auth State Management** | Global React Context (120 lines) | HTTP-only cookies (0 lines) | Simpler, automatic, secure |
| **Client Creation** | 3 different methods | 1 unified method per environment | Consistent, predictable |
| **Package Dependencies** | Deprecated `@supabase/auth-helpers-nextjs` | Modern `@supabase/ssr` | Future-proof, maintained |
| **Cookie Handling** | Inconsistent across pages | Unified strategy | No race conditions |
| **Middleware Performance** | Unknown (deprecated API) | Edge Runtime (<50ms) | Fast auth checks |
| **Lines of Code** | AuthProvider (120) + pages | Pages only | Simpler, maintainable |
| **ChatGPT Alignment** | ❌ No SSR dashboard | ✅ SSR with pre-fetch | Matches architecture guidance |

---

### Key Takeaways

1. **SSR Dashboard is Critical**: Pre-fetching user data server-side eliminates loading states and provides instant UX
2. **Unified Cookie Strategy**: Using `@supabase/ssr` across all environments ensures consistent session management
3. **No Global State Needed**: Supabase SSR handles session via cookies - React Context adds unnecessary complexity
4. **Server Components Win**: For protected routes with data, Server Components provide better performance than Client Components
5. **Edge Middleware**: Running auth checks on Edge Runtime (instead of Node.js) provides sub-50ms latency

---

### Testing the Corrected Architecture

**Dev Server Running**: http://localhost:3002

**Test These Flows**:
1. Visit `/login` → Login with valid credentials → Should redirect to `/dashboard` (instant, no flash)
2. Dashboard should show user email immediately (pre-fetched server-side)
3. Click "Log out" → Should redirect to `/login`
4. Try accessing `/dashboard` without login → Should redirect to `/login` (middleware protection)
5. Refresh dashboard while logged in → Data should appear instantly (no loading state)

**Expected Behavior**:
- ✅ No flash of unauthenticated content
- ✅ No loading spinners on dashboard
- ✅ Instant redirects (server-side, not client-side)
- ✅ Session persists across page refreshes
- ✅ Cookies visible in DevTools → Application → Cookies (HTTP-only flag set)

---

**Architecture now matches industry best practices for Next.js 14 + Supabase SSR applications.**

---

## Requirements

### Functional Requirements

**FR1:** Users can create text captures via web interface and the content appears on their personal web dashboard.

**FR2:** Users can upload photos via web interface and the photos appear on their personal web dashboard.

**FR3:** Users can upload videos via web interface and the videos appear on their personal web dashboard.

**FR4:** System recognizes and preserves URLs (TikTok, Reels, YouTube, etc.) pasted into the web interface.

**FR5:** Users are identified and authenticated by email/password - simple, secure login with Supabase Auth. *(Note: Phone number field preserved in database for Phase 2 SMS features)*

**FR6:** Web dashboard displays a visual, intuitive mapping of captured content (thoughts, photos, videos, links) organized over time.

**FR7:** Users can interact with an LLM chatbot on the web dashboard that acts as a "reality steward" to help navigate and make sense of captured experiences.

**FR8:** Users can share specific experiences or content with friends via their phone numbers.

**FR9:** Friends can contribute their own memories (initially photos) to shared experiences, which appear alongside the original user's content.

**FR10:** System captures timestamps for all content to enable temporal organization and reflection.

**FR11:** Users can create custom labels for any piece of content and apply multiple labels to the same content.

**FR12:** Users can search, filter, and sort content by labels through the LLM interface.

**FR13:** Users can create a mindmap view connecting any content pieces together.

**FR14:** Each connection between content pieces must include a user-provided reason/relationship description.

**FR15:** Mindmap connections are bidirectional and navigable - users can traverse their reality graph in any direction.

### Non-Functional Requirements

**NFR1:** System must be extremely lightweight and simple - optimized for easy understanding and future scaling.

**NFR2:** Upload-to-dashboard latency should be under 3 seconds for instant offloading experience.

**NFR3:** Email-based authentication must be secure and compliant with industry best practices (HTTPS, secure password hashing, JWT sessions).

**NFR4:** Architecture should consider future mobile app integration, but not at the cost of current simplicity (nice-to-have).

**NFR5:** System should minimize cognitive load - interface must be intuitive enough to use during moments of inspiration without friction.

---

## User Interface Design Goals

### Overall UX Vision

A calm, spacious interface resembling the vastness of space - mostly monochromatic (darks and whites) with clean, minimal typography. The interface should feel like navigating your inner cosmos, not scrolling a feed. Content is the star; UI fades into the background.

### Key Interaction Paradigms

- **Passive Capture, Active Reflection**: Content flows in effortlessly via simple web interface; deliberate interaction happens for organizing, connecting, and understanding
- **Conversational Navigation**: LLM chatbot as primary interface for finding, sorting, and making sense of content
- **Visual Thinking**: Mindmap as a first-class view mode, not an afterthought
- **Triage First**: Upon opening, user sees total capture count and most recent unsorted captures requiring attention

### Core Screens and Views

1. **Landing/Triage Screen** - Shows total capture count as prominent number, displays most recent unsorted captures
2. **Add to Your Reality (Capture Interface)** - GPT-like input interface for creating new captures (text, files, URLs)
3. **Dashboard/Timeline View** - Chronological stream of all captured content
4. **Mindmap View** - Graph visualization of connected content with relationships
5. **Chat Interface** - LLM conversation panel for navigating reality
6. **Content Detail View** - Individual piece with labels, connections, and metadata
7. **Shared Experiences View** - Collaborative spaces with friends' contributions

### Capture Interface Design (Phase 1 MVP)

**"Add to Your Reality" Page** - Accessed via "+" button from anywhere in the app:

```
┌─────────────────────────────────────────────┐
│  Add to Your Reality                   [X]  │
├─────────────────────────────────────────────┤
│                                             │
│  [Preview area shows captures as added]     │
│                                             │
├─────────────────────────────────────────────┤
│  📎  [Type or paste your thoughts...]   ⬆️  │
└─────────────────────────────────────────────┘
```

**Interface Behavior:**
- **GPT-like clean input** - Familiar, minimal friction
- **Text input**: Type or paste thoughts, URLs, or paragraphs
- **📎 Attachment**: Click to upload files (photos, videos, documents) - supports batch upload
- **⬆️ Submit**: Creates captures and adds to timeline
- **No AI response** - Input goes directly to your reality, no chatbot reply
- **Each text entry = 1 capture** - Simple, no auto-splitting
- **Each uploaded file = 1 capture** - Batch uploads create multiple captures

**Phase 2 Additions** (deferred):
- 🎤 Voice recording (microphone capture with transcription)
- SMS/Twilio integration (text messages create captures)
- iCloud link parsing (automatically import from iCloud shared albums)

### Accessibility

WCAG AA compliance for text contrast and keyboard navigation. Keep it simple and readable.

### Branding

Space-like aesthetic: monochromatic palette (blacks, whites, grays), clean monospace or geometric sans-serif fonts, generous whitespace. Subtle animations if any. The feeling should be "looking into the void of your own mind."

### Target Platforms

**Primary Platform**: Desktop web browser (optimized for deep work, mindmap visualization, and extended reflection sessions)

**Secondary Platform**: Tablet/iPad browser (full feature parity with desktop)

**Mobile Browser**: Minimal triage interface only - swipe through recent unsorted captures. Intentionally limited to encourage moving to desktop/tablet for deeper engagement. Goal is to get OFF the phone, not stay on it.

---

## Technical Assumptions

### Repository Structure

**Monorepo** - Single repository for simplicity

```
reality/
├── app/              # Next.js application (frontend + API routes)
├── supabase/         # Database migrations, Edge Functions, RLS policies
├── docs/             # PRD, architecture, stories
└── .bmad-core/       # BMAD agent system
```

**Rationale**: Solo developer, keep everything in one place, shared TypeScript types.

---

### Service Architecture

**Serverless Web App + Managed Backend Services**

- **Frontend**: Next.js 14+ App Router (React Server Components, client components)
  - **SSR Pages**: Dashboard and protected routes use Server Components for pre-fetched data
  - **CSR Pages**: Auth pages (login/signup) use Client Components for interactive forms
- **Backend Logic**:
  - Next.js API Routes for LLM chat (`/api/chat`)
  - Next.js API Routes for file uploads (`/api/captures`)
  - *(Phase 2: Supabase Edge Functions for SMS webhooks)*
- **Database**: Supabase PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime subscriptions (new captures appear instantly)
- **Middleware**: Edge middleware for route protection and session management

**NOT microservices** - Simple monolithic Next.js app with thin serverless functions.

**Authentication Architecture**:
- **CSR Auth Forms**: Login/signup pages use Client Components with `@supabase/ssr` browser client
- **SSR Protected Routes**: Dashboard uses Server Component with `@supabase/ssr` server client to pre-fetch user data
- **Edge Middleware**: Route protection runs on Vercel Edge Runtime using `@supabase/ssr` for low-latency session checks
- **No Global Auth Context**: Session state managed via HTTP-only cookies, accessed server-side or client-side as needed

**Rationale**:
- No servers to manage
- Auto-scaling built-in
- Free tier covers MVP
- All TypeScript (consistent language)
- SSR dashboard provides instant data pre-population
- Edge middleware ensures fast auth checks (<50ms typical)
- Simplified architecture removes need for global React Context

---

### Frontend Stack

- **Framework**: Next.js 14+ App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (monochromatic dark/white space theme)
- **Animations**: Framer Motion (page transitions)
- **Mindmap Visualization**: React Flow (graph rendering with nodes/edges)
- **State Management**: Zustand (lightweight global state)
- **Server State**: TanStack Query (data fetching, caching)

---

### Backend Stack

- **Runtime**: Node.js / Deno (Supabase Edge Functions)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (email/password authentication)
- **Storage**: Supabase Storage (photos, videos, documents)
- **LLM**: OpenAI API or Anthropic Claude API
- **Phase 2**: Twilio Programmable Messaging (SMS capture)

---

### Database & Auth

- **Database**: Supabase Postgres with Row Level Security (users only see their own data)
- **Auth Method**: Email/password authentication via Supabase Auth
- **Session**: JWT tokens in HTTP-only cookies, managed by Supabase Auth SSR (`@supabase/ssr`)
- **Phone Number**: Column preserved in `users` table (nullable) for Phase 2 SMS features

**Auth Implementation Pattern**:
- **Client-Side (CSR)**: `lib/supabase/client.ts` exports `createClient()` using `createBrowserClient()` from `@supabase/ssr`
  - Used in: Login, signup, logout button (Client Components)
- **Server-Side (SSR)**: `lib/supabase/server.ts` exports `createClient()` using `createServerClient()` from `@supabase/ssr`
  - Used in: Dashboard, API routes, server data fetching (Server Components)
- **Edge Middleware**: `middleware.ts` uses `createServerClient()` directly for route protection
  - Runs on Vercel Edge Runtime for low-latency auth checks

---

### Testing Requirements

- **Unit Tests**: Core logic (labeling, connections, sorting)
- **Integration Tests**: API routes, database queries
- **E2E Tests**: Manual testing for MVP (automated later if needed)
- **Tools**: Vitest (fast, TypeScript-native)

---

### Deployment

- **Frontend**: Vercel (free hobby tier, auto-deploy from Git)
- **Backend Functions**: Supabase Edge Functions (included in Supabase)
- **Database**: Supabase (free tier: 500MB DB, 1GB storage, 2GB bandwidth)
- **Environments**:
  - Dev: Local (Supabase local via Docker)
  - Production: Vercel + Supabase Cloud

---

### Additional Technical Assumptions

**Cost Structure (Free Tier Focus):**
- Vercel: Free (hobby projects)
- Supabase: Free tier covers MVP (500MB DB, 1GB file storage)
- OpenAI: Pay per token (rate-limit to control costs)
- **Target Phase 1**: $0/month infrastructure, ~$5-10/month for LLM at low usage
- **Target Phase 2**: Add ~$10-20/month for Twilio SMS when implemented

**Browser Support:**
- Desktop: Chrome, Firefox, Safari, Edge (modern versions)
- Tablet: iPad Safari, Chrome
- Mobile: Minimal triage view only (swipe recent captures)

**Performance:**
- Upload-to-dashboard latency: < 3 seconds
- Page load: < 2 seconds
- Mindmap rendering: Smooth 60fps
- File upload: Progress indicator for large files

**Security:**
- HTTPS only (enforced by Vercel)
- Row Level Security on all tables (user data isolation)
- API keys hidden in environment variables
- Email/password authentication with secure password hashing
- JWT sessions in HTTP-only cookies (XSS protection)

**Future Migration Path:**
- If advanced AI/ML needed: Add FastAPI server alongside (hybrid)
- If heavy processing needed: Add background job queue
- If real-time collab needed: Add WebSocket server
- Current architecture supports gradual migration

---

## Epic List

The following epics represent the logical development sequence for My Reality. Each epic delivers a complete, testable, deployable increment of functionality. We will work story-by-story through each epic using the BMAD-METHOD™.

---

### Epic 1: Foundation & Web-Based Capture

**Goal**: Set up Next.js app, Supabase database, email authentication, and web capture interface. Users can log in, create text/photo/video captures via clean web UI, and view them on dashboard.

**Value**: Proves the core loop works - capture → organize → reflect.

---

### Epic 2: Content Organization & Labeling

**Goal**: Users can view captured content on web, create custom labels, and organize content by labels through simple UI.

**Value**: Transform chaotic captures into organized knowledge.

---

### Epic 3: Visual Mapping & Connections

**Goal**: Implement mindmap view where users can connect any two pieces of content with a reason/relationship description.

**Value**: Build the "reality graph" - see how thoughts/experiences relate.

**Technical Approach**:

Connections enable users to link 2 or more captures together with an explanatory relationship. For example:
- **Experience**: "Eating Domino's pizza with friend"
- **Thought**: "Friend wasn't present mentally"
- **Connection**: "Maybe they were worried about something"

Database schema uses a many-to-many relationship pattern:

```sql
-- Stores the connection metadata and relationship description
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,  -- User's explanation of the connection
  metadata JSONB,              -- Optional: connection type, strength, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Junction table linking captures to connections (supports 2, 3, 4+ captures per connection)
CREATE TABLE connection_captures (
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  position INTEGER,  -- Optional: ordering within the connection
  PRIMARY KEY (connection_id, capture_id)
);

-- Indexes for performance
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connection_captures_connection ON connection_captures(connection_id);
CREATE INDEX idx_connection_captures_capture ON connection_captures(capture_id);
```

**Key Design Features**:
- Supports connecting 2+ captures (not just pairs)
- Bidirectional navigation (query from any capture to find its connections)
- Each connection requires user-written relationship description
- RLS ensures users only see their own connections
- Metadata field for future enhancements (connection types, strength ratings)

**Frontend Visualization**: React Flow for graph rendering with nodes (captures) and edges (connections with relationship labels).

---

### Epic 4: LLM Reality Steward

**Goal**: Add LLM chatbot that can navigate, search, filter, and help make sense of captured reality using conversation.

**Value**: AI partner to help you understand your own mind.

---

### Epic 5: Shared Experiences with Friends

**Goal**: Share specific content with friends via phone number, friends can contribute their photos/memories to shared experiences.

**Value**: Collaborative memory-making.

---

### Epic 6: Triage & Landing Experience

**Goal**: Build the "space landing" experience - show capture count on open, triage recent unsorted content first.

**Value**: Clear entry point, encourages regular organization.

---

### Epic 7: Media Support & URL Preservation

**Goal**: Handle videos, extract/preview URLs (TikTok, Reels, YouTube), rich media display.

**Value**: Capture ANY type of meaningful content.

---

### Epic 8: Polish & Performance

**Goal**: Optimize loading, improve animations, refine space aesthetic, performance tuning.

**Value**: Beautiful, fast experience that encourages daily use.

---

## Phase 2: Future Features (Deferred)

The following features are intentionally deferred to Phase 2 to keep the MVP lean and focused on core web experience:

### SMS/Twilio Integration
- **Status**: Deferred (requires Twilio account approval)
- **Description**: Text messages to dedicated phone number create captures automatically
- **Value**: Ultra-low-friction capture from anywhere (no need to open app)
- **Prerequisites**: Twilio account setup, webhook infrastructure, phone number provisioning
- **Epic**: Will be added as Epic 1.5 or separate epic when ready

### Phone Authentication
- **Status**: Deferred (requires SMS provider)
- **Description**: Login via phone number + SMS verification code (no password)
- **Value**: Passwordless authentication, familiar UX
- **Prerequisites**: SMS provider (Twilio or Supabase built-in SMS)

### Voice Recording & Transcription
- **Status**: Deferred to simplify MVP
- **Description**: 🎤 Microphone button in capture interface → record voice → save as audio file or transcribe to text
- **Technical Options**:
  - Browser Web Audio API (free, records audio files)
  - OpenAI Whisper API (paid, transcribes speech to text)
- **Value**: Voice journaling, hands-free capture
- **Epic**: Likely Epic 2 or 3 (after core capture loop validated)

### iCloud Link Parsing
- **Status**: Deferred (technically complex, no public API)
- **Description**: Paste iCloud shared album link → automatically import all photos
- **Challenges**: No public iCloud API, requires scraping or manual download flow
- **Alternative**: Google Drive/Dropbox link support (they have APIs)
- **Value**: Bulk photo imports from existing collections

### Advanced Organizational Framework
- **Status**: Phase 2 feature exploration
- **Description**: AI-assisted categorization of captures into user-defined ontologies (e.g., experiences/thoughts/desires)
- **Value**: Personalized organizational structures beyond generic labels
- **Epic**: Likely tied to Epic 2 (Content Organization & Labeling)

---

## Next Steps

### Immediate Actions

1. **Archive Old PRD/Architecture**: Move previous v4 docs to `docs/archive/v4-web-sms/`
2. **Architect Handoff**: Transform into Architect agent to create detailed architecture document
3. **SM Story Creation**: Use SM agent to create Story 1.1 from Epic 1, work story-by-story

### Story-by-Story Development Workflow

**CRITICAL**: We will work one story at a time through the entire BMAD cycle:

1. **SM creates Story 1.1** → User approves → Status: "Approved"
2. **Dev implements Story 1.1** → All tests pass → Status: "Ready for Review"
3. **(Optional) QA reviews Story 1.1** → Creates gate → Status: "Done"
4. **SM creates Story 1.2** → Repeat cycle

This approach ensures:
- ✅ Incremental progress with constant validation
- ✅ Early detection of architectural issues
- ✅ Ability to pivot based on learnings
- ✅ No overwhelming context for AI agents

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: PM John (BMAD-METHOD™)**
