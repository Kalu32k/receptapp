import { queryAsync, executeAsync } from './db';
import { Recipe, Ingredient, Review } from '../types/recipe';
import uuid from 'react-native-uuid';

// Get all recipes
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const recipes = await queryAsync(
    `SELECT * FROM recipes WHERE deleted_at IS NULL ORDER BY updated_at DESC`
  );

  // Fetch ingredients and instructions for each recipe
  const recipesWithDetails = await Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      ingredients: await getRecipeIngredients(recipe.id),
      instructions: await getRecipeInstructions(recipe.id),
      reviews: await getRecipeReviews(recipe.id),
      isFavorite: await isRecipeFavorite(recipe.id),
    }))
  );

  return recipesWithDetails;
};

// Get single recipe
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  const recipes = await queryAsync(
    `SELECT * FROM recipes WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );

  if (recipes.length === 0) return null;

  const recipe = recipes[0];
  return {
    ...recipe,
    ingredients: await getRecipeIngredients(id),
    instructions: await getRecipeInstructions(id),
    reviews: await getRecipeReviews(id),
    isFavorite: await isRecipeFavorite(id),
  };
};

// Get recipe ingredients
export const getRecipeIngredients = async (recipeId: string): Promise<Ingredient[]> => {
  return queryAsync(
    `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY rowid`,
    [recipeId]
  );
};

// Get recipe instructions
export const getRecipeInstructions = async (recipeId: string): Promise<string[]> => {
  const instructions = await queryAsync(
    `SELECT instruction FROM instructions WHERE recipe_id = ? ORDER BY step_number`,
    [recipeId]
  );
  return instructions.map((i) => i.instruction);
};

// Get recipe reviews
export const getRecipeReviews = async (recipeId: string): Promise<Review[]> => {
  return queryAsync(
    `SELECT * FROM reviews WHERE recipe_id = ? ORDER BY created_at DESC`,
    [recipeId]
  );
};

// Check if recipe is favorite
export const isRecipeFavorite = async (recipeId: string): Promise<boolean> => {
  const result = await queryAsync(
    `SELECT * FROM favorites WHERE recipe_id = ?`,
    [recipeId]
  );
  return result.length > 0;
};

// Add recipe
export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>): Promise<Recipe> => {
  const id = uuid.v4().toString();

  await executeAsync(
    `INSERT INTO recipes (id, title, description, image_url, cook_time, servings, difficulty, cuisine, dietary_tags, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      recipe.title,
      recipe.description,
      '',
      recipe.cookTime,
      recipe.servings,
      'Medium',
      'Other',
      '[]',
      0,
    ]
  );

  // Add ingredients
  for (const ingredient of recipe.ingredients) {
    const ingredientId = uuid.v4().toString();
    await executeAsync(
      `INSERT INTO ingredients (id, recipe_id, name, amount, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [ingredientId, id, ingredient.name, ingredient.amount, ingredient.unit]
    );
  }

  // Add instructions
  for (let i = 0; i < recipe.instructions.length; i++) {
    const instructionId = uuid.v4().toString();
    await executeAsync(
      `INSERT INTO instructions (id, recipe_id, step_number, instruction)
       VALUES (?, ?, ?, ?)`,
      [instructionId, id, i + 1, recipe.instructions[i]]
    );
  }

  return getRecipeById(id) as Promise<Recipe>;
};

// Update recipe
export const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<void> => {
  await executeAsync(
    `UPDATE recipes SET title = ?, description = ?, cook_time = ?, servings = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [updates.title, updates.description, updates.cookTime, updates.servings, id]
  );
};

// Delete recipe (soft delete)
export const deleteRecipe = async (id: string): Promise<void> => {
  await executeAsync(
    `UPDATE recipes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id]
  );
};

// Toggle favorite
export const toggleFavorite = async (recipeId: string): Promise<void> => {
  const isFavorite = await isRecipeFavorite(recipeId);

  if (isFavorite) {
    await executeAsync(`DELETE FROM favorites WHERE recipe_id = ?`, [recipeId]);
  } else {
    await executeAsync(`INSERT INTO favorites (recipe_id) VALUES (?)`, [recipeId]);
  }
};

// Search recipes
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const results = await queryAsync(
    `SELECT * FROM recipes WHERE (title LIKE ? OR description LIKE ?) AND deleted_at IS NULL ORDER BY updated_at DESC`,
    [`%${query}%`, `%${query}%`]
  );

  const recipesWithDetails = await Promise.all(
    results.map(async (recipe) => ({
      ...recipe,
      ingredients: await getRecipeIngredients(recipe.id),
      instructions: await getRecipeInstructions(recipe.id),
      reviews: await getRecipeReviews(recipe.id),
      isFavorite: await isRecipeFavorite(recipe.id),
    }))
  );

  return recipesWithDetails;
};

// Get favorites
export const getFavoriteRecipes = async (): Promise<Recipe[]> => {
  const favoriteIds = await queryAsync(
    `SELECT recipe_id FROM favorites ORDER BY created_at DESC`
  );

  const recipes = await Promise.all(
    favoriteIds.map((fav) => getRecipeById(fav.recipe_id) as Promise<Recipe>)
  );

  return recipes.filter((r) => r !== null);
};

// Add review
export const addReview = async (
  recipeId: string,
  rating: number,
  comment: string
): Promise<void> => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  const id = uuid.v4().toString();

  await executeAsync(
    `INSERT INTO reviews (id, recipe_id, rating, comment)
     VALUES (?, ?, ?, ?)`,
    [id, recipeId, rating, comment]
  );
};

// Get average rating for recipe
export const getAverageRating = async (recipeId: string): Promise<number> => {
  const result = await queryAsync(
    `SELECT AVG(rating) as avg_rating FROM reviews WHERE recipe_id = ?`,
    [recipeId]
  );

  const averageRating = Number(result[0]?.avg_rating);
  return Number.isFinite(averageRating) ? averageRating : 0;
};

// Get review count for recipe
export const getReviewCount = async (recipeId: string): Promise<number> => {
  const result = await queryAsync(
    `SELECT COUNT(*) as count FROM reviews WHERE recipe_id = ?`,
    [recipeId]
  );

  const reviewCount = Number(result[0]?.count);
  return Number.isFinite(reviewCount) ? reviewCount : 0;
};

// Delete review
export const deleteReview = async (reviewId: string): Promise<void> => {
  await executeAsync(`DELETE FROM reviews WHERE id = ?`, [reviewId]);
};

// Search by ingredients
export const searchByIngredients = async (query: string): Promise<Recipe[]> => {
  if (!query.trim()) {
    return [];
  }

  const ingredientResults = await queryAsync(
    `SELECT DISTINCT recipe_id FROM ingredients 
     WHERE name LIKE ? AND CAST(ROWID AS TEXT) IN (
       SELECT recipe_id FROM recipes WHERE deleted_at IS NULL
     )`,
    [`%${query}%`]
  );

  const recipeIds = ingredientResults.map((result) => result.recipe_id);
  if (recipeIds.length === 0) {
    return [];
  }

  const recipes = await Promise.all(
    recipeIds.map((id) => getRecipeById(id) as Promise<Recipe>)
  );

  return recipes.filter((r) => r !== null);
};

// Filter recipes by criteria
interface FilterCriteria {
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  maxCookTime?: number;
}

export const filterRecipes = async (criteria: FilterCriteria): Promise<Recipe[]> => {
  let query = 'SELECT * FROM recipes WHERE deleted_at IS NULL';
  const params: (string | number)[] = [];

  if (criteria.cuisine) {
    query += ' AND LOWER(cuisine) = LOWER(?)';
    params.push(criteria.cuisine);
  }

  if (criteria.difficulty) {
    query += ' AND LOWER(difficulty) = LOWER(?)';
    params.push(criteria.difficulty);
  }

  if (criteria.servings != null) {
    query += ' AND servings >= ?';
    params.push(criteria.servings);
  }

  if (criteria.maxCookTime != null) {
    query += ' AND cook_time <= ?';
    params.push(criteria.maxCookTime);
  }

  query += ' ORDER BY updated_at DESC';

  const results = await queryAsync(query, params);

  const recipesWithDetails = await Promise.all(
    results.map(async (recipe) => ({
      ...recipe,
      ingredients: await getRecipeIngredients(recipe.id),
      instructions: await getRecipeInstructions(recipe.id),
      reviews: await getRecipeReviews(recipe.id),
      isFavorite: await isRecipeFavorite(recipe.id),
    }))
  );

  return recipesWithDetails;
};

// Get distinct cuisines from the database
export const getDistinctCuisines = async (): Promise<string[]> => {
  const rows = await queryAsync(
    `SELECT DISTINCT cuisine FROM recipes WHERE deleted_at IS NULL AND cuisine IS NOT NULL ORDER BY cuisine`
  );
  return rows.map((row) => row.cuisine as string);
};

// Get distinct difficulty levels from the database, normalized to lowercase
export const getDifficultyLevels = async (): Promise<('easy' | 'medium' | 'hard')[]> => {
  const rows = await queryAsync(
    `SELECT DISTINCT LOWER(difficulty) AS difficulty FROM recipes WHERE deleted_at IS NULL AND difficulty IS NOT NULL ORDER BY difficulty`
  );
  return rows
    .map((row) => row.difficulty as string)
    .filter((d): d is 'easy' | 'medium' | 'hard' => ['easy', 'medium', 'hard'].includes(d));
};
