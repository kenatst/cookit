import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Clock, Users, ChefHat, ShoppingCart, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { mockRecipes } from '@/mocks/recipes';
import { useHousehold } from '@/contexts/HouseholdContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToShoppingList } = useHousehold();

  const recipe = mockRecipes.find(r => r.id === id);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddToList = useCallback(() => {
    if (recipe) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addToShoppingList(recipe);
    }
  }, [recipe, addToShoppingList]);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recette introuvable</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return Colors.success;
      case 'Moyen':
        return Colors.warning;
      case 'Difficile':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} />
          <View style={styles.imageOverlay} />
          
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.imageContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
            <Text style={styles.title}>{recipe.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={20} color={Colors.primary} />
              <View>
                <Text style={styles.metaLabel}>Temps total</Text>
                <Text style={styles.metaValue}>{recipe.prepTime} + {recipe.cookTime}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Users size={20} color={Colors.primary} />
              <View>
                <Text style={styles.metaLabel}>Portions</Text>
                <Text style={styles.metaValue}>{recipe.servings} personnes</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <ChefHat size={20} color={getDifficultyColor(recipe.difficulty)} />
              <View>
                <Text style={styles.metaLabel}>Difficulté</Text>
                <Text style={[styles.metaValue, { color: getDifficultyColor(recipe.difficulty) }]}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingrédients</Text>
              <TouchableOpacity
                style={styles.addAllButton}
                onPress={handleAddToList}
                activeOpacity={0.7}
              >
                <ShoppingCart size={16} color={Colors.text} />
                <Text style={styles.addAllText}>Ajouter tout</Text>
              </TouchableOpacity>
            </View>
            
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientQuantity}>
                    {ingredient.quantity} {ingredient.unit}
                  </Text>
                  {' '}{ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Préparation</Text>
            
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={handleAddToList}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={22} color={Colors.text} />
          <Text style={styles.bottomButtonText}>Ajouter à la liste de courses</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 320,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAllText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  ingredientQuantity: {
    fontWeight: '600',
    color: Colors.secondary,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});
