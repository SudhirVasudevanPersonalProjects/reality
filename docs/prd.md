# My Reality - Product Requirements Document (PRD)

**Version:** v5.0 (Lean & Focused)
**Date:** 2025-10-27
**Status:** Approved
**Author:** PM John + User

---

## Goals and Background Context

### Goals

1. **Instant Mind Offloading**: Record thoughts, motivations, desires, and experiences instantly from phone to offload mental energy and map the self over time, helping people understand who they are, what they want, and how to become who they were meant to be.

2. **Visual Reality Mapping**: Create a visual, intuitive mapping of personal reality using thoughts, desires, experiences, and interpretations accessible on the web - a tool to plan the future, appreciate the past, and return to the present when uncertain.

3. **AI Reality Steward**: Provide an LLM chatbot that acts as the steward of "my reality," helping navigate and make sense of captured experiences.

4. **Shared Experiences**: Enable sharing reality with friends, starting with mutual experiences - collecting their memories and my memories (initially photos) in one place.

5. **Lightweight & Scalable**: Build with extreme simplicity for easy understanding and scaling, with future mobile app connectivity.

### Background Context

The World Health Organization identifies meaninglessness and loneliness as epidemics of our time. People are drowning in endless digital noise with no way to capture and evolve personal meaning. "My Reality" solves this by acting as a signal filter - transforming the chaos of daily experiences into coherent, meaningful self-knowledge.

For example: in the midst of a doomscrolling session, when something meaningful strikes you, you can instantly text yourself "oh shit that was meaningful" and capture that moment - including links to reels, TikToks, or any content - to revisit later. By instantly capturing thoughts, experiences, memories, and even fleeting moments of inspiration from your phone, the system creates a living map of who you are, providing clarity in moments of uncertainty and preserving meaning that would otherwise be lost to the mental fog of modern life.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-27 | v5.0 | Lean PRD created - simplified focus on core capture → organize loop | PM + User |

---

## Requirements

### Functional Requirements

**FR1:** Users can send text messages to a phone number and the content appears on their personal web dashboard.

**FR2:** Users can send photos via text message to a phone number and the photos appear on their personal web dashboard.

**FR3:** Users can send videos via text message to a phone number and the videos appear on their personal web dashboard.

**FR4:** System recognizes and preserves URLs (TikTok, Reels, YouTube, etc.) sent via text message.

**FR5:** Users are identified and authenticated by their phone number - no traditional login required.

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

**NFR2:** Message-to-web latency should be under 10 seconds for instant offloading experience.

**NFR3:** Phone-based authentication must be secure and compliant with SMS verification best practices.

**NFR4:** Architecture should consider future mobile app integration, but not at the cost of current simplicity (nice-to-have).

**NFR5:** System should minimize cognitive load - interface must be intuitive enough to use during moments of inspiration without friction.

---

## User Interface Design Goals

### Overall UX Vision

A calm, spacious interface resembling the vastness of space - mostly monochromatic (darks and whites) with clean, minimal typography. The interface should feel like navigating your inner cosmos, not scrolling a feed. Content is the star; UI fades into the background.

### Key Interaction Paradigms

- **Passive Capture, Active Reflection**: Content flows in effortlessly via text; deliberate interaction happens on web for organizing, connecting, and understanding
- **Conversational Navigation**: LLM chatbot as primary interface for finding, sorting, and making sense of content
- **Visual Thinking**: Mindmap as a first-class view mode, not an afterthought
- **Triage First**: Upon opening, user sees total capture count and most recent unsorted captures requiring attention

### Core Screens and Views

1. **Landing/Triage Screen** - Shows total capture count as prominent number, displays most recent unsorted captures
2. **Dashboard/Timeline View** - Chronological stream of all captured content
3. **Mindmap View** - Graph visualization of connected content with relationships
4. **Chat Interface** - LLM conversation panel for navigating reality
5. **Content Detail View** - Individual piece with labels, connections, and metadata
6. **Shared Experiences View** - Collaborative spaces with friends' contributions

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
- **Backend Logic**:
  - Next.js API Routes for LLM chat (`/api/chat`)
  - Supabase Edge Functions for SMS webhooks
- **Database**: Supabase PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime subscriptions (new captures appear instantly)

**NOT microservices** - Simple monolithic Next.js app with thin serverless functions.

**Rationale**:
- No servers to manage
- Auto-scaling built-in
- Free tier covers MVP
- All TypeScript (consistent language)
- Already started with Supabase auth

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
- **Auth**: Supabase Auth (phone verification via SMS)
- **Storage**: Supabase Storage (photos, videos)
- **SMS**: Twilio Programmable Messaging
- **LLM**: OpenAI API or Anthropic Claude API

---

### Database & Auth

- **Database**: Supabase Postgres with Row Level Security (users only see their own data)
- **Auth Method**: Phone number-based (SMS verification codes)
- **Session**: JWT tokens, managed by Supabase Auth

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
- Supabase: Free tier covers MVP
- Twilio: ~$0.0075 per SMS (only cost is usage)
- OpenAI: Pay per token (rate-limit to control costs)
- **Target**: $0/month infrastructure, ~$10-20/month for SMS + LLM at low usage

**Browser Support:**
- Desktop: Chrome, Firefox, Safari, Edge (modern versions)
- Tablet: iPad Safari, Chrome
- Mobile: Minimal triage view only (swipe recent captures)

**Performance:**
- SMS-to-web latency: < 10 seconds
- Page load: < 2 seconds
- Mindmap rendering: Smooth 60fps

**Security:**
- HTTPS only
- Row Level Security on all tables
- API keys hidden in environment variables
- Phone number verification required

**Future Migration Path:**
- If advanced AI/ML needed: Add FastAPI server alongside (hybrid)
- If heavy processing needed: Add background job queue
- If real-time collab needed: Add WebSocket server
- Current architecture supports gradual migration

---

## Epic List

The following epics represent the logical development sequence for My Reality. Each epic delivers a complete, testable, deployable increment of functionality. We will work story-by-story through each epic using the BMAD-METHOD™.

---

### Epic 1: Foundation & Phone-Based Capture

**Goal**: Set up Next.js app, Supabase database, phone authentication, and Twilio SMS integration. Users can text a number and content appears on web dashboard.

**Value**: Proves the core loop works - phone → web.

---

### Epic 2: Content Organization & Labeling

**Goal**: Users can view captured content on web, create custom labels, and organize content by labels through simple UI.

**Value**: Transform chaotic captures into organized knowledge.

---

### Epic 3: Visual Mapping & Connections

**Goal**: Implement mindmap view where users can connect any two pieces of content with a reason/relationship description.

**Value**: Build the "reality graph" - see how thoughts/experiences relate.

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
