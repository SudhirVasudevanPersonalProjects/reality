# Manual Testing Walkthrough - Story 2.8 (Thoughts Focus)

**Date**: 2025-11-06
**Tester**: ___________________

---

## Setup (5 minutes)

### Step 1: Get Your User ID
1. Open Supabase Dashboard → SQL Editor
2. Run: `SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';`
3. Copy your `id` (this is your user_id)

### Step 2: Load Test Data
1. Open `docs/qa/test-data-thoughts.sql`
2. Replace all instances of `YOUR_USER_ID` with your actual user_id
3. Copy the entire SQL file
4. Paste into Supabase SQL Editor
5. Run the query
6. Verify: You should see 5 new Mind somethings created

### Step 3: Get Test Card IDs
Run this query to get your test card IDs:
```sql
SELECT
  id,
  substring(text_content, 1, 40) as preview,
  care,
  location_name
FROM somethings
WHERE realm = 'mind'
  AND user_id = 'YOUR_USER_ID'
ORDER BY captured_at DESC;
```

Copy the IDs - you'll need them for testing.

---

## Core Test Scenarios (15-20 minutes)

### Test 1: Basic Card Display ✅

**Objective**: Verify Thought card displays correctly with all attributes

**Test Card**: Use the one with "Sometimes I wonder if we truly understand happiness..."

**Steps**:
1. ✅ Navigate to `http://localhost:3000/mind/{card-id}`
2. ✅ Page loads without errors

**Verify These Elements**:

**Top Section - Category Badge**:
- [ ] 💭 emoji visible
- [ ] "THOUGHT" text in large bold font
- [ ] "Reflection" subtitle below
- [ ] Purple gradient background

**Middle Section - Content**:
- [ ] Text displays: "Sometimes I wonder if we truly understand happiness..."
- [ ] Full text visible (no truncation)
- [ ] "Why this matters:" section appears
- [ ] Why text displays correctly

**Attributes Panel**:
- [ ] 🕐 Time: Shows "November 5, 2025" format
- [ ] ❤️ Care: Shows "★★★★★ (Love)"
- [ ] 📍 Location: Shows "Central Park" with coordinates
- [ ] "View on Map" button is clickable
- [ ] 🗑️ Domain: Shows "Somewhere"
- [ ] 🏷️ Tags: Shows "Coming soon"
- [ ] 🔗 Connections: Shows "No connections yet"

**Action Buttons**:
- [ ] [Back] button present
- [ ] [Edit] button present
- [ ] [Delete] button present

**Notes**: ___________________

---

### Test 2: Multi-Line Text Preservation ✅

**Objective**: Verify line breaks are preserved

**Test Card**: Use the one with "Line one of my thoughts\nLine two..."

**Steps**:
1. ✅ Navigate to `http://localhost:3000/mind/{card-id}`

**Verify**:
- [ ] Text appears on separate lines (not all mashed together):
  ```
  Line one of my thoughts
  Line two continues the idea
  Line three wraps it up

  Maybe I should write more?
  ```
- [ ] Empty line between paragraphs is preserved
- [ ] Care rating shows "★★★☆☆ (Neutral)"
- [ ] Card opacity is medium (neither bright nor dim)

**Notes**: ___________________

---

### Test 3: Location Link & Navigation ✅

**Objective**: Verify "View on Map" link works

**Test Card**: Use the one with location_name = "Central Park"

**Steps**:
1. ✅ Open card with location
2. ✅ Find "View on Map" button in Location attribute
3. ✅ Right-click → Copy link address
4. ✅ Paste link - should be: `/my_reality?lat=40.7829&lng=-73.9654&zoom=15`
5. ✅ Click "View on Map" button
6. ✅ Physical map loads
7. ✅ Map centers on Central Park location
8. ✅ Marker appears at that location

**Verify**:
- [ ] Link has correct lat/lng parameters
- [ ] Map loads successfully
- [ ] Marker is visible at Central Park
- [ ] Zoom level is 15

**Notes**: ___________________

---

### Test 4: Care Rating Scale ✅

**Objective**: Verify all care ratings display correctly

**Test All 5 Cards** (one of each care level):

**Care 1 (Hate) - "Why did I say that..."**:
- [ ] Shows "★☆☆☆☆ (Hate)"
- [ ] Card is DIM (low opacity, ~0.4)

**Care 2 (Dislike) - Empty content card**:
- [ ] Shows "★★☆☆☆ (Dislike)"
- [ ] Card is dimmer than neutral

**Care 3 (Neutral) - Multi-line thought**:
- [ ] Shows "★★★☆☆ (Neutral)"
- [ ] Card is medium brightness

**Care 4 (Like) - Stoicism book thought**:
- [ ] Shows "★★★★☆ (Like)"
- [ ] Card is brighter than neutral

**Care 5 (Love) - Happiness thought**:
- [ ] Shows "★★★★★ (Love)"
- [ ] Card is BRIGHT (high opacity, ~1.0)

**Notes**: ___________________

---

### Test 5: Empty Content State ✅

**Objective**: Verify graceful handling of empty content

**Test Card**: Use the one with care=2 and NULL text_content

**Steps**:
1. ✅ Navigate to empty content card

**Verify**:
- [ ] Content section shows "No content recorded"
- [ ] Message is centered and readable
- [ ] No error messages or broken UI
- [ ] Attributes panel still displays
- [ ] Care rating still shows "★★☆☆☆ (Dislike)"
- [ ] All action buttons still work

**Notes**: ___________________

---

### Test 6: "Why This Matters" Section ✅

**Objective**: Verify optional "why" field displays

**Test Card**: Use stoicism thought (care=4) or happiness thought (care=5)

**Steps**:
1. ✅ Navigate to card with "why" field

**Verify**:
- [ ] Section appears BETWEEN content and attributes divider
- [ ] Header shows "Why this matters:"
- [ ] Why text displays correctly
- [ ] Section has gray background
- [ ] Purple left border visible
- [ ] Text is readable

**Compare**: Open card WITHOUT "why" field
- [ ] "Why this matters" section does NOT appear
- [ ] Transition from content to attributes is direct

**Notes**: ___________________

---

### Test 7: Delete Flow ✅

**Objective**: Verify delete confirmation and execution

**Test Card**: Use the care=1 card (you can delete this one)

**Steps**:

**Part A: Open Modal**
1. ✅ Navigate to card
2. ✅ Click [Delete] button
3. ✅ Modal appears

**Verify Modal**:
- [ ] Modal overlays the page
- [ ] Background is dimmed
- [ ] Title: "Delete this thought?"
- [ ] Warning message visible
- [ ] [Cancel] button present
- [ ] [Delete] button present (red color)

**Part B: Cancel**
4. ✅ Click [Cancel]
- [ ] Modal closes
- [ ] Returns to card view
- [ ] Card still exists (not deleted)

**Part C: ESC Key**
5. ✅ Click [Delete] again
6. ✅ Press ESC key
- [ ] Modal closes
- [ ] Card still exists

**Part D: Click Outside**
7. ✅ Click [Delete] again
8. ✅ Click on dark background (outside modal box)
- [ ] Modal closes
- [ ] Card still exists

**Part E: Confirm Delete**
9. ✅ Click [Delete] again
10. ✅ Click red [Delete] button in modal
- [ ] Page redirects to `/mind` (list view)
- [ ] Card no longer appears in list
- [ ] Can verify in database: `SELECT * FROM somethings WHERE id = '{card-id}'` returns no rows

**Notes**: ___________________

---

### Test 8: Previous/Next Navigation ✅

**Objective**: Verify chronological navigation works

**Setup**: You should have 4 cards remaining (after deleting one)

**Steps**:

1. ✅ Find your OLDEST card (earliest captured_at)
2. ✅ Navigate to that card

**Verify (First Card)**:
- [ ] NO [← Previous] button (it's the first)
- [ ] [Next →] button IS visible

3. ✅ Click [Next →]
- [ ] Navigates to next card chronologically
- [ ] URL changes to new card ID

4. ✅ Keep clicking [Next →] until you reach the last card

**Verify (Middle Cards)**:
- [ ] Both [← Previous] AND [Next →] buttons visible
- [ ] Previous goes backward in time
- [ ] Next goes forward in time

**Verify (Last Card)**:
- [ ] [← Previous] button IS visible
- [ ] NO [Next →] button (it's the last)

5. ✅ Click [← Previous] multiple times
- [ ] Navigates backward through cards
- [ ] Order is consistent

**Notes**: ___________________

---

### Test 9: Back Button ✅

**Objective**: Verify Back button navigation

**Steps**:
1. ✅ Navigate to `/mind` list view (or any page)
2. ✅ Click on a Mind card to open it
3. ✅ Click [Back] button
- [ ] Returns to previous page
- [ ] Browser back button behavior works

**Notes**: ___________________

---

### Test 10: Authentication ✅

**Objective**: Verify auth protection

**Steps**:

**Part A: Logged In**
1. ✅ Ensure you're logged in
2. ✅ Navigate to any Mind card
- [ ] Page loads successfully
- [ ] Card displays

**Part B: Logged Out**
3. ✅ Log out of application
4. ✅ Try to navigate to same Mind card URL
- [ ] Redirects to `/login` page
- [ ] Cannot view card without auth

5. ✅ Log back in
- [ ] Can now view cards again

**Notes**: ___________________

---

### Test 11: Responsive Design ✅

**Objective**: Verify mobile layout

**Steps**:

**Desktop (Current View)**:
1. ✅ View any card on desktop
- [ ] Card is centered
- [ ] Max width ~800px
- [ ] White space on sides
- [ ] All content readable

**Mobile Simulation**:
2. ✅ Open DevTools (F12)
3. ✅ Click device toolbar icon (or Ctrl+Shift+M)
4. ✅ Select "iPhone SE" or similar mobile device
5. ✅ Refresh page

**Verify Mobile Layout**:
- [ ] Card is full-width (no centering)
- [ ] Padding on left/right edges
- [ ] All text is readable (not too small)
- [ ] Buttons are touchable (not too small)
- [ ] NO horizontal scrolling
- [ ] Images fit within screen
- [ ] Attributes stack vertically
- [ ] Everything is accessible with thumb

6. ✅ Try tablet size (iPad)
- [ ] Layout adjusts appropriately
- [ ] Still readable and usable

**Notes**: ___________________

---

### Test 12: Invalid URLs ✅

**Objective**: Verify error handling

**Steps**:

**Test A: Invalid UUID**
1. ✅ Navigate to `/mind/not-a-valid-uuid`
- [ ] Shows 404 page (not card page)
- [ ] No error in console (beyond expected 404)

**Test B: Non-existent UUID**
2. ✅ Navigate to `/mind/00000000-0000-0000-0000-000000000000`
- [ ] Shows 404 page
- [ ] No sensitive error messages

**Test C: Another User's Card** (if you have access to another account)
3. ✅ Get ID of someone else's Mind card
4. ✅ Try to access it
- [ ] Shows 404 (RLS blocks access)
- [ ] No data leakage

**Notes**: ___________________

---

## Browser Console Check

Throughout testing, keep DevTools Console open (F12 → Console tab)

**Verify**:
- [ ] No JavaScript errors appear during normal use
- [ ] No network request failures (except expected 404s)
- [ ] No warning messages about missing props or keys

**Notes**: ___________________

---

## Test Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Basic Display | ⬜ | |
| 2. Multi-line Text | ⬜ | |
| 3. Location Link | ⬜ | |
| 4. Care Rating Scale | ⬜ | |
| 5. Empty Content | ⬜ | |
| 6. Why Section | ⬜ | |
| 7. Delete Flow | ⬜ | |
| 8. Prev/Next Nav | ⬜ | |
| 9. Back Button | ⬜ | |
| 10. Authentication | ⬜ | |
| 11. Responsive | ⬜ | |
| 12. Invalid URLs | ⬜ | |

---

## Issues Found

| # | Severity | Description | Expected | Actual |
|---|----------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Final Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Story 2.8 is ready for Done

**Tester**: ___________________
**Date**: ___________________
**Time Spent**: _____ minutes

**Overall Notes**:
