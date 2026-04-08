# Testing Guide for Current Implementation

## ⚠️ PREREQUISITE: Run Database Migration

Before testing, you **MUST** run the navigation links migration in Supabase:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and run the entire contents of: `backend/migrate_navigation_links.sql`
4. Verify the table was created: `SELECT * FROM navigation_links;` (should return empty table)

---

## ✅ TEST CHECKLIST

### 1. Building Page - Accordion Behavior

#### Test Steps:
1. Open http://localhost:5173
2. Navigate to a city → building
3. **Expected behavior:**
   - ✅ See "🧭 Свободное перемещение" button in header
   - ✅ Click location card → expands to show panorama inline
   - ✅ Click same card again → collapses
   - ✅ Click different card → previous collapses, new expands
   - ✅ No page navigation (stays on same URL)

#### Issues to Report:
- [ ] Accordion doesn't expand
- [ ] Multiple accordions open at once
- [ ] Panorama doesn't load
- [ ] UI glitches during animation

---

### 2. Panorama Display

#### Desktop Tests:
1. Expand a location with panorama
2. **Check:**
   - [ ] No stretching/distortion
   - [ ] Aspect ratio is correct (16:9 or similar)
   - [ ] Can drag to rotate with mouse
   - [ ] Mouse wheel zooms in/out
   - [ ] Min/max zoom limits work

#### Mobile Tests (use browser dev tools):
1. Switch to mobile view (iPhone/Android)
2. **Check:**
   - [ ] Panorama fills width properly
   - [ ] Touch swipe rotates view
   - [ ] Pinch zoom works
   - [ ] No overflow issues

---

### 3. Street View Mode

#### Test Steps:
1. On building page, click "🧭 Свободное перемещение"
2. **Expected:**
   - [ ] Opens fullscreen overlay
   - [ ] Shows location name at top
   - [ ] Panorama loads and is interactive
   - [ ] Press ESC → closes overlay

#### Navigation Test:
1. First, add navigation links in Supabase (see below)
2. Click "🧭 Свободное перемещение"
3. Click navigation button at bottom
4. **Expected:**
   - [ ] Smooth fade transition
   - [ ] New panorama loads
   - [ ] Location name updates
   - [ ] No flickering

---

### 4. Navigation Graph (Backend)

#### Setup Test Data:
Run in Supabase SQL Editor:
```sql
-- Get location IDs
SELECT id, name FROM locations;

-- Add navigation links (replace IDs with actual ones)
INSERT INTO navigation_links (from_location_id, to_location_id, direction) VALUES
  ('LOCATION_ID_1', 'LOCATION_ID_2', 'forward'),
  ('LOCATION_ID_2', 'LOCATION_ID_1', 'back');
```

#### Test API:
```bash
# Test navigation links endpoint
curl http://localhost:5000/api/locations/LOCATION_ID_1/navigation-links
```

**Expected response:**
```json
{
  "navigationLinks": [
    {
      "id": "...",
      "fromLocationId": "...",
      "toLocationId": "...",
      "direction": "forward"
    }
  ]
}
```

---

### 5. Responsiveness

#### Breakpoints to Test:
- [ ] **Mobile (< 768px)**: Single column, touch-friendly buttons
- [ ] **Tablet (768px - 1024px)**: Adjusted spacing
- [ ] **Desktop (> 1024px)**: Full layout, hover effects

#### Mobile-Specific:
- [ ] Back button works
- [ ] Tabs are accessible
- [ ] Search input works
- [ ] Accordion expands fully
- [ ] Street View button visible
- [ ] Panorama is usable

#### Desktop-Specific:
- [ ] Hover effects on cards
- [ ] Keyboard navigation (Tab, Enter, ESC)
- [ ] Mouse interactions smooth
- [ ] No cursor issues

---

## 🐛 KNOWN ISSUES TO CHECK

### Issue 1: Navigation Links 500 Error
**Symptom:** `GET /api/locations/:id/navigation-links` returns 500

**Possible Causes:**
1. Migration not run (navigation_links table doesn't exist)
2. Foreign key constraint error
3. Service/repository not properly connected

**How to Fix:**
1. Run `backend/migrate_navigation_links.sql` in Supabase
2. Check backend terminal for error details
3. Verify navigation repository is imported correctly

---

### Issue 2: Panorama Not Loading
**Symptom:** "Панорама ещё не добавлена" message

**Check:**
1. Does location have `panoramaUrl` set?
2. Does location have entries in `panoramas` table?
3. Is the image URL valid?

**Fix:**
Add panorama URL via admin panel or SQL:
```sql
UPDATE locations SET panorama_url = 'YOUR_IMAGE_URL' WHERE id = 'LOCATION_ID';
```

---

### Issue 3: Street View Not Opening
**Symptom:** Button does nothing or crashes

**Check:**
1. Console for JavaScript errors
2. Verify StreetViewMode component is imported
3. Check if locations array is empty

---

## 📊 Test Results Template

Copy and fill this out after testing:

```
BUILDING PAGE:
- Accordion works: YES/NO
- Issues: [describe]

PANORAMA DISPLAY:
- No stretching: YES/NO
- Desktop works: YES/NO
- Mobile works: YES/NO
- Issues: [describe]

STREET VIEW MODE:
- Opens correctly: YES/NO
- Navigation works: YES/NO
- Smooth transitions: YES/NO
- Issues: [describe]

NAVIGATION GRAPH:
- API endpoint works: YES/NO
- Links can be created: YES/NO
- Links load in frontend: YES/NO
- Issues: [describe]

RESPONSIVENESS:
- Mobile (< 768px): PASS/FAIL
- Tablet (768-1024px): PASS/FAIL
- Desktop (> 1024px): PASS/FAIL
- Issues: [describe]

OVERALL STATUS: STABLE / NEEDS FIXES
```

---

## 🚦 Next Steps Based on Results

**If ALL tests pass:**
→ Proceed with Phase 1.5 (Admin panel navigation UI)
→ Proceed with Phase 3 (Panorama hotspots)

**If ANY critical tests fail:**
→ Fix issues first
→ Re-test
→ Then continue
