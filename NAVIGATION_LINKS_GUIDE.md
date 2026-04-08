# 🧭 How to Add Navigation Links for Street View Mode

## Problem
Navigation arrows (hotspots) are not showing in Street View mode because **no navigation links exist in the database yet**.

## Solution: Add Navigation Links via Admin Panel

### Step 1: Open Admin Panel
1. Go to http://localhost:5174
2. Click **"Админ-панель"** in the footer
3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### Step 2: Add a Second Location
You need at least **2 locations** to create navigation links between them.

1. Click on building **"Главный корпус Брянск"**
2. Click **"Добавить локацию"**
3. Fill in:
   - Name: `Коридор 1 этажа`
   - Type: `Локация`
   - Floor: `1`
4. Click **"Создать"**

### Step 3: Upload Panorama for New Location
1. Click on the new location **"Коридор 1 этажа"**
2. In the modal, scroll to **"Панорамы"**
3. Click **"Добавить панораму"**
4. Select a panorama image file
5. Click **"Загрузить"**

### Step 4: Create Navigation Link
Now link the two locations together:

1. Open location **"Улица"** (the one with existing panoramas)
2. Scroll to section **"Навигационные ссылки"** (green section)
3. In dropdown, select: **"Коридор 1 этажа"**
4. (Optional) Direction: `forward` or `north`
5. Click **"Добавить ссылку"**

✅ You should see the link appear in the list below!

### Step 5: Create Reverse Link (Bidirectional)
For navigation to work both ways:

1. Open location **"Коридор 1 этажа"**
2. Scroll to **"Навигационные ссылки"**
3. Select: **"Улица"**
4. Direction: `back` or `south`
5. Click **"Добавить ссылку"**

### Step 6: Test Street View Mode
1. Go back to building page
2. Click **"🧭 Свободное перемещение"** button
3. You should now see:
   - ✅ Blue/green circular hotspot arrow on the panorama
   - ✅ Pulse animation on the hotspot
   - ✅ Tooltip showing target location name on hover
   - ✅ Click hotspot to navigate to connected location

## What You Should See

### Hotspot Appearance
- **Color**: Blue-green gradient (cyan → emerald)
- **Size**: 50px diameter circle
- **Arrow**: White ▲ (up arrow) in the center
- **Animation**: Pulsing glow effect
- **Hover**: Scales up 1.3x with brighter glow

### Navigation Flow
```
[Улица] ←→ [Коридор 1 этажа]
   ▲            ▲
   │            │
 Hotspot      Hotspot
   │            │
 Click →      Click →
 Navigate     Navigate
```

## Direction Options

When adding navigation links, you can specify direction to position the hotspot:

| Direction | Yaw (Degrees) | Arrow Position |
|-----------|---------------|----------------|
| `north` / `север` | 0° | Front |
| `south` / `юг` | 180° | Back |
| `east` / `восток` | 90° | Right |
| `west` / `запад` | -90° | Left |
| `forward` / `вперед` | 0° | Front |
| `back` / `назад` | 180° | Back |

**Note**: The arrow symbol is currently always ▲ (up). In future updates, it will rotate based on direction.

## Troubleshooting

### No hotspots visible?
1. Check browser console (F12) for logs:
   ```
   [StreetView] Navigation links: 1
   [StreetView] Connected locations: 1
   ```
2. If count is 0, navigation links weren't saved
3. Try refreshing the page

### Hotspots visible but not clickable?
1. Make sure you're in **Street View mode** (🧭 button)
2. Hotspots only work in Street View, not in accordion view
3. Check console for errors

### Hotspot in wrong position?
1. Edit the navigation link
2. Change the direction value
3. Save and refresh

## Database Structure

Navigation links are stored in `navigation_links` table:
```sql
CREATE TABLE navigation_links (
  id UUID PRIMARY KEY,
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  direction TEXT,  -- 'north', 'south', 'east', 'west', etc.
  created_at TIMESTAMP
);
```

Each link creates a **one-way connection**. For bidirectional navigation, create TWO links (A→B and B→A).

## Next Steps

Once you have navigation links working:
1. Add more locations (rooms, hallways, stairs)
2. Create a complete navigation graph
3. Test free navigation through the building
4. Adjust hotspot positions using direction parameter
