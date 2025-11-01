# Unified Project Structure

```
reality/
├── .github/
│   └── workflows/
│       ├── ci.yaml              # Run tests on PR
│       └── deploy.yaml          # Deploy to Vercel
│
├── apps/
│   ├── web/                     # Next.js web application
│   │   ├── src/
│   │   │   ├── app/             # App Router routes
│   │   │   ├── components/      # React components
│   │   │   ├── services/        # API services
│   │   │   ├── store/           # State management
│   │   │   ├── hooks/           # Custom hooks
│   │   │   ├── utils/           # Utilities
│   │   │   └── types/           # Frontend types
│   │   ├── public/              # Static assets
│   │   ├── .env.local           # Environment variables (gitignored)
│   │   ├── .env.example         # Example env file
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile-archived/         # React Native (archived)
│
├── packages/
│   ├── shared/                  # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── experience.ts
│   │   │   │   ├── thought.ts
│   │   │   │   └── index.ts
│   │   │   └── constants/
│   │   └── package.json
│   │
│   └── config/                  # Shared configuration
│       ├── eslint/
│       └── typescript/
│
├── supabase/
│   ├── functions/               # Edge Functions (Deno)
│   ├── migrations/              # Database migrations
│   └── config.toml
│
├── docs/
│   ├── prd.md
│   ├── architecture.md          # This document
│   ├── pivot-plan-sms-to-web.md
│   └── stories/
│
├── .bmad-core/                  # BMAD development system
│
├── package.json                 # Root package.json (pnpm)
├── pnpm-workspace.yaml
└── README.md
```

---

