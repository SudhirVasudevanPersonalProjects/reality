# Monitoring and Observability

## 17.1: Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Web Vitals, performance)
- **Backend Monitoring:** Supabase Dashboard (database metrics)
- **Error Tracking:** Sentry (frontend + backend errors)
- **Performance Monitoring:** Vercel Speed Insights

## 17.2: Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors (Sentry)
- API response times (TanStack Query)
- User interactions (custom events)

**Backend Metrics:**
- Request rate (requests/second)
- Error rate (errors/total %)
- Response time (P50, P95, P99)
- Database query performance (slow query log)

**Custom Metrics:**
- SMS processing time (Twilio → Supabase latency)
- Pookie chat latency (OpenAI duration)
- Categorization rate (% categorized within 24h)
- Active users (DAU/WAU/MAU)

**Alerts:**
- Error rate > 5% → Slack notification
- Response time > 1s (P95) → Email
- Database CPU > 80% → Email
- SMS webhook failures → Email

---

