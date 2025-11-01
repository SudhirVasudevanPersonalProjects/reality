# Security and Performance

## 13.1: Security Requirements

**Frontend Security:**
- **CSP Headers:** Content Security Policy configured in `next.config.js`
- **XSS Prevention:** Next.js automatic escaping, DOMPurify for user content
- **Secure Storage:** JWT in httpOnly cookies (not localStorage)

**Backend Security:**
- **Input Validation:** Zod schemas for all API inputs
- **Rate Limiting:** 10 req/sec per IP via Vercel Edge Config
- **CORS Policy:** `Access-Control-Allow-Origin: https://reality.app`

**Authentication Security:**
- **Token Storage:** JWT in httpOnly, secure, sameSite cookies
- **Session Management:** 1-hour access token expiry
- **Password Policy:** Min 8 chars, uppercase + lowercase + number

**Database Security:**
- **Row Level Security (RLS):** Enabled on all tables
- **SQL Injection:** Prevented by Supabase parameterized queries
- **API Key Security:** Anon key safe for client, service role key server-only

**Accessibility Compliance:**
- **Target Standard:** WCAG 2.1 Level AA
- **Semantic HTML:** All components use proper HTML5 semantic elements
- **ARIA Attributes:** Provided automatically by Headless UI components
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Focus Management:** Focus trapped in modals, moved to main heading on route changes
- **Screen Reader Support:** ARIA labels, live regions for dynamic content
- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Testing Tools:** axe-core integrated in Playwright tests, manual screen reader testing
- **CI/CD Integration:** Accessibility tests run on every PR via GitHub Actions

## 13.2: Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** < 200KB initial JS bundle
- **Loading Strategy:** Server Components for static content, lazy load client components
- **Caching Strategy:**
  - Static assets: 1 year CDN cache
  - API responses: TanStack Query (5 min stale time)
  - Images: Next.js Image Optimization

**Backend Performance:**
- **Response Time Target:** < 200ms for queries, < 500ms for API endpoints
- **Database Optimization:**
  - Indexes on `user_id`, `timestamp`, `category`
  - PostGIS spatial index for locations
  - Connection pooling via PgBouncer
- **Caching Strategy:**
  - Supabase Realtime caches subscriptions
  - Edge Functions cache static data in memory

**Core Web Vitals Targets:**
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1

---

