# Core Workflows

This section defines the key user journeys through Reality, showing how data flows from capture through organization to meaning-making via connections.

## 7.1: SMS Capture Flow

**User Goal:** Capture a moment via SMS/MMS without friction

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Phone
    participant Twilio
    participant EdgeFn as Edge Function<br/>(sms-webhook)
    participant Mapbox
    participant Storage as Supabase Storage
    participant DB as PostgreSQL
    participant Realtime as Supabase Realtime
    participant WebApp as Next.js Web App

    User->>Phone: Send SMS/MMS to Reality number
    Phone->>Twilio: SMS: "Amazing sunset!"<br/>+ Photo attachment
    Twilio->>EdgeFn: POST /sms-webhook<br/>{From, Body, MediaUrl}

    EdgeFn->>DB: SELECT user WHERE phone_number = From
    DB-->>EdgeFn: User record

    alt MMS with media
        EdgeFn->>Twilio: Download media from MediaUrl
        Twilio-->>EdgeFn: Image binary
        EdgeFn->>Storage: Upload to bucket<br/>(resize to 1080p, compress)
        Storage-->>EdgeFn: Public URL
    end

    alt SMS has GPS metadata
        EdgeFn->>Mapbox: Reverse geocode (lat, lng)
        Mapbox-->>EdgeFn: "San Francisco, CA"
    end

    EdgeFn->>DB: INSERT INTO experiences<br/>{raw_text, media_urls, location_name, category='abode'}
    DB-->>EdgeFn: Experience ID

    DB->>Realtime: Trigger INSERT event
    Realtime->>WebApp: WebSocket: New experience
    WebApp->>WebApp: Show notification<br/>"New capture in Something's Abode"

    EdgeFn->>Twilio: 200 OK <Response/>
    Twilio->>Phone: Delivery confirmation
```

**Key Points:**
- Zero friction: User just texts normally
- Phone number identifies user (no login on phone)
- Media automatically uploaded and compressed
- GPS metadata extracted if available
- Experience lands in "abode" (inbox) by default
- Real-time notification to web app if user is online
- Entire flow completes in <2 seconds

**Error Handling:**
- Unknown phone number → Edge function responds with "Text SIGNUP to get started"
- Media too large → Compress before upload, warn user via SMS if >10MB original
- Geocoding fails → Store lat/lng only, location_name remains null
- Database insert fails → Retry once, then store in dead letter queue

---

## 7.2: Experience Organization Flow

**User Goal:** Organize captured experiences from inbox (Something's Abode) into categories (Heart/Mind/Body/Soul)

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL
    participant Realtime

    User->>WebApp: Navigate to Something's Abode
    WebApp->>TanStack: useQuery('experiences', {category: 'abode'})
    TanStack->>API: GET /experiences?category=eq.abode
    API->>DB: SELECT * FROM experiences WHERE category='abode'
    DB-->>API: [10 uncategorized experiences]
    API-->>TanStack: Response
    TanStack-->>WebApp: Render experience cards

    User->>WebApp: Drag experience card to "Heart" category
    WebApp->>WebApp: Optimistic update (show in Heart immediately)
    WebApp->>TanStack: useMutation('updateExperience')
    TanStack->>API: PATCH /experiences?id=eq.{id}<br/>{category: 'heart'}
    API->>DB: UPDATE experiences SET category='heart'
    DB-->>API: Updated experience
    API-->>TanStack: Success
    TanStack->>WebApp: Invalidate 'experiences' cache

    WebApp->>User: Show success feedback

    User->>WebApp: Click experience to add quality scores
    WebApp->>User: Show rating modal
    User->>WebApp: Rate quality_score: 9, quality_number: 7
    WebApp->>TanStack: useMutation('updateExperience')
    TanStack->>API: PATCH /experiences?id=eq.{id}<br/>{quality_score: 9, quality_number: 7}
    API->>DB: UPDATE experiences
    DB-->>API: Success
    API-->>TanStack: Updated experience
    WebApp->>User: Close modal, show updated card
```

**Key Points:**
- Optimistic updates for instant feedback
- Drag-and-drop interface for categorization
- Quality ratings added on-demand (not required)
- TanStack Query handles caching and invalidation
- All changes auto-saved (no explicit "Save" button)

**UI States:**
- Loading: Skeleton cards while fetching
- Empty: "Your abode is empty - go capture some moments!"
- Error: Retry button with error message
- Optimistic: Show new state immediately, rollback on error

---

## 7.3: Connection Creation Flow

**User Goal:** Create a connection between two entities to make meaning explicit

**Scenario:** Connecting an Experience to a Desire it fulfilled

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant ConnectionModal as Connection Modal
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL

    User->>WebApp: View Experience details page
    WebApp->>User: Show "Create Connection" button
    User->>WebApp: Click "Create Connection"

    WebApp->>ConnectionModal: Open modal
    ConnectionModal->>User: Show entity type selector
    User->>ConnectionModal: Select "Desire" as target

    ConnectionModal->>TanStack: useQuery('desires', {fulfilled: false})
    TanStack->>API: GET /desires?fulfilled=eq.false
    API->>DB: SELECT * FROM desires WHERE NOT fulfilled
    DB-->>API: [User's unfulfilled desires]
    API-->>TanStack: Response
    TanStack-->>ConnectionModal: Render desire list

    User->>ConnectionModal: Select "Learn piano" desire
    ConnectionModal->>User: Show relationship type selector
    User->>ConnectionModal: Type "fulfills" (autocomplete suggests)

    ConnectionModal->>User: Show meaning textarea
    User->>ConnectionModal: Write: "This first lesson fulfilled my desire to learn piano. The fear is gone."

    User->>ConnectionModal: Click "Create Connection"

    ConnectionModal->>TanStack: useMutation('createConnection')
    TanStack->>API: POST /connections<br/>{<br/>  from_entity_type: 'experience',<br/>  to_entity_type: 'desire',<br/>  from_experience_id,<br/>  to_desire_id,<br/>  relationship_type: 'fulfills',<br/>  meaning: '...',<br/>  strength: 10<br/>}
    API->>DB: INSERT INTO connections
    DB->>DB: Trigger: Increment lifetime_connection_count
    DB-->>API: Connection ID
    API-->>TanStack: Success

    TanStack->>WebApp: Invalidate 'connections' cache
    WebApp->>User: Show connection in graph visualization

    opt User wants to mark desire fulfilled
        User->>WebApp: Click "Mark desire fulfilled"
        WebApp->>TanStack: useMutation('updateDesire')
        TanStack->>API: PATCH /desires?id=eq.{id}<br/>{fulfilled: true, fulfilled_by_experience_id}
        API->>DB: UPDATE desires SET fulfilled=true
        DB->>DB: Trigger: Set fulfilled_at timestamp
        DB-->>API: Success
        API-->>TanStack: Updated desire
        WebApp->>User: Show celebration animation
    end
```

**Key Points:**
- Connection creation is guided (entity type → target → relationship → meaning)
- Autocomplete on relationship types from user's existing vocabulary
- Meaning field is the CORE - emphasized in UI
- Strength is optional (defaults to null)
- Connection graph updates immediately
- Optional: Mark desire fulfilled when creating fulfillment connection

**Connection Creation Variants:**
- **AI-suggested connections:** Pookie suggests → user reviews → accepts/edits/rejects
- **Quick connections:** From graph view, drag entity A onto entity B → auto-open modal
- **Bulk connections:** Select multiple entities → "Connect all to..." → batch create

---

## 7.4: Desire Fulfillment Flow

**User Goal:** Create a desire, break it into dependencies, fulfill them over time

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL
    participant Pookie as Pookie AI (Edge Function)

    User->>WebApp: Navigate to Desires view
    User->>WebApp: Click "New Desire"
    WebApp->>User: Show desire creation form

    User->>WebApp: Enter name: "Learn piano"
    User->>WebApp: Enter why: "Music connects me to Grandma's memory"
    User->>WebApp: Set intensity: 0.8
    User->>WebApp: Click "Create"

    WebApp->>TanStack: useMutation('createDesire')
    TanStack->>API: POST /desires<br/>{name, why, intensity}
    API->>DB: INSERT INTO desires
    DB->>DB: Trigger: Increment lifetime_desire_count
    DB-->>API: Desire ID
    API-->>TanStack: Success
    WebApp->>User: Show desire card

    User->>WebApp: Click "Ask Pookie for help breaking this down"
    WebApp->>Pookie: POST /pookie-chat<br/>{message: "How do I break down 'Learn piano'?", context: {desire_id}}
    Pookie->>DB: Fetch user context (desires, experiences, thoughts)
    DB-->>Pookie: User data
    Pookie->>Pookie: Call OpenAI GPT-4<br/>"Suggest 3-5 dependency desires"
    Pookie-->>WebApp: {<br/>  response: "Here are steps...",<br/>  suggested_desires: [<br/>    {name: "Buy piano", priority: 10},<br/>    {name: "Find teacher", priority: 8},<br/>    {name: "Schedule practice", priority: 5}<br/>  ]<br/>}

    WebApp->>User: Show suggested dependencies
    User->>WebApp: Review, edit, approve suggestions

    loop For each approved dependency
        WebApp->>TanStack: useMutation('createDesire')
        TanStack->>API: POST /desires
        API->>DB: INSERT INTO desires
        DB-->>API: Dependency desire ID

        WebApp->>TanStack: useMutation('createDependency')
        TanStack->>API: POST /desire_dependencies<br/>{desire_id, depends_on_desire_id}
        API->>DB: INSERT INTO desire_dependencies
        DB-->>API: Success
    end

    WebApp->>User: Show dependency graph visualization

    rect rgb(200, 220, 255)
        Note over User,DB: Time passes... user buys piano

        User->>WebApp: Capture experience via SMS: "Bought Grandma's exact piano model!"
        Note over WebApp: (SMS Capture Flow executes)

        User->>WebApp: Navigate to experience details
        User->>WebApp: Create connection: Experience → "Buy piano" desire (fulfills)
        Note over WebApp: (Connection Creation Flow executes)

        User->>WebApp: Mark "Buy piano" desire as fulfilled
        WebApp->>TanStack: useMutation('updateDesire')
        TanStack->>API: PATCH /desires?id=eq.{id}<br/>{fulfilled: true}
        API->>DB: UPDATE desires SET fulfilled=true
        DB-->>API: Success

        WebApp->>WebApp: Check if parent desire "Learn piano" is unblocked
        WebApp->>User: Show notification: "Your desire 'Learn piano' is now unblocked!"
    end
```

**Key Points:**
- Desires can be created standalone or with AI assistance
- Pookie AI suggests dependency breakdown
- Dependency graph visualizes what's blocking what
- Fulfilling dependencies unblocks parent desires
- Experiences can fulfill desires (creates meaning loop)

**Dependency States:**
- **Blocked:** Has unfulfilled dependencies (shown in gray)
- **Active:** No blocking dependencies, not yet fulfilled (shown in blue)
- **Fulfilled:** Marked complete, optionally linked to experience (shown in green)

---

## 7.5: Pookie AI Chat Flow

**User Goal:** Chat with Pookie AI to get insights, suggestions, and connection recommendations

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant ChatUI as Chat Interface
    participant TanStack as TanStack Query
    participant Pookie as Edge Function<br/>(pookie-chat)
    participant DB as PostgreSQL
    participant OpenAI

    User->>WebApp: Click floating Pookie chat button
    WebApp->>ChatUI: Open chat sidebar
    ChatUI->>User: Show chat history (from localStorage)

    User->>ChatUI: Type: "Why do I keep avoiding my piano practice?"
    User->>ChatUI: Press Enter

    ChatUI->>WebApp: Add message to chat history (optimistic)
    ChatUI->>TanStack: useMutation('pookieChat')

    TanStack->>Pookie: POST /pookie-chat<br/>{<br/>  message: "Why do I keep avoiding...",<br/>  context: {<br/>    recent_experiences: [last 10 experience IDs],<br/>    active_desires: [unfulfilled desire IDs],<br/>    connection_suggestions: true<br/>  }<br/>}

    Pookie->>DB: Fetch user context<br/>SELECT experiences, desires, thoughts, connections
    DB-->>Pookie: User data graph

    Pookie->>Pookie: Build OpenAI prompt:<br/>"User has desire 'Learn piano' (intensity 0.8)<br/>Recent thought: 'I feel overwhelmed'<br/>Question: Why avoiding practice?"

    Pookie->>OpenAI: POST /chat/completions<br/>{messages, model: 'gpt-4-turbo', stream: true}

    OpenAI-->>Pookie: Stream response chunks

    loop For each chunk
        Pookie-->>ChatUI: Server-Sent Event (SSE)<br/>{delta: "Fear of failure might be..."}
        ChatUI->>User: Update message in real-time (typewriter effect)
    end

    Pookie->>Pookie: Analyze response + user context<br/>Generate connection suggestions

    Pookie-->>TanStack: {<br/>  response: "Fear of failure might be blocking you...",<br/>  suggested_connections: [<br/>    {<br/>      from: {type: 'thought', id: '...', preview: 'I feel overwhelmed'},<br/>      to: {type: 'desire', id: '...', preview: 'Learn piano'},<br/>      relationship: 'blocks',<br/>      meaning: 'Overwhelm is blocking piano practice',<br/>      confidence: 0.85<br/>    }<br/>  ]<br/>}

    TanStack-->>ChatUI: Complete response
    ChatUI->>User: Show AI response + connection suggestions

    User->>ChatUI: Review connection suggestion
    User->>ChatUI: Click "Accept" on suggestion

    ChatUI->>TanStack: useMutation('createConnection')
    TanStack->>API: POST /connections<br/>{...suggestion data}
    API->>DB: INSERT INTO connections
    DB-->>API: Connection ID
    API-->>TanStack: Success

    ChatUI->>User: Show "Connection created!" confirmation
    ChatUI->>User: Update chat: "Great! I've added that connection to your reality."
```

**Key Points:**
- Streaming responses for fast perceived performance
- Pookie has full context (experiences, thoughts, desires, connections)
- AI suggests connections based on conversation
- User can accept/reject/edit AI suggestions
- Chat history persisted in localStorage (not database for privacy)
- Pookie's suggestions improve as user's reality graph grows

**Pookie Capabilities:**
- Answer questions about patterns ("Why do I keep...?")
- Suggest connections between entities
- Break down desires into dependencies
- Reflect on emotional themes in experiences
- Help categorize experiences
- Identify blocking beliefs via thought analysis

---

## 7.6: Knowledge Graph Exploration Flow

**User Goal:** Visually explore the web of connections in their reality

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant Graph as D3.js Graph View
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL

    User->>WebApp: Navigate to "Connections" view
    WebApp->>Graph: Initialize D3.js force-directed graph

    Graph->>TanStack: useQuery('connectionGraph', {depth: 2})
    TanStack->>API: POST /rpc/get_connection_graph<br/>{max_depth: 2, user_id}
    API->>DB: Recursive CTE query:<br/>WITH RECURSIVE graph AS (<br/>  SELECT experiences, thoughts, desires, connections<br/>  WHERE user_id = ...<br/>  UNION<br/>  SELECT connected entities up to depth 2<br/>)
    DB-->>API: Graph data (nodes + edges)
    API-->>TanStack: {<br/>  nodes: [<br/>    {id, type: 'experience', label, color},<br/>    {id, type: 'thought', label, color},<br/>    {id, type: 'desire', label, color}<br/>  ],<br/>  edges: [<br/>    {from, to, relationship, meaning, strength}<br/>  ]<br/>}

    TanStack-->>Graph: Render graph
    Graph->>Graph: Apply force simulation<br/>(attract/repel nodes)
    Graph->>User: Show interactive graph

    User->>Graph: Hover over node
    Graph->>User: Highlight connected nodes + edges<br/>Show tooltip: entity details

    User->>Graph: Click on Experience node
    Graph->>WebApp: Select node
    WebApp->>User: Show detail panel on right
    WebApp->>TanStack: useQuery('experience', {id})
    TanStack->>API: GET /experiences?id=eq.{id}&select=*
    API->>DB: SELECT * FROM experiences
    DB-->>API: Experience details
    API-->>TanStack: Response
    TanStack-->>WebApp: Render details

    User->>WebApp: Click "Show connections" in detail panel
    WebApp->>TanStack: useQuery('entityConnections', {type: 'experience', id})
    TanStack->>API: GET /connections?from_experience_id=eq.{id}&select=*
    API->>DB: SELECT * FROM connections
    DB-->>API: [All connections from this experience]
    API-->>TanStack: Response
    TanStack-->>WebApp: Render connection list

    User->>Graph: Drag node to new position
    Graph->>Graph: Update force simulation<br/>Pin node at new location
    Graph->>User: Graph reorganizes around pinned node

    User->>WebApp: Click "Add connection from this node"
    WebApp->>User: Open connection creation modal<br/>(pre-filled with current node as source)
    Note over User,DB: (Connection Creation Flow executes)

    WebApp->>Graph: Invalidate graph cache
    Graph->>Graph: Re-fetch and re-render with new connection
```

**Key Points:**
- D3.js force-directed graph for organic visualization
- Nodes colored by entity type (experiences blue, thoughts purple, desires orange)
- Edge thickness = connection strength
- Interactive: hover, click, drag, zoom, pan
- Detail panel shows entity details + connections list
- Can create new connections directly from graph
- Graph updates in real-time when connections added

**Graph Filtering:**
- Filter by entity type (show only experiences)
- Filter by category (show only "soul" experiences)
- Filter by date range (experiences in last 30 days)
- Filter by connection strength (only strong connections >7)
- Search nodes by text content

**Performance Optimizations:**
- Limit initial graph to 100 most recent/connected nodes
- Lazy load additional nodes on expansion ("Show more connections")
- Debounce force simulation updates
- Use canvas rendering for >500 nodes (instead of SVG)

---

## 7.7: Timeline View Flow

**User Goal:** View experiences chronologically on a timeline

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant Timeline as Timeline Component
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL

    User->>WebApp: Navigate to "Timeline" view
    WebApp->>Timeline: Initialize timeline component

    Timeline->>TanStack: useQuery('experiencesTimeline', {<br/>  start: '2025-01-01',<br/>  end: '2025-12-31'<br/>})
    TanStack->>API: GET /experiences?<br/>captured_at=gte.2025-01-01&<br/>captured_at=lte.2025-12-31&<br/>order=captured_at.asc
    API->>DB: SELECT * FROM experiences<br/>WHERE captured_at BETWEEN ... ORDER BY captured_at
    DB-->>API: [Experiences in date range]
    API-->>TanStack: Response
    TanStack-->>Timeline: Render timeline

    Timeline->>User: Show experiences as events on timeline<br/>(positioned by captured_at)

    User->>Timeline: Click on experience event
    Timeline->>WebApp: Open experience detail modal
    WebApp->>User: Show experience details + connections

    User->>Timeline: Scroll to earlier dates
    Timeline->>Timeline: Detect scroll past threshold
    Timeline->>TanStack: useInfiniteQuery('experiencesTimeline', {<br/>  fetchNextPage<br/>})
    TanStack->>API: GET /experiences?<br/>captured_at=lt.2024-12-31&<br/>limit=20
    API->>DB: SELECT * FROM experiences<br/>LIMIT 20 OFFSET 20
    DB-->>API: [Next 20 experiences]
    API-->>TanStack: Response
    TanStack-->>Timeline: Append to timeline
    Timeline->>User: Show older experiences seamlessly

    User->>Timeline: Filter by category: "heart"
    Timeline->>TanStack: Refetch with filter
    TanStack->>API: GET /experiences?<br/>category=eq.heart&<br/>captured_at=gte.2025-01-01
    API->>DB: SELECT * WHERE category='heart'
    DB-->>API: [Heart experiences only]
    API-->>TanStack: Response
    Timeline->>User: Show filtered timeline
```

**Key Points:**
- Chronological visualization of life events
- Infinite scroll for loading older experiences
- Events positioned by `captured_at` timestamp
- Filter by category, quality score, tags
- Click event to view details
- Zoom controls (year/month/day view)

**Timeline Features:**
- **Density indicators:** Show clusters of high activity (many captures in short time)
- **Quality gradient:** Event markers colored by quality_score (dark to bright)
- **Connection lines:** Show connections between timeline events
- **Milestone markers:** Highlight desire fulfillments on timeline

---

## 7.8: Map View Flow

**User Goal:** View experiences spatially on a map

**Flow:**

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Next.js Web App
    participant Map as Mapbox GL JS
    participant TanStack as TanStack Query
    participant API as Supabase REST API
    participant DB as PostgreSQL

    User->>WebApp: Navigate to "Map" view
    WebApp->>Map: Initialize Mapbox map
    Map->>User: Show world map centered on user's timezone location

    Map->>TanStack: useQuery('experiencesWithLocation')
    TanStack->>API: GET /experiences?<br/>latitude=not.is.null&<br/>longitude=not.is.null&<br/>select=id,latitude,longitude,category,quality_score,raw_text
    API->>DB: SELECT * FROM experiences<br/>WHERE latitude IS NOT NULL
    DB-->>API: [All experiences with location]
    API-->>TanStack: Response
    TanStack-->>Map: Render markers

    loop For each experience
        Map->>Map: Add marker at (lat, lng)<br/>Color by category<br/>Size by quality_score
    end

    Map->>User: Show experience markers on map

    User->>Map: Click on marker
    Map->>WebApp: Show popup with experience preview
    WebApp->>User: Display: raw_text preview + photo thumbnail

    User->>WebApp: Click "View details" in popup
    WebApp->>User: Open experience detail panel

    User->>Map: Pan to new area (e.g., Europe)
    Map->>Map: Detect viewport change
    Map->>TanStack: Refetch visible experiences
    Note over Map,DB: Optional: Only load experiences in viewport<br/>for performance with >1000 experiences

    User->>Map: Toggle layer: "Show connections on map"
    Map->>TanStack: useQuery('connections', {<br/>  entity_types: ['experience']<br/>})
    TanStack->>API: GET /connections?<br/>from_entity_type=eq.experience&<br/>to_entity_type=eq.experience
    API->>DB: SELECT * FROM connections
    DB-->>API: [Experience-to-experience connections]
    API-->>TanStack: Response

    Map->>Map: Draw lines between connected experiences<br/>(arc between lat/lng coordinates)
    Map->>User: Show connection web overlaid on map
```

**Key Points:**
- Mapbox GL JS for high-performance map rendering
- Markers colored by category, sized by quality_score
- Clustering for dense areas (many experiences in same location)
- Click marker for quick preview, double-click for details
- Optional: Draw connections between experiences on map
- Filter by category, date range, quality

**Map Interactions:**
- **Zoom:** Cluster markers at low zoom, individual at high zoom
- **Popup:** Click marker → show experience preview
- **Heatmap mode:** Show density of experiences (where you spend time)
- **Journey mode:** Connect experiences chronologically with paths

---

## 7.9: Workflow Summary

**The Complete Cycle:**

1. **Capture** (SMS Flow) → Experience lands in Something's Abode
2. **Organize** (Organization Flow) → Move to Heart/Mind/Body/Soul, add ratings
3. **Reflect** (Thought Creation) → Add thoughts on experiences/desires
4. **Connect** (Connection Flow) → Link experiences/thoughts/desires to create meaning
5. **Desire** (Desire Flow) → Create goals, break into dependencies, fulfill via experiences
6. **Explore** (Graph/Timeline/Map) → Navigate your reality spatially, temporally, relationally
7. **Insight** (Pookie Chat) → Get AI help understanding patterns and suggesting connections

**Each workflow feeds into the next, creating the infinite loop of meaning-making:**
- Experiences generate Thoughts
- Thoughts reveal Desires
- Desires drive action (outside system)
- Actions become Experiences
- Connections make all relationships explicit
- Understanding these connections IS solving the mind

---

