# Data Models

These are the core domain entities that represent your business logic. These models are technology-agnostic (not tied to database tables or API contracts) and represent the conceptual "things" in your system.

**CORE PHILOSOPHY:** Reality tracks three temporal dimensions of human experience:
- **Experience** = Past (what happened)
- **Thought** = Present (what I think/reflect)
- **Desire** = Future (what I want)

All meaningful categorization and connection-making happens **after** initial capture. Fields are nullable by default - users add meaning over time.

## 4.1: Core Entities

### User
Represents a registered Reality user with authentication and profile data.

**Attributes:**
- `id` (UUID) - Unique identifier
- `email` (string) - Email address for login
- `phoneNumber` (E.164 string, nullable) - SMS capture phone number (e.g., +14155551234)
- `displayName` (string, nullable) - User's chosen display name
- `birthDate` (date, nullable) - User's birth date
- `createdAt` (timestamp) - Account creation time
- `timezone` (string, nullable) - User's timezone (IANA, e.g., "America/Los_Angeles")
- `preferences` (object, nullable) - User settings (notification preferences, default view, theme)

**Relationships:**
- Participates in many Experiences (many-to-many via ExperienceParticipant)
- Has many Thoughts (created by this user)
- Has many Desires (personal wants/goals)
- Has many Connections (to other users as friends, via Connection entity)
- Has many Tags (user's personal tag vocabulary)
- Has one Profile (extended user data)

**Business Rules:**
- Email must be unique and verified
- Phone number must be unique if provided (1:1 mapping user ↔ phone when set)
- All personal fields (birthDate, phoneNumber, timezone) are nullable - users add meaning over time
- Friendships are bidirectional (if A friends B, then B friends A automatically via Connection entity)

---

### Experience
Represents a captured moment in time with optional location, media, and context. This is the atomic unit of Reality. **Experiences are shareable** - multiple users can participate in the same experience.

**Attributes:**
- `id` (UUID) - Unique identifier
- `createdByUserId` (UUID) - User who initially captured this experience
- `capturedAt` (timestamp, nullable) - When the moment happened (can be set later)
- `latitude` (decimal, nullable) - GPS latitude
- `longitude` (decimal, nullable) - GPS longitude
- `locationName` (string, nullable) - Named location (e.g., "San Francisco, CA") - used for approximate lat/lng lookup if GPS unavailable
- `rawText` (text, nullable) - Original capture text
- `processedText` (text, nullable) - Cleaned/formatted text after AI processing
- `mediaUrls` (array of strings, nullable) - URLs to photos/videos in Supabase Storage
- `category` (string, nullable) - User-assigned category: initially `heart`, `mind`, `body`, `soul`, `abode`, or custom user-defined categories
- `qualityScore` (integer 1-10, nullable) - Subjective emotional quality (1=dark/difficult, 10=bright/joyful)
- `qualityNumber` (integer 1-10, nullable) - Subjective aesthetic quality (1=ugly, 10=beautiful, 5=mid) - user's definition of beauty
- `createdAt` (timestamp) - Record creation time
- `updatedAt` (timestamp) - Last modification time

**Relationships:**
- Created by one User (createdByUserId)
- Participated in by many Users (many-to-many via ExperienceParticipant) - "who else was there"
- Has many Thoughts (nested reflections within this experience)
- Fulfills many Desires (experiences can satisfy desires)
- Has many Connections (links to other experiences)
- Has many Tags (via ExperienceTag)

**Business Rules:**
- Must have at least one of: `rawText`, `mediaUrls`, `locationName` (can't be completely empty)
- Location fields (`latitude`, `longitude`, `locationName`) are all optional - user can add later
- If `locationName` provided without GPS, system attempts geocoding to populate lat/lng
- `category` defaults to `abode` (inbox), user organizes later
- `qualityScore` is optional - user can assign meaning later (1=darkest moments, 10=brightest moments, 5=neutral)
- `qualityNumber` is optional - user defines their own aesthetic standards for beauty/ugliness
- Experiences are **shareable** - creator can add other participants who then see it in their Reality
- All meaningful categorization happens **after** capture - initial capture is friction-free

---

### ExperienceParticipant (Join Table)
Links users to shared experiences. Represents "who was there" for collaborative memory.

**Attributes:**
- `id` (UUID) - Unique identifier
- `experienceId` (UUID) - The shared experience
- `userId` (UUID) - User who participated
- `role` (string, nullable) - User's role in experience (e.g., "organizer", "attendee", custom)
- `joinedAt` (timestamp) - When this user was added to the experience
- `addedBy` (UUID, nullable) - User who added this participant (null if creator)

**Relationships:**
- Belongs to one Experience
- Belongs to one User

**Business Rules:**
- Creator is automatically added as first participant
- Participants can view/edit shared experiences (RLS policies control this)
- Users can leave shared experiences (soft delete their participant record)

---

### Thought
Represents a reflection, note, or insight nested within an Experience, about a Desire, or standing alone. Thoughts can contain other Thoughts (recursive hierarchy). **Thoughts belong to one user only** - they are personal interpretations.

**Attributes:**
- `id` (UUID) - Unique identifier
- `userId` (UUID) - Owner of this thought (personal interpretation)
- `experienceId` (UUID, nullable) - Parent experience (null if standalone or desire-focused)
- `desireId` (UUID, nullable) - Desire being reflected upon (null if experience-focused or standalone)
- `parentThoughtId` (UUID, nullable) - Parent thought (for nested thoughts)
- `content` (text) - The thought content (supports markdown)
- `thoughtType` (string, nullable) - Type: initially `reflection`, `question`, `insight`, `todo`, `quote` - **user-extensible**
- `userCategory` (string, nullable) - User's own categorization system (completely freeform)
- `createdAt` (timestamp) - When the thought was created
- `updatedAt` (timestamp) - Last modification time
- `orderIndex` (integer) - Sort order within parent (for manual reordering)

**Relationships:**
- Belongs to one User (creator/owner)
- Belongs to one Experience (optional, can be standalone or desire-focused)
- Belongs to one Desire (optional, can be standalone or experience-focused)
- Has one parent Thought (optional, for nesting)
- Has many child Thoughts (recursive)
- Has many Tags (via ThoughtTag)

**Business Rules:**
- Thoughts are **always personal** - they represent one user's interpretation/reflection
- A thought can be linked to Experience OR Desire OR both OR neither (standalone)
- If `parentThoughtId` is set and `experienceId` is set, must belong to same experience (thoughts can't nest across experiences)
- Maximum nesting depth: 5 levels (prevents infinite recursion)
- Standalone thoughts (`experienceId = null` and `desireId = null`) cannot have `parentThoughtId` set
- Ordering within siblings controlled by `orderIndex` (allows drag-and-drop reordering)
- `thoughtType` and `userCategory` start with suggested defaults but users can create their own
- All categorization is optional initially - meaning is added over time

---

### Desire
Represents a want, goal, motivation, or aspiration. Desires drive action and can be tracked from intention → fulfillment. **Desires belong to one user** - they are personal motivations.

**Attributes:**
- `id` (UUID) - Unique identifier
- `userId` (UUID) - Owner of this desire
- `name` (string) - Short name/label (e.g., "Travel to Japan", "Learn piano", "Call Mom")
- `description` (text, nullable) - Detailed description of the desire
- `why` (text, nullable) - **Why this desire exists** - the deeper motivation/meaning
- `intensity` (decimal 0.0-1.0, nullable) - How strong the desire is (0.0=mild interest, 1.0=burning need)
- `priority` (integer, nullable) - Relative importance/urgency (higher = more urgent, user-defined scale)
- `fulfilled` (boolean) - Has this desire been satisfied? (default: false)
- `fulfilledAt` (timestamp, nullable) - When the desire was fulfilled
- `fulfilledByExperienceId` (UUID, nullable) - Experience that fulfilled this desire
- `createdAt` (timestamp) - When the desire was identified/created
- `updatedAt` (timestamp) - Last modification time

**Relationships:**
- Belongs to one User (owner)
- Has many Dependencies (other Desires that must be satisfied first, via DesireDependency)
- Blocks many Desires (other desires waiting on this one, via DesireDependency)
- Can be fulfilled by one Experience (optional link)
- Has many Thoughts (reflections on the desire via Thought.desireId)
- Has many Tags (via DesireTag join)

**Business Rules:**
- Only `userId` and `name` are required - all other fields are optional (desires can start as simple wishes)
- `intensity` defaults to null - user can rate over time as they understand the desire better
- `priority` is relative and user-defined - no system-enforced scale, just higher numbers = more urgent
- Dependencies are tracked via separate DesireDependency join table (many-to-many)
- When `fulfilled = true`, system prompts to link to fulfilling Experience (optional)
- Desires can exist in multiple states:
  - **Nascent:** Just name, no why/intensity (raw want)
  - **Explored:** Has why, intensity, priority (understood desire)
  - **Blocked:** Has unfulfilled dependencies (can't pursue yet)
  - **Active:** No blocking dependencies, not yet fulfilled (pursuing)
  - **Fulfilled:** `fulfilled = true`, optionally linked to experience
- Users can "resurrect" fulfilled desires (toggle back to unfulfilled) - desires can be cyclical

---

### DesireDependency (Join Table)
Represents "Desire A depends on Desire B being fulfilled first" relationships.

**Attributes:**
- `id` (UUID) - Unique identifier
- `desireId` (UUID) - The dependent desire (blocked until dependencies are met)
- `dependsOnDesireId` (UUID) - The dependency that must be fulfilled first
- `createdAt` (timestamp) - When dependency was identified

**Relationships:**
- Links two Desires (dependent → dependency)

**Business Rules:**
- No circular dependencies (system validates: A depends on B, B cannot depend on A directly or transitively)
- When dependency desire is fulfilled, system can notify user that blocked desire is now unblocked
- Users can remove dependencies at any time (changed mind about what's required)

---

### Connection
Represents a relationship between **ANY two entities** in Reality: Experience↔Experience, Experience↔Thought, Experience↔Desire, Thought↔Thought, Thought↔Desire, Desire↔Desire, or User↔User (friendships). **This is the heart of the system** - connections ARE the meaning-making. Understanding and creating connections is the point.

**Attributes:**
- `id` (UUID) - Unique identifier
- `userId` (UUID) - User who created this connection
- `fromEntityType` (enum) - Type of source: `experience`, `thought`, `desire`, `user`
- `toEntityType` (enum) - Type of target: `experience`, `thought`, `desire`, `user`
- `fromExperienceId` (UUID, nullable) - Source experience (if fromEntityType = experience)
- `toExperienceId` (UUID, nullable) - Target experience (if toEntityType = experience)
- `fromThoughtId` (UUID, nullable) - Source thought (if fromEntityType = thought)
- `toThoughtId` (UUID, nullable) - Target thought (if toEntityType = thought)
- `fromDesireId` (UUID, nullable) - Source desire (if fromEntityType = desire)
- `toDesireId` (UUID, nullable) - Target desire (if toEntityType = desire)
- `fromUserId` (UUID, nullable) - Source user (if fromEntityType = user, for friendships)
- `toUserId` (UUID, nullable) - Target user (if toEntityType = user, for friendships)
- `relationshipType` (string, nullable) - Nature of connection - **completely user-extensible** - defaults: `related`, `caused`, `inspired`, `contrasts`, `builds_on`, `manifests`, `questions`, `fulfills`
- `strength` (integer 1-10, nullable) - Connection strength (user-defined or AI-suggested)
- `meaning` (text, nullable) - **Why this connection exists at the deepest level** - this is the CORE
- `notes` (text, nullable) - Additional context or observations
- `createdAt` (timestamp) - When connection was made
- `createdBy` (enum) - Who created: `user`, `ai_suggested`

**Relationships:**
- Created by one User
- Can reference any combination of: Experience, Thought, Desire, User (from/to pairs)

**Business Rules:**
- User must have access to both connected entities
- No self-connections (entity to itself)
- Connections are **directional** by default (from → to implies flow/causality)
- User friendships are bidirectional (creating A→B also creates B→A automatically)
- **ANY entity can connect to ANY other entity** - maximum flexibility for meaning-making
- Duplicate connections allowed if different `relationshipType` (same entities can have multiple relationship dimensions)
- `relationshipType` is **completely user-extensible** - starts with defaults but users create their own relationship vocabularies
- `meaning` attribute is the **CORE** - this captures why the connection matters at the deepest level
- `notes` are supporting details, observations, context
- All connection attributes are nullable initially except entity type pairs - meaning is layered over time

**Example Cross-Entity Connections:**
- Experience → Desire: "Trip to Japan" (experience) **fulfills** → "Travel more" (desire)
- Thought → Thought: "Why do I procrastinate?" (thought) **questions** → "Fear of failure blocks me" (thought)
- Desire → Experience: "Learn piano" (desire) **manifests** → "First piano lesson" (experience)
- Thought → Desire: "I feel disconnected from family" (thought) **reveals** → "Call Mom weekly" (desire)
- Experience → Thought: "Grandma's funeral" (experience) **caused** → "Life is short, priorities matter" (thought)

---

### Tag
Represents a user-defined or AI-suggested label for organization. Tags are personal vocabulary.

**Attributes:**
- `id` (UUID) - Unique identifier
- `userId` (UUID) - Owner of this tag
- `name` (string) - Tag name (e.g., "travel", "family", "career")
- `color` (hex string, nullable) - Visual color for tag (e.g., "#3B82F6")
- `createdAt` (timestamp) - Tag creation time

**Relationships:**
- Belongs to one User
- Has many Experiences (many-to-many via ExperienceTag join)
- Has many Thoughts (many-to-many via ThoughtTag join)
- Has many Desires (many-to-many via DesireTag join)

**Business Rules:**
- Tag names must be unique per user (case-insensitive)
- Maximum 100 tags per user (prevents tag chaos while allowing extensive vocabularies)
- System does not reserve any tag names - user has full control over their tagging vocabulary
- Color is optional - system can assign default colors from palette

---

### Profile
Extended user profile information (separated from User for performance - not loaded on every auth check).

**Attributes:**
- `id` (UUID) - Matches User.id (1:1 relationship)
- `bio` (text, nullable) - User bio/description
- `avatarUrl` (string, nullable) - Profile photo URL
- `onboardingCompleted` (boolean) - Whether user finished onboarding flow
- `onboardingStep` (integer, nullable) - Current onboarding step if incomplete
- `lifetimeExperienceCount` (integer) - Total experiences ever captured (for stats)
- `lifetimeThoughtCount` (integer) - Total thoughts ever written
- `lifetimeDesireCount` (integer) - Total desires ever created
- `lifetimeConnectionCount` (integer) - Total connections ever made
- `lastActiveAt` (timestamp) - Last time user interacted with app
- `createdAt` (timestamp) - Profile creation time
- `updatedAt` (timestamp) - Last modification time

**Relationships:**
- Belongs to one User (1:1)

**Business Rules:**
- Created automatically when User signs up
- `onboardingCompleted` must be true before user can capture experiences
- Stats (`lifetimeExperienceCount`, `lifetimeThoughtCount`, `lifetimeDesireCount`, `lifetimeConnectionCount`) updated via database triggers
- All fields nullable except `id` and stats - profile details are added over time

---

## 4.2: Data Model Diagram

```mermaid
erDiagram
    User ||--o{ ExperienceParticipant : "participates in"
    User ||--o{ Thought : "writes"
    User ||--o{ Desire : "has"
    User ||--o{ Connection : "creates"
    User ||--o{ Tag : "defines"
    User ||--|| Profile : "has"
    User }o--o{ User : "friends with"

    Experience ||--o{ ExperienceParticipant : "has participants"
    Experience ||--o{ Thought : "contains reflections"
    Experience ||--o{ Desire : "fulfills"
    Experience ||--o{ Connection : "connects from"
    Experience ||--o{ Connection : "connects to"
    Experience }o--o{ Tag : "tagged with"

    Desire ||--o{ Thought : "reflected upon"
    Desire ||--o{ DesireDependency : "depends on"
    Desire ||--o{ DesireDependency : "blocks"
    Desire }o--o{ Tag : "tagged with"

    Thought ||--o{ Thought : "nests within"
    Thought }o--o{ Tag : "tagged with"

    User {
        uuid id PK
        string email UK
        string phoneNumber UK-nullable
        string displayName nullable
        date birthDate nullable
        timestamp createdAt
        string timezone nullable
        jsonb preferences nullable
    }

    Experience {
        uuid id PK
        uuid createdByUserId FK
        timestamp capturedAt nullable
        decimal latitude nullable
        decimal longitude nullable
        string locationName nullable
        text rawText nullable
        text processedText nullable
        text[] mediaUrls nullable
        string category nullable
        int qualityScore nullable
        int qualityNumber nullable
        timestamp createdAt
        timestamp updatedAt
    }

    ExperienceParticipant {
        uuid id PK
        uuid experienceId FK
        uuid userId FK
        string role nullable
        timestamp joinedAt
        uuid addedBy FK-nullable
    }

    Thought {
        uuid id PK
        uuid userId FK
        uuid experienceId FK-nullable
        uuid desireId FK-nullable
        uuid parentThoughtId FK-nullable
        text content
        string thoughtType nullable
        string userCategory nullable
        int orderIndex
        timestamp createdAt
        timestamp updatedAt
    }

    Desire {
        uuid id PK
        uuid userId FK
        string name
        text description nullable
        text why nullable
        decimal intensity nullable
        int priority nullable
        boolean fulfilled
        timestamp fulfilledAt nullable
        uuid fulfilledByExperienceId FK-nullable
        timestamp createdAt
        timestamp updatedAt
    }

    DesireDependency {
        uuid id PK
        uuid desireId FK
        uuid dependsOnDesireId FK
        timestamp createdAt
    }

    Connection {
        uuid id PK
        uuid userId FK
        enum fromEntityType
        enum toEntityType
        uuid fromExperienceId FK-nullable
        uuid toExperienceId FK-nullable
        uuid fromThoughtId FK-nullable
        uuid toThoughtId FK-nullable
        uuid fromDesireId FK-nullable
        uuid toDesireId FK-nullable
        uuid fromUserId FK-nullable
        uuid toUserId FK-nullable
        string relationshipType nullable
        int strength nullable
        text meaning nullable
        text notes nullable
        enum createdBy
        timestamp createdAt
    }

    Tag {
        uuid id PK
        uuid userId FK
        string name
        string color nullable
        timestamp createdAt
    }

    Profile {
        uuid id PK
        text bio nullable
        string avatarUrl nullable
        boolean onboardingCompleted
        int onboardingStep nullable
        int lifetimeExperienceCount
        int lifetimeThoughtCount
        int lifetimeDesireCount
        int lifetimeConnectionCount
        timestamp lastActiveAt
        timestamp createdAt
        timestamp updatedAt
    }
```

## 4.3: Enumerations and User-Extensible Vocabularies

**CRITICAL PRINCIPLE:** All category/type enumerations start with sensible defaults but are **user-extensible**. Users define their own vocabularies for meaning-making.

**EntityType** (Connection.fromEntityType, Connection.toEntityType) - SYSTEM ENUM (not extensible)
- `experience` - Experience entity
- `thought` - Thought entity
- `desire` - Desire entity
- `user` - User entity (for friendships)

**RelationshipType** (Connection.relationshipType) - USER-EXTENSIBLE STRING
- **Initial defaults:** `related`, `caused`, `inspired`, `contrasts`, `builds_on`, `manifests`, `questions`, `fulfills`, `reveals`, `blocks`, `enables`
- **For user connections:** `friend`, `family`, `colleague`, `mentor`, `collaborator`
- **User can create custom types:** e.g., "soul_resonance", "creative_partnership", "challenging_mirror", "awakens", "transforms"
- **Cross-entity examples:** "manifests" (desire→experience), "questions" (thought→thought), "reveals" (thought→desire), "fulfills" (experience→desire)

**Category** (Experience.category) - USER-EXTENSIBLE STRING
- **Initial defaults:** `heart`, `mind`, `body`, `soul`, `abode`
- **User can create custom categories:** e.g., "career", "creativity", "nature", "travel"

**ThoughtType** (Thought.thoughtType) - USER-EXTENSIBLE STRING
- **Initial defaults:** `reflection`, `question`, `insight`, `todo`, `quote`
- **User can create custom types:** e.g., "prayer", "gratitude", "dream", "intention"

**CreatedBy** (Connection.createdBy) - SYSTEM ENUM (not extensible)
- `user` - User manually created connection
- `ai_suggested` - Pookie AI suggested connection (user can accept/reject)

**UserCategory** (Thought.userCategory) - FREEFORM STRING
- No defaults - completely user-defined
- Represents user's personal categorization system for their thoughts
- Examples: "morning_pages", "therapy_notes", "business_ideas", "poetry"

---

**Implementation Note:** User-extensible fields are stored as strings in the database. The frontend provides autocomplete from user's existing vocabulary + initial defaults. This allows infinite flexibility while maintaining usability through suggestions.

## 4.4: Temporal Philosophy - The Infinite Loop of Meaning

Reality's data model is architecturally designed around three temporal dimensions that form an **infinite self-reinforcing loop**:

1. **Experience (Past)** - What happened. The lived events of your reality.
2. **Thought (Present)** - What you think/reflect. Your current interpretation and sense-making.
3. **Desire (Future)** - What you want. Your aspirations, goals, and motivations.

### The Forward Loop: Desire → Thought → Experience → Desire

```
DESIRE (I want something)
   ↓
THOUGHT (How do I get it? Why do I want this?)
   ↓
ACTION (acting - not captured in the system, exists in physical reality)
   ↓
EXPERIENCE (I did it / it happened)
   ↓
THOUGHT (What did this mean? How do I feel about it?)
   ↓
DESIRE (This creates new wants based on what I learned)
   ↓
[LOOP CONTINUES]
```

**The Point: Understanding these connections IS solving the mind.**

Reality is not just a capture tool - it's a **meaning-making engine**. The more connections you create between Experiences, Thoughts, and Desires, the more you understand:
- Why you want what you want (Desire → Thought connections)
- How your past shapes your present thinking (Experience → Thought connections)
- What experiences fulfill which desires (Experience → Desire connections)
- How thoughts reveal hidden desires (Thought → Desire connections)
- How desires manifest into reality (Desire → Experience connections)

**Acting is the bridge** between mental states (Desire/Thought) and lived reality (Experience). Acting happens in the physical world, outside the system - but the system captures the **before** (Desire), the **during** (Thought while acting), and the **after** (Experience).

### Example: Complete Loop Cycle

**Cycle 1: Birth of Desire**
1. **Experience:** "Grandma's funeral" (captured: photo of her piano, rawText: "She played every Sunday")
2. **Thought on Experience:** "Music was how she expressed love. I never learned."
3. **Connection:** Experience "Grandma's funeral" **reveals** → Thought "Music was how she expressed love"
4. **Desire emerges:** "Learn piano" (why: "Music connects me to Grandma's memory", intensity: 0.8)
5. **Connection:** Thought "Music was how she expressed love" **reveals** → Desire "Learn piano"

**Cycle 2: Planning and Dependencies**
6. **Thought on Desire:** "How do I actually do this? What's blocking me?"
7. **Dependency Desires:** "Buy piano" (priority: 10), "Find teacher" (priority: 8), "Schedule daily practice" (priority: 5)
8. **Connection:** Desire "Learn piano" **depends_on** → Desire "Buy piano" (via DesireDependency)
9. **Thought:** "I can afford a used upright. Craigslist search this week."

**Cycle 3: First Action**
10. **[ACTING in physical reality: searches Craigslist, buys piano, moves it home]**
11. **Experience:** "Bought Grandma's exact piano model - a Yamaha U1" (photo of piano in living room, qualityScore: 10, qualityNumber: 7)
12. **Thought on Experience:** "This feels sacred. Like she's here."
13. **Connection:** Experience "Bought piano" **fulfills** → Desire "Buy piano" (fulfilled = true)
14. **Desire "Buy piano"** status changes to fulfilled, unblocks "Learn piano"

**Cycle 4: Learning and Reflection**
15. **[ACTING: takes first piano lesson]**
16. **Experience:** "First lesson - played Für Elise intro" (qualityScore: 9)
17. **Thought on Experience:** "My fingers are clumsy but my heart remembers. This is right."
18. **Connection:** Experience "First lesson" **manifests** → Desire "Learn piano" (partial fulfillment)
19. **Connection:** Experience "First lesson" **builds_on** → Experience "Bought piano"

**Cycle 5: New Desires Emerge**
20. **Thought:** "I want to share this. Music is meant to be given."
21. **Desire emerges:** "Perform Für Elise at family Thanksgiving" (why: "Honor Grandma by sharing her gift", intensity: 0.9)
22. **Connection:** Desire "Perform Für Elise" **builds_on** → Desire "Learn piano"
23. **Connection:** Thought "Music is meant to be given" **reveals** → Desire "Perform Für Elise"

**[LOOP CONTINUES INFINITELY]**

### The Meta-Purpose: Connections ARE the Meaning

Every time you create a connection, you are:
- **Mapping your mind** - making implicit relationships explicit
- **Understanding causality** - seeing how one thing leads to another
- **Finding patterns** - recognizing recurring themes in your life
- **Building wisdom** - connecting past experiences to future intentions

**This is how you solve the mind** - not by analyzing it in isolation, but by **mapping the web of connections** between what happened (Experience), what you think (Thought), and what you want (Desire).

The system gives you maximum freedom:
- **ANY entity can connect to ANY other entity** (Experience↔Thought, Desire↔Experience, Thought↔Desire, etc.)
- **Relationship types are user-defined** (you create your own vocabulary of connections)
- **Meaning is captured at the connection level** (the "why" lives in the relationship, not just the entities)

**The architecture is designed to get out of your way** and let you map reality as you experience it - messy, non-linear, deeply interconnected.

---

