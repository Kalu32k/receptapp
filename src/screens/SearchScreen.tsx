import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { searchRecipes } from '../database/recipes.db';
import { Recipe } from '../types/recipe';
import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';

type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipeId: string };
  Search: undefined;
};

type SearchScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Search'>;
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const data = await searchRecipes(query);
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder="Sök efter recept..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          placeholderTextColor={COLORS.text_secondary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Results or Empty State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Inga recept hittades</Text>
          <Text style={styles.emptySubtext}>Prova att söka på något annat</Text>
        </View>
      ) : hasSearched && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item.id)} />
          )}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              Hittade {results.length} recept
            </Text>
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.guideText}>🔍</Text>
          <Text style={styles.guideTitleText}>Sök efter recept</Text>
          <Text style={styles.guideSubtext}>Börja skriva för att söka i din receptsamling</Text>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text_primary,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface_variant,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.text_primary,
    height: 40,
  },
  clearButton: {
    padding: SPACING.sm,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.text_secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text_primary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text_secondary,
    textAlign: 'center',
  },
  guideText: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  guideTitleText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text_primary,
    marginBottom: SPACING.sm,
  },
  guideSubtext: {
    fontSize: 14,
    color: COLORS.text_secondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.md,
  },
  resultCount: {
    color: COLORS.text_secondary,
    fontSize: 12,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
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

export default SearchScreen;
