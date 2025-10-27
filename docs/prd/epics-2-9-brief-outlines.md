# Epics 2-9: Brief Outlines

**Note**: These epics will be fully detailed with complete stories after Epic 1 user approval and SM agent story creation. The outlines below preserve all transformation information from the pivot plan.

---

## Epic 2: Physical Reality - Map & Timeline Views

**Goal**: Enable spatial and temporal visualization of captured experiences on desktop web. Users see WHERE (Mapbox map with brightness/darkness/flicker) and WHEN (timeline from birth to present) experiences happened.

**Stories**:
- **2.1**: Web Map View with Experience Dots (Mapbox GL JS, clustering, zoom levels)
- **2.2**: Map Vibe Visualization (dark blue base, Beauty brightens, Ugly darkens, Dreams flicker)
- **2.3**: Web Timeline Views (year/month/day zoom, birth to present chronological)
- **2.4**: Web Experience Detail Modal (click dot/timeline item, show full content + metadata)
- **2.5**: Fog of War Unlocking (grayscale unvisited, brightens as user explores)

**Transformation from Mobile**: React Native Maps → Mapbox GL JS (web), same logic, better desktop visualization

---

## Epic 3: Heart's Abode - Hierarchies & Categorization

**Goal**: Implement Beauty/Ugly/Dreams categorization with custom category support and frequency-ranked hierarchies on desktop. Something's Abode queue for organizing SMS captures. Pookie basic pattern recognition.

**Stories**:
- **3.1**: Manual Thought Creation (web form for non-SMS thoughts)
- **3.2**: Web Categorization UI (drag-and-drop, button clicks, custom category management)
- **3.3**: Beauty Hierarchy (ranked by revisit frequency, desktop columns)
- **3.4**: Ugly Hierarchy (ranked by frequency, desktop visualization)
- **3.5**: Dreams Hierarchy (intensity scale, sorted by revisit count)
- **3.6**: Pookie Pattern Recognition (GPT-4 suggests "similar to..." with custom category awareness)
- **3.7**: Custom Category Management (create, rename, delete custom categories)

**Transformation from Mobile**: Mobile swipe → Desktop spacious UI, enhanced hierarchy visualization, added custom category support

---

## Epic 4: Knowledge Graph - Connections & Understanding

**Goal**: Enable users to link captures into web of meaning with desktop D3.js interactive graph visualization. Drive→Want→Dream intensity scale, connection labels, full network exploration.

**Stories**:
- **4.1**: Web Node Linking UI (split-screen: select item left, search connections right)
- **4.2**: Interactive Graph Visualization (D3.js/Cytoscape.js full interactive graph)
- **4.3**: Intensity Scale UI (Drive/Want/Dream levels with visual indicators)
- **4.4**: Understanding/Rules Category (capture wisdom, link to Uglies transformed)
- **4.5**: Full-Screen Graph View (zoom/pan/filter, physics simulations)

**Transformation from Mobile**: Limited mobile graph → Full desktop D3.js interactive network (significantly enhanced)

---

## Epic 5: Transformation Loop - Completion & Proof

**Goal**: Close the game loop with Dream achievement, Ugly transformation, Beauty Points system, and Reality Score calculation. Permanent proof of agency timeline.

**Stories**:
- **5.1**: Web Dream Completion (modal with confetti animation, +1 Beauty Point)
- **5.2**: Web Ugly Transformation (modal, note on transformation, +1 Beauty Point)
- **5.3**: Beauty Points System (track total, display on profile)
- **5.4**: Reality Score Dashboard (formula display, growth chart using Chart.js)
- **5.5**: Web Completion History (timeline view with filters, proof of power)

**Transformation from Mobile**: Identical logic, web UI animations (confetti.js), desktop dashboard widgets

---

## Epic 6: Social Layer - Shared Realities & Collaboration

**Goal**: Implement fork/merge shared realities model, Related Realities connections, visit other users' public realities, privacy controls, and invite system.

**Stories**:
- **6.1**: Web Tag Others UI (autocomplete with avatars)
- **6.2**: Related Realities Dashboard (grid of connections, shared experience counts)
- **6.3**: Web Referral Links (copy link, QR code generation)
- **6.4**: Referral Onboarding (web signup flow)
- **6.5**: Web Sharing (Web Share API, export as image)
- **6.6**: Fork/Merge Shared Experiences (Git-style collaborative editing)
- **6.7**: Visit Other's Reality (read-only public view)
- **6.8**: Propose Edits to Shared Experience (fork, change, merge request)
- **6.9**: Accept/Reject Edit Proposals (review interpretations)
- **6.10**: Private/Public Toggle UI (visibility controls per experience)

**Transformation from Mobile**: Simple sharing → Collaborative fork/merge model (major enhancement)

---

## Epic 7: Past Memories & Bulk Import

**Goal**: Enable photo upload from desktop (drag-and-drop), EXIF metadata extraction, Google Photos integration, SMS backfill import, and AI-powered bulk organization.

**Stories**:
- **7.1**: Photo Upload from Desktop (drag-and-drop or file picker)
- **7.2**: EXIF Metadata Extraction (server-side Sharp library, GPS + timestamp)
- **7.3**: Something's Abode Queue (already in Epic 1, enhance with keyboard shortcuts)
- **7.4**: Web Batch Organization (multi-select, keyboard shortcuts J/K navigation)
- **7.5**: Web Notifications (browser notifications + Pookie chat reminder)
- **7.6**: SMS Backfill Import (export from iPhone/Android, bulk import)
- **7.7**: Google Photos Integration (OAuth connect, import with EXIF)

**Transformation from Mobile**: Mobile photo library → Desktop upload + Google Photos, SMS backfill added

---

## Epic 8: Creator's Pet Intelligence - Advanced AI

**Goal**: Enhance Pookie with GPT-4 conversational interface, agentic navigation commands, proactive insight notifications, connection suggestions, and voice input via Web Speech API.

**Stories**:
- **8.1**: Web Chat Interface (desktop bottom bar, better than mobile chat screen)
- **8.2**: Auto-Detection (GPT-4 classifies experience vs thought for SMS captures)
- **8.3**: Web Notifications + Chat (browser notifications, Pookie initiates conversations)
- **8.4**: Connection Suggestions (GPT-4 suggests links between captures)
- **8.5**: Pattern Matching (fuzzy matching for revisits, custom category awareness)
- **8.6**: Agentic Navigation Commands (Pookie triggers route changes)
- **8.7**: Voice Input for Pookie (Web Speech API, desktop mic)
- **8.8**: Pookie Memory Context (conversation history per user)

**Transformation from Mobile**: Mobile chat screen → Desktop persistent bottom bar, agentic navigation (enhanced)

---

## Epic 9: Polish, Performance & Launch Prep

**Goal**: Optimize web app performance (Mapbox clustering, Lighthouse audit), SEO optimization, landing page, PWA features, analytics integration, and public production launch.

**Stories**:
- **9.1**: Web Map Optimization (Mapbox GL clustering, vector tiles)
- **9.2**: PWA Offline Support (Service Workers for offline reading, optional)
- **9.3**: Error Handling Polish (web error boundaries, user-friendly messages)
- **9.4**: Web Analytics (PostHog/Plausible privacy-focused)
- **9.5**: SEO & Public Launch (meta tags, Open Graph, sitemap.xml)
- **9.6**: Beta Feedback (web beta testers, address top issues)
- **9.7**: Web Production Readiness (Sentry web monitoring, Lighthouse audit)
- **9.8**: SEO Optimization (structured data, search engine indexing)
- **9.9**: Landing Page Enhancement (public marketing polish)
- **9.10**: Progressive Web App (service workers, install prompt)

**Transformation from Mobile**: App Store submission → SEO/PWA, mobile performance → web optimization
