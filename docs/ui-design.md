# UI Design - ReceptApp

## Design System

### Colors

#### Light Mode
```typescript
const LIGHT_COLORS = {
  primary: '#FF6B35',      // Warm orange
  secondary: '#004E89',    // Deep blue
  accent: '#F7931E',       // Bright orange
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surface_variant: '#EEEEEE',
  text_primary: '#212121',
  text_secondary: '#757575',
  border: '#BDBDBD',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
};
```

#### Dark Mode
```typescript
const DARK_COLORS = {
  primary: '#FF8C42',
  secondary: '#87CEEB',
  accent: '#FFB347',
  background: '#121212',
  surface: '#1E1E1E',
  surface_variant: '#272727',
  text_primary: '#FFFFFF',
  text_secondary: '#B0B0B0',
  border: '#404040',
  success: '#81C784',
  warning: '#FFD54F',
  error: '#E57373',
  info: '#64B5F6',
};
```

---

## Typography

```typescript
const TYPOGRAPHY = {
  headline_large: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  headline_medium: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  headline_small: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  title_large: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  title_medium: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  title_small: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  body_large: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body_medium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  body_small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label_large: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  label_medium: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
};
```

---

## Spacing

```typescript
const SPACING = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 48,    // 48px
};
```

---

## Shadows & Elevation

#### Neumorphic Style (Aero/Glass)

```typescript
const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
```

---

## Components

### Buttons

#### Primary Button
- Background: Primary color
- Text: White
- Disabled: 50% opacity
- Ripple effect on press

#### Secondary Button
- Background: Surface variant
- Text: Primary color
- Border: 1px primary color

#### Icon Button
- Size: 48x48 dp
- Icon: 24x24 dp
- Circular ripple

### Cards

- Border radius: 12dp
- Elevation: small shadow
- Padding: 16dp
- Responsive layout

### Input Fields

- Border radius: 8dp
- Border: 1px, color: border
- Padding: 12dp horizontal, 8dp vertical
- Focus: primary color border, shadow

### Recipe Card

- Image: 16:9 ratio
- Title, description
- Cook time, servings
- Heart icon (favorite)
- Rating stars (optional)

---

## Screens

### Home Screen
- Header with logo
- Quick actions (Add, Search)
- Recent recipes carousel
- Favorites section

### Recipe List Screen
- Tab navigation (All, Favorites, My Recipes)
- Search bar at top
- Scrollable recipe cards
- Pull-to-refresh

### Recipe Detail Screen
- Hero image (full width)
- Add to favorites button
- Cook time, servings, difficulty
- Ingredients (swipeable list)
- Instructions (step by step)
- Reviews section
- Share button
- Floating action button (Edit, Delete)

### Search Screen
- Search bar
- Filters (Cuisine, Difficulty, Tags)
- Recent searches
- Search results with infinite scroll

### Add/Edit Recipe Screen
- Form with validation
- Image picker
- Ingredients list (add/remove)
- Instructions list (add/remove)
- Tags input
- Submit button

---

## Interactions

### Animations
- Screen transitions: Fade (200ms)
- Button press: Scale (100ms)
- Favorite toggle: Heart animation (300ms)
- List items: Slide in (150ms)

### Gestures
- Swipe left/right: Navigate
- Swipe up: Pull-to-refresh
- Long press: Context menu
- Double tap: Favorite toggle

### Micro-interactions
- Loading skeleton screens
- Empty state illustrations
- Toast notifications
- Success feedback

---

## Responsive Design

### Breakpoints
- Mobile: 320px - 480px
- Small tablet: 481px - 600px
- Tablet: 601px - 1024px
- Large tablet/iPad: 1025px+

### Layout adjustments
- Single column on mobile
- Two columns on tablet
- Three columns on large screens
- Flexible spacing

---

## Accessibility

- ✅ Color contrast ratio 4.5:1
- ✅ Touch targets: min 48x48 dp
- ✅ Screen reader support
- ✅ Keyboard navigation
- ✅ Font size: min 16px (readable)
- ✅ Alt text for images
