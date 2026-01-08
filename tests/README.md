# Tests Directory

This directory contains all test files for (ur "reality") using Vitest and React Testing Library.

## Structure

```
tests/
├── api/                    # API route tests
│   ├── assign-abode.test.ts
│   └── ...
├── capture/                # Capture logic tests
│   ├── get-current-location.test.ts
│   └── ...
├── chamber/                # Chamber UI tests
│   ├── swipeable-chamber.test.tsx
│   ├── tag-assignment.test.tsx
│   └── ...
├── link-preview/           # Link preview tests
│   └── ...
└── my-reality/             # Reality map tests
    └── ...

```

---

## Testing Stack

- **Test Runner:** Vitest (fast, Vite-powered)
- **UI Testing:** React Testing Library
- **Assertions:** Vitest expect API
- **Mocking:** Vitest vi utilities
- **DOM:** jsdom (simulated browser environment)

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test:watch

# Run specific test file
pnpm test capture/get-current-location.test.ts

# Run tests with coverage
pnpm test --coverage
```

---

## Test Types

### Unit Tests
Test individual functions and utilities in isolation.

**Location:** Mirror the `lib/` structure

**Example:**
```typescript
// tests/capture/get-current-location.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getCurrentLocation } from '@/lib/capture/get-current-location'

describe('getCurrentLocation', () => {
  it('should return location coordinates', async () => {
    // Mock browser geolocation API
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) =>
        success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
          },
        })
      ),
    }

    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const location = await getCurrentLocation()

    expect(location.latitude).toBe(37.7749)
    expect(location.longitude).toBe(-122.4194)
    expect(location.accuracy).toBe(10)
  })

  it('should handle geolocation errors', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success, error) =>
        error({ code: 1, message: 'User denied geolocation' })
      ),
    }

    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const location = await getCurrentLocation()

    expect(location.error).toBeDefined()
  })
})
```

---

### Integration Tests
Test API routes and database interactions.

**Location:** `tests/api/`

**Example:**
```typescript
// tests/api/assign-abode.test.ts
import { describe, it, expect } from 'vitest'
import { createServerClient } from '@/lib/supabase/server'

describe('POST /api/somethings/[id]/assign-abode', () => {
  it('should assign something to abode', async () => {
    const supabase = createServerClient()

    // Create test something
    const { data: something } = await supabase
      .from('somethings')
      .insert({ text_content: 'Test', content_type: 'text' })
      .select()
      .single()

    // Call API
    const response = await fetch(`/api/somethings/${something.id}/assign-abode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abode_name: 'Beauty' }),
    })

    expect(response.ok).toBe(true)

    // Verify database update
    const { data: updated } = await supabase
      .from('somethings')
      .select()
      .eq('id', something.id)
      .single()

    expect(updated.abode_id).toBeDefined()
  })
})
```

---

### Component Tests
Test React components with user interactions.

**Location:** `tests/chamber/`, `tests/components/`

**Example:**
```typescript
// tests/chamber/swipeable-chamber.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChamberClient } from '@/app/chamber/ChamberClient'

describe('ChamberClient', () => {
  it('should display something content', () => {
    const something = {
      id: '123',
      text_content: 'Beautiful sunset',
      content_type: 'text',
    }

    render(<ChamberClient initialSomething={something} />)

    expect(screen.getByText('Beautiful sunset')).toBeInTheDocument()
  })

  it('should allow swiping to next something', async () => {
    const somethings = [
      { id: '1', text_content: 'First', content_type: 'text' },
      { id: '2', text_content: 'Second', content_type: 'text' },
    ]

    render(<ChamberClient somethings={somethings} />)

    expect(screen.getByText('First')).toBeInTheDocument()

    // Simulate swipe gesture
    const chamber = screen.getByTestId('chamber-container')
    fireEvent.touchStart(chamber, { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(chamber, { touches: [{ clientX: 50 }] })
    fireEvent.touchEnd(chamber)

    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
```

---

### E2E Tests (Future)
Full user journey tests using Playwright or Cypress.

**Status:** Not yet implemented

**Planned tests:**
- Complete capture → chamber → abode workflow
- Lens discovery and naming
- Attention mechanism activation
- Map navigation and exploration

---

## Test Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/app',
      '@/lib': '/lib',
    },
  },
})
```

### `vitest.setup.ts`

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

---

## Writing Tests

### Best Practices

#### 1. Test Behavior, Not Implementation
```typescript
// Good: Test what the user sees
expect(screen.getByText('Beautiful sunset')).toBeInTheDocument()

// Avoid: Test internal state
expect(component.state.content).toBe('Beautiful sunset')
```

#### 2. Use Testing Library Queries
```typescript
// Prefer accessible queries
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')

// Avoid test IDs when possible
screen.getByTestId('submit-button') // Only when no better option
```

#### 3. No Flaky Tests
```typescript
// Good: Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Avoid: Hard-coded delays
await new Promise(resolve => setTimeout(resolve, 1000)) // Flaky!
```

#### 4. Stateless Tests
```typescript
// Good: Each test creates its own data
beforeEach(() => {
  const something = createTestSomething()
  // ...
})

// Avoid: Tests depend on each other
let sharedSomething // Don't share state between tests
```

#### 5. Self-Cleaning Tests
```typescript
// Good: Clean up test data
afterEach(async () => {
  await supabase.from('somethings').delete().eq('user_id', testUserId)
})

// Don't leave test data in database
```

---

## Mocking

### Supabase Client
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClientClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: '1', text_content: 'Test' }],
        error: null,
      })),
    })),
  })),
}))
```

### Browser APIs
```typescript
// Mock geolocation
vi.stubGlobal('navigator', {
  geolocation: {
    getCurrentPosition: vi.fn((success) =>
      success({
        coords: { latitude: 37.7749, longitude: -122.4194 },
      })
    ),
  },
})

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
)
```

### Next.js Router
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
}))
```

---

## Testing Patterns

### Arrange-Act-Assert (AAA)
```typescript
it('should create a something', async () => {
  // Arrange
  const supabase = createServerClient()
  const newSomething = { text_content: 'Test', content_type: 'text' }

  // Act
  const { data, error } = await supabase
    .from('somethings')
    .insert(newSomething)
    .select()
    .single()

  // Assert
  expect(error).toBeNull()
  expect(data.text_content).toBe('Test')
})
```

### Test Fixtures
```typescript
// tests/fixtures/something.fixture.ts
export function createTestSomething(overrides = {}) {
  return {
    id: 'test-id',
    user_id: 'test-user-id',
    content_type: 'text',
    text_content: 'Test content',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// Usage
const something = createTestSomething({ text_content: 'Custom content' })
```

### Test Helpers
```typescript
// tests/helpers/render.tsx
import { render } from '@testing-library/react'

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </AuthProvider>
  )
}
```

---

## Coverage

### Generating Coverage Reports
```bash
pnpm test --coverage
```

**Output:** `coverage/` directory with HTML report

### Coverage Goals
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

### What to Test
✅ **High Priority:**
- Business logic (`lib/`)
- API routes (`app/api/`)
- Critical user flows (capture, chamber)
- Data transformations
- Validation logic

⚠️ **Medium Priority:**
- UI components (interaction-heavy)
- Utilities and helpers
- Error handling paths

❌ **Low Priority:**
- Presentational components (no logic)
- Configuration files
- Type definitions

---

## Debugging Tests

### Run Single Test
```bash
# Run specific test file
pnpm test capture/get-current-location.test.ts

# Run specific test case
pnpm test -t "should return location coordinates"
```

### Watch Mode
```bash
# Auto-rerun tests on file changes
pnpm test:watch
```

### Debug in VS Code
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "--run", "--no-coverage"],
  "console": "integratedTerminal"
}
```

### Console Logging
```typescript
it('should do something', () => {
  console.log('Debugging:', someValue)
  // Or use screen.debug()
  screen.debug() // Prints current DOM
})
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3 # Upload coverage
```

---

## Common Issues

### "Cannot find module '@/lib/...'"
**Fix:** Update `vitest.config.ts` alias paths to match `tsconfig.json`

### "ReferenceError: fetch is not defined"
**Fix:** Mock `fetch` or use `node-fetch` polyfill

### "TypeError: Cannot read property 'useRouter' of null"
**Fix:** Mock Next.js router in test setup

### Tests pass locally but fail in CI
**Fix:** Check for:
- Timezone differences (use UTC in tests)
- File path differences (use platform-agnostic paths)
- Environment variables (set in CI config)

---

## Testing Checklist

Before committing:

- [ ] All tests pass (`pnpm test`)
- [ ] No flaky tests (run multiple times to verify)
- [ ] Tests are independent (can run in any order)
- [ ] Test data is cleaned up
- [ ] No hard-coded delays (`setTimeout`)
- [ ] Mock external APIs and browser APIs
- [ ] Coverage meets goals (80%+)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)

---

**"Tests are the safety net. Write them diligently, run them often, trust them completely."**
