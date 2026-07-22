import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Recipe } from '../types/recipe';
import { getRecipeById, toggleFavorite } from '../database/recipes.db';
import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  EditRecipe: { recipeId: string };
};

type RecipeDetailScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'RecipeDetail'>;
  route: RouteProp<RootStackParamList, 'RecipeDetail'>;
};

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ navigation, route }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await getRecipeById(recipeId);
      if (data) {
        setRecipe(data);
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(recipeId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Receptet kunde inte hittas</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>{recipe.title}</Text>
        <Pressable
          onPress={() => navigation.navigate('EditRecipe', { recipeId })}
          style={styles.editButton}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </Pressable>
      </View>

      {/* Favorite button inline */}
      <View style={styles.headerActions}>
        <Pressable
          onPress={handleToggleFavorite}
          style={({ pressed }) => [styles.favoriteButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          <Text style={styles.favoriteText}>
            {isFavorite ? 'Borttagen från favoriter' : 'Lägg till i favoriter'}
          </Text>
        </Pressable>
      </View>

      {/* Recipe Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>⏱</Text>
          <Text style={styles.infoText}>{recipe.cookTime} min</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoText}>{recipe.servings} portioner</Text>
        </View>
        {recipe.rating > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⭐</Text>
            <Text style={styles.infoText}>{recipe.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {recipe.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Om receptet</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>
      )}

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredienser</Text>
        {recipe.ingredients.length > 0 ? (
          <FlatList
            data={recipe.ingredients}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.ingredientItem}>
                <Text style={styles.ingredientBullet}>•</Text>
                <Text style={styles.ingredientName}>{item.name}</Text>
                {item.amount && (
                  <Text style={styles.ingredientAmount}>
                    {item.amount} {item.unit}
                  </Text>
                )}
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>Inga ingredienser listade</Text>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instruktioner</Text>
        {recipe.instructions.length > 0 ? (
          recipe.instructions.map((instruction, index) => (
            <View key={`instruction-${index}`} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Inga instruktioner listade</Text>
        )}
      </View>

      {/* Reviews */}
      {recipe.reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recensioner ({recipe.reviews.length})</Text>
          <FlatList
            data={recipe.reviews}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{item.author || 'Anonym'}</Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(item.rating)}</Text>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            )}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text_primary,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 20,
  },
  title: {
    ...TYPOGRAPHY.headline_medium,
    color: COLORS.text_primary,
    flex: 1,
    marginRight: SPACING.md,
  },
  headerActions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface_variant,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  favoriteText: {
    color: COLORS.text_secondary,
    fontSize: 12,
  },
  infoSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    color: COLORS.text_secondary,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title_medium,
    color: COLORS.text_primary,
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.text_secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  ingredientItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  ingredientBullet: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  ingredientName: {
    flex: 1,
    color: COLORS.text_primary,
    fontSize: 14,
  },
  ingredientAmount: {
    color: COLORS.text_secondary,
    fontSize: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    color: COLORS.text_primary,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: SPACING.xs,
  },
  emptyText: {
    color: COLORS.text_secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  reviewItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reviewAuthor: {
    fontWeight: '600',
    color: COLORS.text_primary,
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    color: COLORS.text_secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: SPACING.lg,
  },
});

export default RecipeDetailScreen;
