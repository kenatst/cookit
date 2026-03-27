import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oups !' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🍳</Text>
        <Text style={styles.title}>Page introuvable</Text>
        <Text style={styles.subtitle}>
          Cette page n&apos;existe pas dans notre livre de recettes.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Retour à l&apos;accueil</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
