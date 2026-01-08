# (ur "reality") - Consciousness Mapping Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

> **Map the invisible system of drives inside you, so you can see which lenses arise, understand why, and consciously choose which ones to follow.**

## Overview

(ur "reality") is a fullstack web application that helps you map your inner consciousness - the complex system of drives, patterns, and lenses through which you experience reality. By capturing moments of resonance and discovering the patterns that connect them, you build a navigable map of your inner world.

### The Problem We're Solving

Your mind is a bustling city of drives - a chaotic, complex system of competing wants, fears, desires, and impulses. Most people:
- Don't see these drives
- React unconsciously
- Don't understand why they care about what they care about
- Can't direct their will intentionally

**The solution:** Make the invisible visible. Build a map of your inner system.

### How It Works

1. **Capture** - Something in reality resonates with you (a flower, a conversation, a thought). You capture it (photo, text, video, link).
2. **Reflect** - Why did this resonate? What lens was active? Initially unknown (?), you discover patterns over time.
3. **Connect** - Link captures to lenses. Link lenses to deeper drives. The map grows.
4. **Navigate** - Set an intention or goal. The attention mechanism highlights relevant lenses from your map.
5. **Choose** - Now that you see the system, you can consciously choose which lens to follow.

## Key Features

### Capture System
- **Live Capture** (`/capture`) - Quick on-the-go captures with location, photos, and notes
- **Deep Capture** (`/deep-capture`) - Rich media uploads (images, video, audio) with OCR and transcription
- **Link Previews** - Automatic metadata extraction for URLs

### Chamber Interface
- **Organization Space** - Process unorganized captures one at a time
- **Abode Assignment** - Send captures to meaningful spaces (Beauty, Dreams, Ugly, Rules of Reality, custom)
- **Swipeable Navigation** - Fluid navigation between captures

### Visual Exploration
- **2D Spatial Map** (`/my-reality/somewhere`) - Navigate your captured somethings in infinite space
- **Question Marks** - Lenses appear as ? until you discover and name them
- **Dynamic Expansion** - Space grows as your map grows (Known expands, Unknown shrinks)

### Connection System
- Links between captures and lenses
- Hierarchical lens relationships
- Pattern recognition across your map

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18 with TypeScript 5
- **Styling:** Tailwind CSS 3 + Custom CSS
- **Maps:** Mapbox GL JS
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (media files)
- **API:** Next.js API Routes

### Development
- **Testing:** Vitest + React Testing Library
- **Type Safety:** TypeScript with strict mode
- **Linting:** ESLint
- **Package Manager:** pnpm

### Data Processing
- **OCR:** Tesseract.js (extract text from images)
- **Link Metadata:** Custom link preview service
- **Validation:** Zod schemas

## Project Structure

```
reality/
├── app/                      # Next.js 14 app directory
│   ├── (auth)/              # Authentication routes (login, signup)
│   ├── api/                 # API routes (somethings, connections)
│   ├── capture/             # Live capture page
│   ├── deep-capture/        # Deep capture with media upload
│   ├── chamber/             # Organization interface
│   ├── my-reality/          # Personal reality space
│   ├── dashboard/           # Main dashboard
│   └── components/          # Shared React components
├── lib/                      # Business logic and utilities
│   ├── supabase/            # Supabase client and types
│   ├── capture/             # Capture logic (location, OCR)
│   ├── my-reality/          # Map visualization logic
│   ├── link-preview/        # URL metadata extraction
│   └── schemas/             # Zod validation schemas
├── supabase/
│   └── migrations/          # Database schema migrations
├── tests/                    # Test files (Vitest)
├── docs/                     # Product documentation
│   ├── prd-v5.md           # Product Requirements Document
│   ├── why_build_ur_reality.md  # Vision & architecture
│   └── archive/             # Historical brainstorming docs
└── public/                   # Static assets

```

## Getting Started

### Prerequisites

- **Node.js** 20+ and **pnpm**
- **Supabase CLI** (for local development)
- **Docker** (for Supabase local instance)
- **Mapbox Account** (for map features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reality.git
   cd reality
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Mapbox
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Start Supabase locally** (optional, for local dev)
   ```bash
   supabase start
   ```

5. **Run database migrations**
   ```bash
   supabase db push
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser** to `http://localhost:3000`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

## Database Schema

The application uses a PostgreSQL database with the following core tables:

### `somethings`
Stores all captured content (formerly `captures`)
- Text, images, videos, links
- Care level (-2 to +2: Ugly to Beauty spectrum)
- Realm classification (reality, mind, heart)
- Location data (latitude, longitude)
- JSONB attributes for extensibility

### `connections`
Links between somethings and lenses
- Relationship types: `through`, `contains`, `drives`, `fulfills`
- Strength ratings (1-10)
- User-defined meanings

### `lenses` (planned)
The drives/patterns you discover
- Initially unnamed (?)
- Named through reflection
- Type: `discovered`, `system`, or `meta`
- Care level and capture count

### Migration Files
All schema changes are tracked in `supabase/migrations/`. The evolution from `captures` to `somethings` is documented in migration `20251101120000_evolve_captures_to_somethings.sql`.

## Development Workflow

This project uses the **BMAD-METHOD™** (Breakthrough Method of Agile AI-driven Development) with specialized AI agent personas. See [CLAUDE.md](./CLAUDE.md) for details on working with the agent system.

### Key Agents
- **SM (Scrum Master)** - Creates user stories from PRD
- **Dev (Developer)** - Implements features with tests
- **QA (Test Architect)** - Reviews code and quality gates

### Current Development
We're currently building **Epic 5: The Lens System**
- Chamber entry animations
- Abode organization system
- Lens discovery workflow
- Attention mechanism (basic AI)

See [docs/prd-v5.md](./docs/prd-v5.md) for the full product roadmap.

## Architecture Highlights

### Three Worlds Model
- **Reality** - The outer world (infinite, unknown)
- **ur-reality** - Your inner system (the map you're building)
- **My Reality** - What you've discovered and named

### Attention Mechanism
Inspired by transformer attention, the system learns to surface relevant lenses based on your intentions:
- **Query (Q)**: Your goal or question
- **Keys (K) & Values (V)**: Your captures and lenses
- **Attention Output**: Relevant lenses surface and glow in the visual space

### Visual System
- 2D spatial canvas (hexagonal lattice)
- Perlin noise representing the Unknown
- Question marks (?) representing undiscovered lenses
- Size = capture count, Color = care level
- Spaceship navigation metaphor

## Current Project State

### Completed Features
- Authentication system (Supabase Auth)
- Live capture with geolocation
- Deep capture with OCR and transcription
- Link preview extraction
- Chamber view with swipeable interface
- Basic connection system
- 2D spatial visualization

### In Development (Epic 5)
- Page load animation sequence
- Spaceship navigation
- Abode assignment system
- Dynamic space expansion
- Chamber entry flow

### Planned Features
- Lens discovery and naming
- Hierarchical lens relationships
- Intention setting
- Attention mechanism (TF-IDF based, then embeddings)
- Visual attention (glow/fade effects)

## Documentation

- **[PRD v5.0](./docs/prd-v5.md)** - Complete product requirements
- **[Why Build ur reality](./docs/why_build_ur_reality%20(1).md)** - Vision and architecture overview
- **[Epic 5 Brainstorming](./docs/archive/epic-5-brainstorming-v2.md)** - Current development epic
- **[CLAUDE.md](./CLAUDE.md)** - AI agent development workflow

### Historical Context
The project has evolved through several conceptual iterations, documented in `docs/archive/`:
- Epic 2-3: Initial "Three Realms" concept (Reality, Mind, Heart)
- Epic 4: Transition to 2D transformation and beauty/ugly spectrum
- Epic 5: Current "Lens System" with chamber and abodes

## Contributing

This is currently a personal project. If you're interested in contributing or learning more about the vision, please reach out or review the documentation in the `docs/` folder.

## Deployment

The application is deployed on Vercel:
- **Production:** Connected to `main` branch
- **Preview:** Automatic deployments for PRs
- **Database:** Supabase managed PostgreSQL

### Environment Variables
Ensure all production environment variables are set in Vercel:
- Supabase credentials
- Mapbox token
- Any API keys for future features

## License

[Add your license here]

## Contact

[Add your contact information here]

---

**"Map the system. Make the invisible visible. Choose consciously."**
