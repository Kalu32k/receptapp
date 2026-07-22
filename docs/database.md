# Database - ReceptApp

## SQLite Schema

### Recipes Table

```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cook_time INTEGER,
  servings INTEGER,
  difficulty TEXT,
  cuisine TEXT,
  dietary_tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  is_synced BOOLEAN DEFAULT 0,
  sync_id TEXT UNIQUE
);
```

### Ingredients Table

```sql
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL,
  unit TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### Instructions Table

```sql
CREATE TABLE instructions (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  step_number INTEGER,
  instruction TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  author TEXT,
  rating INTEGER,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### Favorites Table

```sql
CREATE TABLE favorites (
  recipe_id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
```

### Sync Queue Table

```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_synced BOOLEAN DEFAULT 0
);
```

---

## Indexering

```sql
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_is_synced ON recipes(is_synced);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
CREATE INDEX idx_reviews_recipe_id ON reviews(recipe_id);
CREATE INDEX idx_sync_queue_is_synced ON sync_queue(is_synced);
```

---

## Migrationsystem

Migreringar körs vid app-start om nödvändigt:

```
migrations/
├── 001_initial_schema.sql
├── 002_add_dietary_tags.sql
└── 003_add_sync_fields.sql
```

---

## Data Synkronisering

### Offline-First Conflict Resolution

1. **Client wins** - Lokala ändringar prioriteras
2. **Server wins** - Backend data prioriteras (konfigurbar)
3. **Manual merge** - Användare väljer (vid kritiska konflikter)

### Sync Process

```
1. Läs sync_queue
2. For each pending operation:
   - POST till /api/recipes/sync
   - Uppdatera is_synced
3. Uppdatera server-ändringar lokalt
4. Rensa sync_queue
```

---

## Best Practices

- ✅ Alltid använd transactions för multi-table operations
- ✅ Sätt NULL för deleted_at istället för att ta bort
- ✅ Håll sync_id synkroniserad med server
- ✅ Testa migrations före deploy
- ✅ Backup database regelbundet
- ✅ Begränsa sync_queue storlek (max 1000 items)

---

## Query Examples

### Hämta alla recept

```typescript
const recipes = await db.query(
  'SELECT * FROM recipes WHERE deleted_at IS NULL ORDER BY updated_at DESC'
);
```

### Sök recept

```typescript
const results = await db.query(
  'SELECT * FROM recipes WHERE (title LIKE ? OR description LIKE ?) AND deleted_at IS NULL',
  [`%${query}%`, `%${query}%`]
);
```

### Hämta favoriter

```typescript
const favorites = await db.query(`
  SELECT r.* FROM recipes r
  INNER JOIN favorites f ON r.id = f.recipe_id
  WHERE r.deleted_at IS NULL
  ORDER BY f.created_at DESC
`);
```

### Hämta söta varor med betyg över 4

```typescript
const topRecipes = await db.query(`
  SELECT r.*, AVG(rev.rating) as avg_rating
  FROM recipes r
  LEFT JOIN reviews rev ON r.id = rev.recipe_id
  WHERE r.deleted_at IS NULL AND r.cuisine = 'Dessert'
  GROUP BY r.id
  HAVING avg_rating > 4
`);
```
