# Documentation

Welcome to the (ur "reality") documentation. This directory contains product requirements, architecture decisions, user stories, quality gates, and the conceptual evolution of the project.

## Quick Navigation

### Core Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| [prd-v5.md](./prd-v5.md) | Product Requirements Document - The Lens System | All team members |
| [why_build_ur_reality.md](./why_build_ur_reality%20(1).md) | Vision, architecture, and system model | Product, Engineering |

### Directory Structure

```
docs/
├── prd-v5.md                    # Current PRD (Epic 5: The Lens System)
├── why_build_ur_reality.md      # Vision & architecture overview
├── stories/                     # User stories (BMAD workflow)
│   ├── 5.1-*.md                # Story files for Epic 5
│   ├── 5.2-*.md
│   └── ...
├── qa/                          # Quality assurance artifacts
│   ├── gates/                  # Quality gate decisions
│   │   ├── 5.1-*.yml           # Gate files for stories
│   │   └── ...
│   └── assessments/            # Risk, test design, traceability
└── archive/                     # Historical brainstorming documents
    ├── epic-2-brainstorming-v1.md
    ├── epic-3-brainstorming.md
    ├── epic-4-1st-draft-proposal.md
    ├── epic-5-brainstorming.md
    ├── epic-5-brainstorming-v2.md
    ├── prd.md                   # Original PRD (Three Realms)
    ├── prd-v5.md                # Earlier PRD iteration
    ├── sprint-change-proposal-epic-5-simplification.md
    ├── sprint-change-proposal-ur-reality-pivot.md
    ├── ur-reality.md            # Extended vision document
    └── ur-reality-raw-prompts.txt  # Stream-of-consciousness brainstorming

```

---

## Current State (Epic 5)

We're currently building **Epic 5: The Lens System** - a consciousness mapping interface that helps users discover the drives and lenses through which they experience reality.

**Key Documents:**
- [prd-v5.md](./prd-v5.md) - Full PRD with data models, architecture, and roadmap
- [archive/epic-5-brainstorming-v2.md](./archive/epic-5-brainstorming-v2.md) - Detailed implementation spec

**Current Focus:**
- Chamber entry animations and flow
- Abode assignment system
- Dynamic space expansion (Known vs Unknown)
- Lens discovery workflow

---

## Document Descriptions

### Product Requirements Document (prd-v5.md)

**Status:** Draft
**Version:** 5.0
**Epic:** Epic 5 - The Lens System

The PRD defines the product vision, user problems, system model, and technical architecture.

**Key Sections:**
- 🎯 **Vision** - "Mapping your inner system"
- 🧠 **The Core Problem** - Why we're building this
- 📖 **The System Model** - How resonance, lenses, and connections work
- 🔄 **The Evolution Loop** - 10-step user journey
- 🤖 **Pookie The AI** - Attention mechanism (transformer analogy)
- 🗄️ **Data Model** - Database schema (somethings, lenses, connections, intentions)
- 🎨 **Visual System** - "Somewhere, A Realm of Somethings" (2D space)
- 🛠️ **Technical Architecture** - System components
- 📦 **MVP Feature Set** - Phased delivery (Epic 5.1, 5.2)

**Read this if:**
- You're new to the project
- You need to understand the full product vision
- You're implementing a new feature
- You're making architectural decisions

---

### Why Build ur reality (why_build_ur_reality.md)

**Purpose:** Architectural overview and system justification

**Key Concepts:**
- **Something** - Any capture from reality
- **Why** - First-class somethings representing motivation
- **Abode** - Collections of somethings (can be nested)
- **Filter** - Pattern recognition across abodes
- **Controller vs Game** - System layers
- **Meta-Abode** - Top-level container (your life)
- **Unknowns** - Areas outside current understanding

**Read this if:**
- You want to understand the conceptual architecture
- You're questioning design decisions (why abodes vs tags?)
- You're building filters or connection systems
- You're interested in the philosophical foundation

---

### Stories (stories/)

User stories following the **BMAD-METHOD™** workflow.

**Story Format:**
```
Epic.Story-slug.md

Example: 5.1-page-load-animation-spaceship.md
```

**Story Structure:**
1. **Title & Metadata** - Story ID, epic, status
2. **Story Description** - User-facing feature description
3. **Acceptance Criteria** - Testable requirements
4. **Tasks** - Developer checklist
5. **Dev Notes** - Technical implementation guidance
6. **Testing** - Test scenarios
7. **Dev Agent Record** - Implementation log (updated during development)
8. **QA Results** - Test results and gate decision

**Story Lifecycle:**
```
Draft → Approved → InProgress → Ready for Review → Done
```

**Read stories when:**
- You're implementing a specific feature
- You need to understand implementation details
- You're reviewing completed work
- You're planning future sprints

---

### Quality Assurance (qa/)

Quality gates and test artifacts managed by the QA agent.

#### `qa/gates/` - Quality Gate Decisions

YAML files with test results and gate decisions.

**Gate Decisions:**
- **PASS** - All requirements met, can proceed
- **CONCERNS** - Non-critical issues, proceed with caution
- **FAIL** - Critical issues, must fix before proceeding
- **WAIVED** - Issues acknowledged and accepted

**File Format:**
```yaml
story: "5.1-page-load-animation-spaceship"
gate_decision: PASS
test_results:
  - name: "Page load animation plays correctly"
    status: PASS
  - name: "Spaceship appears after animation"
    status: PASS
```

#### `qa/assessments/` - Test Artifacts

Detailed test documentation:
- **Risk Assessments** - Risk profiles for stories
- **Test Design** - Test strategies and approaches
- **Traceability** - Requirements coverage
- **NFR Validation** - Non-functional requirements

**Read QA documents when:**
- You're testing a feature
- You need to understand risks
- You're reviewing test coverage
- You're making gate decisions

---

### Archive (archive/)

Historical brainstorming documents showing the project's evolution.

**Epic 2 (Nov 2024):**
- [epic-2-brainstorming-v1.md](./archive/epic-2-brainstorming-v1.md) - Initial "Three Realms" concept

**Epic 3 (Nov 2024):**
- [epic-3-brainstorming.md](./archive/epic-3-brainstorming.md) - 3D visualization brainstorming

**Epic 4 (Nov 2024):**
- [epic-4-1st-draft-proposal.md](./archive/epic-4-1st-draft-proposal.md) - Beauty/Ugly 2D transformation

**Epic 5 (Nov 2024):**
- [epic-5-brainstorming.md](./archive/epic-5-brainstorming.md) - Chamber logic initial design
- [epic-5-brainstorming-v2.md](./archive/epic-5-brainstorming-v2.md) - Refined chamber & abode system

**Sprint Changes:**
- [sprint-change-proposal-ur-reality-pivot.md](./archive/sprint-change-proposal-ur-reality-pivot.md) - Major pivot to ur-reality concept
- [sprint-change-proposal-epic-5-simplification.md](./archive/sprint-change-proposal-epic-5-simplification.md) - Document cleanup & focus shift

**Extended Documents:**
- [prd.md](./archive/prd.md) - Original PRD (Three Realms version)
- [ur-reality.md](./archive/ur-reality.md) - Extended vision with "The Kid" & "The Human" concepts
- [ur-reality-raw-prompts.txt](./archive/ur-reality-raw-prompts.txt) - Stream 1-14 consciousness brainstorming

**Why archive these?**
- Historical context for design decisions
- Understanding the "why" behind current direction
- Learning from previous iterations
- Preserving brainstorming insights

**Read archive when:**
- You're curious about the project's evolution
- You want to understand why we pivoted
- You're looking for alternative approaches we considered
- You need context for current design decisions

---

## Conceptual Evolution

The project has evolved through several major conceptual shifts:

### Phase 1: Three Realms (Epic 2-3)
**Concept:** Organize captures into Reality (physical), Mind (mental), Heart (emotional)

**Key Ideas:**
- Realm-based categorization
- Hierarchical domains and categories
- 3D visualization (globe metaphor)

**Challenges:**
- Too structured upfront (users didn't know which realm)
- 3D complexity high for MVP
- Categories felt prescriptive

### Phase 2: Beauty/Ugly Spectrum (Epic 4)
**Concept:** Rate captures on beauty/ugly spectrum, transform 3D to 2D

**Key Ideas:**
- Care level (-2 to +2: ugly to beauty)
- 2D transformation from 3D globe
- Visual coding (dark = ugly, bright = beauty)

**Breakthrough:**
- Simpler than realm categorization
- More intuitive (gut feeling)
- 2D easier to implement

### Phase 3: The Lens System (Epic 5 - Current)
**Concept:** Discover the lenses (drives) through which you experience reality

**Key Ideas:**
- Lenses start as question marks (?)
- Discovered through pattern recognition
- Attention mechanism surfaces relevant lenses
- Abodes for spatial organization
- Chamber for reflection and assignment

**Why this works:**
- Embraces the unknown (mystery is feature, not bug)
- Pattern recognition over upfront categorization
- Aligns with consciousness model (resonance → capture → reflection)
- Scalable architecture (lenses can nest infinitely)

**Philosophical Foundation:**
- **Reality** = The outer world (infinite, unknown)
- **ur-reality** = Your inner system (drives, lenses, patterns)
- **My Reality** = What you've consciously discovered and named

---

## How to Use This Documentation

### For New Developers

1. Read [prd-v5.md](./prd-v5.md) (Vision & Problem)
2. Skim [why_build_ur_reality.md](./why_build_ur_reality%20(1).md) (Architecture)
3. Review current stories in `stories/` (Implementation details)
4. Check `archive/epic-5-brainstorming-v2.md` for Epic 5 spec

### For Product Decisions

1. Review [prd-v5.md](./prd-v5.md) (Current direction)
2. Check `archive/` for previous iterations (What we tried, why we pivoted)
3. Read [ur-reality-raw-prompts.txt](./archive/ur-reality-raw-prompts.txt) (Raw brainstorming, Stream 14 especially)

### For QA & Testing

1. Find story in `stories/`
2. Read Acceptance Criteria & Testing section
3. Check `qa/gates/` for previous gate decisions
4. Review `qa/assessments/` for test strategies

### For Understanding "Why?"

1. Read `archive/` documents to see evolution
2. Check sprint change proposals for pivot rationale
3. Read [ur-reality.md](./archive/ur-reality.md) for philosophical depth

---

## Documentation Standards

When adding new documentation:

### Stories
- Follow BMAD story template
- Include clear acceptance criteria
- Add implementation tasks
- Update status as you progress

### PRD Updates
- Version the document (e.g., prd-v6.md)
- Archive old versions
- Update change log

### Brainstorming Docs
- Add to `archive/` if superseded
- Keep active docs in root
- Use markdown for readability

### Quality Gates
- Use YAML format
- Include test results
- Clear gate decision (PASS/CONCERNS/FAIL/WAIVED)
- Link to story file

---

## Contributing to Documentation

1. **Update PRD** for major feature changes
2. **Create stories** following BMAD workflow
3. **Document architectural decisions** in appropriate files
4. **Archive old documents** when superseded
5. **Keep this README updated** when structure changes

---

## Questions?

If you can't find what you're looking for:

1. Check the [main README](../README.md) for codebase structure
2. Review [CLAUDE.md](../CLAUDE.md) for BMAD workflow
3. Ask the team or create an issue

---

**"The documentation is the map of the map-making process."**
