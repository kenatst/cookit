import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useHousehold } from '@/contexts/HouseholdContext';
import SwipeCard from '@/components/SwipeCard';
import ActionButtons from '@/components/ActionButtons';
import MatchModal from '@/components/MatchModal';
import { Recipe } from '@/types';



export default function SwipeScreen() {
  const router = useRouter();
  const {
    currentUser,
    switchUser,
    swipe,
    unswipedRecipes,
    addToShoppingList,
    resetAll,
    isLoading,
  } = useHousehold();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedRecipe, setMatchedRecipe] = useState<Recipe | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const switchAnim = useRef(new Animated.Value(0)).current;

  const handleSwipe = useCallback((direction: 'like' | 'dislike') => {
    if (currentIndex >= unswipedRecipes.length) return;
    
    const recipe = unswipedRecipes[currentIndex];
    const match = swipe(recipe.id, direction);
    
    if (match) {
      setMatchedRecipe(match);
      setShowMatchModal(true);
    }
    
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, unswipedRecipes, swipe]);

  const handleSwipeLeft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSwipe('dislike');
  }, [handleSwipe]);

  const handleSwipeRight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSwipe('like');
  }, [handleSwipe]);

  const handleSwitchUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(switchAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(switchAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    switchUser();
    setCurrentIndex(0);
  }, [switchUser, switchAnim]);

  const handleViewRecipe = useCallback(() => {
    if (matchedRecipe) {
      setShowMatchModal(false);
      router.push(`/recipe/${matchedRecipe.id}`);
    }
  }, [matchedRecipe, router]);

  const handleAddToList = useCallback(() => {
    if (matchedRecipe) {
      addToShoppingList(matchedRecipe);
      setShowMatchModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [matchedRecipe, addToShoppingList]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetAll();
    setCurrentIndex(0);
  }, [resetAll]);

  const switchScale = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const remainingRecipes = unswipedRecipes.slice(currentIndex);
  const noMoreRecipes = remainingRecipes.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Qu&apos;est-ce</Text>
          <Text style={styles.logoAccent}>qu&apos;on mange ?</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <RefreshCw size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ scale: switchScale }] }}>
            <TouchableOpacity
              style={styles.userSwitch}
              onPress={handleSwitchUser}
              activeOpacity={0.7}
            >
              <Users size={18} color={Colors.text} />
              <Text style={styles.userText}>
                {currentUser === 'user1' ? 'Personne 1' : 'Personne 2'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {noMoreRecipes ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Plus de recettes !</Text>
            <Text style={styles.emptySubtitle}>
              Passez le téléphone à votre partenaire ou recommencez
            </Text>
            <TouchableOpacity
              style={styles.resetFullButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color={Colors.text} />
              <Text style={styles.resetFullText}>Recommencer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          remainingRecipes.slice(0, 2).reverse().map((recipe, index) => (
            <SwipeCard
              key={recipe.id}
              recipe={recipe}
              isFirst={index === remainingRecipes.slice(0, 2).length - 1}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ))
        )}
      </View>

      {!noMoreRecipes && (
        <ActionButtons
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      )}

      <MatchModal
        visible={showMatchModal}
        recipe={matchedRecipe}
        onClose={() => setShowMatchModal(false)}
        onViewRecipe={handleViewRecipe}
        onAddToList={handleAddToList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logo: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  logoAccent: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetButton: {
    padding: 8,
  },
  userSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resetFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetFullText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
