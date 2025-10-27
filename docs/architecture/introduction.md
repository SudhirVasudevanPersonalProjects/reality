# Introduction

This document outlines the complete fullstack architecture for Reality - Your Creator's Tool, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

## 1.1: Starter Template or Existing Project

**Status:** Brownfield with Web Pivot

This is a mid-flight pivot from React Native mobile app to Next.js web + SMS architecture. The existing codebase (`apps/mobile-archived/`) contains React Native code, Supabase schema v1, and foundational data models that will be referenced but not reused directly. The web pivot uses the same conceptual models (experiences, thoughts, hierarchies) but implemented fresh in Next.js 15 App Router.

**Key Constraints from Existing Work:**
- Supabase project already provisioned with auth and database
- Shared types exist in `packages/shared/` (auth.ts, experience.ts, thought.ts) - these will be adapted
- BMAD agent system in `.bmad-core/` already operational
- Monorepo structure established (pnpm workspace)

**What We're Building Fresh:**
- Next.js 15 App Router web application (new codebase)
- Twilio SMS webhook integration (net new)
- Web-optimized UI components (Mapbox, D3.js, desktop-first layout)
- Supabase Edge Functions for serverless backend

**Rationale:** Per `docs/pivot-plan-sms-to-web.md`, this pivot reduces complexity (no offline sync, no native APIs), accelerates iteration (web deployment vs app store), and cuts costs 73% ($35/mo vs $130/mo for 1K users).

## 1.2: Change Log

| Date       | Version | Description                                        | Author             |
|------------|---------|----------------------------------------------------|--------------------|
| 2025-10-25 | v1.0    | Initial fullstack architecture for Web + SMS pivot | Winston (Architect) |

---

