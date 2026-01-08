# Epic 3 Brainstorming: Explorer Mode Capture + Mystery Map

**Epic Name**: Explorer Mode Capture + Mystery Map
**Epic Goal**: Enable frictionless, unbounded capture (Live/Big-Capture) and visual mystery map (/ur-reality) to support Phase 1 of (ur "reality") vision
**Status**: Planning
**Target**: Phase 1 MVP

---

## Vision Alignment

**From ur-reality.md:**

> "Explorer Mode: where the user is exploring reality, discovering and capturing meaning in an unbounded fashion."

> "The capture page can't redirect, it also shouldn't display a green capture sent it should just be sent to db so that user can proceed with next capture without being distracted."

> "When you don't know what to do, head back to your reality and see what you can discover - make connections, dreams to pursue, goals to organize. A thinking aid to help choose what you want to do."

**Core Philosophy:**
- **Tool of tools**: Like Roblox Studio but for real life
- **Goal**: Make reality more beautiful (elevate the vibe)
- **Constraint**: Finite life → must choose what to care about
- **Need**: Thinking aid to help choose what to DO about what you care about

---

## Epic 3 Scope

### What We're Building

**Phase 1 Components:**

1. **Live-Capture Page** (`/capture`)
   - Dark mode, lightweight, streams of consciousness
   - Rocket ship send button (animated)
   - Microphone for audio transcription
   - Multi-line paste detection → auto-transition to Big-Capture
   - Double-click & hold → manual transition to Big-Capture

2. **Big-Capture Page** (`/big-capture`)
   - Light mode, Apple Notes aesthetic
   - Text input + file upload interface
   - Auto-split on newlines (preview before send)
   - OCR for handwritten images → text
   - Audio transcription → text
   - Return to Live-Capture after send

3. **/ur-reality Mystery Map** (`/ur-reality`)
   - Dark blue space background
   - Grey cartoon question marks (auto-scaling, distributed)
   - Hover to preview content, click to lock open
   - Multiple somethings can be clicked simultaneously
   - Display full content (text, photos, video thumbnails, link previews)

---

## User Journey

### The Explorer Loop

```
START: User has an experience
  ↓
CAPTURE (Live or Big)
  ↓
  Type/speak → text appears
  OR
  Upload files → OCR/transcribe → somethings created
  ↓
  Click rocket ship 🚀 → Submit to DB
  ↓
  Page clears → Ready for next capture
  ↓
REPEAT (unbounded, for days/weeks)
  ↓
WHEN STUCK: "I don't know what to do"
  ↓
NAVIGATE: Type /ur-reality in browser
  ↓
MYSTERY MAP: See all somethings as question marks
  ↓
EXPLORE: Hover/click to reveal content
  ↓
DISCOVER: Make connections, find patterns, see what you already know
  ↓
FUTURE (Phase 2): Use Chamber to choose actions (dreams, goals, connections)
```

---

## Key Design Principles

### 1. Zero Friction Capture

**Live-Capture Philosophy:**
- **Ephemeral**: Text clears after send (like talking into the void)
- **Fast**: No redirects, no confirmations, no loading states
- **Simple**: Dark screen, large text, one button
- **Unbounded**: Capture endlessly without interruption

**Why Dark Mode:**
- Reduces eye strain for long capture sessions
- Feels meditative, contemplative
- Minimizes UI distraction

### 2. Advanced Editing When Needed

**Big-Capture Philosophy:**
- **Light mode**: Signals "editing space" vs "capture space"
- **Split preview**: User sees how many somethings they're uploading
- **Media handling**: All formats → text or media (no audio files stored)
- **Flexibility**: Future home for formatting, styling, connections

### 3. Mystery as Motivation

**Mystery Map Philosophy:**
- **Question marks**: Somethings are unknown until explored
- **Playful**: Cartoon style, space theme, sarcastic tone
- **Discovery**: Hover/click reveals content (not boring list)
- **Multiple views**: Click multiple ?s to compare, find patterns

**Why Question Marks:**
- Gamifies exploration ("what did I capture?")
- Reduces cognitive load (not overwhelming list)
- Encourages re-discovery of forgotten somethings

---

## Stories Breakdown

### Story 3.1: Live-Capture Page

**Goal**: Replace current `/capture` with dark mode, rocket ship send, mic transcription, auto-transitions

**Key Features:**
- Dark screen with large text editor
- Rocket ship button (bottom right) with flight animation + whoosh sound
- Microphone button (bottom center) for audio recording → transcription
- Multi-line paste detection (1+ newlines) → sink-transition to Big-Capture
- Double-click & hold anywhere → sink-transition to Big-Capture
- Auto-save text (persists if user navigates away)
- No redirects after send (clears page, ready for next)

**Technical:**
- Replace existing capture page entirely
- Integrate WhisperLive for audio transcription (or button placeholder if blocked)
- Sink-transition animation (slow ripple effect)
- Rocket animation: straight line, bottom-right → top-right, rotation adjustment

---

### Story 3.2: Big-Capture Page

**Goal**: Create light mode editing page with text input, file upload, auto-split, OCR/transcription

**Key Features:**
- White/cream background (Apple Notes minimal aesthetic)
- Text input box (copy/paste-able)
- File upload interface (photos, videos, handwriting, audio, PDFs, links)
- Auto-split on newlines → preview as stacked text boxes with borders
- Merge/delete splits before sending (reuse Chamber split functionality)
- OCR handwritten images → text only (no image storage)
- Audio transcription → text only (no audio file storage)
- Rocket ship send → return to Live-Capture (cleared)

**Technical:**
- New route `/big-capture`
- Reuse split editor from Story 2.2 (inline, not modal)
- OCR: Tesseract or cloud OCR API
- Transcription: WhisperLive (or skip audio for MVP)
- Link preview metadata extraction

---

### Story 3.3: /ur-reality Mystery Map

**Goal**: Create visual mystery map of all somethings as question marks with hover/click interaction

**Key Features:**
- Dark blue space background
- Grey cartoon question marks (playful, thick outlines)
- Auto-scaling distribution:
  - 1 → big, center
  - 2 → smaller, left/right
  - 3 → smaller, thirds
  - 4 → quadrants
  - 5 → quadrants + center
  - 6+ → asymmetric spread (maintain separation)
- Hover unclicked ? → content appears underneath (z-index above other ?s)
- Click ? circle → shades inside, content locks open
- Multiple ?s can be clicked (multiple somethings displayed)
- Content display: text (full), photos (actual), videos (thumbnail), links (preview card)

**Technical:**
- New route `/ur-reality`
- Query all user's somethings
- Canvas or SVG for question mark positioning
- Dynamic layout algorithm (auto-scale, distribute)
- Z-index management for overlapping content
- Link preview rendering (Twitter/IG card style)

---

## Database & Infrastructure

### Somethings Table (No Changes)

**Already supports everything:**
```sql
CREATE TABLE somethings (
  id UUID,
  user_id UUID,
  text_content TEXT,      -- ✅ Live/Big-Capture text
  media_url TEXT,          -- ✅ Photos, videos
  realm TEXT,              -- ⚠️ Set to NULL (deprecated)
  latitude DECIMAL,        -- ⏸️ Future use
  longitude DECIMAL,       -- ⏸️ Future use
  care INT,                -- ⏸️ Future Chamber (Phase 2)
  captured_at TIMESTAMPTZ, -- ✅ Timestamp
  attributes JSONB         -- ⏸️ Future Chamber actions
)
```

**Epic 3 Usage:**
- `text_content`: All text (typed, OCR'd, transcribed)
- `media_url`: Photos, videos only (Supabase Storage)
- `realm`: NULL (stop using)
- `captured_at`: Auto-set on creation
- All other fields: NULL until Phase 2 (Chamber)

### Supabase Storage (Already Exists)

**Buckets:**
- `something-media`: Store photos, videos

**Upload Flow:**
1. User selects file in Big-Capture
2. Upload to Supabase Storage
3. Get URL, store in `media_url`
4. Submit something to database

---

## Phase Separation

### Phase 1: Explorer Mode (Epic 3) ← **WE ARE HERE**

**Goal**: Frictionless capture + mystery map visualization

**Deliverables:**
- Live-Capture page (dark, rocket, mic)
- Big-Capture page (light, files, splits)
- /ur-reality Mystery Map (question marks, hover/click)

**User Can:**
- Capture unbounded (Explorer Mode)
- See all somethings as mystery map
- Rediscover what they've captured

**User Cannot Yet:**
- Organize somethings (no Chamber)
- Make connections (no UI, just database ready)
- Track dreams/goals/abilities (Phase 2)

---

### Phase 2: The Chamber (Future - NOT Epic 3)

**Goal**: Thinking aid to choose what to DO about somethings

**Concepts to Explore** (after using Phase 1):
- Vibe spectrum (Beauty ←→ Ugly)
- "Why do I care?" meaning-making
- Action choices:
  - Dreams to pursue
  - Goals to organize
  - Connections to make
  - Abilities to track (CAN/CAN'T)

**NOT Yet Defined:** Will discover through using capture + mystery map

---

### Phase 3: Reality Map (Future - NOT Epic 3)

**Goal**: Navigate processed reality (connections, patterns, abodes)

**Concepts to Explore:**
- Web of connections (visual graph)
- Patterns over time (how heart responds)
- Thematic abodes (Lil Wayne abode, work, relationships)
- Physical/temporal views (map, timeline)

**NOT Yet Defined:** Will discover through using Chamber

---

## Technical Decisions

### Transcription Service

**Options:**
1. **WhisperLive** (from GitHub repo): Open source, real-time
2. **OpenAI Whisper API**: Paid, high quality
3. **Browser Web Speech API**: Free, lower quality
4. **Skip for MVP**: Just show mic button (implement later)

**Decision:** Try WhisperLive, fallback to button placeholder

### OCR Service

**Options:**
1. **Tesseract.js**: Free, client-side, decent quality
2. **Google Cloud Vision API**: Paid, high quality
3. **Azure Computer Vision**: Paid, high quality

**Decision:** Start with Tesseract.js (free), upgrade if needed

### Sink-Transition Animation

**Implementation:**
- CSS transition + React state
- "Ripple away" effect (slow fade + scale)
- Triggered by multi-line paste OR double-click & hold
- Duration: ~500ms (playful but not slow)

### Question Mark Distribution Algorithm

**Approach:**
- Predefined patterns for 1-5 somethings
- 6+ somethings: Random position with collision avoidance
- Auto-scale size based on count (inverse relationship)
- Maintain minimum separation (prevent overlap)

**Future Enhancement:** Physics-based layout (force-directed graph)

---

## Success Criteria

**Epic 3 is successful when:**

✅ **Live-Capture works:**
- User can type/speak → text appears
- Rocket ship sends to DB → clears page
- Multi-line paste auto-opens Big-Capture
- Double-click & hold opens Big-Capture
- No redirects, no confirmations

✅ **Big-Capture works:**
- User can upload photos, videos, handwriting
- Auto-split shows preview (stacked text boxes)
- OCR converts handwriting → text
- Audio transcription works (or button exists)
- Returns to Live-Capture after send

✅ **/ur-reality works:**
- All somethings display as question marks
- Auto-scaling distribution looks good (1-20+ somethings)
- Hover shows content preview
- Click locks content open
- Multiple ?s can be clicked simultaneously
- Content displays properly (text, photos, video thumbnails, link previews)

✅ **User can:**
- Capture endlessly (unbounded Explorer Mode)
- Navigate to /ur-reality manually
- Rediscover what they've captured
- See patterns, connections (visually, not yet actionable)

---

## Out of Scope (Epic 3)

❌ **NOT building:**
- Chamber organization (Phase 2)
- Connection creation UI (Phase 2/3)
- Dreams/goals tracking (Phase 2)
- Abilities tracker (Phase 2)
- Thematic abodes (Phase 3)
- Physical/temporal views (Phase 3)
- Care ratings UI (Phase 2)
- "Why this matters" field (Phase 2)

**Rationale:** Phase 1 is about capture + discovery. We'll discover what Chamber/Reality Map need AFTER using Phase 1.

---

## Dependencies & Risks

### Dependencies

✅ **Epic 1 (Complete):**
- Auth system (SSR, Supabase)
- Database schema (somethings table)
- Basic capture infrastructure

⚠️ **Epic 2 (Partially Salvaged):**
- Split editor functionality (reuse from Story 2.2)
- Card display patterns (reuse for /ur-reality content)

### Risks

⚠️ **Transcription Service:**
- **Risk**: WhisperLive may be hard to integrate
- **Mitigation**: Start with button placeholder, implement later

⚠️ **OCR Quality:**
- **Risk**: Tesseract.js may have poor accuracy
- **Mitigation**: Test with real handwriting samples, upgrade if needed

⚠️ **Question Mark Layout:**
- **Risk**: Distribution algorithm may look bad with many somethings
- **Mitigation**: Test with 50-100 somethings, iterate on algorithm

⚠️ **Link Preview:**
- **Risk**: Some sites block preview extraction (CORS, no meta tags)
- **Mitigation**: Fallback to plain URL display

---

## Timeline Estimate

**Story Complexity:**
- **Story 3.1 (Live-Capture)**: Medium (~3-5 days)
  - Replace existing page, add animations, paste detection, audio placeholder
- **Story 3.2 (Big-Capture)**: Large (~5-7 days)
  - New page, file upload, OCR, auto-split, transcription integration
- **Story 3.3 (/ur-reality)**: Medium-Large (~4-6 days)
  - New page, layout algorithm, hover/click interactions, content display

**Total Estimate:** ~2-3 weeks (12-18 development days)

**Sequencing:**
1. Story 3.1 first (foundation, unblocks user testing)
2. Story 3.2 second (builds on 3.1 transitions)
3. Story 3.3 third (visualization of captured somethings)

---

## Next Steps

**Immediate:**
1. ✅ Create this brainstorming doc
2. ✅ Write Story 3.1 spec (Live-Capture)
3. ✅ Write Story 3.2 spec (Big-Capture)
4. ✅ Write Story 3.3 spec (/ur-reality)
5. Get user approval on all 3 stories
6. Dev begins Story 3.1 implementation

**Follow-Up:**
- Update PRD with Epic 3 details
- Update architecture doc with capture page + mystery map architecture
- Hide deprecated routes (/chamber, /my_reality, /mind) via middleware
- Manual test entire flow after all 3 stories complete

---

**🏃 SM Bob - Ready to create the stories!**
