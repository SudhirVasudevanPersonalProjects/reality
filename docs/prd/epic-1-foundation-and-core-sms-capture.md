# Epic 1: Foundation & Core SMS Capture

**Epic Goal (Expanded)**: Establish complete Next.js web application infrastructure including project setup, Supabase integration, user authentication with phone verification, and Twilio SMS/MMS webhook processing. By end of this epic, a user can create an account with phone number, receive welcome SMS, text the Reality number to capture moments (text or photos), and see those captures appear in the web interface at Something's Abode. This proves the full SMS → Web pipeline works end-to-end and establishes the Google Maps-style layout foundation.

**Value Delivered**: Deployable MVP skeleton - users can sign up, get their Reality number via SMS, start capturing via text messages, and organize on desktop web. Beta environment ready for user testing on Vercel.

---

## Story 1.1: Next.js Project Initialization & Deployment

**As a** developer,
**I want** a properly configured Next.js 14 monorepo with Supabase initialized and deployed to Vercel,
**so that** I have a clean foundation to build features without configuration issues blocking progress.

### Acceptance Criteria

1. **Monorepo Structure Created**: Repository has `/apps/web`, `/packages/shared`, `/supabase`, `/docs`, `/.bmad-core` folders with README explaining structure
2. **Next.js 14 Initialized**: `apps/web/` contains working Next.js app with App Router, TypeScript, runs locally via `npm run dev`
3. **Supabase Project Created**: Cloud Supabase project provisioned with project URL and anon key, local Supabase running via Docker for development
4. **Environment Variables Configured**: `.env.local` files in `/apps/web` and `/supabase` with Supabase URL, anon key, service role key (gitignored)
5. **Tailwind CSS Configured**: Tailwind installed and working, dark blue base theme configured (#1a1f2e background)
6. **Dependencies Installed**: All required packages installed (@supabase/supabase-js, @supabase/ssr, framer-motion, zustand, @tanstack/react-query, mapbox-gl)
7. **Build Verification**: App builds successfully (`npm run build`) with no errors
8. **Vercel Deployment**: App deployed to Vercel preview environment, accessible via URL, auto-deploys on git push
9. **Hello World Landing**: Default page shows "My Reality" heading confirming app launches

---

## Story 1.2: User Authentication - Sign Up with Phone Number

**UPDATED 2025-10-27**: Changed from email+phone to phone-only authentication using Supabase native phone auth.

**As a** new user,
**I want** to create an account with my phone number and password,
**so that** I can start capturing moments via text.

### Acceptance Criteria

1. **Sign Up Page UI**: `/auth/signup` route with phone number input (E.164 format validation), password input (min 8 chars, masked), confirm password input, "Create Account" button
2. **Phone Number Validation**: Phone input validates format (e.g., +14085551234), shows inline error for invalid formats
3. **Password Validation**: Password must be 8+ characters, confirm password field matches
4. **Supabase Auth Integration**: Tapping "Create Account" calls `supabase.auth.signUp({ phone, password })`, creates user in auth.users table with native phone field
5. **Profile Creation**: Database trigger creates corresponding record in `profiles` table with user_id, phone_number (from auth.users.phone), created_at
6. **Phone Number Uniqueness**: Supabase automatically checks phone uniqueness, shows "Phone number already registered" error if duplicate (via empty identities array)
7. **Phone Verification**: After signup, user sees "Check your phone for verification code" screen
8. **Error Handling**: Clear errors for duplicate phone, weak password, invalid phone format, network failures
9. **Success Navigation**: After phone verification (Story 1.10), user redirects to login page

### Implementation Notes

- Uses Supabase native phone authentication (`auth.users.phone` field)
- Duplicate detection via Supabase Auth (returns empty `identities` array for duplicates)
- No email required for signup
- Phone becomes primary authentication credential
- SMS provider (Twilio/Vonage) required for production
- For local dev: Use test OTP or real Twilio trial account

---

## Story 1.3: User Authentication - Login & Session Management

**UPDATED 2025-10-27**: Changed to phone-based login (phone + password).

**As a** returning user,
**I want** to log in with my phone number and password,
**so that** I can access my captured experiences and organize my reality.

### Acceptance Criteria

1. **Login Page UI**: `/auth/login` route with phone number input, password input (masked), "Log In" button, "Don't have account? Sign up" link
2. **Supabase Auth Login**: Tapping "Log In" calls `supabase.auth.signInWithPassword({ phone, password })`, returns session token on success
3. **Session Persistence**: JWT session stored in cookies, app remembers login across browser restarts
4. **Error Handling**: Invalid credentials show "Incorrect phone or password", unverified phone shows "Please verify your phone first"
5. **Success Navigation**: On successful login, redirect to `/app` (main application)
6. **Auto-Login**: If valid session exists on page load, skip login and redirect to `/app`
7. **Protected Routes**: Middleware on `/app/*` routes redirects to `/auth/login` if not authenticated
8. **Logout Functionality**: Profile settings has "Log Out" button that clears session and redirects to landing page

---

## Story 1.4: Database Schema - Core Tables for SMS Capture

**As a** developer,
**I want** the foundational database schema for experiences, thoughts, profiles, and sharing,
**so that** captured data has proper structure and relationships from day one.

### Acceptance Criteria

1. **Profiles Table Updated**: `profiles` table includes: phone_number (unique), phone_verified (boolean)
2. **Experiences Table Created**: `experiences` table with: id (uuid), user_id (uuid), content (text nullable), source (enum: 'sms', 'mms', 'web'), photo_urls (text[] nullable), location (jsonb nullable), timestamp (timestamptz), category (text nullable - supports custom categories), visibility (enum: 'private', 'public', 'shared'), interpretation_of (uuid nullable FK to experiences.id), created_at, updated_at
3. **Thoughts Table Created**: `thoughts` table with: id (uuid), user_id (uuid), content (text), category (text nullable - supports custom categories), intensity (enum: 'drive', 'want', 'dream' nullable), revisit_count (int default 1), hierarchy_rank (int nullable), created_at, updated_at
4. **Shared Experiences Table**: `shared_experiences` table with: id (uuid), experience_id (uuid FK), shared_with_user_id (uuid FK), created_at
5. **Related Realities Table**: `related_realities` table with: id (uuid), user_id (uuid FK), related_user_id (uuid FK), relationship_type (text), accepted (boolean default false), created_at
6. **Row Level Security (RLS) Enabled**: All tables have RLS policies: users can only SELECT/INSERT/UPDATE/DELETE their own data (WHERE user_id = auth.uid())
7. **Indexes Created**: Indexes on user_id, created_at, category, phone_number for fast queries
8. **Migration Files**: Supabase migration in `/supabase/migrations/` with timestamp, applied to local and cloud environments
9. **Test Data Verification**: Developer can manually insert test experience via Supabase dashboard, verify RLS prevents seeing other users' data

---

## Story 1.5: Twilio SMS Integration - Webhook & Phone Lookup

**As a** user,
**I want** to text any message to my Reality number and have it captured,
**so that** I can record moments instantly without opening an app.

### Acceptance Criteria

1. **Twilio Number Provisioned**: Shared Twilio number (+1-555-REALITY or similar) purchased and configured
2. **Webhook Endpoint Created**: Supabase Edge Function at `/functions/sms-inbound` receives POST from Twilio webhook
3. **Twilio Webhook Configuration**: Twilio number configured to POST to `https://<project>.supabase.co/functions/v1/sms-inbound` on incoming SMS
4. **Phone Lookup Logic**: Webhook extracts `From` field (sender phone), queries `profiles` WHERE `phone_number = From` to find user_id
5. **Experience Creation**: If user found, creates record in `experiences` table: content = Body, source = 'sms', timestamp = now(), user_id = looked up ID, category = null
6. **User Not Found Handling**: If phone not in profiles, log error and send SMS: "Phone not registered. Sign up at reality.app"
7. **Response to Twilio**: Webhook returns 200 OK with TwiML (no SMS response - silent capture)
8. **Error Logging**: Failed lookups or database errors logged to Supabase logs for debugging
9. **Rate Limiting**: Webhook checks user's daily SMS count, rejects if > 20 with response SMS: "Daily limit reached (20 SMS). Upgrade for unlimited."
10. **Test Verification**: Developer can text test Twilio number, verify experience appears in Supabase `experiences` table with correct user_id

---

## Story 1.6: Twilio MMS Integration - Photo Capture

**As a** user,
**I want** to send photos via MMS to my Reality number,
**so that** I can capture visual moments alongside text.

### Acceptance Criteria

1. **MMS Detection**: Webhook checks for `NumMedia > 0` in Twilio payload to detect MMS
2. **Media URL Extraction**: Webhook extracts `MediaUrl0`, `MediaUrl1`, etc. (up to 10 images per MMS)
3. **Image Download**: Edge function fetches each MediaUrl via HTTP GET (includes Twilio auth headers)
4. **Supabase Storage Upload**: Downloaded images uploaded to Supabase Storage bucket `experience-photos/{user_id}/{uuid}.jpg`
5. **Image Compression**: Before upload, compress image using Sharp library (target: 500KB per photo, maintain aspect ratio)
6. **Experience Creation**: Creates experience record with source = 'mms', photo_urls = array of Supabase Storage public URLs, content = Body (caption if provided)
7. **Multiple Photos Handling**: Single MMS with 3 photos creates 1 experience with photo_urls array containing 3 URLs
8. **Error Handling**: If media download fails, create experience with content only, log error
9. **Storage Quota Check**: If user exceeds storage limit, log warning (don't reject SMS - just don't store photo)
10. **Test Verification**: Developer sends MMS with 2 photos + caption, verifies experience record has 2 photo_urls and caption in content field

---

## Story 1.7: Something's Abode - Unprocessed SMS Queue

**As a** user,
**I want** to see all my uncategorized SMS/MMS captures in one place,
**so that** I can review and organize them when I have time.

### Acceptance Criteria

1. **Route Created**: `/app/something` route displays Something's Abode view
2. **Query Unprocessed**: Fetches all experiences WHERE user_id = current user AND category IS NULL, ordered by timestamp DESC
3. **Card Display**: Each uncategorized item shown as card: content text (first 200 chars if long), photo thumbnails if photo_urls exists, timestamp (relative: "2 hours ago")
4. **Empty State**: If no uncategorized items, show "All caught up! Nothing waiting to be organized."
5. **Photo Thumbnails**: If experience has photo_urls, display thumbnails in card (grid if multiple)
6. **Timestamp Display**: Show relative time ("5 minutes ago", "Yesterday", "Oct 21") for each card
7. **Card Click**: Clicking card opens detail modal (minimal for now - shows full content and photos)
8. **Loading State**: While fetching, show skeleton cards
9. **Infinite Scroll**: Load 20 items at a time, lazy load more on scroll to bottom
10. **Real-time Updates**: Use Supabase Realtime subscription to show new SMS captures immediately without refresh

---

## Story 1.8: SMS Capture Categorization UI

**As a** user,
**I want** to quickly categorize my SMS captures as Beauty, Ugly, Dreams, or custom categories,
**so that** they move from Something's Abode to my hierarchies.

### Acceptance Criteria

1. **Categorization Buttons**: Each card in Something's Abode has buttons: "Beauty", "Ugly", "Dreams", "Other..."
2. **Category Assignment**: Clicking button updates experience: SET category = 'beauty'/'ugly'/'dreams', updated_at = now()
3. **Optimistic UI**: Card immediately fades out and removes from queue (optimistic update)
4. **Rollback on Error**: If update fails, revert optimistic update and show error toast
5. **Visual Feedback**: Button shows brief loading spinner during update
6. **Keyboard Shortcuts**: Press B (beauty), U (ugly), D (dreams), O (other) on selected card for power users
7. **Card Selection**: Arrow keys (up/down) navigate between cards, Enter opens detail modal
8. **Batch Mode Toggle**: "Batch Mode" button enables multi-select (checkboxes appear on cards)
9. **Batch Categorization**: In batch mode, select multiple cards, then click category button to apply to all selected
10. **Custom Category Input**: "Other..." button opens modal with text input, user types custom category name (e.g., "Work", "Travel"), saves to database as category value
11. **Success Feedback**: After categorization, show toast: "Moved to Beauty" (then auto-dismiss after 2 seconds)

---

## Story 1.9: Google Maps-Style Layout & Navigation

**As a** user,
**I want** a spacious desktop interface with persistent navigation,
**so that** I can easily switch between Map, Timeline, Heart, and Something's Abode views.

### Acceptance Criteria

1. **Layout Structure**: `/app` route uses layout: 80% center content + 20% right sidebar + bottom Pookie bar (collapsed)
2. **Right Sidebar**: Fixed position sidebar with navigation buttons: Map (📍), Timeline (📅), Heart (❤️), Something (❓), Shared (👥)
3. **Active State**: Currently active route button highlighted (brighter background)
4. **Navigation**: Clicking sidebar button uses `router.push()` to change route: Map → `/app/map`, Timeline → `/app/timeline`, etc.
5. **Page Transitions**: Framer Motion AnimatePresence wraps center content, slide transition between routes (300ms duration)
6. **Header**: Top header with "Reality" logo (left), user avatar (right), settings icon (right)
7. **Pookie Bar**: Bottom bar with collapsed state: "Ask Pookie..." input field, expand icon
8. **Responsive Breakpoint**: At < 1366px width, sidebar collapses to icon-only navigation
9. **Dark Blue Theme**: Background #1a1f2e, elevated surfaces #2a3142, text high contrast white
10. **Default Route**: `/app` redirects to `/app/something` as default view (unprocessed queue)

---

## Story 1.10: Phone Verification Flow

**As a** new user,
**I want** to verify my phone number via SMS code,
**so that** the system knows which SMS messages are mine.

### Acceptance Criteria

1. **Verification Code Generation**: After signup, system generates random 6-digit code, stores in `profiles.phone_verification_code` with expiry timestamp (10 minutes)
2. **Welcome SMS Sent**: Supabase Edge Function calls Twilio API to send SMS: "Welcome to Reality, the game. I'm Pookie, your guide. Your verification code: 123456. Text me anytime to capture moments. Visit reality.app to organize."
3. **Verification Page**: After signup, user redirects to `/auth/verify-phone` with phone number (masked) displayed
4. **Code Input**: 6-digit code input field (auto-focus, numeric only)
5. **Verification Check**: On code submit, query profiles WHERE phone_number = user's phone AND phone_verification_code = entered code AND code_expiry > now()
6. **Success**: If match, SET phone_verified = true, clear verification_code, redirect to `/app`
7. **Error Handling**: Invalid code shows "Incorrect code, try again", expired code shows "Code expired, resend?"
8. **Resend Code**: "Resend code" button generates new code, sends new SMS, resets expiry timer
9. **Skip Protection**: Middleware blocks `/app/*` routes if phone_verified = false, redirects to verify page
10. **Test Mode**: In development, code "000000" always works for easier testing

---

## Story 1.11: Vercel Production Deployment & Beta Setup

**As a** developer,
**I want** the web app deployed to Vercel with beta access controls,
**so that** beta testers can access the app and provide feedback on Epic 1 functionality.

### Acceptance Criteria

1. **Vercel Project Created**: Next.js app connected to GitHub repo, auto-deploys on push to main branch
2. **Environment Variables**: Supabase URL, anon key, service role key, Twilio credentials, OpenAI API key configured in Vercel environment settings
3. **Production URL**: App accessible at `reality-app.vercel.app` (or custom domain if available)
4. **Preview Deployments**: Pull requests automatically generate preview URLs for testing
5. **Beta Password Protection**: Vercel password protection enabled for production URL (optional, remove after beta)
6. **Performance Check**: Vercel Analytics enabled, initial Lighthouse score checked (aim for 80+ Performance)
7. **Error Monitoring**: Sentry integrated, production errors automatically reported
8. **Beta Tester Instructions**: Email template created: "Sign up at reality-app.vercel.app, verify phone, text [Twilio number] to capture, check Something's Abode"
9. **Beta Tester List**: 5-10 beta testers invited via email with signup instructions
10. **Feedback Channel**: Discord channel or Google Form created for bug reports and feedback

---

## Story 1.12: Pookie Chat Interface - Basic Setup

**As a** user,
**I want** to interact with Pookie AI via chat interface at bottom of screen,
**so that** I can ask questions and get help navigating my reality.

### Acceptance Criteria

1. **Bottom Bar UI**: Persistent bottom bar (collapsed state: 60px height) with "Ask Pookie..." input field and expand icon
2. **Expand/Collapse**: Clicking expand icon animates bar to 400px height, shows chat history above input
3. **Chat Input**: Text input with "Send" button (or Enter key to submit)
4. **Message Display**: Chat history shows user messages (right-aligned, lighter background) and Pookie responses (left-aligned, darker background)
5. **Zustand State**: Chat history stored in Zustand store (persists across route changes, clears on logout)
6. **API Route Created**: `/api/chat` Next.js route handler accepts POST with message, calls OpenAI GPT-4
7. **OpenAI Integration**: Route handler sends message + user context (recent captures count, current route) to GPT-4 with system prompt: "You are Pookie, guide for Reality app. Help user navigate and understand their reality."
8. **Streaming Response**: GPT-4 response streams back to UI, displays token-by-token (Vercel AI SDK)
9. **Loading State**: While waiting for response, show "Pookie is thinking..." with animated dots
10. **Basic Commands**: Pookie recognizes simple commands: "show timeline" → navigates to `/app/timeline`, "what's this?" → explains current view

---

## Story 1.13: Landing Page & Public Routes

**As a** potential user,
**I want** to understand what Reality is and how to sign up,
**so that** I can decide if I want to create an account.

### Acceptance Criteria

1. **Landing Page Route**: `/` displays public marketing page (not protected by auth)
2. **Hero Section**: Heading "Reality: Your Creator's Tool" with subheading explaining SMS capture + desktop organization
3. **Value Proposition**: 3 key benefits displayed: "Zero-friction capture via SMS", "Spacious desktop organization", "Your reality creates the light"
4. **Phone Number Entry**: Call-to-action form: phone number input + "Get Started" button → redirects to `/auth/signup` with phone pre-filled
5. **How It Works**: 3-step visual: 1) Text Reality number, 2) Organize on desktop, 3) See patterns emerge
6. **Pricing Preview**: "Free: 20 SMS/day. Upgrade for unlimited." (sets expectations)
7. **Footer**: Links to Privacy Policy (minimal page), Terms of Service (minimal page), Contact
8. **SEO Optimization**: Meta tags, Open Graph tags for social sharing, title "Reality - Transform Your World Through Capture & Organization"
9. **Responsive Design**: Landing page mobile-responsive (stacked layout on < 768px)
10. **Fast Load**: Page uses Next.js static generation (SSG), loads in < 1 second

---

**End of Epic 1**

Upon completion, users can:
- ✅ Create account with email, password, phone number
- ✅ Verify phone via SMS code, receive welcome message from Pookie
- ✅ Text Reality number to capture moments (text or photos)
- ✅ See SMS captures appear in Something's Abode queue on web app
- ✅ Categorize captures as Beauty/Ugly/Dreams or custom categories
- ✅ Navigate between views using Google Maps-style sidebar
- ✅ Chat with Pookie for basic help and navigation
- ✅ Access beta via Vercel deployment
