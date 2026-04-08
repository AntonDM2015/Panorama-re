# Modern UI/UX + Street View Navigation Implementation Plan

## Phase 1: Database Schema - Navigation Links

### 1.1 Add navigation_links table (backend)
**File**: `backend/src/config/schema.sql`

Add new table to store connections between locations:
```sql
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  direction TEXT, -- e.g., 'north', 'south', 'left', 'right'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_location_id, to_location_id)
);
```

### 1.2 Update TypeScript types
**File**: `backend/src/types/index.ts`

Add to Location interface:
```typescript
export interface Location {
  // ... existing fields
  navigationLinks?: NavigationLink[];
}

export interface NavigationLink {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  direction: string | null;
  toLocation?: Location; // populated when fetching
}
```

### 1.3 Create navigation repository & service
**New files**:
- `backend/src/repositories/navigation.repository.ts` - CRUD for navigation links
- Update `backend/src/services/location.service.ts` to load navigation links

### 1.4 Add API endpoints
**File**: `backend/src/routes/location.routes.ts`

Add endpoints:
- `GET /api/locations/:id/navigation-links` - get links for location
- `POST /api/locations/:id/navigation-links` - add link (admin)
- `DELETE /api/navigation-links/:id` - remove link (admin)

### 1.5 Update admin panel
**File**: `web/src/pages/AdminPage.tsx`

Add navigation links management in location modal:
- Section to view/add/remove connections
- Dropdown to select target location
- Direction selector (optional)

## Phase 2: Building Page - Accordion + Inline Panorama

### 2.1 Convert BuildingPage to use accordion
**File**: `web/src/pages/BuildingPage.tsx`

**Changes**:
- Replace `<Link>` cards with clickable accordion items
- Keep existing buttons: "← Назад", "Локации", "Кабинеты"
- Add "🧭 Свободное перемещение" button in header
- When location clicked: expand accordion, show PanoramaViewer inline
- No page navigation - panorama loads within BuildingPage
- Add smooth expand/collapse animations

**State management**:
```typescript
const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
const [showStreetView, setShowStreetView] = useState(false);
```

### 2.2 Add Street View overlay component
**New file**: `web/src/components/StreetViewMode.tsx`

Features:
- Fullscreen overlay that hides main interface
- Mini-map showing current location and connected locations
- Location name and floor display
- Navigation hotspots (arrows) on panorama
- Controls: fullscreen toggle, reset view, exit button
- Smooth fade/zoom transitions between locations

**Props**:
```typescript
interface StreetViewModeProps {
  locations: Location[];
  startLocationId: string;
  onClose: () => void;
}
```

## Phase 3: Enhanced Panorama Viewer

### 3.1 Update PanoramaViewer with hotspots
**File**: `web/src/components/PanoramaViewer.tsx`

**Enhancements**:
- Add navigation hotspots using Pannellum's hotspot API
- Support click on hotspots to navigate to connected locations
- Mouse wheel zoom (desktop)
- Touch swipe support (mobile)
- Gyroscope support (optional, mobile)
- Better aspect ratio handling with CSS `aspect-ratio` property

**Hotspot configuration**:
```typescript
hotSpots: navigationLinks.map(link => ({
  pitch: 0,
  yaw: calculateYaw(link.direction),
  type: 'info',
  text: link.toLocation.name,
  clickHandlerFunc: () => navigateToLocation(link.toLocationId)
}))
```

### 3.2 Add transition animations
**New file**: `web/src/components/PanoramaTransition.tsx`

Wrapper component that provides:
- Fade transition between panoramas
- Zoom + blur effect
- Loading state management

## Phase 4: Modern UI/UX Redesign

### 4.1 Global styles update
**File**: `web/src/index.css`

**Changes**:
- Add CSS custom properties for theming
- Implement glassmorphism base styles
- Add smooth transitions globally
- Update font stack for modern look

```css
:root {
  --primary-gradient: linear-gradient(135deg, #0B1F4D 0%, #1a3a7a 50%, #0f2458 100%);
  --glass-bg: rgba(15, 36, 88, 0.6);
  --glass-border: rgba(56, 189, 248, 0.3);
  --accent-cyan: #38BDF8;
  --border-radius: 16px;
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 4.2 BuildingPage modernization
**File**: `web/src/pages/BuildingPage.css`

**Visual improvements**:
- Glassmorphism header with `backdrop-filter: blur(10px)`
- Gradient background with subtle animated gradient
- Accordion cards with smooth height transitions
- Hover effects: scale, shadow, border glow
- Touch-friendly buttons (min 44px height on mobile)
- Grid layout: responsive columns

**Accordion animation**:
```css
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
.accordion-content.expanded {
  max-height: 800px;
}
```

### 4.3 PanoramaPage enhancements
**File**: `web/src/pages/PanoramaPage.css`

**Changes**:
- Keep existing "← Назад" button
- Add Street View mode toggle
- Panorama container with proper aspect-ratio
- Mobile: fullscreen panorama, minimal UI
- Desktop: centered panorama with glassmorphism controls

### 4.4 StreetViewMode styling
**New file**: `web/src/components/StreetViewMode.css`

**Features**:
- Fullscreen overlay with z-index: 9999
- Mini-map: bottom-left corner, fixed position
- Location info: top-center, glassmorphism card
- Controls: bottom-right, floating glass buttons
- Hotspot arrows: large, touch-friendly (min 48px)
- Transition overlay: full-screen fade effect

**Mini-map design**:
```css
.mini-map {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 150px;
  height: 150px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}
```

## Phase 5: Responsive Design

### 5.1 Mobile-first media queries
**Update all CSS files** with breakpoints:

```css
/* Mobile first (default) */
/* Tablet */
@media (min-width: 768px) { }
/* Desktop */
@media (min-width: 1024px) { }
```

**Mobile optimizations**:
- Touch targets: minimum 44x44px
- Bottom navigation bar (if applicable)
- Swipe gestures for panorama navigation
- Larger fonts for readability
- Simplified UI in Street View mode

### 5.2 Touch gestures
**File**: `web/src/components/PanoramaViewer.tsx`

Add touch event handlers:
- Swipe left/right: rotate panorama
- Pinch: zoom in/out
- Tap on hotspot: navigate

Use Pannellum's built-in touch support + custom gesture handling.

## Phase 6: Polish & Animations

### 6.1 Add animation library
**Install**: `npm install framer-motion`

Use for:
- Accordion expand/collapse
- Page transitions
- Button hover effects
- Modal open/close
- Street View enter/exit

### 6.2 Hover effects
**All interactive elements**:
- Cards: `transform: translateY(-2px) scale(1.02)`
- Buttons: background gradient shift
- Links: underline animation
- Hotspots: pulse animation

### 6.3 Loading states
**Skeleton screens** for:
- Location list loading
- Panorama loading
- Navigation links loading

## Implementation Order

1. **Phase 1** - Database & API (backend changes)
2. **Phase 4.1** - Global styles & theming
3. **Phase 2** - BuildingPage accordion
4. **Phase 3** - PanoramaViewer hotspots
5. **Phase 2.2 + 4.4** - Street View mode
6. **Phase 1.5** - Admin panel navigation links
7. **Phase 5** - Responsive design
8. **Phase 6** - Animations & polish

## Files to Create

**Backend**:
- `backend/src/repositories/navigation.repository.ts`
- Migration SQL for `navigation_links` table

**Frontend**:
- `web/src/components/StreetViewMode.tsx`
- `web/src/components/StreetViewMode.css`
- `web/src/components/PanoramaTransition.tsx`

## Files to Modify

**Backend**:
- `backend/src/config/schema.sql` - add navigation_links table
- `backend/src/types/index.ts` - add NavigationLink interface
- `backend/src/services/location.service.ts` - load navigation links
- `backend/src/routes/location.routes.ts` - add navigation endpoints
- `backend/src/controllers/location.controller.ts` - add navigation handlers

**Frontend**:
- `web/src/pages/BuildingPage.tsx` - accordion + Street View
- `web/src/pages/BuildingPage.css` - modern UI
- `web/src/pages/PanoramaPage.tsx` - Street View toggle
- `web/src/pages/PanoramaPage.css` - modern UI
- `web/src/pages/AdminPage.tsx` - navigation links management
- `web/src/components/PanoramaViewer.tsx` - hotspots + gestures
- `web/src/components/PanoramaViewer.css` - aspect ratio + mobile
- `web/src/index.css` - global styles + variables
- `web/src/App.css` - glassmorphism base

## Important Constraints

- **KEEP** all existing button names: "← Назад", "Локации", "Кабинеты", "Удалить", "Редактировать", "Панорамы"
- **KEEP** existing page structure (routing)
- **ADD** new features on top of existing functionality
- **PRESERVE** all current API calls and data flow
- **MAINTAIN** backward compatibility with existing data

## Testing Checklist

- [ ] Accordion expand/collapse works smoothly
- [ ] Inline panorama loads without page navigation
- [ ] Street View mode opens in fullscreen
- [ ] Navigation hotspots appear and work
- [ ] Mini-map shows current position
- [ ] Transitions between locations are smooth
- [ ] Mobile: touch gestures work
- [ ] Mobile: UI is responsive and touch-friendly
- [ ] Admin: can add/remove navigation links
- [ ] All existing buttons still work
- [ ] No console errors
- [ ] Performance: <3s panorama load time