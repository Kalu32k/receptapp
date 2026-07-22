import { create } from 'zustand';
import { Recipe } from '../types/recipe';

interface RecipeStore {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  toggleFavorite: (id: string) => void;
  getRecipes: () => Recipe[];
  searchRecipes: (query: string) => Recipe[];
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],

  addRecipe: (recipe: Recipe) => {
    set((state) => ({
      recipes: [...state.recipes, recipe],
    }));
  },

  removeRecipe: (id: string) => {
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    }));
  },

  updateRecipe: (id: string, updates: Partial<Recipe>) => {
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updates } : recipe
      ),
    }));
  },

  toggleFavorite: (id: string) => {
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      ),
    }));
  },

  getRecipes: () => get().recipes,

  searchRecipes: (query: string) => {
    const recipes = get().recipes;
    const lowerQuery = query.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description.toLowerCase().includes(lowerQuery)
    );
  },
}));
