# Testing Strategy

## 14.1: Testing Pyramid

```
       E2E Tests (Playwright)
      /                      \
     Integration Tests
    /                          \
   Frontend Unit Tests    Backend Unit Tests
  (Vitest + RTL)          (Vitest)
```

## 14.2: Test Organization

**Frontend Tests:**

```
apps/web/src/
├── components/
│   ├── auth/
│   │   ├── SignUpForm.tsx
│   │   └── SignUpForm.test.tsx
│   └── map/
│       └── MapView.test.tsx
├── services/
│   └── experiences.service.test.ts
└── __tests__/
    └── e2e/
        ├── auth.spec.ts
        └── capture-flow.spec.ts
```

**Backend Tests:**

```
supabase/
├── functions/
│   └── pookie-chat/
│       └── index.test.ts
└── __tests__/
    └── database/
        └── rls-policies.test.ts
```

## 14.3: Test Examples

**Frontend Component Test:**

```typescript
// components/auth/SignUpForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SignUpForm } from './SignUpForm';

describe('SignUpForm', () => {
  it('submits form with email, password, phone', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert form submission
  });
});
```

**E2E Test:**

```typescript
// __tests__/e2e/categorization.spec.ts
import { test, expect } from '@playwright/test';

test('user can categorize SMS capture', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Password123');
  await page.click('button[type=submit]');

  await page.goto('http://localhost:3000/app/something');
  await page.click('[data-testid=btn-beauty]:first');

  await expect(page.locator('text=Categorized as Beauty')).toBeVisible();
});
```

---

