# Sprint Change Proposal: (ur "reality") Vision - Pivot from Realm Organization to Action Choice

**Date:** 2025-11-08
**Trigger:** Story 2.10 (Physical/Mental realm navigation)
**Scope:** Epic 2 pivot + new Epic 3 definition
**Status:** Awaiting Approval

---

## Executive Summary

**The Core Issue:**
We built Epic 2 around organizing somethings into Physical/Mind realms, but the vision documents reveal the real need: **a thinking aid to help you choose what to do about what you care about when you have finite time**.

**The Pivot:**
- **Old Direction**: Organize captures by realm (Physical/Mind) → Chamber for classification → Map views
- **New Direction**: Frictionless capture (Live/Big) → Mystery Map (/ur-reality) → Chamber for ACTION choice → Reality Map (connections, dreams, goals, abilities)

**What This Means:**
- Epic 2 (Stories 2.1-2.9) has salvageable infrastructure but wrong UX direction
- Need new Epic 3: "Explorer Mode Capture + Mystery Map"
- Chamber will be reimagined for Phase 2 (future, not yet defined)
- Some Epic 2 work (database, auth, basic capture) still valuable
- Some Epic 2 work (Physical/Mind realm UI, Chamber organization) will be archived

---

## 1. Change Trigger & Context

### Triggering Story
**Story 2.10**: Physical→Mind Navigation (connecting the two realms via location links)

### What Went Wrong
During planning for Story 2.10, it became clear that **Physical/Mind realm separation doesn't align with the core vision**:

- **User's actual need**: "When I don't know what to do, head back to my reality and see what I can discover - make connections, dreams to pursue, goals to organize. A thinking aid to help me choose what to do."
- **What we built**: A system to classify somethings as Physical (map locations) vs Mind (thoughts) with care ratings

**The Fundamental Misunderstanding:**
We assumed organization by REALM (where/what type) was the core value. The actual core value is **choosing what to DO** about what you care about.

### Root Cause Analysis

**Incorrect Assumptions:**
1. "Users need to organize by Physical vs Mind realms" → Actually: Users need to choose ACTIONS (connect, pursue dreams, track abilities)
2. "Chamber is for realm classification" → Actually: Chamber should help choose what to do
3. "Capture should confirm submission" → Actually: Capture should be frictionless, unbounded

**What We Missed:**
- The vision is **"Roblox Studio for real life"** - a tool of tools for doing what you want
- Goal is **make reality more beautiful** (elevate the vibe, transform ugly → beauty)
- Constraint is **finite life** = must choose what to care about, what to do
- Heart as compass (Beauty ←→ Ugly spectrum) was underutilized

### Evidence

**From raw streams (ur-reality-raw-prompts.txt):**
> "the trigger: 2.10 where we are connecting the physical and mental realms was the impetus for realizing our current organization doesn't make sense"

> "the point is when you don't know what to do you head back to your reality and see what else you can discover in what you know already in a sense like make connections, dreams to pursue, goals to organize, etc. like its a thinking aid in a sense, helps you choose what you want to do."

> "It's not enough to just leave expression of care to chance. I want more. More what? Beauty."

**From vision doc (ur-reality.md):**
> "Because of DEATH, you simply can't care about everything. Even worse: You can only care and express your care for a small amount of somethings."

> "I need more information in general, i need to be aware of more... I need to increase my ability to do something, track what I can't do, track what I can, prioritize which abilities to work on and turn weaknesses into strengths."

---

## 2. Epic Impact Assessment

### Current Epic Status

**Epic 1: Foundation & Web-Based Capture** ✅ **COMPLETE**
- Stories 1.1-1.4 all done
- **Value**: Auth, database, basic capture infrastructure
- **Status**: **NO CHANGES NEEDED** - foundational work remains valid

**Epic 2: Chamber of Reflection & Mind's Abode Foundation** ⚠️ **PARTIAL**
- Stories 2.1-2.9 complete, Story 2.10 blocked
- **Salvageable**: Database schema (somethings table), authentication patterns, some capture logic
- **Problematic**: Realm organization UI, Physical/Mind separation, current Chamber UX
- **Status**: **NEEDS PIVOT** - keep infrastructure, archive UI/UX work

### Story-by-Story Analysis

| Story | Status | Value | Decision |
|-------|--------|-------|----------|
| **2.1: Database Schema Evolution** | Done | ✅ High | **Keep** - somethings table is correct foundation |
| **2.2: Chamber Foundation** | Done | ⚠️ Mixed | **Partially Keep** - Split functionality reusable, realm organization UI to archive |
| **2.3: Physical Map View** | Done | ❌ Low | **Archive** - Physical realm concept deprecated |
| **2.4: Chamber Organization (Physical vs Mind)** | Done | ❌ Low | **Archive** - Wrong organization model |
| **2.5: Physical Location Capture** | Done | ❌ Low | **Archive** - Location capture not priority |
| **2.6: Location Name/Address Separation** | Done | ❌ Low | **Archive** - Not needed for Phase 1 |
| **2.7: Physical Map 3D Buildings/Markers** | Done | ❌ Low | **Archive** - Physical realm deprecated |
| **2.8: Mind Card View (Pokémon Style)** | Done | ⚠️ Mixed | **Partially Keep** - Card display pattern reusable for /ur-reality content |
| **2.9: Mind List/Grid View** | Done | ❌ Low | **Archive** - Mind realm organization deprecated |
| **2.10: Physical→Mind Navigation** | Blocked | ❌ None | **Cancel** - Connecting deprecated concepts |

### Future Epic Impact

**Epic 3**: Planned for Visual Mapping & Connections
**Status**: **REDEFINE** - becomes "Explorer Mode Capture + Mystery Map"

**Epic 4+**: LLM, Shared Experiences, etc.
**Status**: **ON HOLD** - awaiting Phase 1 completion

---

## 3. Artifact Conflict & Impact Analysis

### PRD (docs/prd.md)

**Conflicts:**
- Epic 2 description: "Build separate Physical and Mind abode layers with care-based organization"
- Chamber description: "Liminal portal space for triaging unorganized captures one-by-one via slideshow. User-controlled split decisions, **realm classification**, category/tag assignment"
- Mind's Abode section describes Physical/Mind/Heart as three separate abodes

**Required Updates:**
- Replace Epic 2 with new vision from ur-reality.md
- Update Chamber philosophy to focus on ACTION choice, not realm classification
- Deprecate Physical/Mind realm separation in favor of unified "somethings" with future Chamber for action choices
- Add Phase 1/2/3 structure from ur-reality.md

### Epic 2 Brainstorming (docs/epic-2-brainstorming.md)

**Conflicts:**
- Entire document focused on Physical Abode (map) + Mind Abode (cards) separation
- "Shawarma Pole" metaphor of layered reality (Physical/Mind/Heart as separate layers)
- Chamber designed for realm classification

**Required Updates:**
- Archive this document (move to `docs/archive/epic-2-brainstorming-v1.md`)
- Create new epic-3-brainstorming.md for Capture + Mystery Map vision

### Architecture Document (docs/architecture.md)

**Conflicts:**
- May contain Physical/Mind realm architectural decisions
- Chamber workflow assumes realm classification

**Required Updates:**
- Review and update realm model sections
- Add capture page architecture (Live-Capture + Big-Capture)
- Add /ur-reality Mystery Map architecture
- Update Chamber section to "Future: Action choice system (not yet defined)"

### Database Schema (somethings table)

**Good News**: Mostly compatible! ✅

**Current Schema:**
```sql
CREATE TABLE somethings (
  id UUID,
  user_id UUID,
  text_content TEXT,
  media_url TEXT,
  realm TEXT,              -- Physical/Mind - will deprecate
  latitude DECIMAL,        -- Keep for future use
  longitude DECIMAL,       -- Keep for future use
  care INT,                -- Keep - aligns with Beauty←→Ugly spectrum
  captured_at TIMESTAMPTZ, -- Keep
  attributes JSONB         -- Keep - flexible for future Chamber actions
)
```

**Migration Needed:**
- **Realm field**: Set to NULL for new captures (no longer used)
- **Attributes field**: Will store future Chamber decisions (dreams, goals, connections, abilities)
- **Latitude/longitude**: Keep but optional (might use for thematic abodes like "Lil Wayne abode")
- **No structural changes needed** - just stop populating realm field

---

## 4. Path Forward Evaluation

### Option 1: Direct Adjustment (Recommended)

**Approach:**
Keep Epic 2 database work, archive Physical/Mind UI, build new Epic 3 for Capture + Mystery Map

**Scope:**
- **Keep**: Database schema, auth patterns, basic infrastructure
- **Archive**: Physical map, Mind cards/grid, Chamber realm organization UI
- **Build New**: Live-Capture page, Big-Capture page, /ur-reality Mystery Map

**Effort:**
- 3 new stories for Epic 3 (~2-3 weeks development)
- Minimal Epic 2 cleanup (just stop using deprecated routes)

**Benefits:**
- ✅ Preserves valuable database/auth work
- ✅ Fast pivot to correct vision
- ✅ Users can start using capture pages immediately
- ✅ Chamber reimagined for Phase 2 (future)

**Risks:**
- ⚠️ Old routes (/chamber, /my_reality, /mind) still exist (can hide with middleware)
- ⚠️ Need to communicate change to any testers

**Feasibility**: ✅ **HIGH** - Most work is new pages, minimal cleanup

---

### Option 2: Rollback

**Approach:**
Revert Epic 2 commits, start fresh from Epic 1

**Effort:**
- Rollback Stories 2.2-2.9 code
- Keep Story 2.1 (database schema)
- Rebuild from clean slate

**Benefits:**
- ✅ Clean codebase (no deprecated code)
- ✅ No confusion about old routes

**Risks:**
- ❌ Loses salvageable work (split editor, card display patterns)
- ❌ Higher effort (must rebuild what's reusable)
- ❌ Git history complexity

**Feasibility**: ⚠️ **MEDIUM** - Possible but wasteful

---

### Option 3: MVP Re-scoping (Not Recommended)

**Approach:**
Try to salvage Physical/Mind realms by adapting to new vision

**Why Not:**
- ❌ Fundamentally misaligned concepts
- ❌ Would require extensive rework of all Epic 2 stories
- ❌ Delays getting to correct vision
- ❌ Confuses the core philosophy

**Feasibility**: ❌ **LOW** - Not worth the effort

---

### **Recommended Path: Option 1 (Direct Adjustment)**

**Rationale:**
- Fastest path to correct vision
- Preserves valuable infrastructure work
- Chamber can be reimagined for Phase 2 (future, not blocking)
- New capture pages align with "unbounded exploration" philosophy

---

## 5. Sprint Change Proposal Components

### Identified Issue Summary

**Problem:**
Epic 2 was built around realm organization (Physical/Mind) when the core need is **a thinking aid to help choose what to do about what you care about**.

**Impact:**
- Story 2.10 (Physical→Mind navigation) is blocked and unmotivated
- Epic 2 UI work (map, mind cards, realm organization) doesn't serve core vision
- Capture page has friction (redirects, confirmations) - opposite of unbounded exploration
- Missing: connections, dreams, goals, abilities tracking (the actual "what to do" tools)

---

### Epic Impact Summary

**Epic 1**: ✅ No changes - foundational work valid

**Epic 2**: ⚠️ Partial salvage
- **Keep**: Database schema (Story 2.1), auth patterns, split functionality
- **Archive**: Physical map (2.3, 2.7), Mind views (2.8, 2.9), Chamber realm organization (2.2, 2.4)
- **Cancel**: Story 2.10 (Physical→Mind navigation)

**Epic 3**: 🔄 Redefine as "Explorer Mode Capture + Mystery Map"

---

### Artifact Adjustment Needs

1. **docs/prd.md**:
   - Replace Epic 2 description with ur-reality.md vision
   - Deprecate Physical/Mind realm sections
   - Add Phase 1/2/3 structure

2. **docs/epic-2-brainstorming.md**:
   - Archive to `docs/archive/epic-2-brainstorming-v1.md`
   - Create new `docs/epic-3-brainstorming.md` for Capture + Mystery Map

3. **docs/architecture.md**:
   - Update realm model (deprecate Physical/Mind separation)
   - Add capture page architecture (Live/Big-Capture)
   - Add /ur-reality Mystery Map architecture

4. **Database**:
   - No structural changes
   - Stop populating `realm` field (set to NULL)
   - Use `attributes` JSONB for future Chamber decisions

5. **Code**:
   - Hide deprecated routes via middleware (soft deprecation)
   - Keep database/auth code
   - Build new Epic 3 pages

---

### Recommended Path Forward

**Option 1: Direct Adjustment** ✅

**Next Steps:**
1. Archive Epic 2 brainstorming doc
2. Create Epic 3: "Explorer Mode Capture + Mystery Map"
3. Write 3 new stories:
   - **Story 3.1**: Live-Capture Page (dark mode, rocket ship, mic, auto-save)
   - **Story 3.2**: Big-Capture Page (light mode, file upload, auto-split, OCR/transcription)
   - **Story 3.3**: /ur-reality Mystery Map (question marks, hover/click, content display)
4. Hide deprecated routes (/chamber, /my_reality, /mind) via middleware
5. Update PRD and architecture docs with new vision

---

### PRD MVP Impact

**Original MVP Goal (Epic 1-2):**
Capture → Organize by realm (Physical/Mind) → View on map/cards

**New MVP Goal (Epic 1 + Epic 3):**
Capture (frictionless, unbounded) → Mystery Map (/ur-reality) → Future Chamber (action choice)

**Scope Changes:**
- ❌ Remove: Physical map, Mind cards, realm organization
- ✅ Add: Live-Capture, Big-Capture, Mystery Map
- ⏸️ Defer: Chamber (Phase 2 - action choice, not yet defined)

**Timeline Impact:**
- Epic 2 work (2.2-2.9) = ~4 weeks → Archived (salvage infrastructure only)
- Epic 3 work (3.1-3.3) = ~2-3 weeks → New stories
- **Net timeline**: ~2-3 weeks from now to Phase 1 complete

---

### High-Level Action Plan

**Immediate (Next 1-2 days):**
1. ✅ Archive Epic 2 brainstorming doc
2. ✅ Create Epic 3 brainstorming with capture + mystery map details
3. ✅ Update PRD with new vision sections
4. ✅ Update architecture doc (realm model, capture pages, mystery map)

**Short-term (Next 2-3 weeks):**
1. ✅ Write Story 3.1: Live-Capture Page
2. ✅ Write Story 3.2: Big-Capture Page
3. ✅ Write Story 3.3: /ur-reality Mystery Map
4. ✅ Implement all 3 stories sequentially
5. ✅ Hide deprecated routes via middleware
6. ✅ Manual test entire capture → mystery map flow

**Medium-term (Future Phase 2):**
1. ⏸️ Use Phase 1 (capture + mystery map) to discover Chamber needs
2. ⏸️ Define Chamber for action choice (dreams, goals, connections, abilities)
3. ⏸️ Write stories for Phase 2 Chamber implementation

---

### Agent Handoff Plan

**Roles Needed:**

1. **SM (Scrum Master - Bob)**:
   - Archive Epic 2 brainstorming
   - Create Epic 3 brainstorming
   - Write Stories 3.1, 3.2, 3.3

2. **Dev (Developer - James)**:
   - Implement Story 3.1 (Live-Capture)
   - Implement Story 3.2 (Big-Capture)
   - Implement Story 3.3 (/ur-reality)
   - Hide deprecated routes
   - Update any broken imports

3. **QA (Test Architect - Quinn)**:
   - Review each story after implementation
   - Manual test capture → mystery map flow
   - Create quality gates for Epic 3

4. **PM (Product Manager)** (if needed):
   - Update PRD sections
   - Align vision docs

5. **Architect** (if needed):
   - Update architecture doc
   - Review database migration (realm field deprecation)

**Immediate Next Agent:** SM Bob to create Epic 3 stories

---

## 6. Final Review & Approval

### Checklist Completion

- ✅ **Trigger identified**: Story 2.10 revealed realm organization doesn't align with vision
- ✅ **Issue defined**: Built for realm classification, need action choice tool
- ✅ **Epic impact assessed**: Epic 2 partial salvage, Epic 3 redefined
- ✅ **Artifact conflicts identified**: PRD, epic brainstorming, architecture docs
- ✅ **Path evaluated**: Option 1 (Direct Adjustment) recommended
- ✅ **Proposal components documented**: Issue, impact, path, action plan, handoffs

### Proposal Alignment

This proposal accurately reflects:
- Vision from ur-reality.md
- Philosophy from raw streams (ur-reality-raw-prompts.txt)
- Current state (Epic 1 complete, Epic 2 done but misaligned)
- Desired state (Phase 1: Capture + Mystery Map)

### User Approval Needed

**Question for User:**
Do you approve this Sprint Change Proposal to:
1. Archive Epic 2 UI work (Physical map, Mind views, realm organization)
2. Keep Epic 2 infrastructure (database, auth, split functionality)
3. Create new Epic 3: "Explorer Mode Capture + Mystery Map" (3 stories)
4. Update PRD/architecture docs to reflect ur-reality.md vision

**If approved, next steps:**
- SM Bob creates Epic 3 brainstorming doc
- SM Bob writes Stories 3.1, 3.2, 3.3
- Dev James implements sequentially
- QA Quinn reviews each story

---

**Prepared by:** SM Bob (BMAD Scrum Master)
**Date:** 2025-11-08
**Status:** Awaiting User Approval
