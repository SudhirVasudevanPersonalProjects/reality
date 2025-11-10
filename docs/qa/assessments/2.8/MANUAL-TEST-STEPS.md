# Manual Testing Guide - Step-by-Step Commands
## Story 2.8: Mind Card View (Pokémon Style)

**Estimated Time**: 20 minutes
**Date**: ___________
**Tester**: ___________

---

## SETUP: Create Test Data (5 minutes)

### Step 1: Open Supabase Studio
```bash
# Click this URL or copy-paste into browser:
http://127.0.0.1:55323
```
- [ ] Supabase Studio opens in browser

---

### Step 2: Open SQL Editor
1. [ ] In Supabase Studio, click **"SQL Editor"** in left sidebar
2. [ ] Click **"New query"** button

---

### Step 3: Get Your User ID

**Copy and paste this command** into SQL Editor:
```sql
SELECT id, email FROM auth.users LIMIT 1;
```

**Execute**:
- [ ] Click **"Run"** button (or press Ctrl+Enter)
- [ ] Copy the **`id`** value from results (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

**Paste your user_id here for reference**:
```
MY_USER_ID: _________________________________
```

---

### Step 4: Create Test Thought Cards

1. [ ] Open the file: `test-data-setup.sql` (in project root)
2. [ ] Find all instances of `'YOUR_USER_ID_HERE'` (there are 6 of them)
3. [ ] Replace with your actual user_id from Step 3
4. [ ] Copy **ONLY the STEP 2 section** (from "Test Thought 1" to "Test Thought 5")
5. [ ] Paste into SQL Editor
6. [ ] Click **"Run"**

**Verify**:
- [ ] You see "Success. 5 rows affected." (or similar)
- [ ] No error messages

---

### Step 5: Get Test Card IDs

**Copy and paste this command** (replace YOUR_USER_ID with yours):
```sql
SELECT
  id,
  substring(text_content, 1, 40) as preview,
  care,
  location_name,
  captured_at
FROM somethings
WHERE realm = 'mind'
  AND user_id = 'YOUR_USER_ID_HERE'
ORDER BY captured_at DESC;
```

**Execute**:
- [ ] Click **"Run"**
- [ ] You should see 5 rows

**Copy the 5 card IDs and paste here**:
```
Card 1 (Happiness, Care=5):    _________________________________
Card 2 (Multi-line, Care=3):   _________________________________
Card 3 (Stoicism, Care=4):     _________________________________
Card 4 (Empty, Care=2):        _________________________________
Card 5 (Embarrassing, Care=1): _________________________________
```

✅ **Setup Complete!** Now let's test...

---

## TEST 1: Basic Card Display (3 minutes)

### Open Card 1 (Happiness - Care 5)

**Command**: Open in browser:
```
http://localhost:3000/mind/[PASTE-CARD-1-ID-HERE]
```

Example: `http://localhost:3000/mind/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### Check: Top Section - Category Badge

- [ ] You see 💭 emoji
- [ ] Text says **"THOUGHT"** (large, bold)
- [ ] Subtitle says **"Reflection"**
- [ ] Purple gradient background on header

---

### Check: Middle Section - Content

- [ ] Text displays: *"Sometimes I wonder if we truly understand happiness..."*
- [ ] Below content, you see section with heading **"Why this matters:"**
- [ ] Why text displays: *"This reflection helped me realize..."*
- [ ] Why section has gray background with purple left border

---

### Check: Bottom Section - Attributes Panel

Look for ATTRIBUTES divider line, then check:

**Time**:
- [ ] 🕐 icon
- [ ] Format: **"November 5, 2025, 2:30 PM"** (or similar)

**Care Rating**:
- [ ] ❤️ icon
- [ ] Shows: **"★★★★★ (Love)"** (5 filled stars)
- [ ] Overall card is BRIGHT (high opacity)

**Location**:
- [ ] 📍 icon
- [ ] Shows: **"Location: Central Park"**
- [ ] Coordinates: **"40.7829°N, 73.9654°W"**
- [ ] Blue/purple button: **"View on Map"**

**Domain**:
- [ ] 🗑️ icon
- [ ] Text: **"Domain: Somewhere"**

**Tags**:
- [ ] 🏷️ icon
- [ ] Text: **"Tags: Coming soon"** (grayed out)

**Connections**:
- [ ] 🔗 icon
- [ ] Text: **"Connections: No connections yet"**

---

### Check: Action Buttons (Bottom)

- [ ] **[Back]** button (gray)
- [ ] **[Edit]** button (blue)
- [ ] **[Delete]** button (red)

---

### Check: Previous/Next Navigation

Since this is Card 1 (newest), you should see:
- [ ] **[← Previous]** button IS visible (older cards exist)
- [ ] NO **[Next →]** button (this is the newest)

**Notes**: ________________

✅ **Test 1 Complete**

---

## TEST 2: Multi-Line Text Preservation (2 minutes)

### Open Card 2 (Multi-line - Care 3)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-2-ID-HERE]
```

---

### Check: Text Appears on Separate Lines

You should see:
```
Line one of my thoughts
Line two continues the idea
Line three wraps it up

Maybe I should write more?
```

- [ ] Text is on separate lines (NOT all on one line)
- [ ] Empty line between "Line three" and "Maybe" is preserved

---

### Check: Care Rating

- [ ] Shows: **"★★★☆☆ (Neutral)"** (3 filled, 2 empty)
- [ ] Card brightness is MEDIUM (not too bright, not too dim)

---

### Check: No Location

- [ ] Location section shows: **"No physical location linked"** (grayed out)
- [ ] No "View on Map" button

**Notes**: ________________

✅ **Test 2 Complete**

---

## TEST 3: Location Link Navigation (2 minutes)

### Go Back to Card 1

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-1-ID-HERE]
```

---

### Test "View on Map" Button

1. [ ] Find the **"View on Map"** button in Location section
2. [ ] **Right-click** the button → **"Copy link address"**

**Paste the copied URL here**:
```
_____________________________________________
```

3. [ ] Verify URL looks like: `/my_reality?lat=40.7829&lng=-73.9654&zoom=15`

4. [ ] Now **Left-click** the "View on Map" button

---

### Check: Physical Map Loads

- [ ] Page navigates to Physical map view (`/my_reality`)
- [ ] Map displays (Mapbox/Google Maps)
- [ ] Map is centered on Central Park area
- [ ] You see a marker/pin on the map
- [ ] Zoom level is close-up (level 15)

**Notes**: ________________

✅ **Test 3 Complete**

---

## TEST 4: Care Rating Scale (4 minutes)

Test all 5 care levels by opening each card.

### Card 5: Hate (1 Star)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-5-ID-HERE]
```

- [ ] Text: *"Why did I say that? So embarrassing."*
- [ ] Care: **"★☆☆☆☆ (Hate)"** (1 filled, 4 empty)
- [ ] Card is **VERY DIM** (low opacity, ~40%)
- [ ] Text still readable but muted

---

### Card 4: Dislike (2 Stars)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-4-ID-HERE]
```

- [ ] Content section shows: **"No content recorded"** (centered message)
- [ ] Care: **"★★☆☆☆ (Dislike)"** (2 filled, 3 empty)
- [ ] Card is **DIM** (darker than neutral)

---

### Card 2: Neutral (3 Stars)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-2-ID-HERE]
```

- [ ] Care: **"★★★☆☆ (Neutral)"** (3 filled, 2 empty)
- [ ] Card is **MEDIUM brightness** (opacity ~65%)

---

### Card 3: Like (4 Stars)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-3-ID-HERE]
```

- [ ] Text: *"Reading that book about stoicism..."*
- [ ] Care: **"★★★★☆ (Like)"** (4 filled, 1 empty)
- [ ] Card is **BRIGHT** (brighter than neutral)
- [ ] "Why this matters" section appears
- [ ] Domain shows: **"☀️ Beauty"** (not "Somewhere")

---

### Card 1: Love (5 Stars)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-1-ID-HERE]
```

- [ ] Care: **"★★★★★ (Love)"** (5 filled stars)
- [ ] Card is **VERY BRIGHT** (opacity ~100%, fully visible)

**Notes**: ________________

✅ **Test 4 Complete**

---

## TEST 5: Delete Flow (3 minutes)

Let's delete Card 5 (the embarrassing one with care=1).

### Open Card 5

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-5-ID-HERE]
```

---

### Test: Cancel Delete

1. [ ] Click **[Delete]** button (red)
2. [ ] Modal appears with dark overlay
3. [ ] Title says: **"Delete this thought?"**
4. [ ] Warning message visible
5. [ ] Click **[Cancel]** button
6. [ ] Modal closes
7. [ ] You're back at the card view
8. [ ] Card still exists (not deleted)

---

### Test: ESC Key

1. [ ] Click **[Delete]** button again
2. [ ] Press **ESC** key on keyboard
3. [ ] Modal closes
4. [ ] Card still exists

---

### Test: Click Outside

1. [ ] Click **[Delete]** button again
2. [ ] Click on the **dark area outside the modal** (not on the modal box)
3. [ ] Modal closes
4. [ ] Card still exists

---

### Test: Confirm Delete

1. [ ] Click **[Delete]** button again
2. [ ] Click the red **[Delete]** button inside the modal (NOT Cancel)
3. [ ] Page redirects to `/mind` (list view or another page)
4. [ ] Card is gone from the list

**Verify in Database**:

Open Supabase Studio SQL Editor and run:
```sql
SELECT * FROM somethings WHERE id = '[PASTE-CARD-5-ID]';
```

- [ ] Returns 0 rows (card was deleted)

**Notes**: ________________

✅ **Test 5 Complete**

---

## TEST 6: Previous/Next Navigation (3 minutes)

Now you have 4 cards remaining. Let's test navigation.

### Find Your Oldest Card

Look at your captured_at dates:
- Card 3 (Stoicism) = Nov 3 ← **This is oldest**
- Card 4 (Empty) = Nov 2 ← Wait, this might be oldest
- Card 2 (Multi-line) = Nov 4
- Card 1 (Happiness) = Nov 5 ← Newest

Actually Card 4 is oldest. Let's open it.

### Open Card 4 (Empty - oldest)

**Command**:
```
http://localhost:3000/mind/[PASTE-CARD-4-ID-HERE]
```

---

### Check Navigation (First Card)

- [ ] NO **[← Previous]** button (this is first/oldest)
- [ ] **[Next →]** button IS visible

---

### Click Next Multiple Times

1. [ ] Click **[Next →]**
2. [ ] URL changes to next card
3. [ ] Card content updates

Continue clicking Next:
- [ ] After Card 4, goes to Card 3 (Stoicism, Nov 3)
- [ ] After Card 3, goes to Card 2 (Multi-line, Nov 4)
- [ ] After Card 2, goes to Card 1 (Happiness, Nov 5)

---

### Check Navigation (Last Card)

When you reach Card 1 (newest):
- [ ] **[← Previous]** button IS visible
- [ ] NO **[Next →]** button (this is last/newest)

---

### Click Previous Multiple Times

1. [ ] Click **[← Previous]**
2. [ ] Goes backward through cards in reverse order
3. [ ] Card 1 → Card 2 → Card 3 → Card 4

**Notes**: ________________

✅ **Test 6 Complete**

---

## TEST 7: Back Button (1 minute)

### Test Browser Back Navigation

1. [ ] Open any Mind card
2. [ ] Click **[Back]** button (gray)
3. [ ] Browser goes to previous page (browser back behavior)

**Notes**: ________________

✅ **Test 7 Complete**

---

## TEST 8: Authentication (2 minutes)

### Test: Logged In Access

1. [ ] Open any Mind card while logged in
2. [ ] Card displays successfully

---

### Test: Logged Out Redirect

1. [ ] Log out of the application
2. [ ] Try to open the same Mind card URL
3. [ ] Should redirect to **`/login`** page
4. [ ] Cannot view card without auth

---

### Test: Log Back In

1. [ ] Log back in
2. [ ] Navigate to card again
3. [ ] Card displays successfully

**Notes**: ________________

✅ **Test 8 Complete**

---

## TEST 9: Responsive Design (2 minutes)

### Desktop View (Current)

1. [ ] Open any Mind card
2. [ ] Card is centered on screen
3. [ ] Max width ~800px
4. [ ] White space on left/right sides

---

### Mobile View

1. [ ] Press **F12** to open DevTools
2. [ ] Click **device toolbar icon** (or press Ctrl+Shift+M)
3. [ ] Select **"iPhone SE"** or **"iPhone 12 Pro"**
4. [ ] Refresh the page

**Check Mobile Layout**:
- [ ] Card is full-width (no centering)
- [ ] Has padding on edges
- [ ] All text is readable (not tiny)
- [ ] Buttons are large enough to tap
- [ ] NO horizontal scrolling
- [ ] Attributes stack vertically
- [ ] "View on Map" button is full-width or large enough

---

### Tablet View

1. [ ] Select **"iPad Mini"** or **"iPad"** in device toolbar
2. [ ] Refresh page
3. [ ] Layout adjusts appropriately
4. [ ] Still readable and usable

**Notes**: ________________

✅ **Test 9 Complete**

---

## TEST 10: Invalid URLs (1 minute)

### Test: Invalid UUID Format

**Command**: Open in browser:
```
http://localhost:3000/mind/not-a-valid-uuid
```

- [ ] Shows 404 page (not card page)
- [ ] No JavaScript errors in console (F12 → Console tab)

---

### Test: Non-Existent UUID

**Command**:
```
http://localhost:3000/mind/00000000-0000-0000-0000-000000000000
```

- [ ] Shows 404 page
- [ ] No sensitive error messages

**Notes**: ________________

✅ **Test 10 Complete**

---

## TEST 11: Browser Console Check (Throughout All Tests)

Keep DevTools Console open (F12 → Console) during testing.

**Verify**:
- [ ] No red JavaScript errors during normal use
- [ ] No failed network requests (except expected 404s)
- [ ] No React warnings about missing keys or props

**Notes**: ________________

✅ **Test 11 Complete**

---

## FINAL CHECKLIST

### Summary

| Test | Status | Time | Notes |
|------|--------|------|-------|
| 1. Basic Display | ⬜ | ___ min | |
| 2. Multi-line Text | ⬜ | ___ min | |
| 3. Location Link | ⬜ | ___ min | |
| 4. Care Rating Scale | ⬜ | ___ min | |
| 5. Delete Flow | ⬜ | ___ min | |
| 6. Prev/Next Nav | ⬜ | ___ min | |
| 7. Back Button | ⬜ | ___ min | |
| 8. Authentication | ⬜ | ___ min | |
| 9. Responsive | ⬜ | ___ min | |
| 10. Invalid URLs | ⬜ | ___ min | |
| 11. Console Check | ⬜ | ___ min | |

**Total Time**: ______ minutes

---

## Issues Found

| # | Severity | Description | Expected | Actual | Card ID |
|---|----------|-------------|----------|--------|---------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All blocking issues documented
- [ ] Story 2.8 is ready for production

**Tester Name**: _______________________
**Date**: _______________________
**Signature**: _______________________

---

## Quick Commands Reference

**Open Supabase Studio**:
```
http://127.0.0.1:55323
```

**Check test data**:
```sql
SELECT id, substring(text_content, 1, 30), care, captured_at
FROM somethings
WHERE realm = 'mind' AND user_id = '[YOUR_USER_ID]'
ORDER BY captured_at DESC;
```

**Delete all test data** (if needed):
```sql
DELETE FROM somethings
WHERE realm = 'mind' AND user_id = '[YOUR_USER_ID]'
AND captured_at >= '2025-11-01' AND captured_at <= '2025-11-05';
```
