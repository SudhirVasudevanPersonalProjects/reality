# Epic 2 Brainstorming - Multidimensional Abode System

**Date:** 2025-11-04 (Updated)
**Status:** Ready for Story 2.4
**Purpose:** Build separate Physical and Mind abode layers with care-based organization

---

## Core Philosophy: The Shawarma Pole - Layered Reality

Reality exists as **separate layers** stacked on an infinite vertical pole:

```
          ∞ (unbounded above)
          │
    ┌─────────────┐
    │   MIND'S    │  ← Inner abode (thoughts, knowledge, concepts)
    │   ABODE     │
    ├─────────────┤
    │  PHYSICAL   │  ← Outer abode (locations, experiences, events)
    │   ABODE     │
    └─────────────┘
          │
          ▼
```

**Key Principles:**
- **Physical & Mind are SEPARATE** - don't worry about inter-layer connections (for now)
- **Heart is an ATTRIBUTE** - care rating (1-5) applies to both layers
- **Time is an ATTRIBUTE** - captured_at connects all points across layers
- Each layer has its own visualization and organization rules

---

## The Two Abode Layers

### **Physical Abode (Body's Layer)**

**What it maps:** Outer reality - locations, places, experiences in physical space

**Data Structure:**
```typescript
{
  abode_type: 'physical',
  latitude: number,
  longitude: number,
  location_name: string,
  elevation?: number,  // optional, nice-to-have
  visited: boolean,    // marks location as unlocked
  care: 1-5,          // Ugly (1) → Beautiful (5)
  captured_at: timestamp
}
```

**Visualization:**
- **Map View** (`/my_reality`): 2D Mapbox map with markers
- Locations appear as markers when visited
- Click marker → Shows list of experiences at that location (timeline)
- Care-based brightness: Ugly=dim/grey, Beautiful=bright/colorful
- **Future:** 3D globe transition, building-level detail, elevation display

**Organization:**
- User searches location (e.g., "La Jolla Papa Johns" via Google search)
- System captures lat/lng, location_name
- User rates care (1-5: Ugly → Beautiful)
- Location marked as visited (appears on map)

---

### **Mind's Abode (Inner Layer)**

**What it maps:** Inner reality - thoughts, knowledge, concepts, reflections

**Data Structure:**
```typescript
{
  abode_type: 'mind',
  text_content: string,
  media?: array,
  related_location_id?: uuid,  // optional link to physical location
  care: 1-5,                   // Hate (1) → Love (5)
  tags: string[],              // #insight, #conservation, etc.
  captured_at: timestamp
}
```

**Visualization:**
- **Mind Card View** (`/mind/{id}`): Pokémon card style
  - **Top Section:** Main content (text, media)
  - **Bottom Section:** Attributes as stats
    - Time (captured_at)
    - Care (★★★★☆)
    - Physical Location (if linked) - clickable
    - Tags (#conservation, #beauty)
    - Connections (future)
- **Mind List View** (`/mind`): Grid/list of all thoughts
  - Filter by care, tags, has-location, time range
  - Card preview with care-based brightness

**Organization:**
- User captures thought/reflection
- Optional: Link to physical location
- User rates care (1-5: Hate → Love)
- User adds tags (#insight, #philosophy)

---

## Heart as Attribute (Not a Separate Layer)

**The Care Scale** - Universal emotional response attribute:

```
1 = Hate     (darkest - ugly)      ← Physical: Ugly place
2 = Dislike  (dark)                ← Mind: Disliked thought
3 = Care     (neutral)             ← Neither beauty nor ugly
4 = Like     (bright)              ← Physical: Nice place
5 = Love     (brightest)           ← Mind: Profound insight
```

**Key Insight:** Heart is like Time - it's a **function/attribute** of points in other abodes, not a separate space visualization (for now).

**Care Frequency:** Tracks repetition (how often you encounter/note this)
- Physical: Return visits to location
- Mind: Recurring thoughts/ideas
- Stored as `care_frequency` integer (default: 1)

---

## Time as Universal Attribute

**Every something has `captured_at` timestamp** - this is the thread connecting all abodes.

**Timeline View** (future, separate from abode views):
- Linear time axis (zoomable: year → month → day → hour)
- Shows somethings from ALL layers on single timeline
- Each point links to its visualization in Physical/Mind layer
- Like a master index connecting the multidimensional spaces

---

## Physical ↔ Mind Navigation Pattern

### **Physical Map → Mind Experiences**

**User clicks "SD Zoo" marker on physical map:**

```
┌─────────────────────────────────────────┐
│  San Diego Zoo                          │
│  32.7353°N, 117.1490°W                  │
├─────────────────────────────────────────┤
│  🗓️ Experiences at this location:       │
│                                         │
│  📍 2020-03-15                          │
│  "First visit with Sarah, saw pandas"  │
│  Care: ★★★★★ (Love)                     │
│  [View Mind Card]                       │
│                                         │
│  📍 2025-01-10                          │
│  "Return visit, memories flooded back"  │
│  Care: ★★★★☆ (Like)                     │
│  [View Mind Card]                       │
└─────────────────────────────────────────┘
```

**Clicking [View Mind Card] → Opens Pokémon-style card view**

---

### **Mind Card → Physical Location**

**Pokémon Card Style:**

```
┌─────────────────────────────────────────┐
│ ╔═══════════════════════════════════╗   │
│ ║  MIND EXPERIENCE                  ║   │
│ ╚═══════════════════════════════════╝   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ "First visit with Sarah,          │  │
│  │  saw pandas. They were so         │  │
│  │  peaceful. Made me think about    │  │
│  │  conservation and how we protect  │  │
│  │  what we love."                   │  │
│  │                                   │  │
│  │ [Photo: Panda sleeping]           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ─────────── ATTRIBUTES ─────────────   │
│                                         │
│  🕐 Time: March 15, 2020, 2:30 PM       │
│  ❤️  Care: ★★★★★ (Love)                │
│  📍 Location: San Diego Zoo             │
│      32.7353°N, 117.1490°W             │
│      [View on Map] ← Clickable         │
│  🏷️  Tags: #conservation #animals       │
│  🔗 Connections: 2 related thoughts     │
│                                         │
│  [Edit] [Connect] [Delete]              │
└─────────────────────────────────────────┘
```

**Clicking [View on Map] → Opens Physical Map zoomed to SD Zoo marker**

---

## Simplified Database Schema (MVP)

```sql
-- Core table for ALL somethings
CREATE TABLE somethings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  text_content TEXT,
  media JSONB,  -- [{ type: 'photo'|'video', url, ... }]

  -- Layer Assignment (Physical vs Mind)
  abode_type TEXT CHECK (abode_type IN ('physical', 'mind')),

  -- Physical Layer Attributes (if abode_type='physical')
  latitude DECIMAL,
  longitude DECIMAL,
  location_name TEXT,
  elevation DECIMAL,
  visited BOOLEAN DEFAULT true,

  -- Mind Layer Attributes (if abode_type='mind')
  related_location_id UUID REFERENCES somethings(id),  -- Link to physical

  -- Universal Attributes (both layers)
  care INT CHECK (care BETWEEN 1 AND 5),
  care_frequency INT DEFAULT 1,
  captured_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Future
  parent_id UUID REFERENCES somethings(id) ON DELETE CASCADE,
  attributes JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_somethings_user_abode ON somethings(user_id, abode_type);
CREATE INDEX idx_somethings_location ON somethings(user_id, latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_somethings_time ON somethings(user_id, captured_at);
CREATE INDEX idx_somethings_related_location ON somethings(related_location_id) WHERE related_location_id IS NOT NULL;

-- Tags system
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  UNIQUE(user_id, name)
);

CREATE TABLE something_tags (
  something_id UUID REFERENCES somethings(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (something_id, tag_id)
);

-- RLS policies
ALTER TABLE somethings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own somethings"
  ON somethings FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE something_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own something_tags"
  ON something_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM somethings
      WHERE somethings.id = something_tags.something_id
      AND somethings.user_id = auth.uid()
    )
  );
```

**Key Simplifications:**
- ❌ No `realms` table (Reality/Mind/Heart as hierarchy)
- ❌ No `domains` table (custom navigation tabs - defer to future)
- ❌ No `categories` table (hierarchical organization - defer to future)
- ❌ No realm extension tables (`my_reality`, `thoughts`, `cares`)
- ✅ Single `somethings` table with `abode_type` discriminator
- ✅ Simple tags system for cross-cutting labels
- ✅ Physical and Mind attributes in same table (nullable based on type)

---

## The Chamber of Reflection - Organization Portal

**Concept:** The Chamber is the liminal space where unorganized captures are transformed into structured elements of your reality.

**Philosophy:** Organization is personal, intuitive, feeling-based. Only you know whether a capture is Physical or Mind, and how you feel about it.

### Chamber Entry (Dashboard)

```
┌─────────────────────────────────────────────────┐
│             My Reality Dashboard                │
├─────────────────────────────────────────────────┤
│                                                 │
│           ┌─────────────────────────┐           │
│           │  ✨ GEMSTONE BUTTON ✨  │           │
│           │                         │           │
│           │  Enter the Chamber of   │           │
│           │     Reflection          │           │
│           │                         │           │
│           │ (sparkly, engraved)     │           │
│           └─────────────────────────┘           │
│                                                 │
│              47+ unorganized                    │
│                                                 │
│  ─────────────────────────────────────────────  │
│  (Below: Organized content - Timeline/Map)      │
└─────────────────────────────────────────────────┘
```

**Dashboard Shows:**
- Gemstone "Enter the Chamber" button (centered)
- Unorganized count (somethings WHERE abode_type IS NULL)
- Organized content only (abode_type IS NOT NULL)

---

### Chamber UI (Slideshow Organization)

```
┌─────────────────────────────────────────────────┐
│           Chamber of Reflection                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Current Something]                            │
│  Text: "Coffee with Sarah at Philz downtown"    │
│  Media: [photo1.jpg]                            │
│  Captured: Nov 1, 2025 3:45 PM                  │
│                                                 │
│  ───────────────────────────────────────────    │
│                                                 │
│  This is a:                                     │
│  ○ Physical Experience (location-based)         │
│  ○ Mind Experience (thought/reflection)         │
│                                                 │
│  ─── IF PHYSICAL ───                            │
│  📍 Location: [Search locations...]             │
│  ❤️  Care: 😞 ⚫⚫⚫⚪⚪ 😍  (Ugly → Beautiful)   │
│                                                 │
│  ─── IF MIND ───                                │
│  📍 Related Location: [Optional - link to map]  │
│  ❤️  Care: 😞 ⚫⚫⚫⚪⚪ 😍  (Hate → Love)        │
│  🏷️  Tags: [#coffee #social] + Add             │
│                                                 │
│  [ ] Split this into multiple somethings?       │
│                                                 │
│  [Skip] [Organize & Continue]                   │
└─────────────────────────────────────────────────┘
```

**Organization Controls:**
1. **Physical or Mind?** - Radio buttons (required)
2. **If Physical:**
   - Location search (captures lat/lng, name)
   - Care slider (1-5: Ugly → Beautiful)
3. **If Mind:**
   - Optional location link (dropdown of user's physical locations)
   - Care slider (1-5: Hate → Love)
   - Tags input (#insight, #philosophy, etc.)
4. **Split checkbox** (optional) - User decides if this is one thing or many

---

## The Flow: Capture → Chamber → Abodes

### Step 1: Capture (Frictionless)
```
User on /capture page
  ↓
Types/uploads content
  ↓
Submits
  ↓
Creates somethings record:
  - text_content, media
  - abode_type: NULL (unorganized)
  - care: NULL
  - captured_at: now()
  ↓
NO REDIRECT - stays on /capture
```

### Step 2: Enter Chamber
```
User on dashboard
  ↓
Sees gemstone button + "47+ unorganized"
  ↓
Clicks "Enter the Chamber"
  ↓
/chamber loads first unorganized something (oldest)
```

### Step 3: Organize
```
User sees unorganized something
  ↓
Chooses: Physical or Mind?
  ↓
IF Physical:
  - Search location → capture lat/lng, name
  - Rate care (Ugly → Beautiful)
  - Mark visited
  ↓
IF Mind:
  - Optional: Link to physical location
  - Rate care (Hate → Love)
  - Add tags
  ↓
Optional: Split into multiple
  ↓
Clicks "Organize & Continue"
  ↓
Updates somethings:
  - abode_type: 'physical' or 'mind'
  - latitude, longitude, location_name (if physical)
  - related_location_id, tags (if mind)
  - care: 1-5
  - captured_at (can adjust)
  ↓
Fetches next unorganized something
```

### Step 4: View in Abodes
```
Organized somethings appear in:

Physical Abode:
  - /my_reality map with markers
  - Click marker → Experience list
  - Click experience → Mind card (if mental)

Mind Abode:
  - /mind list/grid view
  - Click card → Full Pokémon-style card
  - Click location attribute → Physical map
```

---

## Visual Brightness Formula

```typescript
function calculateBrightness(care: number): number {
  // Care 1-5 maps to brightness 0.0-1.0
  // 1 (Hate/Ugly) → 0.0 (darkest)
  // 3 (Neutral)   → 0.5 (medium)
  // 5 (Love/Beauty) → 1.0 (brightest)
  return (care - 1) / 4;
}

// Apply to markers/cards
const brightness = calculateBrightness(something.care);
element.style.opacity = brightness;
element.style.backgroundColor = `hsl(0, 0%, ${brightness * 100}%)`;
```

---

## Epic 2 Story Breakdown (Revised)

### **✅ Completed Stories**

**Story 2.1: Database Schema Evolution** (Status: Ready for Review)
- Created somethings table (captures → somethings rename)
- Added realm/domain/category system (will deprecate in favor of abode_type)
- Created extension tables (will simplify to single table)
- **Needs migration update** to match new simplified schema

**Story 2.2: Chamber of Reflection Foundation** (Status: Done)
- Chamber route `/chamber` with slideshow UI
- Gemstone button on dashboard
- Unorganized counter
- Dashboard filters organized only
- Split checkbox (UI foundation)

**Story 2.3: Physical Map View Foundation** (Status: Done)
- `/my_reality` route with 3D globe → 2D map
- Grey/grayscale Mapbox style
- Zoom levels, map controls
- No data connection yet

---

### **🚧 Remaining Stories**

**Story 2.4: Chamber Organization - Physical vs Mind Selection** ⭐ **NEXT**
- Add "Physical or Mind?" toggle in Chamber
- Conditional UI: Show location search if Physical, hide if Mind
- Show tags input if Mind, hide if Physical
- Care slider with context labels (Ugly→Beautiful vs Hate→Love)
- Save abode_type on organize
- Update "Organize & Continue" to save and fetch next unorganized

**Story 2.5: Physical Location Capture & Organization**
- Location search input (Google Places API integration - OPTIONAL)
- Manual location entry (text input for location name)
- Capture lat/lng from search OR manual geocoding lookup
- Elevation capture (optional)
- Care slider (1-5: Ugly → Beautiful)
- Mark as visited (boolean flag)
- Save to somethings with abode_type='physical'

**Story 2.6: Mind Thought Capture & Organization**
- Mind-specific Chamber UI (text content primary)
- Optional: Link to existing physical location (dropdown)
- Care slider (1-5: Hate → Love)
- Tags input with autocomplete (#conservation, #insight, etc.)
- Create tags on-the-fly if don't exist
- Save to somethings with abode_type='mind'

**Story 2.7: Physical Map - 3D Buildings, Markers & Experience List**
- **3D Bird's Eye View**: pitch=45°, bearing=-17.6°, antialias=true
- **3D Building Layer**: fill-extrusion with real building heights (opacity 0.6)
- Query: SELECT * FROM somethings WHERE realm='physical' AND latitude IS NOT NULL
- Display as markers on 3D map (rendered above buildings)
- Care-based marker brightness/glow (1=dim grey, 5=bright glowing)
- Click marker → Show modal with experience list grouped by time
- Each experience: timestamp, preview text, care rating, [View Mind Card] button
- Responsive: Desktop modal, mobile bottom sheet
- Map controls: Zoom, rotate, tilt (user can adjust perspective)

**Story 2.8: Mind Card View (Pokémon Card Style)**
- New route: `/mind/[id]` (dynamic route)
- Top section: Content display (text, media gallery)
- Bottom section: Attributes card
  - Time (formatted timestamp)
  - Care (★★★★☆ visual + label)
  - Physical Location (if linked) - clickable link to map
  - Tags (colored chips)
  - Connections count (future)
- Edit/Delete buttons
- Navigation: Previous/Next mind experiences

**Story 2.9: Mind List/Grid View**
- Route: `/mind` (index page)
- Display all somethings WHERE abode_type='mind'
- Card grid layout (responsive)
- Each card: Preview content, care stars, tags, timestamp
- Care-based brightness on cards
- Filters: Care range, tags, has-location, time range
- Sort: Recent, Care (high→low), Captured date
- Click card → Navigate to full Mind card view (Story 2.8)

**Story 2.10: Physical→Mind Navigation (Web Zoom)**
- Physical Map marker click → Experience list modal
- Each experience has [View Mind Card] button
- Click → Navigate to `/mind/[id]` with breadcrumb context
- Breadcrumb: Physical Map > SD Zoo > 2020-03-15 Experience
- Back button returns to map with marker highlighted

**Story 2.11: Split Workflow Implementation** (OPTIONAL - can defer)
- Split modal component
- Text splitter: Manual line selection for multi-line text
- Photo assigner: Drag photos to split groups
- Split API: POST /api/somethings/{id}/split
- Creates child somethings with parent_id
- Original marked as split (metadata flag)

---

## Success Criteria for Epic 2

**Epic 2 is complete when:**
- ✅ Users can organize unorganized captures into Physical or Mind
- ✅ Physical somethings appear as markers on map with care brightness
- ✅ Mind somethings appear in grid/list with Pokémon card view
- ✅ Clicking Physical map marker shows experience list
- ✅ Clicking experience opens Mind card view
- ✅ Mind cards show location attribute that links back to map
- ✅ Tags work for Mind somethings (create, assign, filter)
- ✅ Care rating applies to both layers with appropriate context
- ✅ Chamber provides clear Physical vs Mind organization workflow

**Visual Result:**
A **dual-layer reality map** showing:
- **Physical Layer**: Map with visited locations, care-based brightness (ugly→beautiful)
- **Mind Layer**: Thought collection with Pokémon cards, care-based brightness (hate→love)
- **Navigation**: Seamless travel between layers via location links
- **Attributes**: Time and care connect all points across layers

---

## Technology Stack Decisions (2025-11-04)

### **Geocoding Strategy: Mapbox + Future LLM Layer**

**Decision**: Use Mapbox Geocoding API for MVP, enhance with LLM in Epic 4

**Architecture**:
```
User Query → [LLM Intelligence Layer] → Address String → [Mapbox Geocoding] → Lat/Lng → [Database Storage] → [Mapbox GL JS Rendering]
```

**Rationale**:

1. **Mapbox Geocoding (Story 2.5 - Now)**
   - **Strengths**:
     - Excellent for addresses/landmarks (95% accuracy)
     - 50,000 free requests/month (vs Google's 1,000)
     - Already integrated (using Mapbox for map rendering)
     - Simple API: address string → coordinates
   - **Limitations**:
     - Weak business POI database (~50M vs Google's 200M+)
     - No business metadata (hours, ratings, photos)
     - Struggles with vague queries ("that pizza place")
   - **Cost**: FREE for MVP scale (up to 50k geocodes/month)

2. **LLM Enhancement Layer (Epic 4 - Future)**
   - **How it works**:
     - User: "that pizza place near UCSD I went to last week"
     - LLM: Web searches "pizza near UCSD" + analyzes user history
     - LLM: Suggests "Did you mean Papa Johns on Villa La Jolla Dr?"
     - User confirms → LLM formats address for Mapbox
     - Mapbox geocodes clean address → Returns coordinates
   - **Advantages over Google Places**:
     - ✅ Contextual memory (knows YOUR history)
     - ✅ Natural language understanding ("that spot where I proposed")
     - ✅ Real-time web search (finds new businesses)
     - ✅ Reasoning chain (infers ambiguous queries)
   - **Cost**: ~$0.0003/query (Claude API calls)

3. **Why NOT Google Places API**:
   - ❌ Expensive: $0.017/request (17x more than Mapbox)
   - ❌ Limited free tier: 1,000/month (vs Mapbox 50,000)
   - ❌ Vendor lock-in (place_id system)
   - ❌ No contextual understanding (doesn't know user's history)
   - ✅ Better for: Business directory apps (Yelp clones)
   - ❌ Overkill for: Personal memory mapping

**Use Case Fit**:
- ✅ Users capture PERSONAL memories (not business reviews)
- ✅ Meaning comes from text_content + media (not POI metadata)
- ✅ "Beach where I proposed" > "Yelp rating of beach"
- ✅ LLM can provide Google-level intelligence without Google costs

**Total Cost Comparison** (1,000 users × 10 locations/month):
- Mapbox only: $0 (within free tier)
- Mapbox + LLM: $3-5/month (LLM calls)
- Google Places: $153/month (9,000 paid requests)

---

### **3D Rendering Strategy: Mapbox GL JS**

**Decision**: Use Mapbox GL JS for all 3D visualization (NOT Google Street View)

**Capabilities**:

1. **3D Globe View** (Epic 8 - Future)
   ```typescript
   map.setProjection('globe') // Spinning 3D Earth
   map.setFog({ ... }) // Atmospheric glow
   ```

2. **3D Terrain/Elevation** (Epic 8 - Future)
   ```typescript
   map.setTerrain({
     source: 'mapbox-dem',
     exaggeration: 1.5 // Mountains, valleys in 3D
   })
   ```

3. **3D Buildings** (Building-Level Detail - **REQUIRED for Story 2.7**)
   ```typescript
   // Bird's eye view with tilted camera
   const map = new mapboxgl.Map({
     container: 'map',
     style: 'mapbox://styles/mapbox/dark-v11', // Or light-v11
     center: [-117.2147, 32.8704], // User's location
     zoom: 15.5,
     pitch: 45,        // Tilt camera 45° (bird's eye, not top-down)
     bearing: -17.6,   // Rotate view slightly
     antialias: true   // Smooth 3D edges
   })

   // Add 3D building extrusions
   map.on('style.load', () => {
     const labelLayerId = layers.find(
       (layer) => layer.type === 'symbol' && layer.layout['text-field']
     ).id

     map.addLayer({
       id: 'add-3d-buildings',
       source: 'composite',
       'source-layer': 'building',
       filter: ['==', ['get', 'extrude'], true],
       type: 'fill-extrusion',
       minzoom: 15,
       paint: {
         'fill-extrusion-color': '#aaa',
         'fill-extrusion-height': [
           'interpolate', ['linear'], ['zoom'],
           15, 0,
           15.05, ['get', 'height'] // Real building heights
         ],
         'fill-extrusion-base': [
           'interpolate', ['linear'], ['zoom'],
           15, 0,
           15.05, ['get', 'min_height']
         ],
         'fill-extrusion-opacity': 0.6
       }
     }, labelLayerId)
   })
   ```
   **Result**: Bird's eye 3D city view (like SimCity/video game)
   **CRITICAL**: This is the PRIMARY visualization mode (not optional polish)

4. **Custom 3D Markers** (Epic 8 - Future)
   - Replace 2D pins with 3D gem models (GLB/GLTF format)
   - Care-based glow: 1=dim grey, 5=glowing diamond
   - Matches Chamber aesthetic

**What Mapbox DOESN'T Have**:
- ❌ Google Street View (360° photo spheres)
- ❌ Photo-based street navigation

**Street View Alternative** (Optional - Epic 8):
- Use Google Street View API on-demand only
- Free: Map navigation (Mapbox 3D buildings)
- Paid: Street photos (load when user clicks "View Street Level")
- Cost optimization: 90% users never load it

**Cost**: All Mapbox 3D features FREE (included in GL JS, no extra charges)

---

### **Story 2.5 Technical Scope**

**Goal**: Capture and store geographic coordinates for Physical somethings

**What Story 2.5 Adds**:
- Mapbox Geocoding Autocomplete (user searches → coordinates)
- Database storage: `latitude`, `longitude`, `location_name`
- Manual text entry fallback (if no autocomplete match)
- Validation: lat (-90 to 90), lng (-180 to 180)

**What Story 2.5 DEFERS**:
- ❌ Elevation capture (add in Epic 8 if needed)
- ❌ 3D rendering (Story 2.7 does 3D buildings + markers)
- ❌ LLM enhancement (Epic 4)
- ❌ Street View integration (Epic 8 polish, optional)

**Data Flow**:
```
Chamber Organization UI (Story 2.4)
  ↓ User selects "Physical Experience"
Mapbox Autocomplete Input (Story 2.5)
  ↓ User types "La Jolla Cove"
Mapbox Geocoding API
  ↓ Returns { lat: 32.8509, lng: -117.2713, name: "La Jolla Cove" }
Database UPDATE
  ↓ somethings SET latitude=32.8509, longitude=-117.2713, location_name='La Jolla Cove'
Physical Map Rendering (Story 2.7)
  ↓ SELECT * FROM somethings WHERE realm='physical'
Mapbox GL JS Map
  ↓ Render marker at coordinates with care-based brightness
```

---

## Story 2.4 → 2.5 Connection & Technical Handoff

### **Story 2.4 Delivered (Complete)**

**What Works**:
- ✅ Physical/Mind radio button toggle in Chamber UI
- ✅ Care slider with context-appropriate labels (Ugly→Beautiful vs Hate→Love)
- ✅ Text-only location input (`app/components/LocationInput.tsx`)
- ✅ Organization API endpoint (`/api/somethings/[id]/organize`)
- ✅ Saves `realm='physical'`, `location_name` (text), `care` (1-5)

**Intentional Gap (By Design)**:
```typescript
// Story 2.4 creates this data structure:
{
  realm: "physical",
  location_name: "Papa Johns",  // ✅ Text from user input
  care: 4,                       // ✅ Care rating
  latitude: null,                // ❌ NOT CAPTURED (Story 2.5)
  longitude: null                // ❌ NOT CAPTURED (Story 2.5)
}
```

**From Story 2.4 AC2**: "When Physical selected, show location input field (**text input for now, prepare for future geocoding**)"

### **Story 2.5 Mission: Geographic Precision**

**Upgrade Path**:
```typescript
// BEFORE Story 2.5 (Story 2.4 data):
location_name: "Papa Johns"  // Just text, not mappable

// AFTER Story 2.5 (geocoded data):
location_name: "Papa Johns"
latitude: 32.870427          // ✅ Mapbox geocoding
longitude: -117.214683       // ✅ Mapbox geocoding
formatted_address: "8657 Villa La Jolla Dr, La Jolla, CA"
```

### **Technical Debt Items**

| Item | Story 2.4 Status | Story 2.5 Resolution |
|------|------------------|----------------------|
| **Coordinates** | NULL (not captured) | Mapbox Geocoding API captures lat/lng |
| **LocationInput** | Simple text input | Upgrade to autocomplete component |
| **API Schema** | Accepts `location_name` only | Extend to accept `latitude`, `longitude`, `formatted_address` |
| **Database** | `latitude`/`longitude` columns exist but empty | Populate via geocoding |
| **`visited` field** | Noted in API comment as "doesn't exist" | Add migration if needed (low priority) |
| **`formatted_address`** | Not in schema | Add column in Story 2.5 migration |

### **Integration Points**

**1. Component Upgrade** (`app/components/LocationInput.tsx`):
```tsx
// Story 2.4: Simple text input
<input type="text" value={locationName} onChange={...} />

// Story 2.5: Mapbox autocomplete
<MapboxAutocomplete
  onSelect={(result) => {
    setLocationName(result.place_name)
    setLatitude(result.center[1])      // NEW
    setLongitude(result.center[0])     // NEW
  }}
/>
```

**2. State Management** (`app/chamber/ChamberClient.tsx`):
```tsx
// Story 2.4 state:
const [locationName, setLocationName] = useState('')

// Story 2.5 additions:
const [latitude, setLatitude] = useState<number | null>(null)    // NEW
const [longitude, setLongitude] = useState<number | null>(null)  // NEW
```

**3. API Request Schema** (`lib/schemas/organization.ts`):
```typescript
// Story 2.4 schema:
location_name: z.string().optional()

// Story 2.5 additions:
latitude: z.number().min(-90).max(90).optional()     // NEW
longitude: z.number().min(-180).max(180).optional()  // NEW
formatted_address: z.string().optional()             // NEW
```

**4. API Handler** (`app/api/somethings/[id]/organize/route.ts`):
```typescript
// Story 2.4 handler:
if (realm === 'physical') {
  updateData.location_name = location_name
}

// Story 2.5 additions:
if (realm === 'physical') {
  updateData.location_name = location_name
  updateData.latitude = latitude               // NEW
  updateData.longitude = longitude             // NEW
  updateData.formatted_address = formatted_address  // NEW

  // Validation: coordinates required
  if (!latitude || !longitude) {
    return NextResponse.json({ error: 'Coordinates required' }, { status: 400 })
  }
}
```

### **Story 2.7 Dependency (Blocked Until 2.5 Complete)**

**Why Story 2.7 Needs Story 2.5**:
```typescript
// Story 2.7: Physical Map Rendering
const { data: somethings } = await supabase
  .from('somethings')
  .select('*')
  .eq('realm', 'physical')
  .not('latitude', 'is', null)  // ← REQUIRES Story 2.5 data!

somethings.forEach(s => {
  new mapboxgl.Marker(el)
    .setLngLat([s.longitude, s.latitude])  // ← REQUIRES Story 2.5!
    .addTo(map)
})
```

**Without Story 2.5**: Story 2.7 has NO coordinates to render (all Physical somethings have `latitude=NULL`)

**With Story 2.5**: Story 2.7 can immediately render 3D map with markers at precise locations

### **Migration Required for Story 2.5**

```sql
-- Add formatted_address column
ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Optional: Add visited column (if needed for AC6 from Story 2.4)
ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS visited BOOLEAN DEFAULT true;

-- Verify coordinate columns exist (should already exist from Story 2.1)
-- latitude DECIMAL(10,8)
-- longitude DECIMAL(11,8)

-- Add index for spatial queries (performance)
CREATE INDEX IF NOT EXISTS idx_somethings_location
  ON somethings(user_id, latitude, longitude)
  WHERE latitude IS NOT NULL;
```

---

**Updated:** 2025-11-05 by SM Bob
**Status:** Story 2.4 complete and reviewed (Ready for Review). Drafting Story 2.5.
**Next Action**: Complete Story 2.5 draft → User approves → Dev implements
