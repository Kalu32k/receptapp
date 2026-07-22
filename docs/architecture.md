# Architecture - ReceptApp

## Översikt

ReceptApp är en offline-first mobilapp byggd med React Native och Expo. Appen lagrar recept lokalt på enheten och synkroniserar med backend när internet är tillgängligt.

---

## Lagersstruktur (Layered Architecture)

```
┌─────────────────────────────────────┐
│         UI Layer (Screens)          │
│  HomeScreen, RecipeDetail, Search   │
├─────────────────────────────────────┤
│     Component Layer                 │
│  RecipeCard, Button, Input          │
├─────────────────────────────────────┤
│    Business Logic Layer             │
│  useRecipesHook, useSearchHook      │
├─────────────────────────────────────┤
│     State Management (Zustand)      │
│  recipeStore, syncStore             │
├─────────────────────────────────────┤
│    Data Access Layer                │
│  database.ts, api.ts                │
├─────────────────────────────────────┤
│     Core Services                   │
│  SQLite, AsyncStorage, HTTP         │
└─────────────────────────────────────┘
```

---

## Mappstruktur

```
src/
├── screens/           # Navigation screens
│   ├── HomeScreen.tsx
│   ├── RecipeListScreen.tsx
│   ├── RecipeDetailScreen.tsx
│   ├── SearchScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── AddRecipeScreen.tsx
│   └── SettingsScreen.tsx
│
├── components/        # Reusable UI components
│   ├── RecipeCard.tsx
│   ├── IngredientList.tsx
│   ├── InstructionStep.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── SearchBar.tsx
│   └── Header.tsx
│
├── hooks/            # Custom hooks
│   ├── useRecipes.ts
│   ├── useSearch.ts
│   ├── useFavorites.ts
│   ├── useOfflineSync.ts
│   └── useTheme.ts
│
├── store/            # Zustand state
│   ├── recipeStore.ts
│   ├── syncStore.ts
│   ├── settingsStore.ts
│   └── uiStore.ts
│
├── services/         # Business logic
│   ├── recipeService.ts
│   ├── searchService.ts
│   ├── syncService.ts
│   └── cloudService.ts
│
├── database/         # Data access
│   ├── db.ts         # SQLite initialization
│   ├── recipes.db.ts # Recipe queries
│   ├── migrations.ts # Database migrations
│   └── seed.ts       # Initial data
│
├── api/              # HTTP client
│   ├── client.ts     # Axios config
│   ├── recipes.api.ts
│   └── auth.api.ts
│
├── types/            # TypeScript definitions
│   ├── recipe.ts
│   ├── user.ts
│   ├── api.ts
│   └── sync.ts
│
├── utils/            # Helper functions
│   ├── validation.ts
│   ├── formatting.ts
│   ├── constants.ts
│   └── logger.ts
│
├── theme/            # Styling & theme
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── theme.ts
│
└── App.tsx           # Root component
```

---

## Data Flow

### Offline-First Pattern

```
┌──────────────────┐
│   User Action    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Update Store    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Update SQLite   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Update UI       │
└────────┬─────────┘
         │
      (Background)
         ▼
┌──────────────────┐
│  Sync to Backend │
└──────────────────┘
```

---

## State Management (Zustand)

Varje store ansvarar för en del av appen:

- **recipeStore**: Alla recept, CRUD-operationer
- **syncStore**: Sync-status, konflikthantering
- **settingsStore**: Användarinställningar, tema
- **uiStore**: UI-state, modals, loading-tillstånd

---

## Databasen (SQLite)

SQLite används för lokal data-lagring. All data synkroniseras med backend när möjligt.

Tabeller:
- `recipes` - Receptdata
- `ingredients` - Ingredienser
- `instructions` - Instruktioner
- `reviews` - Recensioner
- `favorites` - Favoritmarkering
- `sync_queue` - Väntande ändringar

---

## API-kommunikation

Använd offline-first approach:

1. Uppdatera lokal SQLite
2. Uppdatera Zustand store
3. Uppdatera UI
4. Synkronisera med backend (asynkrona)
5. Hantera konflikter vid behov

---

## Performance & Optimization

- Lazy loading av receptlistor
- Memoization av komponenter
- Optimistisk UI-uppdatering
- Image caching
- Batched synkronisering
