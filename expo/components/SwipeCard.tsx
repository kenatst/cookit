import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import { Clock, Users, ChefHat } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Recipe } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeCardProps {
  recipe: Recipe;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
}

export default function SwipeCard({
  recipe,
  onSwipeLeft,
  onSwipeRight,
  isFirst,
}: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.92, 1],
    extrapolate: 'clamp',
  });

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.5 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = isFirst
    ? {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
      }
    : {
        transform: [{ scale: nextCardScale }],
      };

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
    <Animated.View
      style={[styles.card, cardStyle]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: recipe.image }} style={styles.image} />
      
      <View style={styles.gradient} />
      
      {isFirst && (
        <>
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.stampText}>MIAM !</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={[styles.stampText, styles.nopeText]}>NAH</Text>
          </Animated.View>
        </>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{recipe.category}</Text>
        </View>
        
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.prepTime} + {recipe.cookTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.servings} pers.</Text>
          </View>
          <View style={styles.metaItem}>
            <ChefHat size={16} color={getDifficultyColor(recipe.difficulty)} />
            <Text style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty) }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 24,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%',
    background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8))',
  },
  stamp: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
  },
  likeStamp: {
    left: 20,
    borderColor: Colors.success,
  },
  nopeStamp: {
    right: 20,
    borderColor: Colors.error,
    transform: [{ rotate: '15deg' }],
  },
  stampText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.success,
    letterSpacing: 2,
  },
  nopeText: {
    color: Colors.error,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
