# API Specification

This section defines all APIs available to the frontend application, including Supabase auto-generated REST endpoints, Realtime subscriptions, and custom Edge Functions.

## 6.1: API Architecture Overview

Reality uses a **hybrid API architecture**:

1. **Supabase PostgREST** - Auto-generated REST API from database schema (primary data access)
2. **Supabase Realtime** - WebSocket subscriptions for live updates
3. **Supabase Edge Functions** - Custom serverless endpoints for business logic (SMS webhook, AI chat, geocoding)

**Authentication:**
- All APIs use JWT bearer tokens from Supabase Auth
- Frontend includes token in `Authorization: Bearer <token>` header
- RLS policies enforce data access control at database level
- No API-level auth logic needed (database handles it)

**Base URLs:**
- **REST API:** `https://<project-ref>.supabase.co/rest/v1`
- **Realtime:** `wss://<project-ref>.supabase.co/realtime/v1`
- **Edge Functions:** `https://<project-ref>.supabase.co/functions/v1`

## 6.2: REST API Endpoints (Supabase PostgREST)

Supabase automatically generates RESTful endpoints from database tables. The API follows PostgREST conventions.

**Standard Headers:**
```
Authorization: Bearer <jwt-token>
apikey: <supabase-anon-key>
Content-Type: application/json
```

**Query Operators:**
- `eq` - equals
- `neq` - not equals
- `gt` - greater than
- `gte` - greater than or equal
- `lt` - less than
- `lte` - less than or equal
- `like` - pattern matching
- `ilike` - case-insensitive pattern matching
- `is` - null/not null checks
- `in` - array contains
- `cs` - contains (array/range)
- `order` - sort results
- `limit` - limit results
- `offset` - pagination offset

---

### Users

**Get current user profile**
```
GET /rest/v1/users?id=eq.<user-id>&select=*
```

**Update current user profile**
```
PATCH /rest/v1/users?id=eq.<user-id>
Body: { "display_name": "New Name", "timezone": "America/Los_Angeles" }
```

---

### Profiles

**Get current user profile (extended data)**
```
GET /rest/v1/profiles?id=eq.<user-id>&select=*
```

**Update profile**
```
PATCH /rest/v1/profiles?id=eq.<user-id>
Body: { "bio": "Creator exploring reality", "onboarding_completed": true }
```

---

### Experiences

**List user's experiences (with pagination)**
```
GET /rest/v1/experiences?created_by_user_id=eq.<user-id>&order=created_at.desc&limit=20&offset=0
```

**Get single experience with participants**
```
GET /rest/v1/experiences?id=eq.<experience-id>&select=*,experience_participants(user_id,role)
```

**Create experience**
```
POST /rest/v1/experiences
Body: {
  "created_by_user_id": "<user-id>",
  "raw_text": "Amazing sunset at the beach",
  "captured_at": "2025-10-25T18:30:00Z",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "location_name": "San Francisco, CA",
  "media_urls": ["https://storage.supabase.co/..."],
  "category": "abode"
}
```

**Update experience (categorization)**
```
PATCH /rest/v1/experiences?id=eq.<experience-id>
Body: {
  "category": "soul",
  "quality_score": 9,
  "quality_number": 8,
  "processed_text": "Watched the sun dip below the horizon. Felt grateful."
}
```

**Delete experience**
```
DELETE /rest/v1/experiences?id=eq.<experience-id>
```

**Filter experiences by category**
```
GET /rest/v1/experiences?created_by_user_id=eq.<user-id>&category=eq.heart&select=*
```

**Search experiences by text**
```
GET /rest/v1/experiences?created_by_user_id=eq.<user-id>&raw_text=ilike.*travel*&select=*
```

**Get experiences by date range**
```
GET /rest/v1/experiences?created_by_user_id=eq.<user-id>&captured_at=gte.2025-01-01&captured_at=lte.2025-12-31&order=captured_at.desc
```

**Get experiences near location (requires custom RPC function)**
```
POST /rest/v1/rpc/experiences_near_location
Body: {
  "lat": 37.7749,
  "lng": -122.4194,
  "radius_km": 10,
  "user_id": "<user-id>"
}
```

---

### Thoughts

**List thoughts for an experience**
```
GET /rest/v1/thoughts?experience_id=eq.<experience-id>&order=order_index.asc&select=*
```

**List thoughts for a desire**
```
GET /rest/v1/thoughts?desire_id=eq.<desire-id>&order=created_at.desc&select=*
```

**Get thought with nested children**
```
GET /rest/v1/thoughts?id=eq.<thought-id>&select=*,children:thoughts!parent_thought_id(*)
```

**Create thought**
```
POST /rest/v1/thoughts
Body: {
  "user_id": "<user-id>",
  "experience_id": "<experience-id>",
  "content": "This moment reminded me of childhood summers",
  "thought_type": "reflection",
  "order_index": 0
}
```

**Create nested thought**
```
POST /rest/v1/thoughts
Body: {
  "user_id": "<user-id>",
  "experience_id": "<experience-id>",
  "parent_thought_id": "<parent-id>",
  "content": "Specifically, the smell of saltwater and ice cream",
  "thought_type": "insight",
  "order_index": 0
}
```

**Update thought**
```
PATCH /rest/v1/thoughts?id=eq.<thought-id>
Body: { "content": "Updated reflection...", "user_category": "morning_pages" }
```

**Delete thought (cascades to children)**
```
DELETE /rest/v1/thoughts?id=eq.<thought-id>
```

---

### Desires

**List all desires (unfulfilled)**
```
GET /rest/v1/desires?user_id=eq.<user-id>&fulfilled=eq.false&order=priority.desc.nullslast
```

**List fulfilled desires**
```
GET /rest/v1/desires?user_id=eq.<user-id>&fulfilled=eq.true&order=fulfilled_at.desc
```

**Get desire with dependencies**
```
GET /rest/v1/desires?id=eq.<desire-id>&select=*,dependencies:desire_dependencies!desire_id(depends_on_desire_id,desires!depends_on_desire_id(*))
```

**Create desire**
```
POST /rest/v1/desires
Body: {
  "user_id": "<user-id>",
  "name": "Learn piano",
  "description": "Master Für Elise and basic technique",
  "why": "Music connects me to Grandma's memory",
  "intensity": 0.8,
  "priority": 5
}
```

**Update desire (mark fulfilled)**
```
PATCH /rest/v1/desires?id=eq.<desire-id>
Body: {
  "fulfilled": true,
  "fulfilled_by_experience_id": "<experience-id>"
}
```

**Delete desire**
```
DELETE /rest/v1/desires?id=eq.<desire-id>
```

---

### Desire Dependencies

**Add dependency**
```
POST /rest/v1/desire_dependencies
Body: {
  "desire_id": "<blocked-desire-id>",
  "depends_on_desire_id": "<dependency-desire-id>"
}
```

**Remove dependency**
```
DELETE /rest/v1/desire_dependencies?desire_id=eq.<desire-id>&depends_on_desire_id=eq.<dependency-id>
```

**Get blocked desires (dependencies not fulfilled)**
```
POST /rest/v1/rpc/get_blocked_desires
Body: { "user_id": "<user-id>" }
```

---

### Connections

**List all connections for user**
```
GET /rest/v1/connections?user_id=eq.<user-id>&order=created_at.desc&limit=50
```

**Get connections for specific experience**
```
GET /rest/v1/connections?user_id=eq.<user-id>&or=(from_experience_id.eq.<exp-id>,to_experience_id.eq.<exp-id>)&select=*
```

**Get connections from experience to thoughts**
```
GET /rest/v1/connections?from_experience_id=eq.<exp-id>&to_entity_type=eq.thought&select=*,to_thought:thoughts!to_thought_id(*)
```

**Create connection (Experience → Desire)**
```
POST /rest/v1/connections
Body: {
  "user_id": "<user-id>",
  "from_entity_type": "experience",
  "to_entity_type": "desire",
  "from_experience_id": "<experience-id>",
  "to_desire_id": "<desire-id>",
  "relationship_type": "fulfills",
  "strength": 10,
  "meaning": "This trip fulfilled my desire to travel more. I feel alive again.",
  "notes": "Specifically the spontaneity of booking last-minute"
}
```

**Create connection (Thought → Thought)**
```
POST /rest/v1/connections
Body: {
  "user_id": "<user-id>",
  "from_entity_type": "thought",
  "to_entity_type": "thought",
  "from_thought_id": "<thought-1-id>",
  "to_thought_id": "<thought-2-id>",
  "relationship_type": "questions",
  "meaning": "This question reveals a deeper fear underneath"
}
```

**Update connection meaning**
```
PATCH /rest/v1/connections?id=eq.<connection-id>
Body: { "meaning": "Deeper reflection: this represents a pattern of avoidance" }
```

**Delete connection**
```
DELETE /rest/v1/connections?id=eq.<connection-id>
```

**Get connection graph (requires custom RPC)**
```
POST /rest/v1/rpc/get_connection_graph
Body: {
  "entity_type": "experience",
  "entity_id": "<experience-id>",
  "max_depth": 2
}
```

---

### Tags

**List user's tags**
```
GET /rest/v1/tags?user_id=eq.<user-id>&order=name.asc
```

**Create tag**
```
POST /rest/v1/tags
Body: {
  "user_id": "<user-id>",
  "name": "travel",
  "color": "#3B82F6"
}
```

**Update tag**
```
PATCH /rest/v1/tags?id=eq.<tag-id>
Body: { "color": "#EF4444" }
```

**Delete tag (removes from all entities)**
```
DELETE /rest/v1/tags?id=eq.<tag-id>
```

**Tag an experience**
```
POST /rest/v1/experience_tags
Body: {
  "experience_id": "<experience-id>",
  "tag_id": "<tag-id>"
}
```

**Untag an experience**
```
DELETE /rest/v1/experience_tags?experience_id=eq.<exp-id>&tag_id=eq.<tag-id>
```

**Get experiences by tag**
```
GET /rest/v1/experiences?id=in.(select experience_id from experience_tags where tag_id = '<tag-id>')&select=*
```

---

## 6.3: Realtime Subscriptions (WebSocket)

Supabase Realtime provides WebSocket subscriptions to database changes.

**Connection:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10 // Rate limit
    }
  }
})
```

**Subscribe to new experiences (Something's Abode inbox)**
```javascript
const channel = supabase
  .channel('experiences-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'experiences',
      filter: `created_by_user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New experience captured!', payload.new)
      // Update UI with new experience
    }
  )
  .subscribe()
```

**Subscribe to experience updates (categorization changes)**
```javascript
const channel = supabase
  .channel('experience-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'experiences',
      filter: `id=eq.${experienceId}`
    },
    (payload) => {
      console.log('Experience updated!', payload.new)
      // Update local state
    }
  )
  .subscribe()
```

**Subscribe to new connections**
```javascript
const channel = supabase
  .channel('connections-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // All events
      schema: 'public',
      table: 'connections',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        console.log('New connection created!', payload.new)
      } else if (payload.eventType === 'DELETE') {
        console.log('Connection deleted!', payload.old)
      }
    }
  )
  .subscribe()
```

**Subscribe to desire fulfillment**
```javascript
const channel = supabase
  .channel('desire-fulfilled')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'desires',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      if (payload.new.fulfilled && !payload.old.fulfilled) {
        console.log('Desire fulfilled!', payload.new.name)
        // Show celebration UI
      }
    }
  )
  .subscribe()
```

**Unsubscribe**
```javascript
channel.unsubscribe()
```

**Realtime Best Practices:**
- Only subscribe to channels when route/component is mounted
- Unsubscribe when component unmounts (prevent memory leaks)
- Use filtered subscriptions (don't subscribe to entire table)
- Limit to 1-3 active subscriptions per route (avoid connection overload)
- Use TanStack Query for data fetching, Realtime for live updates only

---

## 6.4: Edge Functions (Custom APIs)

Edge Functions are serverless Deno functions for business logic that can't be expressed in SQL.

**Base URL:** `https://<project-ref>.supabase.co/functions/v1`

**Standard Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

### POST /functions/v1/sms-webhook

Twilio webhook handler for inbound SMS/MMS messages.

**Called by:** Twilio (not frontend)

**Request Body (from Twilio):**
```json
{
  "From": "+14155551234",
  "Body": "Amazing sunset at the beach!",
  "NumMedia": "1",
  "MediaUrl0": "https://api.twilio.com/...",
  "MediaContentType0": "image/jpeg"
}
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

**What it does:**
1. Validates request from Twilio (signature verification)
2. Looks up user by phone number
3. Downloads MMS media (if present) and uploads to Supabase Storage
4. Creates Experience record in database
5. Optionally: Reverse geocodes location if GPS metadata exists
6. Returns TwiML response

---

### POST /functions/v1/pookie-chat

Pookie AI chat endpoint (calls OpenAI GPT-4).

**Request Body:**
```json
{
  "message": "Why do I keep procrastinating on my piano practice?",
  "context": {
    "recent_experiences": ["<experience-id-1>", "<experience-id-2>"],
    "active_desires": ["<desire-id-1>"],
    "connection_suggestions": true
  }
}
```

**Response:**
```json
{
  "response": "I see you have an active desire to 'Learn piano' with intensity 0.8. Your recent thoughts suggest fear of failure might be blocking you. Would you like me to suggest a dependency? Perhaps 'Schedule 15min practice sessions' could help break the overwhelm.",
  "suggested_connections": [
    {
      "from_entity_type": "thought",
      "from_entity_id": "<thought-id>",
      "to_entity_type": "desire",
      "to_entity_id": "<desire-id>",
      "relationship_type": "blocks",
      "meaning": "Fear of failure is blocking piano practice desire"
    }
  ]
}
```

**What it does:**
1. Validates JWT token
2. Fetches user context (recent experiences, desires, connections)
3. Constructs OpenAI prompt with context
4. Streams GPT-4 response
5. Optionally generates connection suggestions based on conversation
6. Returns response + suggested connections

---

### POST /functions/v1/geocode-location

Reverse geocoding (lat/lng → location name) using Mapbox.

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response:**
```json
{
  "location_name": "San Francisco, CA, USA",
  "place_name": "San Francisco",
  "region": "California",
  "country": "United States"
}
```

**What it does:**
1. Calls Mapbox Geocoding API
2. Formats response as location_name
3. Returns structured location data

---

### POST /functions/v1/process-experience-text

AI-powered text processing (cleanup, enhancement).

**Request Body:**
```json
{
  "experience_id": "<experience-id>",
  "raw_text": "sunset beach so beautiful wow",
  "enhance": true
}
```

**Response:**
```json
{
  "processed_text": "Watched the sunset at the beach. The beauty was overwhelming.",
  "suggested_category": "soul",
  "suggested_quality_score": 9,
  "extracted_themes": ["nature", "beauty", "awe"]
}
```

**What it does:**
1. Uses GPT-4 to clean up raw SMS text
2. Optionally suggests category/quality based on content
3. Extracts themes for auto-tagging
4. Updates experience.processed_text in database

---

### POST /functions/v1/suggest-connections

AI-powered connection suggestions.

**Request Body:**
```json
{
  "entity_type": "experience",
  "entity_id": "<experience-id>",
  "limit": 5
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "to_entity_type": "desire",
      "to_entity_id": "<desire-id>",
      "relationship_type": "manifests",
      "meaning": "This beach sunset experience manifests your desire to 'spend more time in nature'",
      "confidence": 0.85
    },
    {
      "to_entity_type": "experience",
      "to_entity_id": "<other-experience-id>",
      "relationship_type": "related",
      "meaning": "Both experiences involve moments of natural beauty triggering gratitude",
      "confidence": 0.72
    }
  ]
}
```

**What it does:**
1. Fetches entity details + user's connection graph
2. Uses vector embeddings (OpenAI) to find semantically similar entities
3. Uses GPT-4 to generate connection meaning
4. Returns ranked suggestions with confidence scores

---

## 6.5: Error Handling

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body (DELETE)
- `400 Bad Request` - Invalid request body/parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - RLS policy denial (user doesn't own resource)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Unique constraint violation
- `422 Unprocessable Entity` - Validation error (check constraints failed)
- `500 Internal Server Error` - Server error

**Error Response Format (PostgREST):**
```json
{
  "code": "PGRST116",
  "details": "Results contain 0 rows, application expected 1 row",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

**Error Response Format (Edge Functions):**
```json
{
  "error": "Invalid request",
  "message": "Latitude must be between -90 and 90",
  "code": "INVALID_LATITUDE"
}
```

**Frontend Error Handling Strategy:**
1. Use TanStack Query error boundaries
2. Display user-friendly error messages (not raw DB errors)
3. Log errors to Sentry for debugging
4. Retry transient errors (network failures, 500s)
5. Don't retry auth errors (401/403) - redirect to login

---

## 6.6: Rate Limiting

**Supabase Rate Limits (Free Tier):**
- REST API: 500 requests/minute per IP
- Realtime: 200 concurrent connections
- Edge Functions: 500K invocations/month, 500 requests/minute

**Frontend Rate Limiting Strategy:**
- Debounce search queries (300ms)
- Throttle autosave (1 update/2 seconds max)
- Batch connection creation (don't create 10 connections in 10 requests, batch into 1)
- Use optimistic updates to reduce perceived latency
- Implement exponential backoff on retries

**Monitoring:**
- Track rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Show "Slow down" message if approaching rate limit
- Upgrade to Supabase Pro if consistently hitting limits in production

---

