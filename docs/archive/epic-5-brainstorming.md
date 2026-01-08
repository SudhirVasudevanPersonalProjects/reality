# Epic 5 Brainstorming
## Growing My Reality - Organization & Sharing

**Date:** 2025-11-12
**Status:** Brainstorming → Stories

---

## Context: What We Have (Story 4.1)

✅ `/my-reality/somewhere` page exists with:
- 2D canvas space with question marks/balls
- Care rating system (-2 to +2, beauty/ugly)
- Visual transformation: grey question marks → colored balls based on care
- Pan/zoom controls
- Click to isolate and rate care level
- Care picker UI (5 levels)

**The vision:** Initially your reality is a cloud of fog. By adding captures, your reality grows with positive energy (beauty) or negative energy (ugly).

---

## Epic 5: New Features

### 1. Custom Organization Types
**Current:** Bottom bar shows static navigation
**New:** User can add custom organization types

**Feature:**
- After existing nav items, show `+` button
- Click `+` → Create new organization type
- Examples: "Dreams", "Fears", "Work", "Music", "Friends"
- Each organization = a filter/view of captures

**UX:**
```
Bottom bar:
[Home] [Somewhere] [Dreams] [+]
                              ↑
                         Click to add
```

---

### 2. Friend Search & Sharing
**Current:** No social features
**New:** Find friends, share individual captures

**Features:**

#### Search Friends
- Search bar to find friends (by username/email)
- Friend request system
- Friends list

#### Share Individual Captures
- Click a ball (capture) → Share button
- Select friends from list
- Friend receives the capture in their reality
- Shared captures have indicator (e.g., "From @username")

**UX Flow:**
```
1. Click ball → Isolated view
2. Care picker + Share button appears
3. Click Share → Friend selector modal
4. Select friends → Send
5. Friend sees shared ball in their space
```

---

## Database Changes Needed

### New Tables

#### **organizations**
User-defined organization types (Dreams, Fears, etc.)
```sql
id              UUID PRIMARY KEY
user_id         UUID
name            TEXT
icon            TEXT (optional)
color           TEXT (optional)
sort_order      INT
created_at      TIMESTAMP
```

#### **something_organizations**
Link captures to organizations (many-to-many)
```sql
something_id    UUID (FK to somethings)
organization_id UUID (FK to organizations)
created_at      TIMESTAMP
PRIMARY KEY (something_id, organization_id)
```

#### **friendships**
Friend connections
```sql
id              UUID PRIMARY KEY
user_id         UUID (requester)
friend_id       UUID (receiver)
status          TEXT ('pending', 'accepted', 'rejected')
created_at      TIMESTAMP
```

#### **shared_somethings**
Track shared captures
```sql
id              UUID PRIMARY KEY
something_id    UUID (FK to somethings)
from_user_id    UUID (who shared)
to_user_id      UUID (who received)
message         TEXT (optional note)
shared_at       TIMESTAMP
```

### Extend Existing Tables

#### **somethings**
Add `original_owner_id` to track shared captures
```sql
ALTER TABLE somethings ADD COLUMN original_owner_id UUID;
ALTER TABLE somethings ADD COLUMN shared_from_user_id UUID;
```

---

## Stories Breakdown

### Story 5.1: Custom Organization Types

**As a** user organizing my captures,
**I want** to create custom organization types (Dreams, Fears, Work, etc.),
**so that** I can filter and view captures by meaningful categories.

**Acceptance Criteria:**
- AC1: `+` button appears in bottom navigation bar
- AC2: Click `+` opens "Create Organization" modal
- AC3: User can enter name, optional icon, optional color
- AC4: New organization appears in bottom bar
- AC5: Click organization filters view to show only captures in that org
- AC6: User can assign captures to multiple organizations
- AC7: Database stores organizations and many-to-many relationships

---

### Story 5.2: Assign Captures to Organizations

**As a** user viewing a capture,
**I want** to assign it to one or more organizations,
**so that** I can find it later when filtering by that organization.

**Acceptance Criteria:**
- AC1: When capture is isolated (clicked), show "Organize" button
- AC2: Click "Organize" opens modal with list of user's organizations
- AC3: User can select multiple organizations (checkboxes)
- AC4: Selected organizations save to database
- AC5: Visual indicator on ball shows which orgs it belongs to
- AC6: Filter view updates immediately

---

### Story 5.3: Friend Search & Request System

**As a** user wanting to connect with friends,
**I want** to search for friends and send friend requests,
**so that** I can build my network within the app.

**Acceptance Criteria:**
- AC1: New `/friends` page with search bar
- AC2: Search by username or email
- AC3: Results show user profiles (name, avatar)
- AC4: "Add Friend" button sends friend request
- AC5: Pending requests shown in "Requests" tab
- AC6: Receiver can accept or reject
- AC7: Accepted friends appear in "Friends" list
- AC8: Database tracks friendship status

---

### Story 5.4: Share Individual Captures with Friends

**As a** user with friends in the app,
**I want** to share individual captures with specific friends,
**so that** they can see what resonates with me.

**Acceptance Criteria:**
- AC1: When capture is isolated, show "Share" button
- AC2: Click "Share" opens friend selector modal
- AC3: User can select multiple friends (checkboxes)
- AC4: Optional: Add message/note with share
- AC5: Click "Send" shares capture with selected friends
- AC6: Shared capture appears in friend's `/my-reality/somewhere`
- AC7: Shared captures have visual indicator: "From @username"
- AC8: Friend can view shared capture metadata (who sent, when)
- AC9: Friend can rate care level on received capture (own rating)
- AC10: Shared captures don't clutter - can be filtered/hidden

---

### Story 5.5: Received Captures View

**As a** user receiving shared captures,
**I want** to see what friends have shared with me,
**so that** I can explore their perspectives.

**Acceptance Criteria:**
- AC1: New filter in bottom bar: "Shared with Me"
- AC2: Shows only captures received from friends
- AC3: Each capture shows sender's name/avatar
- AC4: Can rate care level independently
- AC5: Can add to my own organizations
- AC6: Can re-share with other friends
- AC7: Can "Remove" (doesn't delete for sender)

---

## Technical Architecture

### API Routes Needed

#### Organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations` - Get user's organizations
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

#### Something Organizations
- `POST /api/somethings/:id/organizations` - Assign to orgs
- `GET /api/somethings/:id/organizations` - Get something's orgs
- `DELETE /api/somethings/:id/organizations/:org_id` - Remove from org

#### Friends
- `GET /api/users/search?q=` - Search users
- `POST /api/friendships` - Send friend request
- `GET /api/friendships` - Get friends list
- `PUT /api/friendships/:id` - Accept/reject request
- `DELETE /api/friendships/:id` - Remove friend

#### Sharing
- `POST /api/somethings/:id/share` - Share with friends
- `GET /api/somethings/shared` - Get received captures
- `DELETE /api/somethings/shared/:id` - Remove received capture

---

## UI/UX Considerations

### Bottom Navigation Bar
**Current:** Static items
**New:** Dynamic + customizable

```
[🌍 Reality] [📍 Somewhere] [✨ Dreams] [➕]
```

**Behavior:**
- Click org name → Filter view to show only those captures
- Long-press org name → Edit/delete
- Drag to reorder

---

### Share Modal Design
```
┌─────────────────────────────────┐
│  Share with Friends             │
├─────────────────────────────────┤
│  🔍 Search friends...            │
├─────────────────────────────────┤
│  ☐ @alice                       │
│  ☐ @bob                         │
│  ☑ @charlie (selected)          │
│  ☐ @diana                       │
├─────────────────────────────────┤
│  Add a message (optional)       │
│  [text area]                    │
├─────────────────────────────────┤
│         [Cancel]  [Send]        │
└─────────────────────────────────┘
```

---

### Shared Capture Indicator
- Small badge/icon on ball: "👤" or "From @user"
- Hover shows full details
- Different color glow? (e.g., blue tint for shared)

---

## Migration Notes

**Keep everything from Story 4.1:**
- Care rating system ✅
- Visual balls ✅
- 2D space ✅
- Perlin noise background ✅

**Just add:**
- Organizations (new tables)
- Friendships (new tables)
- Sharing (new tables)
- New UI components (modals, filters)

**No breaking changes to existing captures.**

---

## Out of Scope (Future)

- Group chats about captures
- Collaborative organizations
- Public captures (all sharing is private)
- Comments on captures
- AI-suggested organizations
- Notifications system (nice to have, but not MVP)

---

## Success Metrics

### Organization Feature
- % of users who create custom organizations
- Average # of organizations per user
- % of captures assigned to organizations

### Social Features
- # of friendships created
- # of captures shared per week
- % of users who share at least once
- Engagement: Do shared captures get rated?

---

## Philosophy Connection

**From brainstorming:** The lens system, will to power, three modes of being - all of this is valuable thinking, but for Epic 5, we're **keeping it simple** and **building incrementally**.

The beauty/ugly care system (Story 4.1) is the foundation. We're growing organically:
- Custom organization = user-defined lenses (simplified)
- Sharing = social discovery of patterns
- Friends = collective mapping

**Future epics can incorporate deeper philosophy** as the system proves itself.

---

**Next Steps:**
1. Review stories with user
2. Create architecture document for implementation
3. Prioritize: Which story to build first?
4. SM creates Story 5.1 in proper format

---

**END OF BRAINSTORMING**
