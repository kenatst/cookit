import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Users, ChefHat, ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useHousehold } from '@/contexts/HouseholdContext';
import { Match } from '@/types';

export default function MatchesScreen() {
  const router = useRouter();
  const { matches, addToShoppingList } = useHousehold();

  const handleViewRecipe = useCallback((recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${recipeId}`);
  }, [router]);

  const handleAddToList = useCallback((match: Match) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToShoppingList(match.recipe);
  }, [addToShoppingList]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleViewRecipe(item.recipe.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.recipe.image }} style={styles.matchImage} />
      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.recipe.name}</Text>
          <Text style={styles.matchDate}>{formatDate(item.matchedAt)}</Text>
        </View>
        
        <Text style={styles.matchCategory}>{item.recipe.category}</Text>
        
        <View style={styles.matchMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.recipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.recipe.servings} pers.</Text>
          </View>
          <View style={styles.metaItem}>
            <ChefHat size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.recipe.difficulty}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToList(item)}
          activeOpacity={0.7}
        >
          <ShoppingCart size={16} color={Colors.text} />
          <Text style={styles.addButtonText}>Ajouter aux courses</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💔</Text>
        <Text style={styles.emptyTitle}>Pas encore de matchs</Text>
        <Text style={styles.emptySubtitle}>
          Swipez tous les deux sur les mêmes plats pour créer un match !
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  matchCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  matchImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  matchContent: {
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  matchDate: {
    fontSize: 12,
    color: Colors.textMuted,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchCategory: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
