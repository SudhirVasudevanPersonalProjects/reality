# Manual Testing Guide - Story 2.9: Mind List/Grid View

**Estimated Time**: 15 minutes
**Date**: ___________
**Tester**: ___________

---

## PREREQUISITES

Before testing, ensure you have:
- [ ] Supabase running locally (http://127.0.0.1:55323)
- [ ] Development server running (http://localhost:3000)
- [ ] At least 5-10 Mind somethings in your database (use test-data-setup.sql)
- [ ] Logged in to the application

**Quick Setup**: If you need test data, see MANUAL-TEST-STEPS.md Steps 1-5 to create test Mind somethings.

---

## TEST 1: Basic Grid View (3 minutes)

### Navigate to Mind List

**Command**: Open in browser:
```
http://localhost:3000/mind
```

### Check: Page Loads Successfully

- [ ] Page loads without errors
- [ ] Title displays: **"Mind's Abode"**
- [ ] Subtitle displays: **"Your thoughts, experiences & desires"**
- [ ] Item count shows: **"Showing X Mind somethings"** (where X = your count)
- [ ] Sort dropdown is visible (top right area)
- [ ] **"New Mind Entry"** button is visible (top right, grayed out)

### Check: Grid Layout

**Desktop View** (screen width ≥ 1024px):
- [ ] Cards are arranged in **3 columns**
- [ ] Cards have equal width
- [ ] Gaps between cards are consistent (~24px)
- [ ] Cards are aligned in a grid pattern

**Notes**: ________________

✅ **Test 1 Complete**

---

## TEST 2: Card Preview Display (4 minutes)

### Check: Card Elements

Pick any card in the grid and verify it contains:

**Category Badge** (top of card):
- [ ] Badge shows emoji (🎭 Experience, 💭 Thought, or ✨ Desire)
- [ ] Badge shows category label text
- [ ] Badge has rounded background

**Content Preview**:
- [ ] Text content is visible
- [ ] If text > 150 characters, it shows "..." at the end
- [ ] If text < 150 characters, no truncation

**Media Thumbnail** (if card has images):
- [ ] Image displays above content text
- [ ] Image has rounded corners
- [ ] Image height is ~192px (12rem)
- [ ] Image covers the area (no stretching)

**Care Rating Stars**:
- [ ] Stars display below content (★★★★☆ format)
- [ ] Filled stars are yellow/gold color
- [ ] Empty stars are dark gray
- [ ] Number of filled stars matches care rating (1-5)

**Timestamp**:
- [ ] Shows at bottom of card
- [ ] Recent cards (<7 days): "2 hours ago" / "3 days ago" format
- [ ] Older cards (≥7 days): "Nov 5, 2025" format

**Location Indicator**:
- [ ] If card has location: Shows 📍 icon at bottom
- [ ] If no location: No 📍 icon

**Notes**: ________________

✅ **Test 2 Complete**

---

## TEST 3: Care-Based Brightness (2 minutes)

### Visual Brightness Check

Look at cards with different care ratings:

- [ ] **Care 5 (Love)** cards: Very bright, fully opaque
- [ ] **Care 4 (Like)** cards: Bright
- [ ] **Care 3 (Neutral)** cards: Medium brightness
- [ ] **Care 2 (Dislike)** cards: Dim
- [ ] **Care 1 (Hate)** cards: Very dim, low opacity (~40%)

**Verify**: Higher care = brighter card appearance

**Notes**: ________________

✅ **Test 3 Complete**

---

## TEST 4: Card Interaction (2 minutes)

### Hover Effect (Desktop)

1. [ ] Hover mouse over a card
2. [ ] Card slightly scales up (grows ~2%)
3. [ ] Purple glow appears around card border
4. [ ] Card border color changes to purple
5. [ ] Effect is smooth (transitions nicely)

### Click Navigation

1. [ ] Click anywhere on a card
2. [ ] Browser navigates to `/mind/[card-id]`
3. [ ] Card detail page loads (Story 2.8 view)
4. [ ] URL in address bar shows the card ID

### Keyboard Navigation

1. [ ] Press **Tab** key repeatedly
2. [ ] Focus moves from card to card
3. [ ] Focused card shows purple ring outline
4. [ ] Navigate to a card using Tab
5. [ ] Press **Enter** key
6. [ ] Card detail page opens

**Notes**: ________________

✅ **Test 4 Complete**

---

## TEST 5: Sorting (3 minutes)

### Test: Recent First (Default)

1. [ ] On `/mind` page, check sort dropdown
2. [ ] Default selection is **"Recent First"**
3. [ ] Top card is the most recently captured
4. [ ] Cards are in descending `captured_at` order

### Test: Care High → Low

1. [ ] Click sort dropdown
2. [ ] Select **"Care: High → Low"**
3. [ ] URL updates to `/mind?sort=care_desc`
4. [ ] Page refreshes
5. [ ] Top cards are Care=5 (Love)
6. [ ] Bottom cards are Care=1 (Hate)
7. [ ] Cards with same care are sorted by recent first

### Test: Care Low → High

1. [ ] Click sort dropdown
2. [ ] Select **"Care: Low → High"**
3. [ ] URL updates to `/mind?sort=care_asc`
4. [ ] Top cards are Care=1 (Hate)
5. [ ] Bottom cards are Care=5 (Love)

### Test: Oldest First

1. [ ] Click sort dropdown
2. [ ] Select **"Oldest First"**
3. [ ] URL updates to `/mind?sort=oldest`
4. [ ] Oldest card appears first
5. [ ] Newest card appears last

**Notes**: ________________

✅ **Test 5 Complete**

---

## TEST 6: Filtering via URL (Optional - 2 minutes)

**Note**: Filter Panel UI is not implemented yet, but backend filtering works via URL params.

### Test: Care Filter

**Command**: Manually edit URL to:
```
http://localhost:3000/mind?care=5
```

- [ ] Page shows only Care=5 (Love) cards
- [ ] All displayed cards have 5 filled stars
- [ ] Item count updates correctly

### Test: Category Filter

**Command**: Edit URL to:
```
http://localhost:3000/mind?category=thought
```

- [ ] Page shows only Thought (💭) category cards
- [ ] All displayed cards have Thought badge

### Test: Location Filter

**Command**: Edit URL to:
```
http://localhost:3000/mind?location=has
```

- [ ] Page shows only cards with 📍 icon
- [ ] All displayed cards have location data

### Test: Combined Filters

**Command**: Edit URL to:
```
http://localhost:3000/mind?care=4,5&category=desire
```

- [ ] Shows only Desire cards with Care 4 or 5
- [ ] Results match both filter criteria

**Notes**: ________________

✅ **Test 6 Complete** (Skip if you prefer to skip URL editing)

---

## TEST 7: Empty States (2 minutes)

### Test: No Filter Matches

**Command**: Edit URL to impossible filter:
```
http://localhost:3000/mind?care=999
```

**Check Empty State**:
- [ ] Page shows search emoji: 🔍
- [ ] Title: **"No matches found"**
- [ ] Message: **"Try adjusting your filters."**
- [ ] Button: **"Clear All Filters"**
- [ ] Click button → Returns to `/mind` (all cards)

### Test: No Mind Somethings (Optional)

**Only do this if you can safely delete test data:**

1. Delete all Mind somethings from database temporarily
2. Visit `/mind`
3. [ ] Page shows thought emoji: 💭
4. [ ] Title: **"No thoughts captured yet"**
5. [ ] Message: **"Start by organizing captures in your Chamber."**
6. [ ] Button: **"Go to Chamber"**

**Notes**: ________________

✅ **Test 7 Complete**

---

## TEST 8: Responsive Design (3 minutes)

### Tablet View

1. [ ] Press **F12** to open DevTools
2. [ ] Enable device toolbar (Ctrl+Shift+M)
3. [ ] Select **"iPad"** or set width to 768px
4. [ ] Refresh page

**Check Tablet Layout**:
- [ ] Cards are arranged in **2 columns**
- [ ] Grid adapts smoothly
- [ ] No horizontal scrolling
- [ ] Cards maintain proper spacing

### Mobile View

1. [ ] Select **"iPhone SE"** or set width to 375px
2. [ ] Refresh page

**Check Mobile Layout**:
- [ ] Cards are arranged in **1 column** (vertical list)
- [ ] Cards are full-width with padding
- [ ] Text is readable
- [ ] Images scale properly
- [ ] No horizontal scrolling
- [ ] Sort dropdown is usable (not cut off)

### Return to Desktop

1. [ ] Disable device toolbar
2. [ ] Refresh page
3. [ ] Grid returns to **3 columns**

**Notes**: ________________

✅ **Test 8 Complete**

---

## TEST 9: Authentication (1 minute)

### Test: Logged Out Redirect

1. [ ] Log out of the application
2. [ ] Visit `http://localhost:3000/mind`
3. [ ] Should redirect to `/login` page
4. [ ] Cannot view Mind list without authentication

### Test: Log Back In

1. [ ] Log back in
2. [ ] Navigate to `/mind` again
3. [ ] Grid loads successfully

**Notes**: ________________

✅ **Test 9 Complete**

---

## TEST 10: Browser Console Check

Open DevTools Console (F12 → Console tab) during all testing.

**Verify**:
- [ ] No red JavaScript errors
- [ ] No failed network requests (500 errors)
- [ ] No React warnings about missing keys
- [ ] No accessibility warnings

**Notes**: ________________

✅ **Test 10 Complete**

---

## FINAL CHECKLIST

### Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Basic Grid View | ⬜ | |
| 2. Card Preview | ⬜ | |
| 3. Care Brightness | ⬜ | |
| 4. Card Interaction | ⬜ | |
| 5. Sorting | ⬜ | |
| 6. URL Filtering | ⬜ | (Optional) |
| 7. Empty States | ⬜ | |
| 8. Responsive | ⬜ | |
| 9. Authentication | ⬜ | |
| 10. Console Check | ⬜ | |

**Total Time**: ______ minutes

---

## Issues Found

| # | Severity | Description | Expected | Actual |
|---|----------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All blocking issues documented
- [ ] Story 2.9 is ready for production

**Tester Name**: _______________________
**Date**: _______________________
**Signature**: _______________________

---

## Quick Commands Reference

**Main page**:
```
http://localhost:3000/mind
```

**Sort examples**:
```
/mind?sort=care_desc
/mind?sort=care_asc
/mind?sort=oldest
```

**Filter examples**:
```
/mind?care=5
/mind?category=thought
/mind?location=has
/mind?care=4,5&category=desire&sort=care_desc
```

**Check Mind data in database**:
```sql
SELECT
  id,
  substring(text_content, 1, 30) as preview,
  care,
  captured_at,
  attributes->>'mind_category' as category
FROM somethings
WHERE realm = 'mind'
ORDER BY captured_at DESC
LIMIT 20;
```
