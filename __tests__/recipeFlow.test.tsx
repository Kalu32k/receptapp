/**
 * Full UI flow tests: create a recipe and delete a recipe.
 *
 * The database layer is mocked so tests run without a real SQLite database.
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddRecipeScreen from '../src/screens/AddRecipeScreen';
import EditRecipeScreen from '../src/screens/EditRecipeScreen';
import { Recipe } from '../src/types/recipe';

// ─── Mock database ───────────────────────────────────────────────────────────

jest.mock('../src/database/recipes.db', () => ({
  addRecipe: jest.fn(),
  getRecipeById: jest.fn(),
  updateRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
  getAllRecipes: jest.fn(),
  toggleFavorite: jest.fn(),
}));

import {
  addRecipe as mockAddRecipe,
  getRecipeById as mockGetRecipeById,
  deleteRecipe as mockDeleteRecipe,
} from '../src/database/recipes.db';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeNavigation = (overrides: Record<string, jest.Mock> = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  ...overrides,
});

const sampleRecipe: Recipe = {
  id: 'recipe-1',
  title: 'Pasta',
  description: 'God pasta',
  ingredients: [{ id: 'ing-1', name: 'pasta', amount: 200, unit: 'g' }],
  instructions: ['Koka pasta'],
  cookTime: 20,
  servings: 2,
  rating: 0,
  reviews: [],
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Create flow ─────────────────────────────────────────────────────────────

describe('Create recipe flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockAddRecipe as jest.Mock).mockResolvedValue({ ...sampleRecipe, id: 'new-id' });
  });

  it('renders the add recipe form', () => {
    const { getByPlaceholderText, getByText } = render(
      <AddRecipeScreen navigation={makeNavigation() as any} />
    );

    expect(getByPlaceholderText('T.ex. Spaghetti Carbonara')).toBeTruthy();
    expect(getByText('Lägg till recept')).toBeTruthy();
  });

  it('shows validation error when title is empty and form is submitted', async () => {
    const nav = makeNavigation();
    const { getByText } = render(<AddRecipeScreen navigation={nav as any} />);

    await act(async () => {
      fireEvent.press(getByText('Spara recept'));
    });

    await waitFor(() => {
      expect(getByText('Receptets namn är obligatoriskt')).toBeTruthy();
    });

    expect(mockAddRecipe).not.toHaveBeenCalled();
  });

  it('creates a recipe and navigates to detail on success', async () => {
    const nav = makeNavigation();
    const originalAlert = global.alert;
    global.alert = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <AddRecipeScreen navigation={nav as any} />
    );

    // Fill in title
    fireEvent.changeText(
      getByPlaceholderText('T.ex. Spaghetti Carbonara'),
      'Spaghetti Carbonara'
    );

    // Add an ingredient
    fireEvent.changeText(getByPlaceholderText('Ingrediens namn'), 'Pasta');
    fireEvent.press(getByText('+ Lägg till ingrediens'));

    // Add an instruction
    fireEvent.changeText(getByPlaceholderText('Lägg till instruktion...'), 'Koka pasta tills al dente');
    fireEvent.press(getByText('+ Lägg till steg'));

    // Submit the form
    await act(async () => {
      fireEvent.press(getByText('Spara recept'));
    });

    await waitFor(() => {
      expect(mockAddRecipe).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Spaghetti Carbonara' })
      );
    });

    expect(nav.navigate).toHaveBeenCalledWith('RecipeDetail', { recipeId: 'new-id' });
    global.alert = originalAlert;
  });
});

// ─── Delete flow ─────────────────────────────────────────────────────────────

describe('Delete recipe flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockGetRecipeById as jest.Mock).mockResolvedValue(sampleRecipe);
    (mockDeleteRecipe as jest.Mock).mockResolvedValue(undefined);
  });

  const makeRoute = (recipeId: string) => ({
    params: { recipeId },
    key: 'EditRecipe',
    name: 'EditRecipe' as const,
  });

  it('renders the edit recipe screen with recipe data', async () => {
    const nav = makeNavigation();
    const { findByDisplayValue } = render(
      <EditRecipeScreen navigation={nav as any} route={makeRoute('recipe-1') as any} />
    );

    expect(await findByDisplayValue('Pasta')).toBeTruthy();
  });

  it('calls deleteRecipe and navigates back after confirmation', async () => {
    const nav = makeNavigation();

    // Intercept Alert.alert so we can confirm deletion automatically
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const confirmButton = buttons?.find((b) => b.style === 'destructive');
      confirmButton?.onPress?.();
    });

    const { findByText } = render(
      <EditRecipeScreen navigation={nav as any} route={makeRoute('recipe-1') as any} />
    );

    // Wait for the screen to finish loading, then press the delete button
    const deleteBtn = await findByText('🗑️');
    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    await waitFor(() => {
      expect(mockDeleteRecipe).toHaveBeenCalledWith('recipe-1');
    });

    expect(nav.goBack).toHaveBeenCalled();
  });

  it('does NOT delete when user cancels the confirmation dialog', async () => {
    const nav = makeNavigation();

    // Cancel instead of confirm
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const cancelButton = buttons?.find((b) => b.style === 'cancel');
      cancelButton?.onPress?.();
    });

    const { findByText } = render(
      <EditRecipeScreen navigation={nav as any} route={makeRoute('recipe-1') as any} />
    );

    const deleteBtn = await findByText('🗑️');
    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    expect(mockDeleteRecipe).not.toHaveBeenCalled();
    expect(nav.goBack).not.toHaveBeenCalled();
  });
});
