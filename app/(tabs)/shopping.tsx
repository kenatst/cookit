import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { Check, Trash2, CheckCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useHousehold } from '@/contexts/HouseholdContext';
import { ShoppingItem } from '@/types';

interface SectionData {
  title: string;
  data: ShoppingItem[];
}

export default function ShoppingScreen() {
  const { shoppingList, toggleShoppingItem, clearShoppingList, clearCheckedItems } = useHousehold();

  const sections = useMemo(() => {
    const grouped: Record<string, ShoppingItem[]> = {};
    
    shoppingList.forEach(item => {
      if (!grouped[item.recipeName]) {
        grouped[item.recipeName] = [];
      }
      grouped[item.recipeName].push(item);
    });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    })) as SectionData[];
  }, [shoppingList]);

  const checkedCount = useMemo(() => 
    shoppingList.filter(item => item.checked).length,
    [shoppingList]
  );

  const handleToggle = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleShoppingItem(itemId);
  }, [toggleShoppingItem]);

  const handleClearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearShoppingList();
  }, [clearShoppingList]);

  const handleClearChecked = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearCheckedItems();
  }, [clearCheckedItems]);

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <TouchableOpacity
      style={[styles.itemRow, item.checked && styles.itemChecked]}
      onPress={() => handleToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Check size={14} color={Colors.text} />}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.name}
        </Text>
        <Text style={[styles.itemQuantity, item.checked && styles.itemQuantityChecked]}>
          {item.quantity} {item.unit}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (shoppingList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Liste vide</Text>
        <Text style={styles.emptySubtitle}>
          Ajoutez des ingrédients depuis vos matchs pour commencer
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {checkedCount}/{shoppingList.length} articles cochés
        </Text>
        <View style={styles.headerActions}>
          {checkedCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearChecked}
              activeOpacity={0.7}
            >
              <CheckCheck size={18} color={Colors.accent} />
              <Text style={styles.headerButtonText}>Retirer cochés</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.headerButton, styles.clearButton]}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  headerButtonText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 10,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemChecked: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  itemQuantityChecked: {
    color: Colors.textMuted,
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
});
