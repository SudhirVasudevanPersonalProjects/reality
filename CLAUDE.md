# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository uses the **BMAD-METHOD™** (Breakthrough Method of Agile AI-driven Development), a framework for AI-assisted software development through specialized agent personas. The core system is located in `.bmad-core/` with Claude Code integration via `.claude/commands/BMad/`.

## Core Configuration

The project configuration is managed through `.bmad-core/core-config.yaml`:

```yaml
prd:
  prdFile: docs/prd.md
  prdVersion: v4
  prdSharded: true
  prdShardedLocation: docs/prd
  epicFilePattern: epic-{n}*.md

architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true
  architectureShardedLocation: docs/architecture

devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/source-tree.md

devDebugLog: .ai/debug-log.md
devStoryLocation: docs/stories
```

## Agent System Architecture

BMAD uses specialized AI agent personas, each with specific responsibilities:

- **SM (Scrum Master - Bob)**: Story creation from PRD/architecture, manages `docs/stories/`
- **Dev (Developer - James)**: Code implementation, follows stories, updates Dev Agent Record sections only
- **QA (Test Architect - Quinn)**: Risk assessment, test design, code review, quality gates
- **PM (Product Manager)**: PRD creation using `prd-tmpl.yaml`
- **Architect**: Architecture design using `architecture-tmpl.yaml`
- **PO (Product Owner)**: Backlog validation, story refinement
- **Analyst**: Market research, requirements gathering, project documentation
- **UX Expert**: UI/UX design
- **bmad-master**: Universal task executor without persona switching
- **bmad-orchestrator**: Multi-agent coordinator

### Loading Agents in Claude Code

Use slash commands to load agents:
```
/bmad-master
/dev
/sm
/qa
/pm
/architect
```

Each agent loads with specific persona, commands, and dependencies defined in `.bmad-core/agents/{agent}.md`.

## Development Workflow

### Standard Development Cycle

**CRITICAL**: Always use fresh chat contexts when switching between agents for optimal AI performance.

1. **Story Creation** (New Chat)
   - Load SM agent: `/sm`
   - Execute: `*draft` (runs create-next-story task)
   - Story saved to `docs/stories/{epic}.{story}-{slug}.md`
   - Review and change status from "Draft" to "Approved"

2. **Story Implementation** (New Chat)
   - Load Dev agent: `/dev`
   - Execute: `*develop-story {story-file}`
   - Dev reads story, implements tasks sequentially, writes tests
   - Dev ONLY updates: Task checkboxes, Debug Log, Completion Notes, File List, Change Log, Status
   - Dev marks story "Ready for Review" when all tests pass

3. **QA Review** (New Chat)
   - Load QA agent: `/qa`
   - Execute: `*review {story-file}`
   - QA performs code review, can refactor directly
   - QA creates gate file in `docs/qa/gates/`
   - QA appends results to story's QA Results section
   - Status: PASS/CONCERNS/FAIL/WAIVED

4. **Repeat**: Continue cycle until all epic stories complete

### Test Architect (QA) Integration

The QA agent provides comprehensive quality assurance throughout development:

| Stage | Command | Purpose | Output Location |
|-------|---------|---------|-----------------|
| After Story Approval | `*risk {story}` | Risk assessment | `docs/qa/assessments/{epic}.{story}-risk-{date}.md` |
| Before Development | `*design {story}` | Test strategy | `docs/qa/assessments/{epic}.{story}-test-design-{date}.md` |
| During Development | `*trace {story}` | Coverage verification | `docs/qa/assessments/{epic}.{story}-trace-{date}.md` |
| Mid-Development | `*nfr {story}` | Quality attributes | `docs/qa/assessments/{epic}.{story}-nfr-{date}.md` |
| After Development | `*review {story}` | Full assessment | Story file + `docs/qa/gates/{epic}.{story}-{slug}.yml` |
| Post-Review | `*gate {story}` | Update decision | Updated gate file |

**Risk Priority Matrix**: P0 (critical, must test), P1 (should test), P2 (nice to have)

**Gate Decisions**:
- PASS: All requirements met, can proceed
- CONCERNS: Non-critical issues, proceed with caution
- FAIL: Critical issues, must fix before proceeding
- WAIVED: Issues acknowledged and accepted

### Document Structure

```
docs/
├── prd.md                    # Full Product Requirements Document (v4)
├── prd/                      # Sharded PRD sections
│   ├── epic-1-*.md          # Epic files with stories
│   └── ...
├── architecture.md           # Full Architecture Document (v4)
├── architecture/             # Sharded architecture sections
│   ├── coding-standards.md  # Dev agent loads always
│   ├── tech-stack.md        # Dev agent loads always
│   ├── source-tree.md       # Dev agent loads always
│   └── ...
├── stories/                  # Generated user stories
│   └── {epic}.{story}-{slug}.md
└── qa/
    ├── assessments/         # Risk, design, trace, NFR reports
    └── gates/               # Quality gate decisions
```

### Document Sharding

Large documents MUST be sharded before development to optimize context usage:

```
*shard-doc docs/prd.md prd
*shard-doc docs/architecture.md architecture
```

Sharding splits documents by Level 2 headings (`##`) into separate files in the specified destination folder.

## Agent Command Reference

### Common Commands (All Agents)

- `*help` - Show available commands
- `*status` - Show current context/progress
- `*exit` - Exit agent mode

### SM Agent Commands

- `*draft` - Create next story from sharded PRD
- `*correct-course` - Realign development direction
- `*story-checklist` - Validate story with draft checklist

### Dev Agent Commands

- `*develop-story` - Implement story following task workflow
- `*explain` - Detailed explanation of recent work
- `*review-qa` - Apply QA feedback fixes
- `*run-tests` - Execute linting and tests

### QA Agent Commands

- `*risk {story}` - Risk profile assessment
- `*design {story}` - Test design strategy
- `*trace {story}` - Requirements traceability
- `*nfr {story}` - Non-functional requirements validation
- `*review {story}` - Comprehensive code review
- `*gate {story}` - Update quality gate decision

### bmad-master Commands

- `*create-doc {template}` - Create document from template
- `*doc-out` - Output full document
- `*document-project` - Generate project documentation
- `*execute-checklist {checklist}` - Run validation checklist
- `*kb` - Toggle knowledge base mode
- `*shard-doc {document} {destination}` - Shard document
- `*task {task}` - Execute specific task
- `*yolo` - Toggle skip confirmations

## Critical Development Rules

### For Dev Agent

1. **Story contains ALL needed info** - Never load PRD/architecture unless explicitly directed
2. **Check folder structure first** - Don't recreate existing directories
3. **ONLY update authorized sections**: Task checkboxes, Dev Agent Record (Debug Log, Completion Notes, File List, Change Log), Status
4. **Never modify**: Story description, Acceptance Criteria, Dev Notes, Testing sections
5. **Completion criteria**: All tasks [x], all tests pass, File List complete, execute story-dod-checklist, status "Ready for Review"

### For SM Agent

1. **Follow create-next-story procedure** rigorously
2. **All info from PRD/Architecture** - ensure dev agent has everything needed
3. **Never implement code** - SM only creates stories

### For All Agents

1. **Stay in character** - Each agent has specific expertise
2. **Load dependencies on-demand** - Don't preload during activation
3. **Task instructions override** - When executing tasks from dependencies, follow exactly
4. **Interactive tasks require interaction** - Tasks with `elicit=true` cannot be bypassed
5. **Use numbered lists** for presenting options

## Testing Standards

All tests must meet these quality criteria:

- **No Flaky Tests**: Proper async handling, explicit waits
- **No Hard Waits**: Dynamic strategies only (polling, events)
- **Stateless**: Tests run independently and in parallel
- **Self-Cleaning**: Tests manage their own test data
- **Appropriate Levels**: Unit for logic, integration for interactions, E2E for journeys
- **Clear Assertions**: Keep assertions in tests, not buried in helpers

## File Resolution

Dependencies map to `.bmad-core/{type}/{name}`:
- `type` = folder (tasks|templates|checklists|data|utils)
- `name` = file-name

Examples:
- `create-doc.md` → `.bmad-core/tasks/create-doc.md`
- `story-tmpl.yaml` → `.bmad-core/templates/story-tmpl.yaml`
- `story-dod-checklist.md` → `.bmad-core/checklists/story-dod-checklist.md`

## Status Progression

Stories follow this lifecycle:
```
Draft → Approved → InProgress → Ready for Review → Done
```

User verification required before each transition.

## Common Workflows

### Brownfield Project (Existing Codebase)

1. Document existing project: `/analyst` → `*document-project`
2. Create brownfield PRD: `/pm` → `*create-doc brownfield-prd`
3. Create brownfield architecture: `/architect` → `*create-doc brownfield-architecture`
4. Shard documents
5. Follow standard development cycle

### Greenfield Project (New Project)

1. Create PRD: `/pm` → `*create-doc prd`
2. Create architecture: `/architect` → `*create-doc architecture`
3. Shard documents
4. Follow standard development cycle

### Quick Task Execution

For one-off tasks without persona switching:
```
/bmad-master
*task {task-name}
```

## Context Optimization

**CRITICAL for Quality**: Always start fresh chat contexts when switching agents:
- SM creates story → **New Chat** → Dev implements → **New Chat** → QA reviews
- Clean contexts = better AI performance = higher quality output
- Large context pollution reduces agent effectiveness

## Additional Resources

- **Knowledge Base**: `.bmad-core/data/bmad-kb.md` (load via `*kb` in bmad-master)
- **Enhanced Workflow**: `.bmad-core/enhanced-ide-development-workflow.md`
- **Agent Definitions**: `.bmad-core/agents/{agent}.md`
- **Available Tasks**: `.bmad-core/tasks/`
- **Templates**: `.bmad-core/templates/`
- **Checklists**: `.bmad-core/checklists/`
