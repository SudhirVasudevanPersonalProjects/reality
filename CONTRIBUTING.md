# Contributing to (ur "reality")

Thank you for your interest in contributing to (ur "reality")! This document provides guidelines for contributing to the project.

## Getting Started

1. **Read the documentation**
   - [README.md](./README.md) - Project overview and setup
   - [docs/prd-v5.md](./docs/prd-v5.md) - Product vision and requirements
   - [CLAUDE.md](./CLAUDE.md) - BMAD development workflow

2. **Set up your development environment**
   - Follow the installation instructions in [README.md](./README.md)
   - Ensure all tests pass: `pnpm test`
   - Run the development server: `pnpm dev`

3. **Understand the architecture**
   - Review [app/README.md](./app/README.md) for frontend structure
   - Review [lib/README.md](./lib/README.md) for business logic
   - Review [supabase/README.md](./supabase/README.md) for database schema

## Development Workflow

This project uses the **BMAD-METHOD™** (Breakthrough Method of Agile AI-driven Development). See [CLAUDE.md](./CLAUDE.md) for details.

### Key Principles

1. **Stories first** - All features start as user stories
2. **Test-driven** - Write tests before or alongside implementation
3. **Type-safe** - Use TypeScript with strict mode
4. **Clean code** - Follow existing patterns and conventions

### Working with Stories

1. **Find a story** in `docs/stories/` with status "Approved"
2. **Understand the requirements** - Read the story description and acceptance criteria
3. **Implement the feature** - Follow the tasks checklist
4. **Write tests** - Ensure test coverage meets standards
5. **Update the story** - Mark tasks complete, update Dev Agent Record
6. **Submit for review** - Change status to "Ready for Review"

## Code Style

### TypeScript

```typescript
// Use explicit types
function processSomething(something: Something): ProcessedSomething {
  // Implementation
}

// Prefer interfaces for objects
interface Something {
  id: string
  content: string
}

// Use type for unions
type ContentType = 'text' | 'image' | 'video'
```

### React Components

```typescript
// Server Components (default)
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// Client Components (when needed)
'use client'
export default function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState('new')}>Click</button>
}
```

### Styling

- Use Tailwind utility classes
- Follow existing color variables (defined in `globals.css`)
- Keep custom CSS minimal
- Use `clsx` for conditional classes

```typescript
import clsx from 'clsx'

<div className={clsx(
  'base-class',
  isActive && 'active-class',
  'utility-class'
)}>
```

## Testing Standards

### Requirements

- **No flaky tests** - Proper async handling, explicit waits
- **No hard waits** - Use `waitFor`, polling, or events
- **Stateless** - Tests run independently
- **Self-cleaning** - Tests clean up their data
- **Clear assertions** - Keep assertions in tests, not helpers

### Test Coverage Goals

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test --coverage
```

See [tests/README.md](./tests/README.md) for detailed testing guidelines.

## Database Changes

### Creating Migrations

```bash
# Create new migration
supabase migration new description_of_change

# Edit the generated SQL file
# Run locally to test
supabase db reset

# Regenerate types
supabase gen types typescript --local > lib/supabase/database.types.ts
```

### Migration Best Practices

1. **Idempotent** - Use `IF NOT EXISTS`, `IF EXISTS`
2. **Backward compatible** - Add columns with defaults
3. **Data migrations** - Update data before adding constraints
4. **Comments** - Explain the "why"
5. **RLS policies** - Always include for new tables

See [supabase/README.md](./supabase/README.md) for detailed migration guidelines.

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

**Examples:**
```
feat(chamber): add swipeable navigation
fix(capture): handle geolocation errors
docs(readme): update setup instructions
test(api): add tests for somethings endpoint
```

## Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/description-of-feature
   ```

2. **Make your changes**
   - Follow code style
   - Write tests
   - Update documentation

3. **Ensure quality**
   ```bash
   pnpm lint        # No linting errors
   pnpm typecheck   # No type errors
   pnpm test        # All tests pass
   pnpm build       # Build succeeds
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/description-of-feature
   ```
   - Create PR on GitHub
   - Fill in PR template
   - Link to related story (if applicable)

6. **Address review feedback**
   - Make requested changes
   - Push updates to same branch
   - Re-request review

## Project Structure

### Adding New Features

When adding a significant feature:

1. **Create or update story** in `docs/stories/`
2. **Implement in appropriate location**:
   - New page: `app/[route]/page.tsx`
   - Business logic: `lib/[module]/`
   - API endpoint: `app/api/[route]/route.ts`
   - Component: `app/components/`
3. **Write tests** in `tests/[module]/`
4. **Update documentation** as needed

### File Organization

```
feature-name/
├── page.tsx              # Server component (if route)
├── FeatureClient.tsx     # Client component
├── components/
│   ├── SubComponent.tsx
│   └── ...
└── README.md             # (Optional) Feature documentation
```

## Documentation

### What to Document

- **New features** - Update relevant README
- **API changes** - Update API documentation
- **Breaking changes** - Highlight in PR and CHANGELOG
- **Complex logic** - Add code comments
- **Architecture decisions** - Document in `docs/`

### Documentation Standards

- Use Markdown
- Include code examples
- Keep language clear and concise
- Update table of contents if applicable

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** Open a GitHub Issue
- **Security issue?** Email [security@example.com] (do not open public issue)

## Code Review Guidelines

### As a Reviewer

- Be constructive and kind
- Explain the "why" behind suggestions
- Approve when code meets standards
- Request changes when necessary

### As an Author

- Respond to all comments
- Ask for clarification when needed
- Don't take feedback personally
- Mark conversations as resolved

## Community Guidelines

- **Be respectful** - Treat others with kindness
- **Be collaborative** - Help others learn and grow
- **Be inclusive** - Welcome contributors of all backgrounds
- **Be patient** - Everyone is learning

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to (ur "reality")!**
