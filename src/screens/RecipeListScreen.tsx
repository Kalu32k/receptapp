import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { Recipe } from '../types/recipe';
import { getAllRecipes } from '../database/recipes.db';
import { SPACING, COLORS } from '../theme/constants';

type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipeId: string };
  AddRecipe: undefined;
};

type RecipeListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = async () => {
    try {
      const data = await getAllRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // Reload recipes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecipes();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Laddar recept...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ReceptApp</Text>
        <Pressable onPress={handleAddRecipe} style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Inga recept än</Text>
          <Text style={styles.emptySubtext}>Lägg till ditt första recept för att komma igång</Text>
          <Pressable onPress={handleAddRecipe} style={styles.emptyAddButton}>
            <Text style={styles.emptyAddButtonText}>Lägg till recept</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item.id)} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
};

const RecipeCard: React.FC<{ recipe: Recipe; onPress: () => void }> = ({ recipe, onPress }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {recipe.image_url ? (
        <Image source={{ uri: recipe.image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={styles.placeholderText}>Ingen bild</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>⏱ {recipe.cookTime} min</Text>
          <Text style={styles.cardMeta}>👥 {recipe.servings} portioner</Text>
          {recipe.rating > 0 && <Text style={styles.cardMeta}>⭐ {recipe.rating.toFixed(1)}</Text>}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text_primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text_secondary,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text_primary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text_secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.surface_variant,
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.text_secondary,
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text_primary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.text_secondary,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.text_secondary,
  },
});

export default RecipeListScreen;
