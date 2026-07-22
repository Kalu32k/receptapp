import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRecipeById, updateRecipe, deleteRecipe } from '../database/recipes.db';
import { Recipe } from '../types/recipe';
import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';

const RecipeSchema = z.object({
  title: z.string().min(1, 'Receptets namn är obligatoriskt').max(100, 'Max 100 tecken'),
  description: z.string().max(500, 'Max 500 tecken').optional().default(''),
  cookTime: z.number().min(1, 'Matkokstiden måste vara minst 1 minut'),
  servings: z.number().min(1, 'Antal portioner måste vara minst 1'),
});

type RecipeFormData = z.infer<typeof RecipeSchema>;

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  EditRecipe: { recipeId: string };
};

type EditRecipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditRecipe'>;
  route: RouteProp<RootStackParamList, 'EditRecipe'>;
};

interface Ingredient {
  id: string;
  name: string;
  amount: number | null;
  unit: string;
}

interface Instruction {
  tempId: string;
  text: string;
}

const EditRecipeScreen: React.FC<EditRecipeScreenProps> = ({ navigation, route }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: 'g' });
  const [newInstruction, setNewInstruction] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeSchema),
  });

  useEffect(() => {
    loadRecipe();
  }, []);

  const loadRecipe = async () => {
    try {
      const data = await getRecipeById(recipeId);
      if (data) {
        setRecipe(data);
        setValue('title', data.title);
        setValue('description', data.description);
        setValue('cookTime', data.cookTime);
        setValue('servings', data.servings);
        setIngredients(data.ingredients);
        setInstructions(data.instructions.map((text, index) => ({ tempId: `inst-${index}`, text })));
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Kunde inte ladda receptet');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      const ingredient: Ingredient = {
        id: `ing-${Date.now()}`,
        name: newIngredient.name,
        amount: newIngredient.amount ? parseFloat(newIngredient.amount) : null,
        unit: newIngredient.unit,
      };
      setIngredients([...ingredients, ingredient]);
      setNewIngredient({ name: '', amount: '', unit: 'g' });
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      const instruction: Instruction = {
        tempId: `temp-${Date.now()}`,
        text: newInstruction,
      };
      setInstructions([...instructions, instruction]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (tempId: string) => {
    setInstructions(instructions.filter((i) => i.tempId !== tempId));
  };

  const onSubmit = async (data: RecipeFormData) => {
    if (ingredients.length === 0) {
      Alert.alert('Error', 'Lägg till minst en ingrediens');
      return;
    }

    if (instructions.length === 0) {
      Alert.alert('Error', 'Lägg till minst en instruktion');
      return;
    }

    try {
      setSaving(true);
      await updateRecipe(recipeId, {
        title: data.title,
        description: data.description,
        cookTime: data.cookTime,
        servings: data.servings,
      });
      Alert.alert('Success', 'Receptet uppdaterades!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating recipe:', error);
      Alert.alert('Error', 'Kunde inte uppdatera receptet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Ta bort recept',
      'Är du säker på att du vill ta bort detta recept? Det kan inte ångras.',
      [
        { text: 'Avbryt', onPress: () => {}, style: 'cancel' },
        {
          text: 'Ta bort',
          onPress: async () => {
            try {
              setSaving(true);
              await deleteRecipe(recipeId);
              Alert.alert('Success', 'Receptet togs bort');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Error', 'Kunde inte ta bort receptet');
            } finally {
              setSaving(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const units = ['g', 'ml', 'msk', 'tsk', 'st', 'dl', 'l'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Redigera recept</Text>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </Pressable>
      </View>

      {/* Recipe Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receptets namn</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="T.ex. Spaghetti Carbonara"
              value={value}
              onChangeText={onChange}
              editable={!saving}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beskrivning</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="En kort beskrivning av receptet..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              editable={!saving}
            />
          )}
        />
      </View>

      {/* Cook Time & Servings */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Matlagning (min)</Text>
            <Controller
              control={control}
              name="cookTime"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="30"
                  keyboardType="number-pad"
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  editable={!saving}
                />
              )}
            />
            {errors.cookTime && <Text style={styles.errorText}>{errors.cookTime.message}</Text>}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Portioner</Text>
            <Controller
              control={control}
              name="servings"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="4"
                  keyboardType="number-pad"
                  value={value.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  editable={!saving}
                />
              )}
            />
            {errors.servings && <Text style={styles.errorText}>{errors.servings.message}</Text>}
          </View>
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredienser</Text>

        {ingredients.length > 0 && (
          <FlatList
            data={ingredients}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  {item.amount && <Text style={styles.ingredientAmount}>{item.amount} {item.unit}</Text>}
                </View>
                <Pressable onPress={() => removeIngredient(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>✕</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        {/* Add Ingredient Form */}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.ingredientInput]}
            placeholder="Ingrediens namn"
            value={newIngredient.name}
            onChangeText={(text) => setNewIngredient({ ...newIngredient, name: text })}
            editable={!saving}
          />
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="Mängd"
            keyboardType="decimal-pad"
            value={newIngredient.amount}
            onChangeText={(text) => setNewIngredient({ ...newIngredient, amount: text })}
            editable={!saving}
          />
          <View style={styles.unitPicker}>
            {units.map((unit) => (
              <Pressable
                key={unit}
                onPress={() => setNewIngredient({ ...newIngredient, unit })}
                style={[styles.unitButton, newIngredient.unit === unit && styles.unitButtonActive]}
              >
                <Text style={[styles.unitButtonText, newIngredient.unit === unit && styles.unitButtonTextActive]}>
                  {unit}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={addIngredient} style={styles.addButton} disabled={!newIngredient.name}>
            <Text style={styles.addButtonText}>+ Lägg till ingrediens</Text>
          </Pressable>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instruktioner</Text>

        {instructions.length > 0 && (
          <FlatList
            data={instructions}
            keyExtractor={(item) => item.tempId}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.listItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.instructionText}>{item.text}</Text>
                </View>
                <Pressable onPress={() => removeInstruction(item.tempId)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>✕</Text>
                </Pressable>
              </View>
            )}
          />
        )}

        {/* Add Instruction Form */}
        <View style={styles.addForm}>
          <TextInput
            style={[styles.input, styles.instructionInput]}
            placeholder="Lägg till instruktion..."
            value={newInstruction}
            onChangeText={setNewInstruction}
            multiline
            numberOfLines={2}
            editable={!saving}
          />
          <Pressable onPress={addInstruction} style={styles.addButton} disabled={!newInstruction.trim()}>
            <Text style={styles.addButtonText}>+ Lägg till steg</Text>
          </Pressable>
        </View>
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.8 }]}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Spara ändringar</Text>
        )}
      </Pressable>

      <View style={{ height: SPACING.xl }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text_primary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    ...TYPOGRAPHY.title_large,
    color: COLORS.text_primary,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title_small,
    color: COLORS.text_primary,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.text_primary,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  column: {
    flex: 1,
  },
  smallInput: {
    textAlign: 'center',
  },
  addForm: {
    gap: SPACING.md,
  },
  ingredientInput: {
    flex: 1,
  },
  amountInput: {
    width: 80,
  },
  unitPicker: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  unitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitButtonText: {
    color: COLORS.text_secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface_variant,
  },
  listItemContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  ingredientName: {
    color: COLORS.text_primary,
    fontWeight: '500',
    fontSize: 14,
  },
  ingredientAmount: {
    color: COLORS.text_secondary,
    fontSize: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  instructionText: {
    color: COLORS.text_primary,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: COLORS.surface_variant,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default EditRecipeScreen;
