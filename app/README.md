# App Directory

This directory contains the Next.js 14 App Router application structure for (ur "reality").

## Structure Overview

```
app/
├── (auth)/              # Auth routes (grouped, no layout impact)
│   ├── login/          # Login page
│   └── signup/         # Signup page
├── api/                 # API Routes (backend endpoints)
├── capture/            # Live capture page (on-the-go)
├── deep-capture/       # Deep capture page (rich media)
├── chamber/            # Chamber interface (organization)
├── my-reality/         # Personal reality space
│   └── [id]/          # Dynamic routes for specific somethings
├── dashboard/          # Main dashboard
├── components/         # Shared React components
├── layout.tsx          # Root layout (auth provider, fonts)
├── page.tsx            # Home page (redirects to dashboard)
└── globals.css         # Global styles

```

## Route Groups

### `(auth)/` - Authentication
Routes grouped for layout purposes. Users who are not authenticated are redirected here.

**Pages:**
- `/login` - Email/password login
- `/signup` - User registration

**Key Files:**
- `login/page.tsx` - Login page component
- `signup/page.tsx` - Signup page component

### `api/` - Backend API Routes
RESTful API endpoints using Next.js Route Handlers.

**Endpoints:**
- `/api/somethings` - CRUD operations for somethings
  - `GET` - Fetch user's somethings (with filters)
  - `POST` - Create new something
- `/api/somethings/[id]` - Individual something operations
  - `GET` - Fetch single something
  - `PUT` - Update something
  - `DELETE` - Delete something
- `/api/somethings/[id]/organize` - Organize something into realm/domain
- `/api/somethings/[id]/assign-abode` - Assign something to an abode
- `/api/somethings/with-location` - Fetch somethings with location data

**Implementation Pattern:**
```typescript
// app/api/somethings/route.ts
export async function GET(request: Request) {
  // 1. Create authenticated Supabase client
  // 2. Fetch data with RLS (user_id automatically filtered)
  // 3. Return NextResponse.json()
}
```

### `capture/` - Live Capture
Quick capture interface for on-the-go moments.

**Features:**
- Text input with auto-save
- Camera capture (photo)
- Location detection (lat/lng)
- Voice transcription (planned)

**Key Files:**
- `page.tsx` - Server component wrapper
- `LiveCaptureClient.tsx` - Client component with capture logic

**State Management:**
- Local state for draft content
- Auto-save to Supabase on form submit
- Location fetching via browser Geolocation API

### `deep-capture/` - Deep Capture
Rich media capture for when you have time to reflect.

**Features:**
- Multi-file upload (images, videos, audio)
- OCR for text extraction from images
- Audio transcription
- Link preview generation
- Rich text editing

**Key Files:**
- `page.tsx` - Server component wrapper
- `DeepCaptureClient.tsx` - Client component with upload logic

**Processing Pipeline:**
1. User uploads media files
2. Files stored in Supabase Storage (`captures-media` bucket)
3. OCR/transcription runs client-side (Tesseract.js)
4. Metadata stored in `somethings` table with media URLs

### `chamber/` - Chamber Interface
Organization interface where you process unorganized somethings.

**Flow:**
1. User enters chamber (from spaceship click)
2. Loads first unorganized something
3. User assigns to abode or marks care level
4. Automatically loads next unorganized something
5. Exits when all organized

**Key Files:**
- `page.tsx` - Chamber page wrapper
- `ChamberClient.tsx` - Main chamber interface
- UI Components:
  - Content circle display
  - Care bar (beauty/ugly slider)
  - "Send to Abode" dropdown
  - Swipeable navigation

**Current Status:** Basic structure complete, Epic 5 enhancements in progress

### `my-reality/` - Personal Reality Space
Visual exploration of your mapped reality.

**Routes:**
- `/my-reality/somewhere` - Main 2D spatial map
- `/my-reality/[id]` - Detail view for specific something

**Visualization:**
- Hexagonal lattice for organized somethings
- Perlin noise representing the Unknown
- Question marks (?) for undiscovered lenses
- Spaceship navigation element

**Key Files:**
- `somewhere/page.tsx` - 2D map page (planned)
- `[id]/page.tsx` - Something detail view

**Future Features:**
- Abode boundaries visualization
- Lens highlighting with attention mechanism
- Camera zoom/pan animations

### `dashboard/` - Main Dashboard
Entry point after login. Shows overview of recent captures and quick actions.

**Features:**
- Recent somethings list
- Quick capture button
- Chamber entry button
- Stats overview (total captures, organized %)

**Key Files:**
- `page.tsx` - Server component (fetches initial data)
- `DashboardClient.tsx` - Client component with interactions

### `components/` - Shared Components
Reusable React components used across the application.

**Core Components:**
- `MindCard.tsx` - Card display for a something
- `SomethingContent.tsx` - Content renderer (text/image/video/link)
- `LinkPreviewCard.tsx` - Link preview with metadata
- `FilterBar.tsx` - Filter UI for somethings list
- `CarePickerUI.tsx` - Care level picker (-2 to +2)

**Map Components:**
- `map/MapView.tsx` - Mapbox map integration
- `map/ExperienceListModal.tsx` - Modal for viewing somethings on map

**Archived Components:**
- `archive/` - Old components kept for reference

## Layouts

### Root Layout (`layout.tsx`)
Wraps entire application.

**Responsibilities:**
- Metadata (title, description)
- Font loading (Geist Sans, Geist Mono)
- Global styles import
- Auth session provider (future)

### Route-Specific Layouts
Can be added in any route directory to wrap child routes.

**Example:**
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

## Client vs Server Components

### Server Components (Default)
- Fetch data on the server
- No client-side JavaScript
- Direct database access via Supabase
- Use for: pages, layouts, static content

**Example:**
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('somethings').select()
  return <DashboardClient initialData={data} />
}
```

### Client Components (`'use client'`)
- Interactive UI with hooks
- Event handlers
- Browser APIs (geolocation, camera)
- Use for: forms, modals, interactive widgets

**Example:**
```typescript
// app/capture/LiveCaptureClient.tsx
'use client'
export default function LiveCaptureClient() {
  const [text, setText] = useState('')
  // ... hooks and handlers
}
```

## Styling

### Global Styles
- `globals.css` - Tailwind directives, CSS variables, global resets

### Component Styles
- Primarily Tailwind utility classes
- Custom CSS for complex animations (chamber, map)
- CSS Modules for component-scoped styles (when needed)

### Theming
Using CSS variables for colors:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

## Data Fetching Patterns

### Server-Side Fetching (Preferred)
```typescript
import { createServerClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createServerClient()
  const { data } = await supabase.from('somethings').select()
  return <Component data={data} />
}
```

### Client-Side Fetching
```typescript
'use client'
import { createClientClient } from '@/lib/supabase/client'

export default function Component() {
  const [data, setData] = useState([])
  useEffect(() => {
    const supabase = createClientClient()
    supabase.from('somethings').select().then(({ data }) => setData(data))
  }, [])
}
```

### API Route Fetching
```typescript
// Use when you need custom business logic or external API calls
const response = await fetch('/api/somethings', {
  method: 'POST',
  body: JSON.stringify(something),
})
```

## Best Practices

1. **Keep Server Components Default** - Only use `'use client'` when necessary
2. **Colocate Related Code** - Keep page-specific components in the same directory
3. **Shared Components** - Move reusable components to `app/components/`
4. **TypeScript First** - Use proper types, leverage Supabase generated types
5. **Error Boundaries** - Add error.tsx for route-level error handling
6. **Loading States** - Add loading.tsx for route-level loading UI
7. **Metadata** - Export metadata from pages for SEO

## Next Steps

- Implement Epic 5 features (chamber animations, abode system)
- Add lens discovery UI
- Build intention setting interface
- Implement attention mechanism visualization
- Add social features (sharing, collaboration)
