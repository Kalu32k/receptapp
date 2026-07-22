#!/bin/bash

FILE="src/screens/RecipeDetailScreen.tsx"

# Lägg till import
sed -i "s|import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';|import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';\nimport { shareRecipe } from '../utils/shareRecipe';|" "$FILE"

# Verifiera
grep "shareRecipe" "$FILE"
echo "Updated RecipeDetailScreen"
