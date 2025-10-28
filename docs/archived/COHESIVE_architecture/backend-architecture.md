# Backend Architecture

## 9.1: Edge Functions Architecture

**Function Organization:**

```
supabase/
├── functions/
│   ├── pookie-chat/
│   │   └── index.ts         # Pookie AI chat endpoint
│   ├── sms-webhook/
│   │   └── index.ts         # Alternative SMS webhook
│   └── _shared/
│       ├── supabase.ts      # Shared Supabase client
│       └── openai.ts        # Shared OpenAI client
│
├── migrations/              # Database migrations (SQL)
│   ├── 20251024000401_create_profiles_trigger.sql
│   └── 20251024182206_create_experiences_and_thoughts_tables.sql
│
└── config.toml             # Supabase configuration
```

**Function Template (Pookie Chat):**

```typescript
// supabase/functions/pookie-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

serve(async (req) => {
  const { message, userId } = await req.json();

  // Get user context
  const { data: experiences } = await supabase
    .from('experiences')
    .select('content, category, timestamp')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(10);

  // Call OpenAI with context
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: `You are Pookie. User's recent: ${JSON.stringify(experiences)}` },
      { role: 'user', content: message },
    ],
  });

  return new Response(
    JSON.stringify({ response: completion.choices[0].message.content }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

## 9.2: Authentication and Authorization

**UPDATED 2025-10-27**: Changed to phone-only authentication using Supabase native phone auth.

**Authentication Method**: Phone + Password
- Primary credential: Phone number (E.164 format, e.g., +14085551234)
- Users sign up with `supabase.auth.signUp({ phone, password })`
- Users log in with `supabase.auth.signInWithPassword({ phone, password })`
- Phone stored in `auth.users.phone` (native Supabase field)
- Duplicate phone detection via Supabase Auth (empty identities array)

**Database Trigger** (Auto-create Profile):

```sql
-- Trigger: Create profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, created_at)
  VALUES (
    NEW.id,
    NEW.phone,  -- Uses native auth.users.phone field
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Auth Middleware:**

```typescript
// middleware.ts (Next.js)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/app') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/app/:path*'],
};
```

**SMS Provider Configuration** (`supabase/config.toml`):

```toml
[auth.sms]
enable_signup = true
enable_confirmations = true

# For local dev: Use test OTP
[auth.sms.test_otp]
"+14085551234" = "123456"

# For production: Configure real Twilio credentials
[auth.sms.twilio]
enabled = true
account_sid = "ACxxxxx"
message_service_sid = "MGxxxxx"
auth_token = "env(TWILIO_AUTH_TOKEN)"
```

---

