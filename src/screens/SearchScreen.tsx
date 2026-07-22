import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { searchRecipes, filterRecipes, getDistinctCuisines, getDifficultyLevels } from '../database/recipes.db';
import { Recipe } from '../types/recipe';
import { SPACING, COLORS } from '../theme/constants';
import RecipeCard from '../components/RecipeCard';

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  Search: undefined;
};

type SearchScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Search'>;
};

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface FilterState {
  cuisine: string;
  difficulty: DifficultyLevel | null;
  servings: string;
  maxCookTime: string;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cuisine: '',
    difficulty: null,
    servings: '',
    maxCookTime: '',
  });
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableDifficulties, setAvailableDifficulties] = useState<DifficultyLevel[]>([]);

  useEffect(() => {
    getDistinctCuisines().then(setAvailableCuisines).catch(() => {});
    getDifficultyLevels().then(setAvailableDifficulties).catch(() => {});
  }, []);

  const hasActiveFilters =
    filters.cuisine.trim().length > 0 ||
    filters.difficulty !== null ||
    filters.servings.trim().length > 0 ||
    filters.maxCookTime.trim().length > 0;

  useEffect(() => {
    const hasText = searchQuery.trim().length > 0;
    if (!hasText && !hasActiveFilters) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        let data: Recipe[];

        if (hasActiveFilters) {
          const criteria = {
            cuisine: filters.cuisine.trim() || undefined,
            difficulty: filters.difficulty ?? undefined,
            servings: filters.servings.trim() ? Number(filters.servings) : undefined,
            maxCookTime: filters.maxCookTime.trim() ? Number(filters.maxCookTime) : undefined,
          };
          data = await filterRecipes(criteria);
          if (hasText) {
            const q = searchQuery.trim().toLowerCase();
            data = data.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
            );
          }
        } else {
          data = await searchRecipes(searchQuery.trim());
        }

        if (!cancelled) {
          setResults(data);
          setHasSearched(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error searching recipes:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, filters, hasActiveFilters]);

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleClearFilters = () => {
    setFilters({ cuisine: '', difficulty: null, servings: '', maxCookTime: '' });
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
        <Pressable
          onPress={() => setShowFilters((v) => !v)}
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        >
          <Text style={[styles.filterIcon, hasActiveFilters && styles.filterIconActive]}>⚙</Text>
        </Pressable>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {/* Cuisine chips */}
            {availableCuisines.map((c) => (
              <Pressable
                key={c}
                onPress={() => setFilters((f) => ({ ...f, cuisine: f.cuisine === c ? '' : c }))}
                style={[styles.chip, filters.cuisine === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.cuisine === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Difficulty */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Svårighetsgrad</Text>
            <View style={styles.difficultyRow}>
              {(availableDifficulties.length > 0
                ? availableDifficulties
                : (['easy', 'medium', 'hard'] as DifficultyLevel[])
              ).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setFilters((f) => ({ ...f, difficulty: f.difficulty === d ? null : d }))}
                  style={[styles.chip, filters.difficulty === d && styles.chipActive]}
                >
                  <Text style={[styles.chipText, filters.difficulty === d && styles.chipTextActive]}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Servings & Cook time */}
          <View style={styles.filterSection}>
            <View style={styles.filterInputRow}>
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>Min portioner</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="0"
                  value={filters.servings}
                  onChangeText={(v) => setFilters((f) => ({ ...f, servings: v }))}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text_secondary}
                />
              </View>
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>Max koktid (min)</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="0"
                  value={filters.maxCookTime}
                  onChangeText={(v) => setFilters((f) => ({ ...f, maxCookTime: v }))}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text_secondary}
                />
              </View>
            </View>
          </View>

          {hasActiveFilters && (
            <Pressable onPress={handleClearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>Rensa filter</Text>
            </Pressable>
          )}
        </View>
      )}

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
          <Text style={styles.guideSubtext}>Börja skriva eller välj filter för att söka i din receptsamling</Text>
        </View>
      )}
    </View>
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
  filterButton: {
    padding: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  filterIcon: {
    fontSize: 18,
    color: COLORS.text_secondary,
  },
  filterIconActive: {
    color: '#FFFFFF',
  },
  filterPanel: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  filterRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: 12,
    color: COLORS.text_secondary,
    marginBottom: SPACING.xs,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterInputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filterInputGroup: {
    flex: 1,
  },
  filterInput: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface_variant,
    borderRadius: 6,
    fontSize: 14,
    color: COLORS.text_primary,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.surface_variant,
    marginRight: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text_secondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFiltersText: {
    fontSize: 13,
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
});

export default SearchScreen;

