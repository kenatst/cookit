import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { X, Heart, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface ActionButtonsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export default function ActionButtons({
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  canUndo = false,
}: ActionButtonsProps) {
  const scaleLeft = useRef(new Animated.Value(1)).current;
  const scaleRight = useRef(new Animated.Value(1)).current;
  const scaleUndo = useRef(new Animated.Value(1)).current;

  const animatePress = (scale: Animated.Value, callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <View style={styles.container}>
      {canUndo && onUndo && (
        <Animated.View style={{ transform: [{ scale: scaleUndo }] }}>
          <TouchableOpacity
            style={[styles.button, styles.undoButton]}
            onPress={() => animatePress(scaleUndo, onUndo)}
            activeOpacity={0.8}
          >
            <RotateCcw size={24} color={Colors.warning} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleLeft }] }}>
        <TouchableOpacity
          style={[styles.button, styles.noButton]}
          onPress={() => animatePress(scaleLeft, onSwipeLeft)}
          activeOpacity={0.8}
        >
          <X size={32} color={Colors.error} strokeWidth={3} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleRight }] }}>
        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => animatePress(scaleRight, onSwipeRight)}
          activeOpacity={0.8}
        >
          <Heart size={32} color={Colors.success} fill={Colors.success} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  noButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  likeButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  undoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
});
