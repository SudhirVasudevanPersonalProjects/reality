# Lib Directory

This directory contains the business logic, utilities, and shared code for (ur "reality").

## Structure Overview

```
lib/
├── supabase/           # Database client and types
├── capture/            # Capture logic (location, OCR, transcription)
├── my-reality/         # Reality map visualization logic
├── link-preview/       # URL metadata extraction
├── mapbox/             # Mapbox integration utilities
├── ocr/                # OCR utilities (Tesseract.js)
├── transcription/      # Audio transcription utilities
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── api/                # API client utilities

```

## Core Modules

### `supabase/` - Database Layer

**Files:**
- `client.ts` - Browser Supabase client
- `server.ts` - Server Supabase client (cookies-based auth)
- `database.types.ts` - Auto-generated TypeScript types from database schema

**Usage:**

```typescript
// In Server Components or Route Handlers
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data } = await supabase.from('somethings').select()
```

```typescript
// In Client Components
import { createClientClient } from '@/lib/supabase/client'

const supabase = createClientClient()
const { data } = await supabase.from('somethings').select()
```

**Type Generation:**
```bash
# Regenerate types after schema changes
supabase gen types typescript --local > lib/supabase/database.types.ts
```

**Row Level Security (RLS):**
All queries automatically filter by `user_id` via RLS policies. Never manually add `user_id` filters in queries.

---

### `capture/` - Capture Logic

Handles the business logic for capturing somethings from reality.

**Files:**
- `get-current-location.ts` - Browser geolocation API wrapper
- `process-media.ts` - Media file processing (resize, compress)
- `extract-text.ts` - OCR wrapper for image text extraction

**Example: Location Capture**
```typescript
import { getCurrentLocation } from '@/lib/capture/get-current-location'

const location = await getCurrentLocation()
// Returns: { latitude, longitude, accuracy, error? }
```

**Example: OCR Processing**
```typescript
import { extractTextFromImage } from '@/lib/capture/extract-text'

const text = await extractTextFromImage(imageFile)
// Returns extracted text string
```

---

### `my-reality/` - Map Visualization Logic

Contains logic for the 2D spatial map visualization.

**Files:**
- `hexagonal-lattice.ts` - Hexagonal grid positioning algorithm
- `perlin-noise.ts` - Perlin noise generator for Unknown regions
- `position-content.ts` - Position somethings on the map
- `camera-controls.ts` - Zoom/pan camera logic

**Example: Hexagonal Positioning**
```typescript
import { getHexPosition } from '@/lib/my-reality/hexagonal-lattice'

const position = getHexPosition(index)
// Returns: { x, y } coordinates for hexagonal grid
```

**Future Enhancements:**
- Abode boundary calculations
- Lens attention highlighting
- Dynamic space expansion logic

---

### `link-preview/` - URL Metadata Extraction

Fetches and parses metadata from URLs (Open Graph, Twitter Cards).

**Files:**
- `fetch-metadata.ts` - Fetch URL metadata (title, description, image)
- `fetch-thumbnail.ts` - Extract thumbnail image from URL

**Example:**
```typescript
import { fetchLinkMetadata } from '@/lib/link-preview/fetch-metadata'

const metadata = await fetchLinkMetadata('https://example.com')
// Returns: { title, description, image, url }
```

**Usage in Capture:**
When user pastes a link, automatically fetch metadata and store in `attributes` JSONB field.

---

### `mapbox/` - Mapbox Integration

Utilities for working with Mapbox GL JS.

**Files:**
- `config.ts` - Mapbox configuration (token, styles)
- `geocode.ts` - Reverse geocoding (lat/lng → location name)

**Example:**
```typescript
import { reverseGeocode } from '@/lib/mapbox/geocode'

const locationName = await reverseGeocode(latitude, longitude)
// Returns: "San Francisco, CA, USA"
```

---

### `schemas/` - Zod Validation Schemas

Type-safe validation schemas for forms and API requests.

**Files:**
- `something.schema.ts` - Validation for something creation/update
- `connection.schema.ts` - Validation for connection creation
- `lens.schema.ts` - Validation for lens creation (planned)

**Example:**
```typescript
import { somethingSchema } from '@/lib/schemas/something.schema'

const result = somethingSchema.safeParse(formData)
if (!result.success) {
  // Handle validation errors
  console.error(result.error.errors)
}
```

**Benefits:**
- Runtime type checking
- Automatic error messages
- Integration with React Hook Form
- Type inference for TypeScript

---

### `types/` - TypeScript Type Definitions

Shared TypeScript types and interfaces.

**Files:**
- `database.types.ts` - Database row types (auto-generated)
- `api.types.ts` - API request/response types
- `components.types.ts` - Component prop types

**Example:**
```typescript
import type { Something } from '@/lib/types/database.types'

function processSomething(something: Something) {
  // Fully typed something object
}
```

---

### `hooks/` - Custom React Hooks

Reusable React hooks for common patterns.

**Files:**
- `use-somethings.ts` - Fetch and manage somethings list
- `use-location.ts` - Geolocation hook
- `use-media-upload.ts` - Media upload with progress

**Example:**
```typescript
'use client'
import { useSomethings } from '@/lib/hooks/use-somethings'

export default function Component() {
  const { somethings, loading, error, refetch } = useSomethings()
  // Use somethings data
}
```

---

### `api/` - API Client Utilities

Wrapper functions for API calls with proper error handling.

**Files:**
- `somethings.api.ts` - Somethings CRUD operations
- `connections.api.ts` - Connections CRUD operations

**Example:**
```typescript
import { createSomething } from '@/lib/api/somethings.api'

const newSomething = await createSomething({
  text_content: 'Beautiful sunset',
  content_type: 'text',
})
```

**Benefits:**
- Centralized error handling
- Type-safe API calls
- Consistent request/response format
- Easy to mock for testing

---

## Design Patterns

### Separation of Concerns

**Data Layer** (`supabase/`)
- Direct database access
- Type generation
- RLS enforcement

**Business Logic** (`capture/`, `my-reality/`, etc.)
- Domain-specific operations
- Complex calculations
- Side effects (OCR, geocoding)

**Validation** (`schemas/`)
- Input validation
- Type safety
- Error messages

**Presentation** (`app/components/`)
- UI rendering
- User interactions
- Styling

### Type Safety

All modules export proper TypeScript types:

```typescript
// lib/capture/get-current-location.ts
export interface LocationResult {
  latitude: number
  longitude: number
  accuracy: number
  error?: string
}

export async function getCurrentLocation(): Promise<LocationResult> {
  // Implementation
}
```

### Error Handling

Consistent error handling pattern:

```typescript
export async function fetchData() {
  try {
    const result = await operation()
    return { data: result, error: null }
  } catch (error) {
    console.error('Operation failed:', error)
    return { data: null, error: error.message }
  }
}
```

### Async Operations

All async operations return Promises with proper typing:

```typescript
// Good
export async function fetchSomething(id: string): Promise<Something | null> {
  const { data } = await supabase.from('somethings').select().eq('id', id).single()
  return data
}

// Avoid
export function fetchSomething(id: string) {
  return supabase.from('somethings').select().eq('id', id).single()
}
```

---

## Testing

### Unit Tests

Test business logic in isolation:

```typescript
// tests/capture/get-current-location.test.ts
import { getCurrentLocation } from '@/lib/capture/get-current-location'

describe('getCurrentLocation', () => {
  it('should return location coordinates', async () => {
    const location = await getCurrentLocation()
    expect(location.latitude).toBeDefined()
    expect(location.longitude).toBeDefined()
  })
})
```

### Integration Tests

Test with actual Supabase client (using test database):

```typescript
// tests/api/somethings.test.ts
import { createSomething } from '@/lib/api/somethings.api'

describe('Somethings API', () => {
  it('should create a new something', async () => {
    const something = await createSomething({ text_content: 'Test' })
    expect(something.id).toBeDefined()
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific module
pnpm test lib/capture

# Watch mode
pnpm test:watch
```

---

## Best Practices

1. **Pure Functions** - Keep functions pure when possible (no side effects)
2. **Single Responsibility** - Each module handles one concern
3. **Type Everything** - Use TypeScript for all exports
4. **Error Handling** - Always handle errors gracefully
5. **No Business Logic in Components** - Keep logic in `lib/`, render in `app/`
6. **Document Complex Logic** - Add comments for non-obvious code
7. **Test Coverage** - Write tests for critical business logic

---

## Future Additions

### Planned Modules

- `lib/lenses/` - Lens discovery and naming logic
- `lib/attention/` - Attention mechanism (TF-IDF, embeddings)
- `lib/connections/` - Connection inference and suggestions
- `lib/filters/` - Filter logic for abode views
- `lib/animations/` - Reusable animation utilities

### AI Integration

- Attention mechanism for lens highlighting
- Pattern recognition across captures
- Auto-suggested connections
- Lens naming suggestions

---

## Contributing to lib/

When adding new modules:

1. Create a new directory with clear purpose
2. Export types and functions explicitly
3. Add unit tests for business logic
4. Update this README with module description
5. Follow existing patterns (error handling, typing)

---

**The `lib/` directory is the engine of (ur "reality") - keep it clean, typed, and testable.**
