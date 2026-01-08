# Sprint Change Proposal: Epic 5 Simplification & Documentation Cleanup

**Date**: 2025-11-14
**Agent**: Scrum Master (Bob)
**Status**: Approved

---

## 1. Identified Issue Summary

**Triggering Event**: User reported confusion with multiple versioned documents (epic-3, epic-4, epic-5, prd-v5, prd.md, etc.)

**Core Problem**: Document proliferation creating cognitive overhead and making it difficult to maintain single source of truth for current direction.

**Initial Assessment**: Too many brainstorming/planning documents scattered across docs folder without clear active/archived distinction.

---

## 2. Epic Impact Summary

**Current Epic**: N/A (between planning phases)

**Future Epics**:
- Epic 5 is NOW the active epic (Chamber Logic & Abode Organization)
- Epic 3, 4 brainstorming archived (not yet implemented)
- Focus shifted to implementing Epic 5 based on Stream 14 brainstorming

**Impact on Epic Structure**:
- ✅ Preserved: Epic 5 direction and scope
- ✅ Archived: Old epic brainstorms (3, 4) and PRD versions
- ✅ Maintained: ur-reality.md as living vision document
- ✅ Created: epic-5-brainstorming.md as implementation guide

---

## 3. Artifact Adjustment Summary

### Documents Archived
Moved to `docs/archive/`:
- `epic-3-brainstorming.md`
- `epic-4-1st-draft-proposal.md`
- `prd.md`
- `prd-v5.md`
- `sprint-change-proposal-ur-reality-pivot.md`

### Documents Unarchived (Active)
Moved back to `docs/`:
- `ur-reality.md` (core vision document)
- `ur-reality-raw-prompts.txt` (consciousness streams log)

### Documents Created
- `docs/epic-NOW.md` (empty placeholder - decided not to use)
- `docs/epic-5-brainstorming.md` (Epic 5 implementation spec)
- `docs/sprint-change-proposal-epic-5-simplification.md` (this document)

### Documents Updated
- `ur-reality-raw-prompts.txt` - Added Stream 14 (Chamber Logic brainstorming)
- `ur-reality.md` - Added Chamber View and Abode System sections

---

## 4. Recommended Path Forward

**Selected Path**: Direct Adjustment / Integration

**Rationale**:
- Not a fundamental direction change - still following ur-reality vision
- Epic 5 naturally extends existing 3.4 work (Three.js space, question marks)
- No work needs to be rolled back
- Clear implementation path defined
- Maintains momentum without replanning

**Why Not Rollback**: No completed work conflicts with new direction

**Why Not Re-scope MVP**: Epic 5 aligns with MVP goals (organize somethings into meaningful spaces)

---

## 5. PRD/MVP Impact

**Changes to Scope**: None - Epic 5 was already planned direction

**MVP Still Achievable**: Yes
- Capture system (✅ Complete - Stories 2.1, 3.1, 3.2)
- Mystery map visualization (✅ Complete - Story 3.4)
- Chamber organization (🔄 Epic 5 - Next)
- Basic abode system (🔄 Epic 5 - Next)

**Core MVP Goals Unchanged**:
1. Capture somethings easily
2. View somethings in infinite space
3. Organize somethings into abodes
4. Reflect in chamber to decide what to do

---

## 6. High-Level Action Plan

### Immediate Next Steps

**1. Documentation Cleanup** ✅ COMPLETE
   - Archive old epic/PRD versions
   - Maintain ur-reality.md as single source of truth
   - Keep ur-reality-raw-prompts.txt for stream-of-consciousness capture

**2. Epic 5 Planning**
   - Use epic-5-brainstorming.md as implementation guide
   - Break down into stories following BMAD workflow
   - SM creates detailed stories from epic-5-brainstorming.md

**3. Story Creation** (Next)
   - SM: Create Story 5.1 (Page load animation + spaceship)
   - SM: Create Story 5.2 (Chamber entry flow)
   - SM: Create Story 5.3 (Chamber view UI)
   - SM: Create Story 5.4 (Send to Abode system)
   - SM: Create Story 5.5 (Abode spatial structure + expansion)

**4. Development Cycle** (After stories approved)
   - Dev: Implement stories sequentially
   - QA: Review each story
   - Iterate until Epic 5 complete

---

## 7. Agent Handoff Plan

**Current Agent**: SM (Scrum Master)

**Next Agent**: SM (Story Creation)
- **Task**: Execute `*draft` command to create Story 5.1
- **Input**: epic-5-brainstorming.md
- **Output**: docs/stories/5.1-[slug].md

**After Stories Approved**: Dev (Developer)
- **Task**: Execute `*develop-story` for each story
- **Input**: Approved story files
- **Output**: Working code + tests

**After Each Story**: QA (Test Architect)
- **Task**: Execute `*review` command
- **Input**: Completed story
- **Output**: Quality gate decision + feedback

---

## 8. Specific Proposed Edits

### ur-reality.md Changes ✅ COMPLETE

**Section 5 Title**:
- **From**: "The /ur-reality Page"
- **To**: "The /my-reality/somewhere Page"

**Added Section**: "Navigation Features & Chamber Entry"
- Page load animation sequence
- Chamber entry flow (spaceship click → animation → chamber view)
- "ENTER CHAMBER" text specification

**Added Section**: "Chamber View (Organization Interface)"
- Visual layout specification
- Send to Abode dropdown (Dreams, Beauty, Ugly, Rules of Reality, Create New)
- Abode system explanation (hexagonal lattice, dynamic expansion)
- Chamber purpose clarification

### epic-5-brainstorming.md ✅ CREATED

**New file with complete Epic 5 specification**:
- Page load animation sequence
- Chamber entry flow
- Chamber view layout
- Send to Abode system
- Abode spatial structure
- Database schema changes
- User flow example
- Success criteria (10 checkpoints)
- Out of scope clarifications

---

## 9. Technical Debt / Risks

**Low Risk**:
- Epic 5 extends existing 2D implementation (Story 3.4)
- No conflicting features to remove
- Incremental addition of chamber logic

**Potential Challenges**:
- Spaceship sprite/image creation (design asset needed)
- Complex animation choreography (zoom, fly, fade, blink)
- Hexagonal lattice expansion algorithm (extend existing)
- Abode spatial positioning logic

**Mitigation**:
- Keep spaceship simple (2D sprite/image for MVP)
- Break animations into separate tasks per story
- Reuse lattice logic from 3.4, add expansion trigger
- Random abode positions acceptable for initial implementation

---

## 10. Success Metrics

**Sprint Change Proposal Success**:
- ✅ Documents organized (archive vs. active clear)
- ✅ Single source of truth established (ur-reality.md + epic-5-brainstorming.md)
- ✅ User confusion eliminated
- ✅ Clear path forward defined

**Epic 5 Success** (Future):
- Chamber entry animation complete and smooth
- User can organize all somethings via chamber
- Abodes created and expand dynamically
- Unknown shrinks as Known expands
- All 10 success criteria in epic-5-brainstorming.md met

---

## Summary

**What Changed**: Cleaned up document proliferation, focused on Epic 5 as immediate priority

**Why**: User reported confusion with too many versioned docs

**What We're Doing**:
1. Archived old brainstorming docs
2. Established ur-reality.md as vision doc
3. Created epic-5-brainstorming.md as implementation spec
4. Ready to create detailed stories for Epic 5

**Who Does What**:
- SM creates Story 5.1 next (page load + spaceship)
- Dev implements stories after approval
- QA reviews completed stories

**When We'll Know It Worked**:
- Clear document structure
- Smooth story creation
- Epic 5 features working as described

---

**Status**: ✅ Proposal Approved
**Next Action**: SM create Story 5.1 using `*draft` command
**Context**: epic-5-brainstorming.md ready for story extraction
