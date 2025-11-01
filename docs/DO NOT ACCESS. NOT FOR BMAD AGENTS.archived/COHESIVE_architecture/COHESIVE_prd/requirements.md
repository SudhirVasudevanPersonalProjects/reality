# Requirements

## Functional Requirements

**Core Capture System (SMS-Based):**

1. **FR1**: Users receive unique phone number (+1-555-REALITY shared number) during onboarding for SMS capture
2. **FR2**: Users can text any message to Reality number, system creates experience record with content, timestamp, source='sms'
3. **FR3**: Users can send photos via MMS, system downloads media from Twilio webhook, stores in Supabase Storage, creates experience with photo_urls
4. **FR4**: System looks up user by sender phone number (from field) and associates capture with correct user_id
5. **FR5**: SMS captures default to unprocessed state (null category), appear in Something's Abode queue
6. **FR6**: Users can send multiple photos in one MMS, each stored separately with same timestamp
7. **FR7**: System handles SMS delivery failures with retry logic and user notification

**Authentication & Phone Verification:**

8. **FR8**: Users create account via email/password with phone number field required during signup
9. **FR9**: System sends welcome SMS immediately after signup: "Welcome to Reality, the game. I'm Pookie, your guide. Text me anytime to capture moments. Visit reality.app to organize."
10. **FR10**: Users verify phone number via SMS code (6-digit) sent after signup
11. **FR11**: Users can optionally sign in via OAuth (Google) for simplified onboarding
12. **FR12**: Phone number must be unique per user, enforced at database level

**Desktop Web Organization Interface:**

13. **FR13**: Main app interface (/app) uses Google Maps-style layout: center content (80% width) + right sidebar navigation (20%)
14. **FR14**: Right sidebar contains navigation compass with buttons: Map, Timeline, Heart, Something's Abode, Shared Realities
15. **FR15**: Bottom bar contains Pookie LLM chat interface (collapsed by default, expands upward)
16. **FR16**: Clicking navigation button triggers smooth Framer Motion page transition without hard reload
17. **FR17**: Header displays "Reality" logo, user avatar, settings icon
18. **FR18**: Mobile web provides read-only view (browse map/timeline/hierarchies, no organization features)

**Something's Abode (Unprocessed Queue):**

19. **FR19**: Something's Abode displays all uncategorized SMS/MMS captures as cards (content, photos if MMS, timestamp)
20. **FR20**: Users can categorize captures via swipe/click actions with suggested categories: "Beauty", "Ugly", "Dreams"
21. **FR21**: Users can create custom category names beyond suggested defaults, stored as free-form text in database
22. **FR22**: Users can add GPS location manually to SMS capture (search city or click map)
23. **FR23**: Users can delete captures from queue with confirmation prompt
24. **FR24**: Batch mode allows selecting multiple captures for bulk categorization
25. **FR25**: Processed captures move from Something's Abode to appropriate hierarchy/map/timeline

**Map View (Physical Reality):**

26. **FR26**: Map (/app/map) displays Mapbox GL JS world map with dark blue grayscale base; experiences appear as dots where Beauty brightens the area, Ugly darkens it, and Dreams appear as flickering lights
27. **FR27**: Map supports zoom from world → country → state → city → street level with dot clustering at high zoom-out
28. **FR28**: Clicking map dot opens experience detail modal with all metadata and linked thoughts
29. **FR29**: Map uses "fog of war" for unvisited locations (darker grayscale), brightens as user adds experiences (especially Beauty)
30. **FR30**: Dream locations display as flickering/translucent markers if no GPS yet assigned

**Timeline View (Temporal Reality):**

31. **FR31**: Timeline (/app/timeline) displays all experiences chronologically from user's birth date to present
32. **FR32**: Timeline supports year/month/day zoom levels with smooth transitions
33. **FR33**: Users can jump to specific date via date picker navigation
34. **FR34**: Each timeline entry shows thumbnail (if photo), text preview, category indicator, GPS icon if location-tagged
35. **FR35**: Clicking timeline entry opens experience detail modal

**Heart's Abode (Hierarchies):**

36. **FR36**: Heart's Abode (/app/heart) displays columns for each category used by user (Beauty, Ugly, Dreams, and custom categories)
37. **FR37**: Each column shows ranked hierarchy (most-revisited at top) with visual ranking indicators
38. **FR38**: Users can manually categorize thoughts via drag-and-drop or button clicks
39. **FR39**: Hierarchies update in real-time as user revisits items (viewing item detail = +1 revisit count)
40. **FR40**: Clicking hierarchy item opens detail modal with connections graph

**Pookie LLM Chat Interface:**

41. **FR41**: Pookie chat always visible at bottom of screen with input field "Ask Pookie..."
42. **FR42**: Users can type navigation commands: "Show me timeline" triggers router.push('/app/timeline')
43. **FR43**: Users can ask questions: "Show me all my Beauty thoughts about nature" filters current view
44. **FR44**: Pookie has access to user's full capture history for context-aware responses via GPT-4 API
45. **FR45**: Chat history persists per session in Zustand state, clears on logout

**Shared Realities (Collaborative Editing):**

46. **FR46**: Users can share specific experiences with other users (visibility toggle: Private/Public/Shared with...)
47. **FR47**: Shared experiences appear in both users' realities as separate copies (fork model)
48. **FR48**: Users can view other users' public realities (read-only) via Shared Realities view (/app/shared)
49. **FR49**: Related Realities list shows connections with other users, sorted by shared experience count
50. **FR50**: Users can send relationship invites (accept/reject flow) before sharing experiences

**Completion & Scoring:**

51. **FR51**: Users can mark Dreams as "Completed" via button in detail modal, awards +1 Beauty Point
52. **FR52**: Users can mark Uglies as "Transformed" via button in detail modal, awards +1 Beauty Point
53. **FR53**: Reality Score formula (Total Beauty Created - Active Ugly Count) displays on profile
54. **FR54**: Completed Dreams and Transformed Uglies move to "Completed" archive (viewable but separate)
55. **FR55**: Profile shows completion history with dates and permanent "Beauty Created" counter

**Knowledge Graph & Connections:**

56. **FR56**: Users can link any capture to any other via "Connect" button, creating directional relationship
57. **FR57**: Connection labels explain relationship (e.g., "why this beauty matters", "underlying drive")
58. **FR58**: Item detail modal shows all connected nodes as visual web/graph (D3.js/Cytoscape.js)
59. **FR59**: Full knowledge graph view (/app/graph - future epic) shows entire network with zoom/pan/filter

**Data Management:**

60. **FR60**: All user data syncs to Supabase cloud with real-time updates (no offline mode for MVP)
61. **FR61**: Users can export all data (captures, hierarchies, completions) as JSON or CSV file
62. **FR62**: Users can permanently delete account and all data with confirmation prompt
63. **FR63**: Phone number visible only in Settings/Profile (not displayed in reality views to maintain immersion)

**Rate Limiting & Freemium:**

64. **FR64**: Free tier allows 20 SMS/day per user, enforced at webhook level
65. **FR65**: Exceeding 20 SMS shows notification: "Daily limit reached - upgrade for unlimited"
66. **FR66**: Freemium upgrade unlocks unlimited SMS capture (future monetization)

## Non-Functional Requirements

**Performance:**

1. **NFR1**: Web app loads initial route in <2 seconds on broadband connection
2. **NFR2**: SMS webhook processing completes within 3 seconds (Twilio → Supabase → stored)
3. **NFR3**: Map rendering completes initial load within 1 second, smooth 60fps pan/zoom
4. **NFR4**: Timeline scrolling maintains 60fps with lazy loading for datasets up to 1000 experiences
5. **NFR5**: Pookie chat responses return within 5 seconds (GPT-4 API call + streaming)

**Scalability:**

6. **NFR6**: System supports up to 10,000 captures per user without performance degradation
7. **NFR7**: Backend (Supabase + Vercel) handles up to 10,000 concurrent users during MVP phase
8. **NFR8**: Twilio webhook endpoint handles 100 SMS/minute burst traffic
9. **NFR9**: Photo storage scales cost-effectively via Supabase Storage with compression (target: 500KB per photo)

**Reliability:**

10. **NFR10**: Web app maintains 99% uptime (measured via Vercel analytics)
11. **NFR11**: SMS webhook retries failed processing with exponential backoff (3 retries max)
12. **NFR12**: Database backup occurs automatically every 24 hours with 30-day retention

**Security & Privacy:**

13. **NFR13**: All user data encrypted at rest and in transit (HTTPS/TLS)
14. **NFR14**: Row Level Security (RLS) policies ensure users can only access their own data
15. **NFR15**: Pookie AI calls routed through Supabase Edge Functions (OpenAI API keys hidden from client)
16. **NFR16**: Phone numbers hashed for privacy, Twilio proxy available for masking (future opt-in)
17. **NFR17**: App complies with GDPR (data export/deletion) and COPPA (13+ age gate)

**Usability:**

18. **NFR18**: Onboarding flow completable in <3 minutes (account creation, phone verification, welcome SMS)
19. **NFR19**: Desktop UI optimized for 1920x1080 baseline, responsive down to 1366x768
20. **NFR20**: Mobile web (< 768px) provides read-only view with bottom tab navigation
21. **NFR21**: All primary actions accessible within 2 clicks from home screen

**Cost Constraints:**

22. **NFR22**: Total infrastructure cost remains under $35/month for 1000 active users:
    - Supabase: $25/month (Pro tier)
    - Twilio: $1/month + $7.50/1K SMS
    - Vercel: Free tier (hobby)
23. **NFR23**: Pookie AI usage rate-limited to 10 interactions per user per day (control OpenAI costs)
24. **NFR24**: Photo storage uses compression (Sharp library) to minimize storage costs

**Platform Support:**

25. **NFR25**: Web app supports Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
26. **NFR26**: Mobile web provides read-only compatibility for iOS Safari and Chrome Android
27. **NFR27**: Built with Next.js 14+ App Router for optimal web performance

**Localization:**

28. **NFR28**: MVP supports English only (i18n infrastructure deferred to post-MVP)

**SEO & Public Launch:**

29. **NFR29**: Landing page (/) optimized for SEO with meta tags, Open Graph, structured data
30. **NFR30**: Public pages (landing, about) render server-side for search engine indexing
31. **NFR31**: /app routes protected with authentication middleware (redirect to login)
