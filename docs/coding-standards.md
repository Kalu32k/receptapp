# Coding Standards - ReceptApp

## TypeScript

### Typer först, ingen `any`

```typescript
// ❌ DONT
function getRecipe(id: any): any {
  const recipe: any = store.recipes.find(r => r.id === id);
  return recipe;
}

// ✅ DO
function getRecipe(id: string): Recipe | undefined {
  const recipe = store.recipes.find(r => r.id === id);
  return recipe;
}
```

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## Komponenter

### Functional Components Only

```typescript
// ❌ DONT - Class components
class RecipeCard extends React.Component {
  render() {
    return <View>{this.props.recipe.title}</View>;
  }
}

// ✅ DO - Functional components
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return <View>{recipe.title}</View>;
};
```

### Props Interface

```typescript
// ✅ Always define props interface
interface RecipeCardProps {
  recipe: Recipe;
  onPress?: (id: string) => void;
  featured?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  featured = false,
}) => {
  // component
};

// Export for reuse
export type { RecipeCardProps };
```

### Memoization

```typescript
// Memoize expensive components
const RecipeCard = React.memo<RecipeCardProps>(({ recipe, onPress }) => {
  return (
    <Pressable onPress={() => onPress?.(recipe.id)}>
      <Text>{recipe.title}</Text>
    </Pressable>
  );
});

// Custom hook memoization (useCallback)
const useRecipeSearch = (query: string) => {
  const search = useCallback(() => {
    return searchService.search(query);
  }, [query]);

  return search;
};
```

---

## Styling

### Use StyleSheet

```typescript
// ✅ DO - Efficient styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
});

export const RecipeCard = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Recipe Title</Text>
  </View>
);
```

### Theme System

```typescript
// ✅ DO - Use theme hooks
const RecipeCard = () => {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text_primary }]}>
        Recipe
      </Text>
    </View>
  );
};
```

---

## Naming Conventions

### Files & Folders

```
PascalCase    for components:  RecipeCard.tsx
camelCase     for hooks:       useRecipes.ts
camelCase     for services:    recipeService.ts
camelCase     for utilities:   formatTime.ts
UPPER_CASE    for constants:   COLORS.ts
```

### Variables & Functions

```typescript
// ❌ Avoid cryptic names
const rc = (r) => r.title;

// ✅ Clear, descriptive names
const getRcipeTitle = (recipe: Recipe): string => recipe.title;
const getRecipeTitle = (recipe: Recipe): string => recipe.title;

// Boolean prefix with is/has/should
const isLoading = false;
const hasError = true;
const shouldShowModal = false;
```

---

## Imports

### Organize Imports

```typescript
// 1. React & Native
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third party
import { useNavigation } from '@react-navigation/native';

// 3. Local components
import { RecipeCard } from '@/components/RecipeCard';

// 4. Hooks
import { useRecipes } from '@/hooks/useRecipes';

// 5. Services
import { recipeService } from '@/services/recipeService';

// 6. Types
import type { Recipe } from '@/types/recipe';

// 7. Utils & Constants
import { formatTime } from '@/utils/formatTime';
import { SPACING, COLORS } from '@/theme/constants';
```

### Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Error Handling

### Try-Catch

```typescript
// ✅ DO - Handle errors
const loadRecipes = async () => {
  try {
    setLoading(true);
    const recipes = await recipeService.getAll();
    setRecipes(recipes);
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    console.error('Failed to load recipes:', message);
    showErrorNotification('Could not load recipes');
  } finally {
    setLoading(false);
  }
};

// ❌ DONT - Silent fails
const loadRecipes = async () => {
  const recipes = await recipeService.getAll(); // What if this fails?
  setRecipes(recipes);
};
```

### Validation

```typescript
// ✅ Use Zod for validation
import { z } from 'zod';

const RecipeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  cookTime: z.number().min(0),
});

type Recipe = z.infer<typeof RecipeSchema>;

const validateRecipe = (data: unknown): Recipe => {
  return RecipeSchema.parse(data);
};
```

---

## React Hooks

### Custom Hooks Pattern

```typescript
// ✅ DO - Reusable hook
const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  return { recipes, loading, error, refetch: loadRecipes };
};

// Usage
const MyComponent = () => {
  const { recipes, loading } = useRecipes();
  return <View>{/* render recipes */}</View>;
};
```

---

## Testing

### Unit Tests

```typescript
// useRecipes.test.ts
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useRecipes } from './useRecipes';

describe('useRecipes', () => {
  it('should load recipes on mount', async () => {
    const { result } = renderHook(() => useRecipes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recipes.length).toBeGreaterThan(0);
  });
});
```

---

## Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] Props interface defined
- [ ] Components memoized if needed
- [ ] Error handling implemented
- [ ] Accessibility considered
- [ ] Responsive design ✓
- [ ] Naming conventions followed
- [ ] Imports organized
- [ ] No console.log in production
- [ ] Tests written
- [ ] Documentation updated

---

## Performance Tips

- Use `React.memo` for expensive components
- Use `useCallback` for expensive functions
- Use `useMemo` for expensive calculations
- Lazy-load images
- Virtualize long lists
- Batch uploads/syncs
- Use SQLite for local storage (not AsyncStorage)
- Profile with React DevTools Profiler

---

## Anti-Patterns

```typescript
// ❌ DONT: useState with objects (causes unnecessary renders)
const [user, setUser] = useState({ name: '', email: '' });
setUser({ ...user, name: 'John' }); // Re-renders entire component

// ✅ DO: Separate state or use useReducer
const [name, setName] = useState('');
const [email, setEmail] = useState('');

// ❌ DONT: Creating new objects/functions in render
const RecipeCard = ({ recipe }) => {
  const style = { padding: 10 }; // New object every render!
  const onPress = () => console.log(recipe.id); // New function every render!
  return <Pressable style={style} onPress={onPress} />;
};

// ✅ DO: Memoize or move outside
const style = { padding: 10 };
const RecipeCard = ({ recipe }) => {
  const onPress = useCallback(() => console.log(recipe.id), [recipe.id]);
  return <Pressable style={style} onPress={onPress} />;
};
```
