# User Interface Design Goals

## Overall UX Vision

Minimal dark blue grayscale interface where the **user's reality creates the light**. The base map and interface exist in subdued dark blue tones, becoming illuminated only through user's captures: Beauty brightens the world, Ugly creates shadow, Dreams flicker with possibility. This reflects the core philosophy - external reality is neutral until you impose meaning through categorization. Google Maps-style layout provides spatial navigation with persistent sidebar compass and bottom-bar Pookie chat. Desktop-first design prioritizes spacious organization; mobile web is read-only viewer.

## Key Interaction Paradigms

- **SMS as primary input**: Users never open app to capture - they text Reality number throughout day (existing behavior)
- **Desktop as organization space**: Web app is where chaotic SMS stream becomes structured reality
- **Visual navigation metaphor**: Right sidebar compass guides between "abodes" (Map/Timeline/Heart/Something/Shared)
- **Smooth transitions**: Route changes use Framer Motion page transitions - feels like single-page app but uses URLs for deep linking
- **Light sculpting**: User's categorizations literally shape the visual brightness/darkness of their reality map
- **Pookie as guide**: Always-accessible bottom chat bar for navigation and insights
- **Custom categories**: Users can create their own organizational systems beyond suggested defaults

## Core Screens and Views

From product perspective, critical screens delivering PRD value:

1. **Landing Page (/)** - Public marketing site with phone number entry, signup CTA, explanation of "text to capture, desktop to organize"
2. **Signup/Login (/auth/signup, /auth/login)** - Web forms with phone number field, email verification
3. **Main App Layout (/app)** - Google Maps-style: center content (80%) + right sidebar (20%) + bottom Pookie bar
4. **Map View (/app/map)** - Default view: Mapbox dark blue grayscale with brightness/darkness/flicker visualization
5. **Timeline View (/app/timeline)** - Vertical chronological scroll from birth to present, zoomable year/month/day
6. **Heart's Abode (/app/heart)** - Dynamic columns for each category (suggested + custom) with ranked hierarchies
7. **Something's Abode (/app/something)** - Unprocessed SMS queue with categorization UI, batch mode, custom category input
8. **Shared Realities (/app/shared)** - Related Realities list, public reality viewer, invite management
9. **Profile (/app/profile)** - Beauty Created counter, Reality Score, completion history, settings
10. **Experience Detail Modal** - Universal modal for viewing full content, connections graph, action buttons

## Accessibility

Level: None (WCAG AA compliance deferred to post-MVP) - MVP focuses on core desktop functionality for beta users. Screen reader support and keyboard navigation will be added post-launch based on user feedback.

## Branding

**Dark blue grayscale aesthetic** with reality-sculpting light system:
- **Base**: Dark blue-gray map and UI (#1a1f2e base, #2a3142 elevated surfaces)
- **Beauty**: Brightens area with warm glow (increases luminosity, subtle golden tint)
- **Ugly**: Darkens area with shadow (decreases luminosity, cooler tone)
- **Dreams**: Flickering lights (animated opacity pulses, ethereal blue-white)
- **Custom categories**: User-defined visual treatment (future enhancement)
- **Neutral/unexplored**: Dark grayscale (fog of war)
- **Typography**: Clean sans-serif (Inter or system fonts), high contrast for readability
- **Animations**: Smooth Framer Motion transitions, subtle lighting effects

Visual design polish deferred to post-MVP; PRD specifies **functional interaction patterns** only.

## Target Device and Platforms

**Desktop-first web application** with read-only mobile view:
- **Primary**: Desktop browsers 1366x768 minimum, optimized for 1920x1080
- **Supported browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Secondary**: Mobile web (< 768px) provides read-only browsing (map/timeline/hierarchies visible, no organization tools)
- **Native apps**: Explicitly out of scope - web only for MVP
- **Progressive Web App (PWA)**: Deferred to Epic 9 (optional offline reading)
