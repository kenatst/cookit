import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Recipe, Match, ShoppingItem } from '@/types';
import { mockRecipes } from '@/mocks/recipes';

const STORAGE_KEYS = {
  USER_SWIPES: 'user_swipes',
  PARTNER_SWIPES: 'partner_swipes',
  MATCHES: 'matches',
  SHOPPING_LIST: 'shopping_list',
  CURRENT_USER: 'current_user',
};

type SwipeRecord = Record<string, 'like' | 'dislike'>;

export const [HouseholdProvider, useHousehold] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<'user1' | 'user2'>('user1');
  const [userSwipes, setUserSwipes] = useState<SwipeRecord>({});
  const [partnerSwipes, setPartnerSwipes] = useState<SwipeRecord>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userSwipesData, partnerSwipesData, matchesData, shoppingData, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_SWIPES),
        AsyncStorage.getItem(STORAGE_KEYS.PARTNER_SWIPES),
        AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
        AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      ]);

      if (userSwipesData) setUserSwipes(JSON.parse(userSwipesData));
      if (partnerSwipesData) setPartnerSwipes(JSON.parse(partnerSwipesData));
      if (matchesData) setMatches(JSON.parse(matchesData));
      if (shoppingData) setShoppingList(JSON.parse(shoppingData));
      if (userData) setCurrentUser(userData as 'user1' | 'user2');
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSwipes = useCallback(async (user: SwipeRecord, partner: SwipeRecord) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER_SWIPES, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.PARTNER_SWIPES, JSON.stringify(partner)),
    ]);
  }, []);

  const saveMatches = useCallback(async (newMatches: Match[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(newMatches));
  }, []);

  const saveShoppingList = useCallback(async (list: ShoppingItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(list));
  }, []);

  const switchUser = useCallback(async () => {
    const newUser = currentUser === 'user1' ? 'user2' : 'user1';
    setCurrentUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser);
  }, [currentUser]);

  const swipe = useCallback((recipeId: string, direction: 'like' | 'dislike'): Recipe | null => {
    const mySwipes = currentUser === 'user1' ? userSwipes : partnerSwipes;
    const theirSwipes = currentUser === 'user1' ? partnerSwipes : userSwipes;
    
    const newMySwipes = { ...mySwipes, [recipeId]: direction };
    
    if (currentUser === 'user1') {
      setUserSwipes(newMySwipes);
      saveSwipes(newMySwipes, partnerSwipes);
    } else {
      setPartnerSwipes(newMySwipes);
      saveSwipes(userSwipes, newMySwipes);
    }

    if (direction === 'like' && theirSwipes[recipeId] === 'like') {
      const recipe = mockRecipes.find(r => r.id === recipeId);
      if (recipe && !matches.some(m => m.recipe.id === recipeId)) {
        const newMatch: Match = {
          id: `match_${Date.now()}`,
          recipe,
          matchedAt: Date.now(),
        };
        const newMatches = [...matches, newMatch];
        setMatches(newMatches);
        saveMatches(newMatches);
        return recipe;
      }
    }
    return null;
  }, [currentUser, userSwipes, partnerSwipes, matches, saveSwipes, saveMatches]);

  const getUnswipedRecipes = useMemo(() => {
    const mySwipes = currentUser === 'user1' ? userSwipes : partnerSwipes;
    return mockRecipes.filter(recipe => !mySwipes[recipe.id]);
  }, [currentUser, userSwipes, partnerSwipes]);

  const addToShoppingList = useCallback((recipe: Recipe) => {
    const newItems: ShoppingItem[] = recipe.ingredients.map((ing, idx) => ({
      ...ing,
      id: `${recipe.id}_${idx}_${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      checked: false,
    }));
    
    const updatedList = [...shoppingList, ...newItems];
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
  }, [shoppingList, saveShoppingList]);

  const toggleShoppingItem = useCallback((itemId: string) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
  }, [shoppingList, saveShoppingList]);

  const clearShoppingList = useCallback(() => {
    setShoppingList([]);
    saveShoppingList([]);
  }, [saveShoppingList]);

  const clearCheckedItems = useCallback(() => {
    const updatedList = shoppingList.filter(item => !item.checked);
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
  }, [shoppingList, saveShoppingList]);

  const resetAll = useCallback(async () => {
    setUserSwipes({});
    setPartnerSwipes({});
    setMatches([]);
    setShoppingList([]);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_SWIPES),
      AsyncStorage.removeItem(STORAGE_KEYS.PARTNER_SWIPES),
      AsyncStorage.removeItem(STORAGE_KEYS.MATCHES),
      AsyncStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST),
    ]);
  }, []);

  return {
    currentUser,
    switchUser,
    swipe,
    matches,
    shoppingList,
    unswipedRecipes: getUnswipedRecipes,
    addToShoppingList,
    toggleShoppingItem,
    clearShoppingList,
    clearCheckedItems,
    resetAll,
    isLoading,
  };
});
