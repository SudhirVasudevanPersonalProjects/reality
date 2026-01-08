# Product Requirements Document v5.0
## (ur "reality") - Mapping Your Inner System

**Status:** Draft
**Version:** 5.0
**Date:** 2025-11-12
**Epic:** Epic 5 - The Lens System

---

## 🎯 Vision

**You are mapping the invisible system of drives inside you (ur "reality"), so you can see which lenses arise, understand why, and consciously choose which ones to follow.**

---

## 🧠 The Core Problem

Your mind is a **bustling city of drives** - a chaotic, complex system of competing wants, fears, desires, and impulses.

Most people:
- Don't see these drives
- React unconsciously
- Don't understand why they care about what they care about
- Can't direct their will intentionally

**The solution:** Map the system. Make the invisible visible.

---

## 📖 The System Model (Story Mode)

### The Moment of Resonance

You're just aware. Peaceful. Nothing happening.

Something appears in reality (a flower, a face, a thought).

**Two outcomes:**

**1. No Resonance**
- You see it
- Nothing stirs
- No capture

**2. Resonance (The Capture Moment)**
- You see it
- Something stirs inside you
- A **lens** rises up (unconscious or conscious)
- The experience is colored by the lens
- You feel compelled to capture it

**What happened?** A drive inside you activated. A lens pulled up.

---

### The Lens (The Question Mark)

You captured something (photo, text, video, link).

**You ask:** Why did I capture this? What stirred in me?

You look inward at the feeling.

You discover: A lens.

**Example lenses:**
- Beauty (the want to be here, to exist, to stay alive)
- Connection (the want to belong, to be seen)
- Curiosity (the want to know, to understand)
- Fear (the want to avoid harm)
- Purpose (the want to matter)

**The lens is initially unknown** - a question mark (?).

Over time, through reflection and pattern recognition, you name it.

---

### The System Beneath

This isn't about one capture.

**The same lens arises repeatedly:**
- You see a flower → beauty lens
- You hear music → beauty lens
- You watch sunset → beauty lens

**Pattern recognition:** Multiple captures through the same lens.

**What is beauty really?** It's a **system** inside you - a complex subsystem of drives, wants, and responses.

---

### The Hierarchy of Systems

As you map more lenses, you discover **meta-patterns.**

**Example hierarchy:**

```
The Kid (Heart/Source)
├── Beauty system
│   ├── Want to be here
│   ├── Aesthetic attraction
│   └── Joy response
└── Ugly system
    ├── Want to avoid
    ├── Disgust response
    └── Pain avoidance

The Human (Mind + Body)
├── Understanding system
│   ├── Curiosity
│   ├── Pattern recognition
│   └── Explanation-making
└── Action system
    ├── Capability tracking
    ├── Goal pursuit
    └── Will execution
```

**The Kid** = The source of beauty and ugly (heart, vibe dimension)
**The Human** = The one who names, understands, acts (mind + body)
**Beauty, Ugly, Curiosity, Fear** = Named subsystems you discover

**These are labels** you give to patterns you observe in yourself.

---

### The Mysterious System (Your Life)

**What you're mapping is your life itself.**

Not the events. Not the timeline.

**The invisible system** that governs:
- What you notice
- What you care about
- What lenses arise
- When they arise
- Why they arise

**This system IS (ur "reality").**

It's the operating system running beneath your awareness.

---

## 🔄 The Evolution Loop

### 1. Experience
Reality presents something (flower, conversation, thought)

### 2. Resonance
A lens arises (unconsciously or consciously)
You feel/think something

### 3. Capture
You record the evidence (photo, text, video)
The capture = proof that a lens activated

### 4. Reflection
You ask: "What lens did this come through?"
You look at the feeling
You name it (or leave it as ?)

### 5. Connection
You link the capture to the lens
You link lenses to each other
The map grows

### 6. Pattern Recognition
You see: "I've captured 10 things through the beauty lens"
You realize: "Beauty is a major system in me"

### 7. Intention
You ask: "What do I want?"
You set a goal/question
The system responds: "Here are the lenses relevant to that"

### 8. Navigation
You explore the highlighted lenses
You see connections you hadn't noticed
You understand yourself better

### 9. Choice
Now that you see the system, you can choose
Which lens do you want to follow?
Which drive aligns with your will?

### 10. Action
You act in reality, directed by conscious choice
The result feeds back into the system

**Loop repeats. The map deepens. The system clarifies.**

---

## 🤖 The Baby AI (Attention Mechanism)

The AI isn't separate from the system. **It IS the system.**

### What It Does

1. **Stores** the map (captures, lenses, connections)
2. **Recognizes patterns** (same lens, multiple captures)
3. **Calculates relevance** (when you set intention, which lenses matter?)
4. **Surfaces** relevant nodes (attention mechanism)
5. **Learns** from your choices (feedback loop)

### How It Works (Transformer Analogy)

| Transformer Component | (ur "reality") Component | Function |
|----------------------|-------------------------|----------|
| Query (Q) | Intention / Goal | User sets a goal or asks a question |
| Keys (K) & Values (V) | Captures + Lenses | Every captured experience and discovered lens |
| Attention Mechanism | The Ship (Focus) | When goal is set, attention activates |
| Output (Weighted Sum) | Relevant Lenses Surface | System highlights which nodes matter for this goal |

**This is NOT an LLM.** It doesn't generate text.

It's an **attention-based navigation system** for your inner world.

**Over time, it grows more accurate** because:
- The map grows richer
- It learns which connections you reinforce
- Feedback from your actions improves relevance scoring

---

## 🌍 The Three Worlds

| World | What It Is | In This System |
|-------|------------|----------------|
| **Reality** | The outer world (unknown, infinite) | The flower, the experiences, what happens |
| **ur-reality** | Your inner system (your map) | The lenses, the drives, the system you're building |
| **My Reality** | What you've discovered (the known) | Named lenses, understood patterns, conscious map |

**Reality** is infinite, unknown, what exists.
**ur-reality** is your personal, evolving map of what drives you.
**My Reality** is the subset you've made conscious and named.

---

## 🗄️ Data Model

### Core Tables

#### **captures**
Concrete evidence of resonance

```sql
id              UUID PRIMARY KEY
user_id         UUID
content_type    TEXT ('text', 'image', 'video', 'url')
text_content    TEXT
media_url       TEXT
attributes      JSONB (link metadata, etc.)
captured_at     TIMESTAMP
```

#### **lenses**
The drives/question marks (initially unknown)

```sql
id              UUID PRIMARY KEY
user_id         UUID
name            TEXT (NULL initially, named during discovery)
description     TEXT (what this lens means to you)
care_level      INT (-2 to +2, beauty/ugly spectrum)
type            TEXT ('discovered', 'system', 'meta')
discovered_at   TIMESTAMP
capture_count   INT (how many captures through this lens)
```

**Lens types:**
- `discovered` - User-discovered lenses (beauty, connection, etc.)
- `system` - Meta-system labels (The Kid, The Human)
- `meta` - Higher-order patterns (subsystems)

#### **connections**
Links between captures and lenses, lenses and lenses

```sql
id                  UUID PRIMARY KEY
user_id             UUID
from_id             UUID (capture or lens)
to_id               UUID (lens)
from_type           TEXT ('capture', 'lens')
to_type             TEXT ('lens')
relationship_type   TEXT ('through', 'contains', 'drives', 'fulfills')
meaning             TEXT (why this connection exists)
strength            INT (1-10, connection strength)
created_at          TIMESTAMP
```

**Relationship types:**
- `through` - Capture came through this lens
- `contains` - Lens contains sub-lenses (beauty → want to be here)
- `drives` - Lens drives another lens
- `fulfills` - Lens fulfills another lens

#### **intentions**
Goals/questions user sets (activates attention)

```sql
id              UUID PRIMARY KEY
user_id         UUID
query           TEXT (the goal or question)
active          BOOLEAN (currently active?)
created_at      TIMESTAMP
completed_at    TIMESTAMP
```

#### **attention_results**
Which lenses surfaced for an intention (AI output)

```sql
id              UUID PRIMARY KEY
intention_id    UUID
lens_id         UUID
relevance_score FLOAT (0.0-1.0, calculated by attention mechanism)
surfaced_at     TIMESTAMP
```

---

## 🎨 Visual System

### "Somewhere, A Realm of Somethings" (2D Space)

**What You See:**
- **Question marks (?)** = Lenses (drives you're discovering)
- **Size** = How many captures through this lens (bigger = more captures)
- **Color** = Care level (dark = ugly, bright = beauty, grey = neutral)
- **Connections** = Lines between lenses (the system map)

**Interactions:**

**1. Default View (No Intention Set)**
- All lenses visible as question marks
- Can pan/zoom through the space
- Hover over lens → see captures that came through it
- Click lens → explore it in detail

**2. Intention View (Goal Set)**
- User sets intention (text input)
- Attention activates (ship leaves globe metaphor)
- **Relevant lenses glow/highlight** (attention mechanism)
- Irrelevant lenses fade
- User follows the trail

**3. Exploration View (Lens Detail)**
- Click a lens
- See all captures through this lens
- See connections to other lenses
- Option to name the lens (if unnamed)
- Option to add description

---

## 🛠️ Technical Architecture

### System Components

#### **1. Capture System** ✅ (Already built)
- Live-capture page (`/capture`)
- Deep-capture page (`/deep-capture`)
- Stores in `somethings` table

#### **2. Lens Discovery System** ❌ (To build)
- UI to connect captures to lenses
- Create new lens (starts as ?)
- Name lens during reflection
- View all captures through a lens

#### **3. Connection Mapping System** ❌ (To build)
- Link captures → lenses
- Link lenses → lenses (hierarchy)
- Visualize connections (graph view)

#### **4. Attention Engine (Baby AI)** ❌ (To build)
- Input: Intention (query text)
- Process: Calculate relevance scores for all lenses
- Output: Ranked list of relevant lenses
- Algorithm: TF-IDF + semantic similarity (simple v1)

**V1 Algorithm (Simple):**
```
For each lens:
  - Extract all capture text through this lens
  - Calculate TF-IDF similarity to intention query
  - Bonus weight for connection strength
  - Bonus weight for capture count
  - Return relevance score (0.0-1.0)

Sort lenses by relevance score
Surface top N lenses in visual space
```

**V2 Algorithm (Advanced):**
- Use embeddings (OpenAI API or local model)
- Semantic similarity calculation
- Learn from user feedback (which lenses they explore)

#### **5. Visual Navigation System** ❌ (To build)
- 2D canvas rendering (already have base from Story 4.1)
- Intention input UI
- Attention visualization (glow/fade effect)
- Lens detail view

---

## 📊 Migration from Current Schema

### What We Keep
- `somethings` table → becomes `captures` (rename)
- `connections` table → extend with `from_type`, `to_type`
- Location fields, `attributes`, `care`

### What We Add
- `lenses` table (new)
- `intentions` table (new)
- `attention_results` table (new)

### What We Deprecate
- `realm`, `domain`, `category_path` → not needed for lens system
- `my_reality`, `cares`, `thoughts` extension tables → simplified into lenses
- `categories`, `tags` → replaced by lens hierarchy

**Migration strategy:** Keep old tables for now, build new system alongside, migrate data later.

---

## 📦 MVP Feature Set

### **Phase 1: Build the Map** (Epic 5.1)

**Story 5.1.1: Lens Creation & Connection**
- User can create a new lens (starts as ?)
- User can connect a capture to a lens
- User can view all captures through a lens

**Story 5.1.2: Lens Naming & Discovery**
- User can name a lens (? → "Beauty")
- User can add description to lens
- User can see lens metadata (capture count, first discovered)

**Story 5.1.3: Lens Hierarchy**
- User can connect lens to lens (beauty → want to be here)
- User can mark lenses as "system" or "meta" types
- Visual hierarchy view

**Story 5.1.4: Visual Space Updates**
- Update `/my-reality/somewhere` to show lenses instead of captures
- Lens size = capture count
- Lens color = care level
- Hover shows lens name + capture preview

### **Phase 2: Activate Attention** (Epic 5.2)

**Story 5.2.1: Intention Setting**
- User can input intention/goal (text box)
- Intention stored in database
- UI shows active intention

**Story 5.2.2: Attention Engine (Simple)**
- TF-IDF based relevance calculation
- Calculate scores for all lenses
- Return ranked list

**Story 5.2.3: Visual Attention**
- Relevant lenses glow/grow in visual space
- Irrelevant lenses fade
- Smooth animation transition
- Click lens to explore

**Story 5.2.4: Feedback Loop**
- Track which lenses user explores
- Store in `attention_results`
- Use for future relevance improvements

---

## 🎯 Success Metrics

### User Behavior
- % of captures that get connected to lenses
- Average # of captures per lens
- % of lenses that get named (? → named)
- # of intentions set per week

### System Growth
- # of lenses created over time
- # of connections made over time
- Depth of lens hierarchy (levels)

### Engagement
- Time spent in visual exploration mode
- # of times attention activated per week
- Repeat visits to same lenses

---

## 🚧 Out of Scope (For Now)

- Social features (sharing lenses with others)
- AI-suggested connections
- Advanced embeddings (OpenAI API)
- Mobile app
- Voice capture with auto-lens detection
- Real-time collaboration

---

## 🔮 Future Vision

### Phase 3: The System Learns
- AI suggests lens names based on patterns
- AI suggests connections between lenses
- AI learns your hierarchy preferences

### Phase 4: Social Discovery
- Share lens maps with friends
- Find people with similar lens structures
- Collaborative exploration

### Phase 5: Reality Sync
- Connect lenses to real-world actions
- Track: Did following this lens lead to beauty or ugly?
- Feedback loop: Adjust lens weights based on outcomes

---

## 📝 Appendix: Key Concepts

### The Lens
A drive, want, or impulse inside you that causes you to notice and capture something. Initially unknown (?), discovered through reflection and pattern recognition.

### The Kid
The source of beauty and ugly - the heart, the vibe dimension. Pure feeling, pure want.

### The Human
The mind + body. The one who names, understands, organizes, and acts.

### Resonance
The moment when something in reality activates a lens inside you, causing you to care.

### The Capture
Evidence that a lens activated. The concrete artifact (photo, text, video, link).

### The Connection
A link between capture and lens, or lens and lens. Represents the system structure.

### Intention
A goal or question you set that activates the attention mechanism.

### Attention
The focus mechanism that surfaces relevant lenses when intention is set. The "ship" that navigates your inner world.

### (ur "reality")
The invisible system of drives inside you. What you're mapping.

---

**END OF PRD v5.0**
