import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addRecipe } from '../database/recipes.db';
import { SPACING, COLORS, TYPOGRAPHY } from '../theme/constants';

// Zod validation schema
const RecipeSchema = z.object({
  title: z.string().min(1, 'Receptets namn är obligatoriskt').max(100, 'Max 100 tecken'),
  description: z.string().max(500, 'Max 500 tecken').optional().default(''),
  cookTime: z.number().min(1, 'Matkokstiden måste vara minst 1 minut'),
  servings: z.number().min(1, 'Antal portioner måste vara minst 1'),
});

type RecipeFormData = z.infer<typeof RecipeSchema>;

type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipeId: string };
  AddRecipe: undefined;
};

type AddRecipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AddRecipe'>;
};

interface Ingredient {
  tempId: string;
  name: string;
  amount: number | null;
  unit: string;
}

interface Instruction {
  tempId: string;
  text: string;
}

const AddRecipeScreen: React.FC<AddRecipeScreenProps> = ({ navigation }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: 'g' });
  const [newInstruction, setNewInstruction] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      title: '',
      description: '',
      cookTime: 30,
      servings: 4,
    },
  });

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      const ingredient: Ingredient = {
        tempId: `temp-${Date.now()}`,
        name: newIngredient.name,
        amount: newIngredient.amount ? parseFloat(newIngredient.amount) : null,
        unit: newIngredient.unit,
      };
      setIngredients([...ingredients, ingredient]);
      setNewIngredient({ name: '', amount: '', unit: 'g' });
    }
  };

  const removeIngredient = (tempId: string) => {
    setIngredients(ingredients.filter((i) => i.tempId !== tempId));
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
      alert('Lägg till minst en ingrediens');
      return;
    }

    if (instructions.length === 0) {
      alert('Lägg till minst en instruktion');
      return;
    }

    try {
      setLoading(true);

      // Map temp ingredients to proper format
      const formattedIngredients = ingredients.map((ing, index) => ({
        id: `ing-${index}`,
        name: ing.name,
        amount: ing.amount || 0,
        unit: ing.unit,
      }));

      // Create recipe
      const recipe = await addRecipe({
        title: data.title,
        description: data.description || '',
        cookTime: data.cookTime,
        servings: data.servings,
        ingredients: formattedIngredients,
        instructions: instructions.map((i) => i.text),
        rating: 0,
        reviews: [],
      });

      alert('Receptet tillades!');
      navigation.navigate('RecipeDetail', { recipeId: recipe.id });
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Error när receptet skulle läggas till');
    } finally {
      setLoading(false);
    }
  };

  const units = ['g', 'ml', 'msk', 'tsk', 'st', 'dl', 'l'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Lägg till recept</Text>
        <View style={{ width: 40 }} />
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
              editable={!loading}
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
              editable={!loading}
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
                  editable={!loading}
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
                  editable={!loading}
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
            keyExtractor={(item) => item.tempId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  {item.amount && <Text style={styles.ingredientAmount}>{item.amount} {item.unit}</Text>}
                </View>
                <Pressable onPress={() => removeIngredient(item.tempId)} style={styles.deleteButton}>
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
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="Mängd"
            keyboardType="decimal-pad"
            value={newIngredient.amount}
            onChangeText={(text) => setNewIngredient({ ...newIngredient, amount: text })}
            editable={!loading}
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
            editable={!loading}
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
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Spara recept</Text>
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
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 18,
    fontWeight: 'bold',
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

export default AddRecipeScreen;
