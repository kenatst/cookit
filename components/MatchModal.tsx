import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Heart, ChefHat, ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Recipe } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onViewRecipe: () => void;
  onAddToList: () => void;
}

export default function MatchModal({
  visible,
  recipe,
  onClose,
  onViewRecipe,
  onAddToList,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      heartScale.setValue(0);
    }
  }, [visible, scaleAnim, rotateAnim, heartScale]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!recipe) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.heartContainer,
              {
                transform: [{ scale: heartScale }, { rotate }],
              },
            ]}
          >
            <Heart size={80} color={Colors.primary} fill={Colors.primary} />
          </Animated.View>

          <Text style={styles.matchText}>C&apos;EST UN MATCH !</Text>
          <Text style={styles.subtitle}>
            Vous êtes d&apos;accord sur ce plat 🎉
          </Text>

          <View style={styles.recipeCard}>
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.recipeCategory}>{recipe.category}</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.recipeButton]}
              onPress={onViewRecipe}
              activeOpacity={0.8}
            >
              <ChefHat size={20} color={Colors.text} />
              <Text style={styles.buttonText}>Voir la recette</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.listButton]}
              onPress={onAddToList}
              activeOpacity={0.8}
            >
              <ShoppingCart size={20} color={Colors.text} />
              <Text style={styles.buttonText}>Liste de courses</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.continueText}>Continuer à swiper</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  heartContainer: {
    marginBottom: 16,
  },
  matchText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    width: '100%',
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  recipeButton: {
    backgroundColor: Colors.primary,
  },
  listButton: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  continueButton: {
    paddingVertical: 12,
  },
  continueText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
