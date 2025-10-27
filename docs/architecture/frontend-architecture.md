# Frontend Architecture

## 8.1: Component Architecture

**Component Organization:**

```
apps/web/src/
├── app/                          # Next.js 15 App Router (routes)
│   ├── layout.tsx                # Root layout (HTML shell, providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Tailwind imports + global styles
│   │
│   ├── auth/                     # Authentication routes
│   │   ├── signup/page.tsx       # /auth/signup
│   │   ├── login/page.tsx        # /auth/login
│   │   └── verify-phone/page.tsx # /auth/verify-phone
│   │
│   ├── app/                      # Main application (protected)
│   │   ├── layout.tsx            # App layout (Google Maps style)
│   │   ├── loading.tsx           # Loading state
│   │   ├── error.tsx             # Error boundary
│   │   │
│   │   ├── map/page.tsx          # /app/map (Physical Reality)
│   │   ├── timeline/page.tsx     # /app/timeline (Temporal Reality)
│   │   ├── heart/page.tsx        # /app/heart (Heart's Abode)
│   │   ├── something/page.tsx    # /app/something (Something's Abode)
│   │   ├── shared/page.tsx       # /app/shared (Shared Realities)
│   │   └── profile/page.tsx      # /app/profile (Settings)
│   │
│   └── api/                      # Next.js API routes
│       ├── sms/inbound/route.ts  # Twilio webhook
│       └── pookie/chat/route.ts  # Pookie AI proxy
│
├── components/                   # React components
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Auth context provider
│   │   ├── SignUpForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx            # App header
│   │   ├── Sidebar.tsx           # Navigation compass
│   │   ├── PookieChat.tsx        # Bottom chat bar
│   │   └── AppLayout.tsx         # Google Maps layout
│   │
│   ├── map/
│   │   ├── MapView.tsx           # Mapbox GL map
│   │   ├── ExperienceDot.tsx     # Map marker
│   │   └── MapControls.tsx
│   │
│   ├── timeline/
│   │   ├── TimelineView.tsx
│   │   └── TimelineEntry.tsx
│   │
│   ├── hierarchy/
│   │   ├── HierarchyColumn.tsx   # Category column
│   │   └── HierarchyCard.tsx
│   │
│   ├── queue/
│   │   ├── SomethingAbode.tsx    # Unprocessed queue
│   │   └── CaptureCard.tsx
│   │
│   ├── experience/
│   │   ├── ExperienceModal.tsx   # Detail modal
│   │   └── ExperienceCard.tsx
│   │
│   └── ui/                       # Base components
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       └── Card.tsx
│
├── services/                     # API service layer
│   ├── supabase.ts               # Supabase client
│   ├── experiences.service.ts
│   ├── thoughts.service.ts
│   ├── connections.service.ts
│   └── pookie.service.ts
│
├── store/                        # State management
│   ├── ui.store.ts               # Zustand: UI state
│   ├── auth.store.ts             # Zustand: Auth state
│   └── queries/                  # TanStack Query hooks
│       ├── useExperiences.ts
│       ├── useThoughts.ts
│       └── useConnections.ts
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useMap.ts
│   ├── useRealtime.ts
│   └── useMediaQuery.ts
│
├── utils/                        # Utilities
│   ├── validation.ts
│   ├── formatting.ts
│   └── cn.ts                     # Tailwind class merger
│
└── types/                        # Frontend-specific types
    └── api.ts
```

**Component Template (TypeScript + Next.js 15):**

```typescript
'use client'; // Only for client components with interactivity

import { useState } from 'react';
import { cn } from '@/utils/cn';

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentNameProps) {
  const [state, setState] = useState<string>('');

  const handleAction = () => {
    // Event handler
  };

  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

**Naming Conventions:**
- Components: `PascalCase` (`UserProfile.tsx`)
- Hooks: `camelCase` with `use` prefix (`useAuth.ts`)
- Utilities: `camelCase` (`formatDate.ts`)
- Types: `PascalCase` (`Experience`)
- Files: Match component name

## 8.2: State Management Architecture

**State Structure:**

```typescript
// UI State (Zustand) - Client-side only
// store/ui.store.ts
import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  pookieChatOpen: boolean;
  currentView: string;
  theme: 'light' | 'dark';

  toggleSidebar: () => void;
  togglePookieChat: () => void;
  setCurrentView: (view: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  pookieChatOpen: false,
  currentView: '/app/map',
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  togglePookieChat: () => set((state) => ({ pookieChatOpen: !state.pookieChatOpen })),
  setCurrentView: (view) => set({ currentView: view }),
}));

// Server State (TanStack Query)
// store/queries/useExperiences.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experiencesService } from '@/services/experiences.service';

export function useExperiences(userId: string) {
  return useQuery({
    queryKey: ['experiences', userId],
    queryFn: () => experiencesService.getAll(userId),
  });
}

export function useCategorizeExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: experiencesService.categorize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
```

**State Management Patterns:**
- **UI state** → Zustand (sidebar, theme, chat open/closed)
- **Server state** → TanStack Query (experiences, thoughts, connections)
- **Form state** → React Hook Form (controlled forms)
- **URL state** → Next.js router (current route)

## 8.3: Routing Architecture

**Route Organization:**

```
app/
├── layout.tsx              # Root layout (HTML, providers)
├── page.tsx                # Landing page (/)
├── auth/
│   ├── signup/page.tsx     # /auth/signup
│   ├── login/page.tsx      # /auth/login
│   └── verify-phone/page.tsx
├── app/
│   ├── layout.tsx          # App layout (protected, Google Maps style)
│   ├── map/page.tsx        # /app/map (default)
│   ├── timeline/page.tsx
│   ├── heart/page.tsx
│   ├── something/page.tsx
│   ├── shared/page.tsx
│   └── profile/page.tsx
└── experience/
    └── [id]/page.tsx       # /experience/:id (modal intercept)
```

**Protected Route Pattern:**

```typescript
// app/app/layout.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
```

## 8.4: Frontend Services Layer

**Service Example:**

```typescript
// services/experiences.service.ts
import { supabase } from './supabase';
import type { Experience } from '@reality/shared';

export const experiencesService = {
  async getAll(userId: string): Promise<Experience[]> {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  async categorize(id: string, category: string, location?: { lat: number; lng: number }) {
    const { data, error } = await supabase
      .from('experiences')
      .update({
        category,
        latitude: location?.lat,
        longitude: location?.lng,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

