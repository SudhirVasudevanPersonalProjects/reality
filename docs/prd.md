# Reality Product Requirements Document (PRD)

**Date:** 2025-10-25
**Version:** v2.0 (Web + SMS Architecture)
**Status:** Ready for Architect
**Author:** PM John

---

## Goals and Background Context

### Goals

- Enable zero-friction thought capture via SMS (users text Reality number instantly without opening app)
- Provide spacious desktop organization interface for categorizing and visualizing captured moments
- Achieve faster iteration cycles through web deployment vs app store approval
- Reduce infrastructure costs by 73% ($35/month vs $130/month for 1K users)
- Deliver MVP in 6-8 weeks (vs 16-20 weeks for mobile equivalent)
- Prove SMS → Web workflow as superior UX for input (existing behavior) + organization (desktop interface)

### Background Context

The attention economy has turned reality into a minefield - My Reality turns it into a playfield by giving users a creator's tool to navigate it. The original mobile app approach required significant native development complexity (GPS, camera, offline sync, app store distribution) that created friction for both development and user experience.

The pivot to SMS capture + desktop web organization leverages existing user behavior (texting is frictionless) while providing the spacious interface needed for thoughtful categorization and visualization. Users text moments to their Reality number throughout the day, then organize them on desktop with Google Maps-style interface featuring interactive map, timeline, hierarchies, and Pookie (AI guide). This approach eliminates app store cycles, reduces costs, and accelerates time-to-market while delivering superior UX for both capture and organization.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-25 | v2.0 | Pivot to Web + SMS architecture based on pivot-plan-sms-to-web.md | PM John |

---

## Requirements

### Functional Requirements

**Core Capture System (SMS-Based):**

1. **FR1**: Users receive unique phone number (+1-555-REALITY shared number) during onboarding for SMS capture
2. **FR2**: Users can text any message to Reality number, system creates experience record with content, timestamp, source='sms'
3. **FR3**: Users can send photos via MMS, system downloads media from Twilio webhook, stores in Supabase Storage, creates experience with photo_urls
4. **FR4**: System looks up user by sender phone number (from field) and associates capture with correct user_id
5. **FR5**: SMS captures default to unprocessed state (null category), appear in Something's Abode queue
6. **FR6**: Users can send multiple photos in one MMS, each stored separately with same timestamp
7. **FR7**: System handles SMS delivery failures with retry logic and user notification

**Authentication & Phone Verification:**

8. **FR8**: Users create account via email/password with phone number field required during signup
9. **FR9**: System sends welcome SMS immediately after signup: "Welcome to Reality, the game. I'm Pookie, your guide. Text me anytime to capture moments. Visit reality.app to organize."
10. **FR10**: Users verify phone number via SMS code (6-digit) sent after signup
11. **FR11**: Users can optionally sign in via OAuth (Google) for simplified onboarding
12. **FR12**: Phone number must be unique per user, enforced at database level

**Desktop Web Organization Interface:**

13. **FR13**: Main app interface (/app) uses Google Maps-style layout: center content (80% width) + right sidebar navigation (20%)
14. **FR14**: Right sidebar contains navigation compass with buttons: Map, Timeline, Heart, Something's Abode, Shared Realities
15. **FR15**: Bottom bar contains Pookie LLM chat interface (collapsed by default, expands upward)
16. **FR16**: Clicking navigation button triggers smooth Framer Motion page transition without hard reload
17. **FR17**: Header displays "Reality" logo, user avatar, settings icon
18. **FR18**: Mobile web provides read-only view (browse map/timeline/hierarchies, no organization features)

**Something's Abode (Unprocessed Queue):**

19. **FR19**: Something's Abode displays all uncategorized SMS/MMS captures as cards (content, photos if MMS, timestamp)
20. **FR20**: Users can categorize captures via swipe/click actions with suggested categories: "Beauty", "Ugly", "Dreams"
21. **FR21**: Users can create custom category names beyond suggested defaults, stored as free-form text in database
22. **FR22**: Users can add GPS location manually to SMS capture (search city or click map)
23. **FR23**: Users can delete captures from queue with confirmation prompt
24. **FR24**: Batch mode allows selecting multiple captures for bulk categorization
25. **FR25**: Processed captures move from Something's Abode to appropriate hierarchy/map/timeline

**Map View (Physical Reality):**

26. **FR26**: Map (/app/map) displays Mapbox GL JS world map with dark blue grayscale base; experiences appear as dots where Beauty brightens the area, Ugly darkens it, and Dreams appear as flickering lights
27. **FR27**: Map supports zoom from world → country → state → city → street level with dot clustering at high zoom-out
28. **FR28**: Clicking map dot opens experience detail modal with all metadata and linked thoughts
29. **FR29**: Map uses "fog of war" for unvisited locations (darker grayscale), brightens as user adds experiences (especially Beauty)
30. **FR30**: Dream locations display as flickering/translucent markers if no GPS yet assigned

**Timeline View (Temporal Reality):**

31. **FR31**: Timeline (/app/timeline) displays all experiences chronologically from user's birth date to present
32. **FR32**: Timeline supports year/month/day zoom levels with smooth transitions
33. **FR33**: Users can jump to specific date via date picker navigation
34. **FR34**: Each timeline entry shows thumbnail (if photo), text preview, category indicator, GPS icon if location-tagged
35. **FR35**: Clicking timeline entry opens experience detail modal

**Heart's Abode (Hierarchies):**

36. **FR36**: Heart's Abode (/app/heart) displays columns for each category used by user (Beauty, Ugly, Dreams, and custom categories)
37. **FR37**: Each column shows ranked hierarchy (most-revisited at top) with visual ranking indicators
38. **FR38**: Users can manually categorize thoughts via drag-and-drop or button clicks
39. **FR39**: Hierarchies update in real-time as user revisits items (viewing item detail = +1 revisit count)
40. **FR40**: Clicking hierarchy item opens detail modal with connections graph

**Pookie LLM Chat Interface:**

41. **FR41**: Pookie chat always visible at bottom of screen with input field "Ask Pookie..."
42. **FR42**: Users can type navigation commands: "Show me timeline" triggers router.push('/app/timeline')
43. **FR43**: Users can ask questions: "Show me all my Beauty thoughts about nature" filters current view
44. **FR44**: Pookie has access to user's full capture history for context-aware responses via GPT-4 API
45. **FR45**: Chat history persists per session in Zustand state, clears on logout

**Shared Realities (Collaborative Editing):**

46. **FR46**: Users can share specific experiences with other users (visibility toggle: Private/Public/Shared with...)
47. **FR47**: Shared experiences appear in both users' realities as separate copies (fork model)
48. **FR48**: Users can view other users' public realities (read-only) via Shared Realities view (/app/shared)
49. **FR49**: Related Realities list shows connections with other users, sorted by shared experience count
50. **FR50**: Users can send relationship invites (accept/reject flow) before sharing experiences

**Completion & Scoring:**

51. **FR51**: Users can mark Dreams as "Completed" via button in detail modal, awards +1 Beauty Point
52. **FR52**: Users can mark Uglies as "Transformed" via button in detail modal, awards +1 Beauty Point
53. **FR53**: Reality Score formula (Total Beauty Created - Active Ugly Count) displays on profile
54. **FR54**: Completed Dreams and Transformed Uglies move to "Completed" archive (viewable but separate)
55. **FR55**: Profile shows completion history with dates and permanent "Beauty Created" counter

**Knowledge Graph & Connections:**

56. **FR56**: Users can link any capture to any other via "Connect" button, creating directional relationship
57. **FR57**: Connection labels explain relationship (e.g., "why this beauty matters", "underlying drive")
58. **FR58**: Item detail modal shows all connected nodes as visual web/graph (D3.js/Cytoscape.js)
59. **FR59**: Full knowledge graph view (/app/graph - future epic) shows entire network with zoom/pan/filter

**Data Management:**

60. **FR60**: All user data syncs to Supabase cloud with real-time updates (no offline mode for MVP)
61. **FR61**: Users can export all data (captures, hierarchies, completions) as JSON or CSV file
62. **FR62**: Users can permanently delete account and all data with confirmation prompt
63. **FR63**: Phone number visible only in Settings/Profile (not displayed in reality views to maintain immersion)

**Rate Limiting & Freemium:**

64. **FR64**: Free tier allows 20 SMS/day per user, enforced at webhook level
65. **FR65**: Exceeding 20 SMS shows notification: "Daily limit reached - upgrade for unlimited"
66. **FR66**: Freemium upgrade unlocks unlimited SMS capture (future monetization)

### Non-Functional Requirements

**Performance:**

1. **NFR1**: Web app loads initial route in <2 seconds on broadband connection
2. **NFR2**: SMS webhook processing completes within 3 seconds (Twilio → Supabase → stored)
3. **NFR3**: Map rendering completes initial load within 1 second, smooth 60fps pan/zoom
4. **NFR4**: Timeline scrolling maintains 60fps with lazy loading for datasets up to 1000 experiences
5. **NFR5**: Pookie chat responses return within 5 seconds (GPT-4 API call + streaming)

**Scalability:**

6. **NFR6**: System supports up to 10,000 captures per user without performance degradation
7. **NFR7**: Backend (Supabase + Vercel) handles up to 10,000 concurrent users during MVP phase
8. **NFR8**: Twilio webhook endpoint handles 100 SMS/minute burst traffic
9. **NFR9**: Photo storage scales cost-effectively via Supabase Storage with compression (target: 500KB per photo)

**Reliability:**

10. **NFR10**: Web app maintains 99% uptime (measured via Vercel analytics)
11. **NFR11**: SMS webhook retries failed processing with exponential backoff (3 retries max)
12. **NFR12**: Database backup occurs automatically every 24 hours with 30-day retention

**Security & Privacy:**

13. **NFR13**: All user data encrypted at rest and in transit (HTTPS/TLS)
14. **NFR14**: Row Level Security (RLS) policies ensure users can only access their own data
15. **NFR15**: Pookie AI calls routed through Supabase Edge Functions (OpenAI API keys hidden from client)
16. **NFR16**: Phone numbers hashed for privacy, Twilio proxy available for masking (future opt-in)
17. **NFR17**: App complies with GDPR (data export/deletion) and COPPA (13+ age gate)

**Usability:**

18. **NFR18**: Onboarding flow completable in <3 minutes (account creation, phone verification, welcome SMS)
19. **NFR19**: Desktop UI optimized for 1920x1080 baseline, responsive down to 1366x768
20. **NFR20**: Mobile web (< 768px) provides read-only view with bottom tab navigation
21. **NFR21**: All primary actions accessible within 2 clicks from home screen

**Cost Constraints:**

22. **NFR22**: Total infrastructure cost remains under $35/month for 1000 active users:
    - Supabase: $25/month (Pro tier)
    - Twilio: $1/month + $7.50/1K SMS
    - Vercel: Free tier (hobby)
23. **NFR23**: Pookie AI usage rate-limited to 10 interactions per user per day (control OpenAI costs)
24. **NFR24**: Photo storage uses compression (Sharp library) to minimize storage costs

**Platform Support:**

25. **NFR25**: Web app supports Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
26. **NFR26**: Mobile web provides read-only compatibility for iOS Safari and Chrome Android
27. **NFR27**: Built with Next.js 14+ App Router for optimal web performance

**Localization:**

28. **NFR28**: MVP supports English only (i18n infrastructure deferred to post-MVP)

**SEO & Public Launch:**

29. **NFR29**: Landing page (/) optimized for SEO with meta tags, Open Graph, structured data
30. **NFR30**: Public pages (landing, about) render server-side for search engine indexing
31. **NFR31**: /app routes protected with authentication middleware (redirect to login)

---

## User Interface Design Goals

### Overall UX Vision

Minimal dark blue grayscale interface where the **user's reality creates the light**. The base map and interface exist in subdued dark blue tones, becoming illuminated only through user's captures: Beauty brightens the world, Ugly creates shadow, Dreams flicker with possibility. This reflects the core philosophy - external reality is neutral until you impose meaning through categorization. Google Maps-style layout provides spatial navigation with persistent sidebar compass and bottom-bar Pookie chat. Desktop-first design prioritizes spacious organization; mobile web is read-only viewer.

### Key Interaction Paradigms

- **SMS as primary input**: Users never open app to capture - they text Reality number throughout day (existing behavior)
- **Desktop as organization space**: Web app is where chaotic SMS stream becomes structured reality
- **Visual navigation metaphor**: Right sidebar compass guides between "abodes" (Map/Timeline/Heart/Something/Shared)
- **Smooth transitions**: Route changes use Framer Motion page transitions - feels like single-page app but uses URLs for deep linking
- **Light sculpting**: User's categorizations literally shape the visual brightness/darkness of their reality map
- **Pookie as guide**: Always-accessible bottom chat bar for navigation and insights
- **Custom categories**: Users can create their own organizational systems beyond suggested defaults

### Core Screens and Views

From product perspective, critical screens delivering PRD value:

1. **Landing Page (/)** - Public marketing site with phone number entry, signup CTA, explanation of "text to capture, desktop to organize"
2. **Signup/Login (/auth/signup, /auth/login)** - Web forms with phone number field, email verification
3. **Main App Layout (/app)** - Google Maps-style: center content (80%) + right sidebar (20%) + bottom Pookie bar
4. **Map View (/app/map)** - Default view: Mapbox dark blue grayscale with brightness/darkness/flicker visualization
5. **Timeline View (/app/timeline)** - Vertical chronological scroll from birth to present, zoomable year/month/day
6. **Heart's Abode (/app/heart)** - Dynamic columns for each category (suggested + custom) with ranked hierarchies
7. **Something's Abode (/app/something)** - Unprocessed SMS queue with categorization UI, batch mode, custom category input
8. **Shared Realities (/app/shared)** - Related Realities list, public reality viewer, invite management
9. **Profile (/app/profile)** - Beauty Created counter, Reality Score, completion history, settings
10. **Experience Detail Modal** - Universal modal for viewing full content, connections graph, action buttons

### Accessibility

Level: None (WCAG AA compliance deferred to post-MVP) - MVP focuses on core desktop functionality for beta users. Screen reader support and keyboard navigation will be added post-launch based on user feedback.

### Branding

**Dark blue grayscale aesthetic** with reality-sculpting light system:
- **Base**: Dark blue-gray map and UI (#1a1f2e base, #2a3142 elevated surfaces)
- **Beauty**: Brightens area with warm glow (increases luminosity, subtle golden tint)
- **Ugly**: Darkens area with shadow (decreases luminosity, cooler tone)
- **Dreams**: Flickering lights (animated opacity pulses, ethereal blue-white)
- **Custom categories**: User-defined visual treatment (future enhancement)
- **Neutral/unexplored**: Dark grayscale (fog of war)
- **Typography**: Clean sans-serif (Inter or system fonts), high contrast for readability
- **Animations**: Smooth Framer Motion transitions, subtle lighting effects

Visual design polish deferred to post-MVP; PRD specifies **functional interaction patterns** only.

### Target Device and Platforms

**Desktop-first web application** with read-only mobile view:
- **Primary**: Desktop browsers 1366x768 minimum, optimized for 1920x1080
- **Supported browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Secondary**: Mobile web (< 768px) provides read-only browsing (map/timeline/hierarchies visible, no organization tools)
- **Native apps**: Explicitly out of scope - web only for MVP
- **Progressive Web App (PWA)**: Deferred to Epic 9 (optional offline reading)

---

## Technical Assumptions

### Repository Structure: Monorepo

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

### Service Architecture: Client-Side Heavy + Serverless Functions

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

### Testing Requirements: Unit + Integration, Manual E2E

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

### Additional Technical Assumptions and Requests

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

---

## Epic List

The following epics represent the logical development sequence for Reality v2.0 (Web + SMS). Each epic delivers a complete, testable, deployable increment of functionality. Epics build sequentially - later epics depend on infrastructure established in earlier ones.

---

### Epic 1: Foundation & Core SMS Capture

**Goal**: Establish Next.js web project, authentication with phone verification, and Twilio SMS/MMS capture via webhook. Proves users can text Reality number and captures appear in web interface.

---

### Epic 2: Physical Reality - Map & Timeline Views

**Goal**: Enable spatial and temporal visualization of captured experiences on desktop web. Users see WHERE (Mapbox map with brightness/darkness/flicker) and WHEN (timeline from birth to present) experiences happened.

---

### Epic 3: Heart's Abode - Hierarchies & Categorization

**Goal**: Implement Beauty/Ugly/Dreams categorization with custom category support and frequency-ranked hierarchies on desktop. Something's Abode queue for organizing SMS captures. Pookie basic pattern recognition.

---

### Epic 4: Knowledge Graph - Connections & Understanding

**Goal**: Enable users to link captures into web of meaning with desktop D3.js interactive graph visualization. Drive→Want→Dream intensity scale, connection labels, full network exploration.

---

### Epic 5: Transformation Loop - Completion & Proof

**Goal**: Close the game loop with Dream achievement, Ugly transformation, Beauty Points system, and Reality Score calculation. Permanent proof of agency timeline.

---

### Epic 6: Social Layer - Shared Realities & Collaboration

**Goal**: Implement fork/merge shared realities model, Related Realities connections, visit other users' public realities, privacy controls, and invite system.

---

### Epic 7: Past Memories & Bulk Import

**Goal**: Enable photo upload from desktop (drag-and-drop), EXIF metadata extraction, Google Photos integration, SMS backfill import, and AI-powered bulk organization.

---

### Epic 8: Creator's Pet Intelligence - Advanced AI

**Goal**: Enhance Pookie with GPT-4 conversational interface, agentic navigation commands, proactive insight notifications, connection suggestions, and voice input via Web Speech API.

---

### Epic 9: Polish, Performance & Launch Prep

**Goal**: Optimize web app performance (Mapbox clustering, Lighthouse audit), SEO optimization, landing page, PWA features, analytics integration, and public production launch.

---

## Epic 1: Foundation & Core SMS Capture

**Epic Goal (Expanded)**: Establish complete Next.js web application infrastructure including project setup, Supabase integration, user authentication with phone verification, and Twilio SMS/MMS webhook processing. By end of this epic, a user can create an account with phone number, receive welcome SMS, text the Reality number to capture moments (text or photos), and see those captures appear in the web interface at Something's Abode. This proves the full SMS → Web pipeline works end-to-end and establishes the Google Maps-style layout foundation.

**Value Delivered**: Deployable MVP skeleton - users can sign up, get their Reality number via SMS, start capturing via text messages, and organize on desktop web. Beta environment ready for user testing on Vercel.

---

### Story 1.1: Next.js Project Initialization & Deployment

**As a** developer,
**I want** a properly configured Next.js 14 monorepo with Supabase initialized and deployed to Vercel,
**so that** I have a clean foundation to build features without configuration issues blocking progress.

#### Acceptance Criteria

1. **Monorepo Structure Created**: Repository has `/apps/web`, `/packages/shared`, `/supabase`, `/docs`, `/.bmad-core` folders with README explaining structure
2. **Next.js 14 Initialized**: `apps/web/` contains working Next.js app with App Router, TypeScript, runs locally via `npm run dev`
3. **Supabase Project Created**: Cloud Supabase project provisioned with project URL and anon key, local Supabase running via Docker for development
4. **Environment Variables Configured**: `.env.local` files in `/apps/web` and `/supabase` with Supabase URL, anon key, service role key (gitignored)
5. **Tailwind CSS Configured**: Tailwind installed and working, dark blue base theme configured (#1a1f2e background)
6. **Dependencies Installed**: All required packages installed (@supabase/supabase-js, @supabase/ssr, framer-motion, zustand, @tanstack/react-query, mapbox-gl)
7. **Build Verification**: App builds successfully (`npm run build`) with no errors
8. **Vercel Deployment**: App deployed to Vercel preview environment, accessible via URL, auto-deploys on git push
9. **Hello World Landing**: Default page shows "My Reality" heading confirming app launches

---

### Story 1.2: User Authentication - Sign Up with Phone Number

**As a** new user,
**I want** to create an account with email, password, and phone number,
**so that** I can receive my Reality SMS number and start capturing moments via text.

#### Acceptance Criteria

1. **Sign Up Page UI**: `/auth/signup` route with email input, password input (min 8 chars, masked), phone number input (E.164 format validation), "Create Account" button
2. **Phone Number Validation**: Phone input validates format (e.g., +14085551234), shows inline error for invalid formats
3. **Email/Password Validation**: Invalid email shows error, password must be 8+ characters, confirm password field matches
4. **Supabase Auth Integration**: Tapping "Create Account" calls `supabase.auth.signUp()`, creates user in auth.users table
5. **Profile Creation**: Database trigger creates corresponding record in `profiles` table with user_id, email, phone_number, created_at
6. **Phone Number Uniqueness**: Database constraint ensures phone_number is unique, shows "Phone number already registered" error if duplicate
7. **Email Verification**: After signup, user sees "Check your email to verify account" screen
8. **Error Handling**: Clear errors for duplicate email, weak password, invalid phone, network failures
9. **Success Navigation**: After email verification click, user redirects to login page

---

### Story 1.3: User Authentication - Login & Session Management

**As a** returning user,
**I want** to log in with my email and password,
**so that** I can access my captured experiences and organize my reality.

#### Acceptance Criteria

1. **Login Page UI**: `/auth/login` route with email input, password input (masked), "Log In" button, "Don't have account? Sign up" link
2. **Supabase Auth Login**: Tapping "Log In" calls `supabase.auth.signInWithPassword()`, returns session token on success
3. **Session Persistence**: JWT session stored in cookies, app remembers login across browser restarts
4. **Error Handling**: Invalid credentials show "Incorrect email or password", unverified email shows "Please verify your email first"
5. **Success Navigation**: On successful login, redirect to `/app` (main application)
6. **Auto-Login**: If valid session exists on page load, skip login and redirect to `/app`
7. **Protected Routes**: Middleware on `/app/*` routes redirects to `/auth/login` if not authenticated
8. **Logout Functionality**: Profile settings has "Log Out" button that clears session and redirects to landing page

---

### Story 1.4: Database Schema - Core Tables for SMS Capture

**As a** developer,
**I want** the foundational database schema for experiences, thoughts, profiles, and sharing,
**so that** captured data has proper structure and relationships from day one.

#### Acceptance Criteria

1. **Profiles Table Updated**: `profiles` table includes: phone_number (unique), phone_verified (boolean)
2. **Experiences Table Created**: `experiences` table with: id (uuid), user_id (uuid), content (text nullable), source (enum: 'sms', 'mms', 'web'), photo_urls (text[] nullable), location (jsonb nullable), timestamp (timestamptz), category (text nullable - supports custom categories), visibility (enum: 'private', 'public', 'shared'), interpretation_of (uuid nullable FK to experiences.id), created_at, updated_at
3. **Thoughts Table Created**: `thoughts` table with: id (uuid), user_id (uuid), content (text), category (text nullable - supports custom categories), intensity (enum: 'drive', 'want', 'dream' nullable), revisit_count (int default 1), hierarchy_rank (int nullable), created_at, updated_at
4. **Shared Experiences Table**: `shared_experiences` table with: id (uuid), experience_id (uuid FK), shared_with_user_id (uuid FK), created_at
5. **Related Realities Table**: `related_realities` table with: id (uuid), user_id (uuid FK), related_user_id (uuid FK), relationship_type (text), accepted (boolean default false), created_at
6. **Row Level Security (RLS) Enabled**: All tables have RLS policies: users can only SELECT/INSERT/UPDATE/DELETE their own data (WHERE user_id = auth.uid())
7. **Indexes Created**: Indexes on user_id, created_at, category, phone_number for fast queries
8. **Migration Files**: Supabase migration in `/supabase/migrations/` with timestamp, applied to local and cloud environments
9. **Test Data Verification**: Developer can manually insert test experience via Supabase dashboard, verify RLS prevents seeing other users' data

---

### Story 1.5: Twilio SMS Integration - Webhook & Phone Lookup

**As a** user,
**I want** to text any message to my Reality number and have it captured,
**so that** I can record moments instantly without opening an app.

#### Acceptance Criteria

1. **Twilio Number Provisioned**: Shared Twilio number (+1-555-REALITY or similar) purchased and configured
2. **Webhook Endpoint Created**: Supabase Edge Function at `/functions/sms-inbound` receives POST from Twilio webhook
3. **Twilio Webhook Configuration**: Twilio number configured to POST to `https://<project>.supabase.co/functions/v1/sms-inbound` on incoming SMS
4. **Phone Lookup Logic**: Webhook extracts `From` field (sender phone), queries `profiles` WHERE `phone_number = From` to find user_id
5. **Experience Creation**: If user found, creates record in `experiences` table: content = Body, source = 'sms', timestamp = now(), user_id = looked up ID, category = null
6. **User Not Found Handling**: If phone not in profiles, log error and send SMS: "Phone not registered. Sign up at reality.app"
7. **Response to Twilio**: Webhook returns 200 OK with TwiML (no SMS response - silent capture)
8. **Error Logging**: Failed lookups or database errors logged to Supabase logs for debugging
9. **Rate Limiting**: Webhook checks user's daily SMS count, rejects if > 20 with response SMS: "Daily limit reached (20 SMS). Upgrade for unlimited."
10. **Test Verification**: Developer can text test Twilio number, verify experience appears in Supabase `experiences` table with correct user_id

---

### Story 1.6: Twilio MMS Integration - Photo Capture

**As a** user,
**I want** to send photos via MMS to my Reality number,
**so that** I can capture visual moments alongside text.

#### Acceptance Criteria

1. **MMS Detection**: Webhook checks for `NumMedia > 0` in Twilio payload to detect MMS
2. **Media URL Extraction**: Webhook extracts `MediaUrl0`, `MediaUrl1`, etc. (up to 10 images per MMS)
3. **Image Download**: Edge function fetches each MediaUrl via HTTP GET (includes Twilio auth headers)
4. **Supabase Storage Upload**: Downloaded images uploaded to Supabase Storage bucket `experience-photos/{user_id}/{uuid}.jpg`
5. **Image Compression**: Before upload, compress image using Sharp library (target: 500KB per photo, maintain aspect ratio)
6. **Experience Creation**: Creates experience record with source = 'mms', photo_urls = array of Supabase Storage public URLs, content = Body (caption if provided)
7. **Multiple Photos Handling**: Single MMS with 3 photos creates 1 experience with photo_urls array containing 3 URLs
8. **Error Handling**: If media download fails, create experience with content only, log error
9. **Storage Quota Check**: If user exceeds storage limit, log warning (don't reject SMS - just don't store photo)
10. **Test Verification**: Developer sends MMS with 2 photos + caption, verifies experience record has 2 photo_urls and caption in content field

---

### Story 1.7: Something's Abode - Unprocessed SMS Queue

**As a** user,
**I want** to see all my uncategorized SMS/MMS captures in one place,
**so that** I can review and organize them when I have time.

#### Acceptance Criteria

1. **Route Created**: `/app/something` route displays Something's Abode view
2. **Query Unprocessed**: Fetches all experiences WHERE user_id = current user AND category IS NULL, ordered by timestamp DESC
3. **Card Display**: Each uncategorized item shown as card: content text (first 200 chars if long), photo thumbnails if photo_urls exists, timestamp (relative: "2 hours ago")
4. **Empty State**: If no uncategorized items, show "All caught up! Nothing waiting to be organized."
5. **Photo Thumbnails**: If experience has photo_urls, display thumbnails in card (grid if multiple)
6. **Timestamp Display**: Show relative time ("5 minutes ago", "Yesterday", "Oct 21") for each card
7. **Card Click**: Clicking card opens detail modal (minimal for now - shows full content and photos)
8. **Loading State**: While fetching, show skeleton cards
9. **Infinite Scroll**: Load 20 items at a time, lazy load more on scroll to bottom
10. **Real-time Updates**: Use Supabase Realtime subscription to show new SMS captures immediately without refresh

---

### Story 1.8: SMS Capture Categorization UI

**As a** user,
**I want** to quickly categorize my SMS captures as Beauty, Ugly, Dreams, or custom categories,
**so that** they move from Something's Abode to my hierarchies.

#### Acceptance Criteria

1. **Categorization Buttons**: Each card in Something's Abode has buttons: "Beauty", "Ugly", "Dreams", "Other..."
2. **Category Assignment**: Clicking button updates experience: SET category = 'beauty'/'ugly'/'dreams', updated_at = now()
3. **Optimistic UI**: Card immediately fades out and removes from queue (optimistic update)
4. **Rollback on Error**: If update fails, revert optimistic update and show error toast
5. **Visual Feedback**: Button shows brief loading spinner during update
6. **Keyboard Shortcuts**: Press B (beauty), U (ugly), D (dreams), O (other) on selected card for power users
7. **Card Selection**: Arrow keys (up/down) navigate between cards, Enter opens detail modal
8. **Batch Mode Toggle**: "Batch Mode" button enables multi-select (checkboxes appear on cards)
9. **Batch Categorization**: In batch mode, select multiple cards, then click category button to apply to all selected
10. **Custom Category Input**: "Other..." button opens modal with text input, user types custom category name (e.g., "Work", "Travel"), saves to database as category value
11. **Success Feedback**: After categorization, show toast: "Moved to Beauty" (then auto-dismiss after 2 seconds)

---

### Story 1.9: Google Maps-Style Layout & Navigation

**As a** user,
**I want** a spacious desktop interface with persistent navigation,
**so that** I can easily switch between Map, Timeline, Heart, and Something's Abode views.

#### Acceptance Criteria

1. **Layout Structure**: `/app` route uses layout: 80% center content + 20% right sidebar + bottom Pookie bar (collapsed)
2. **Right Sidebar**: Fixed position sidebar with navigation buttons: Map (📍), Timeline (📅), Heart (❤️), Something (❓), Shared (👥)
3. **Active State**: Currently active route button highlighted (brighter background)
4. **Navigation**: Clicking sidebar button uses `router.push()` to change route: Map → `/app/map`, Timeline → `/app/timeline`, etc.
5. **Page Transitions**: Framer Motion AnimatePresence wraps center content, slide transition between routes (300ms duration)
6. **Header**: Top header with "Reality" logo (left), user avatar (right), settings icon (right)
7. **Pookie Bar**: Bottom bar with collapsed state: "Ask Pookie..." input field, expand icon
8. **Responsive Breakpoint**: At < 1366px width, sidebar collapses to icon-only navigation
9. **Dark Blue Theme**: Background #1a1f2e, elevated surfaces #2a3142, text high contrast white
10. **Default Route**: `/app` redirects to `/app/something` as default view (unprocessed queue)

---

### Story 1.10: Phone Verification Flow

**As a** new user,
**I want** to verify my phone number via SMS code,
**so that** the system knows which SMS messages are mine.

#### Acceptance Criteria

1. **Verification Code Generation**: After signup, system generates random 6-digit code, stores in `profiles.phone_verification_code` with expiry timestamp (10 minutes)
2. **Welcome SMS Sent**: Supabase Edge Function calls Twilio API to send SMS: "Welcome to Reality, the game. I'm Pookie, your guide. Your verification code: 123456. Text me anytime to capture moments. Visit reality.app to organize."
3. **Verification Page**: After signup, user redirects to `/auth/verify-phone` with phone number (masked) displayed
4. **Code Input**: 6-digit code input field (auto-focus, numeric only)
5. **Verification Check**: On code submit, query profiles WHERE phone_number = user's phone AND phone_verification_code = entered code AND code_expiry > now()
6. **Success**: If match, SET phone_verified = true, clear verification_code, redirect to `/app`
7. **Error Handling**: Invalid code shows "Incorrect code, try again", expired code shows "Code expired, resend?"
8. **Resend Code**: "Resend code" button generates new code, sends new SMS, resets expiry timer
9. **Skip Protection**: Middleware blocks `/app/*` routes if phone_verified = false, redirects to verify page
10. **Test Mode**: In development, code "000000" always works for easier testing

---

### Story 1.11: Vercel Production Deployment & Beta Setup

**As a** developer,
**I want** the web app deployed to Vercel with beta access controls,
**so that** beta testers can access the app and provide feedback on Epic 1 functionality.

#### Acceptance Criteria

1. **Vercel Project Created**: Next.js app connected to GitHub repo, auto-deploys on push to main branch
2. **Environment Variables**: Supabase URL, anon key, service role key, Twilio credentials, OpenAI API key configured in Vercel environment settings
3. **Production URL**: App accessible at `reality-app.vercel.app` (or custom domain if available)
4. **Preview Deployments**: Pull requests automatically generate preview URLs for testing
5. **Beta Password Protection**: Vercel password protection enabled for production URL (optional, remove after beta)
6. **Performance Check**: Vercel Analytics enabled, initial Lighthouse score checked (aim for 80+ Performance)
7. **Error Monitoring**: Sentry integrated, production errors automatically reported
8. **Beta Tester Instructions**: Email template created: "Sign up at reality-app.vercel.app, verify phone, text [Twilio number] to capture, check Something's Abode"
9. **Beta Tester List**: 5-10 beta testers invited via email with signup instructions
10. **Feedback Channel**: Discord channel or Google Form created for bug reports and feedback

---

### Story 1.12: Pookie Chat Interface - Basic Setup

**As a** user,
**I want** to interact with Pookie AI via chat interface at bottom of screen,
**so that** I can ask questions and get help navigating my reality.

#### Acceptance Criteria

1. **Bottom Bar UI**: Persistent bottom bar (collapsed state: 60px height) with "Ask Pookie..." input field and expand icon
2. **Expand/Collapse**: Clicking expand icon animates bar to 400px height, shows chat history above input
3. **Chat Input**: Text input with "Send" button (or Enter key to submit)
4. **Message Display**: Chat history shows user messages (right-aligned, lighter background) and Pookie responses (left-aligned, darker background)
5. **Zustand State**: Chat history stored in Zustand store (persists across route changes, clears on logout)
6. **API Route Created**: `/api/chat` Next.js route handler accepts POST with message, calls OpenAI GPT-4
7. **OpenAI Integration**: Route handler sends message + user context (recent captures count, current route) to GPT-4 with system prompt: "You are Pookie, guide for Reality app. Help user navigate and understand their reality."
8. **Streaming Response**: GPT-4 response streams back to UI, displays token-by-token (Vercel AI SDK)
9. **Loading State**: While waiting for response, show "Pookie is thinking..." with animated dots
10. **Basic Commands**: Pookie recognizes simple commands: "show timeline" → navigates to `/app/timeline`, "what's this?" → explains current view

---

### Story 1.13: Landing Page & Public Routes

**As a** potential user,
**I want** to understand what Reality is and how to sign up,
**so that** I can decide if I want to create an account.

#### Acceptance Criteria

1. **Landing Page Route**: `/` displays public marketing page (not protected by auth)
2. **Hero Section**: Heading "Reality: Your Creator's Tool" with subheading explaining SMS capture + desktop organization
3. **Value Proposition**: 3 key benefits displayed: "Zero-friction capture via SMS", "Spacious desktop organization", "Your reality creates the light"
4. **Phone Number Entry**: Call-to-action form: phone number input + "Get Started" button → redirects to `/auth/signup` with phone pre-filled
5. **How It Works**: 3-step visual: 1) Text Reality number, 2) Organize on desktop, 3) See patterns emerge
6. **Pricing Preview**: "Free: 20 SMS/day. Upgrade for unlimited." (sets expectations)
7. **Footer**: Links to Privacy Policy (minimal page), Terms of Service (minimal page), Contact
8. **SEO Optimization**: Meta tags, Open Graph tags for social sharing, title "Reality - Transform Your World Through Capture & Organization"
9. **Responsive Design**: Landing page mobile-responsive (stacked layout on < 768px)
10. **Fast Load**: Page uses Next.js static generation (SSG), loads in < 1 second

---

**End of Epic 1**

Upon completion, users can:
- ✅ Create account with email, password, phone number
- ✅ Verify phone via SMS code, receive welcome message from Pookie
- ✅ Text Reality number to capture moments (text or photos)
- ✅ See SMS captures appear in Something's Abode queue on web app
- ✅ Categorize captures as Beauty/Ugly/Dreams or custom categories
- ✅ Navigate between views using Google Maps-style sidebar
- ✅ Chat with Pookie for basic help and navigation
- ✅ Access beta via Vercel deployment

---

## Epics 2-9: Brief Outlines

**Note**: These epics will be fully detailed with complete stories after Epic 1 user approval and SM agent story creation. The outlines below preserve all transformation information from the pivot plan.

---

### Epic 2: Physical Reality - Map & Timeline Views

**Goal**: Enable spatial and temporal visualization of captured experiences on desktop web. Users see WHERE (Mapbox map with brightness/darkness/flicker) and WHEN (timeline from birth to present) experiences happened.

**Stories**:
- **2.1**: Web Map View with Experience Dots (Mapbox GL JS, clustering, zoom levels)
- **2.2**: Map Vibe Visualization (dark blue base, Beauty brightens, Ugly darkens, Dreams flicker)
- **2.3**: Web Timeline Views (year/month/day zoom, birth to present chronological)
- **2.4**: Web Experience Detail Modal (click dot/timeline item, show full content + metadata)
- **2.5**: Fog of War Unlocking (grayscale unvisited, brightens as user explores)

**Transformation from Mobile**: React Native Maps → Mapbox GL JS (web), same logic, better desktop visualization

---

### Epic 3: Heart's Abode - Hierarchies & Categorization

**Goal**: Implement Beauty/Ugly/Dreams categorization with custom category support and frequency-ranked hierarchies on desktop. Something's Abode queue for organizing SMS captures. Pookie basic pattern recognition.

**Stories**:
- **3.1**: Manual Thought Creation (web form for non-SMS thoughts)
- **3.2**: Web Categorization UI (drag-and-drop, button clicks, custom category management)
- **3.3**: Beauty Hierarchy (ranked by revisit frequency, desktop columns)
- **3.4**: Ugly Hierarchy (ranked by frequency, desktop visualization)
- **3.5**: Dreams Hierarchy (intensity scale, sorted by revisit count)
- **3.6**: Pookie Pattern Recognition (GPT-4 suggests "similar to..." with custom category awareness)
- **3.7**: Custom Category Management (create, rename, delete custom categories)

**Transformation from Mobile**: Mobile swipe → Desktop spacious UI, enhanced hierarchy visualization, added custom category support

---

### Epic 4: Knowledge Graph - Connections & Understanding

**Goal**: Enable users to link captures into web of meaning with desktop D3.js interactive graph visualization. Drive→Want→Dream intensity scale, connection labels, full network exploration.

**Stories**:
- **4.1**: Web Node Linking UI (split-screen: select item left, search connections right)
- **4.2**: Interactive Graph Visualization (D3.js/Cytoscape.js full interactive graph)
- **4.3**: Intensity Scale UI (Drive/Want/Dream levels with visual indicators)
- **4.4**: Understanding/Rules Category (capture wisdom, link to Uglies transformed)
- **4.5**: Full-Screen Graph View (zoom/pan/filter, physics simulations)

**Transformation from Mobile**: Limited mobile graph → Full desktop D3.js interactive network (significantly enhanced)

---

### Epic 5: Transformation Loop - Completion & Proof

**Goal**: Close the game loop with Dream achievement, Ugly transformation, Beauty Points system, and Reality Score calculation. Permanent proof of agency timeline.

**Stories**:
- **5.1**: Web Dream Completion (modal with confetti animation, +1 Beauty Point)
- **5.2**: Web Ugly Transformation (modal, note on transformation, +1 Beauty Point)
- **5.3**: Beauty Points System (track total, display on profile)
- **5.4**: Reality Score Dashboard (formula display, growth chart using Chart.js)
- **5.5**: Web Completion History (timeline view with filters, proof of power)

**Transformation from Mobile**: Identical logic, web UI animations (confetti.js), desktop dashboard widgets

---

### Epic 6: Social Layer - Shared Realities & Collaboration

**Goal**: Implement fork/merge shared realities model, Related Realities connections, visit other users' public realities, privacy controls, and invite system.

**Stories**:
- **6.1**: Web Tag Others UI (autocomplete with avatars)
- **6.2**: Related Realities Dashboard (grid of connections, shared experience counts)
- **6.3**: Web Referral Links (copy link, QR code generation)
- **6.4**: Referral Onboarding (web signup flow)
- **6.5**: Web Sharing (Web Share API, export as image)
- **6.6**: Fork/Merge Shared Experiences (Git-style collaborative editing)
- **6.7**: Visit Other's Reality (read-only public view)
- **6.8**: Propose Edits to Shared Experience (fork, change, merge request)
- **6.9**: Accept/Reject Edit Proposals (review interpretations)
- **6.10**: Private/Public Toggle UI (visibility controls per experience)

**Transformation from Mobile**: Simple sharing → Collaborative fork/merge model (major enhancement)

---

### Epic 7: Past Memories & Bulk Import

**Goal**: Enable photo upload from desktop (drag-and-drop), EXIF metadata extraction, Google Photos integration, SMS backfill import, and AI-powered bulk organization.

**Stories**:
- **7.1**: Photo Upload from Desktop (drag-and-drop or file picker)
- **7.2**: EXIF Metadata Extraction (server-side Sharp library, GPS + timestamp)
- **7.3**: Something's Abode Queue (already in Epic 1, enhance with keyboard shortcuts)
- **7.4**: Web Batch Organization (multi-select, keyboard shortcuts J/K navigation)
- **7.5**: Web Notifications (browser notifications + Pookie chat reminder)
- **7.6**: SMS Backfill Import (export from iPhone/Android, bulk import)
- **7.7**: Google Photos Integration (OAuth connect, import with EXIF)

**Transformation from Mobile**: Mobile photo library → Desktop upload + Google Photos, SMS backfill added

---

### Epic 8: Creator's Pet Intelligence - Advanced AI

**Goal**: Enhance Pookie with GPT-4 conversational interface, agentic navigation commands, proactive insight notifications, connection suggestions, and voice input via Web Speech API.

**Stories**:
- **8.1**: Web Chat Interface (desktop bottom bar, better than mobile chat screen)
- **8.2**: Auto-Detection (GPT-4 classifies experience vs thought for SMS captures)
- **8.3**: Web Notifications + Chat (browser notifications, Pookie initiates conversations)
- **8.4**: Connection Suggestions (GPT-4 suggests links between captures)
- **8.5**: Pattern Matching (fuzzy matching for revisits, custom category awareness)
- **8.6**: Agentic Navigation Commands (Pookie triggers route changes)
- **8.7**: Voice Input for Pookie (Web Speech API, desktop mic)
- **8.8**: Pookie Memory Context (conversation history per user)

**Transformation from Mobile**: Mobile chat screen → Desktop persistent bottom bar, agentic navigation (enhanced)

---

### Epic 9: Polish, Performance & Launch Prep

**Goal**: Optimize web app performance (Mapbox clustering, Lighthouse audit), SEO optimization, landing page, PWA features, analytics integration, and public production launch.

**Stories**:
- **9.1**: Web Map Optimization (Mapbox GL clustering, vector tiles)
- **9.2**: PWA Offline Support (Service Workers for offline reading, optional)
- **9.3**: Error Handling Polish (web error boundaries, user-friendly messages)
- **9.4**: Web Analytics (PostHog/Plausible privacy-focused)
- **9.5**: SEO & Public Launch (meta tags, Open Graph, sitemap.xml)
- **9.6**: Beta Feedback (web beta testers, address top issues)
- **9.7**: Web Production Readiness (Sentry web monitoring, Lighthouse audit)
- **9.8**: SEO Optimization (structured data, search engine indexing)
- **9.9**: Landing Page Enhancement (public marketing polish)
- **9.10**: Progressive Web App (service workers, install prompt)

**Transformation from Mobile**: App Store submission → SEO/PWA, mobile performance → web optimization

---

## Checklist Results Report

**Note**: PM checklist execution deferred until after user approval of Epic 1 detailed stories. This allows validation of story structure and acceptance criteria quality before generating full PRD validation report.

**Status**: Pending user review

---

## Next Steps

### Immediate Actions

1. **User Review**: Review Epic 1 detailed stories for quality, structure, and completeness
2. **Archive Sharded Folders**: Move `docs/prd/`, `docs/architecture/`, `docs/qa/`, `docs/stories/` to `docs/archive/v1-mobile-2025-10-25/`
3. **Approval Decision**: Approve Epic 1 story structure OR request revisions

### Architect Handoff (After PRD Approval)

**Architect Prompt**:

```
You are a Software Architect. Transform the Reality PRD v2.0 (docs/prd.md) into a comprehensive architecture document that enables development.

CONTEXT:
- Solo founder building MVP - architecture must be simple, managed services, minimal DevOps
- Next.js 14+ App Router (web), Supabase (PostgreSQL + Edge Functions), Twilio (SMS)
- Cost target: <$35/month for 1000 users
- Pivot from mobile to web+SMS (see docs/pivot-plan-sms-to-web.md for rationale)

YOUR DELIVERABLES:
1. **System Architecture Diagram**: Next.js ↔ Supabase ↔ External APIs (Twilio, OpenAI, Mapbox)
2. **Database Schema**: Full PostgreSQL schema (profiles, experiences, thoughts, connections, shared_experiences, related_realities), indexes, RLS policies, migration strategy
3. **API Design**: Supabase Edge Functions for SMS webhook, Pookie AI, image compression
4. **Data Flow Patterns**: SMS ingestion (Twilio → Supabase → Realtime updates), optimistic UI updates
5. **State Management**: Zustand stores, TanStack Query patterns, Supabase Realtime subscriptions
6. **Authentication & Authorization**: Supabase Auth flow, RLS policies, JWT sessions
7. **File Storage Strategy**: MMS photo upload (Twilio → Sharp compression → Supabase Storage)
8. **AI Integration Architecture**: GPT-4 prompts for Pookie chat, pattern matching, custom category suggestions
9. **Performance Optimization**: Mapbox clustering, image compression, lazy loading, query optimization
10. **Testing Strategy**: Unit test structure, integration test patterns, manual E2E approach
11. **Deployment Architecture**: Vercel (Next.js), Supabase cloud, environment management
12. **Monitoring & Observability**: Sentry error tracking, PostHog analytics, Supabase logging

CRITICAL DESIGN DECISIONS TO ADDRESS:
1. Supabase schema - mirror exactly what's needed for custom categories (text field, no enum)
2. Twilio webhook → Supabase Edge Function flow with error handling
3. Custom category storage and hierarchy rendering (dynamic columns)
4. Dark blue vibe visualization (brightness/darkness/flicker CSS/Canvas approach)
5. RLS policy design for shared experiences fork/merge model

START BY: Reading docs/prd.md fully, especially Epic 1 stories (detailed acceptance criteria) and pivot plan context.
```

---

### SM Agent Tasks (After Architecture Approval)

1. Load `/sm` agent in new chat
2. Execute `*draft` to create Story 1.1 from Epic 1
3. Review story, approve, mark "Approved"
4. Repeat for Stories 1.2-1.13
5. Hand off to Dev agent for implementation

---

### Success Criteria

**PRD Complete When**:
- ✅ Epic 1 fully detailed (13 stories with acceptance criteria)
- ✅ Epics 2-9 outlined (preserving transformation map)
- ✅ Custom category support documented in requirements
- ✅ User approves Epic 1 story structure
- ✅ Ready for Architect handoff

**Architecture Ready When**:
- ✅ Database schema supports custom categories (text field)
- ✅ Twilio SMS webhook flow documented
- ✅ Dark blue vibe visualization approach specified
- ✅ All Epic 1 technical questions answered

---

*🤖 Generated with [Claude Code](https://claude.com/claude-code)*

*Co-Authored-By: PM John (BMAD-METHOD™)*
