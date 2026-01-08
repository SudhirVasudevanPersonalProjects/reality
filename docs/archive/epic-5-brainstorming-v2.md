# Epic 5: Chamber Logic & Abode Organization

## Overview
Add chamber entry mechanism and basic abode organization system to /my-reality/somewhere, allowing users to process unorganized somethings and send them to meaningful spaces (abodes).

**Implementation Note**: This is 2D implementation (not Three.js). Working with existing 2D space from Story 3.4.

## Core Features

### 1. Page Load Animation Sequence (Story 5.1)
**Page**: `/my-reality/somewhere`

**Animation Flow**:
1. **Initial View**: Page loads zoomed out showing Unknown (Perlin noise texture filling screen)
   - Spaceship NOT visible yet
2. **Zoom to Home**: Camera zooms to default home screen
   - Shows spread of all question mark dots
3. **Spaceship Appears**: Spaceship materializes in bottom left
4. **Chamber Prompt**: Text appears above spaceship: "ENTER CHAMBER" (all caps)

**Purpose**: Sets the stage for the exploration → organization flow

**Story 5.1 Scope**: This entire section (animation sequence + spaceship appearance + "ENTER CHAMBER" text)

---

### 2. Chamber Entry Flow (Story 5.2)

**Trigger**: User clicks on spaceship

**Animation Sequence**:
1. Spaceship flies to **nearest unorganized something** (most recent capture without abode assignment)
2. Spaceship slowly zooms out of vision, appearing to fly toward that something
3. Whole screen slowly fades to black
4. Screen blinks back into vision
5. **Chamber View loads**

**Visual Effect**: Creates transition from exploration space to focused organization mode

**Story 5.2 Scope**: Spaceship click handler + flight animation to nearest unorganized something + fade to black + blink transition

---

### 3. Chamber Redirection & Display Logic (Story 5.3)

**Implementation Status**: Not yet implemented - currently reverting to old chamber behavior (acceptable for now)

**Story 5.3 Scope**:
- **Chamber URL Redirection**: Implement proper chamber routing with `?id={something_id}` parameter
- **Chamber Functionality & API**:
  - Build chamber API endpoints for fetching unorganized somethings
  - Handle chamber session state (current something, navigation between somethings)
  - Manage "send to abode" logic and database updates
- **Display Layer**: Use existing content circle component from v3.3/v3.4
  - Content circle displays current something (text/media)
  - Care bar at bottom center
  - "Something #X" counter in top right
  - "Send to Abode" dropdown in bottom right

**Technical Notes**:
- Chamber page should intercept with `?id=` query parameter
- Display uses existing UI components - no new visualization work needed
- Focus on routing, state management, and API integration

---

### 4. Chamber View (Organization Interface)

**When Shown**: After spaceship animation completes

**Layout Components**:

#### Center
- Content circle displaying current something
- Same circle visual from v3.3/v3.4

#### Top Right
- **Change from**: Somethings count (e.g., "12 somethings")
- **Change to**: "Something #X" (where X = current something number)
- Example: "Something #7"

#### Bottom Center
- Care bar (existing component)
- Modifications planned for future, keep as-is for now

#### Bottom Right
- **New Component**: "Send to Abode" button with dropdown menu

---

### 4. Send to Abode System

**UI Component**: Dropdown menu in bottom right

**Default Abode Options**:
- Dreams
- Beauty
- Ugly
- Rules of Reality
- **Create New** (allows user to name custom abode)

**Behavior**:
- User selects abode from dropdown
- Something is assigned to that abode
- Something becomes "organized"
- Next unorganized something loads automatically
- If no more unorganized somethings → exit chamber, return to main view

---

### 5. Abode System (Initial Implementation)

**Spatial Structure**:
- Each abode is a **separate space** within my-reality
- Randomly assigned initial positions (for now)
- Uses same **hexagonal lattice** pattern as "Somewhere"

**Dynamic Expansion**:
- **When**: More space needed for abode (either creating new abode or sending something to existing abode)
- **Action**:
  - Expand the "Known" region (where somethings live)
  - Shrink the "Unknown" (Perlin noise boundary) by one layer
- Hexagonal lattice extends outward
- Abodes grow based on number of somethings they contain

**Visual Representation** (Future):
- Each abode could have different color/theme
- Boundaries between abodes visible
- User can navigate between abodes

---

## Technical Considerations

### Database Changes
**Somethings Table**:
- Add column: `abode_id` (nullable, foreign key to abodes table)
- Add column: `is_organized` (boolean, default false)

**New Table: Abodes**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `name` (text) - "Dreams", "Beauty", "Ugly", "Rules of Reality", or custom
- `created_at` (timestamp)
- `position_x`, `position_y` (for spatial layout)
- `color` (optional, for future theming)

### State Management
- Track current unorganized something
- Track current chamber session
- Handle "no more unorganized somethings" state

### Animation Requirements
- Spaceship flight path calculation
- Smooth camera zoom/pan
- Fade to black transition
- Content sphere appearance animation

---

## User Flow

### Complete Flow Example

**Starting Point**: User at `/my-reality/somewhere` with 10 unorganized somethings

1. **Load Page**:
   - Zooms in from Unknown to show all 10 question marks
   - Spaceship appears with "ENTER CHAMBER" text

2. **Click Spaceship**:
   - Flies to most recent unorganized something (#10)
   - Screen fades to black
   - Chamber View loads

3. **In Chamber** (Something #10):
   - User sees content in center circle
   - Top right: "Something #10"
   - Care bar at bottom center
   - Bottom right: "Send to Abode" dropdown

4. **User Selects "Beauty"**:
   - Something #10 assigned to Beauty abode
   - Beauty abode expands if needed (shrinks Unknown layer)
   - Chamber automatically loads Something #9

5. **Repeat** for #9, #8, #7... until all processed

6. **All Organized**:
   - Chamber exits automatically
   - Returns to main /my-reality/somewhere view
   - All question marks now in organized abodes

---

## Future Enhancements (Not in Epic 5)

### Advanced Abode Features
- Navigate directly to specific abode
- View all somethings in an abode
- Rename/delete custom abodes
- Move somethings between abodes
- Merge abodes

### Chamber Enhancements
- Skip button (process this something later)
- Connection creation (link to other somethings)
- Vibe rating interface (beauty/ugly spectrum slider)
- Add notes/reflections to something

### Visualization
- Abode boundaries visible on main view
- Different colors/themes per abode
- Show organization percentage
- Minimap showing abode layout

---

## Out of Scope (for Epic 5)

- Care bar modifications
- Multi-something selection
- Batch organization
- Advanced filtering
- Search within abodes
- LLM-based auto-organization suggestions
- Full 3D rotation (still fixed 45-degree view)

---

## Success Criteria

**Epic 5 is complete when**:
1. ✅ Page load animation sequence works (Unknown → home → spaceship appears)
2. ✅ "ENTER CHAMBER" text displays above spaceship
3. ✅ Clicking spaceship triggers chamber entry animation
4. ✅ Chamber View loads with content circle
5. ✅ "Something #X" displays in top right
6. ✅ "Send to Abode" dropdown works with default abodes
7. ✅ Selecting abode assigns something and loads next unorganized
8. ✅ Hexagonal lattice expands when abodes need more space
9. ✅ Unknown shrinks by one layer when Known expands
10. ✅ Chamber exits when all somethings organized

---

## Dependencies

**From Previous Stories**:
- Story 3.4: 2D space, Perlin noise background, hexagonal lattice
- Somethings table with proper schema
- Content display system (circle with media/text)
- Care bar component

**New Requirements**:
- Abodes table creation
- Spaceship sprite/image
- Animation system for zoom/pan movements
- Fade/blink transition effects

---

## Notes

- Keep it simple for MVP - random abode positions fine for now
- Focus on core flow: unorganized → chamber → organized
- Don't overcomplicate abode visualization yet
- Care bar stays as-is, don't modify
- Hexagonal lattice logic already exists from 3.4, extend it

---

*This epic establishes the foundation for organizing somethings into meaningful spaces, creating the bridge between raw capture and curated reality.*
