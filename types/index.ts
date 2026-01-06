export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface Swipe {
  odId: string;
  odswipe: 'like' | 'dislike';
  timestamp: number;
}

export interface Match {
  id: string;
  recipe: Recipe;
  matchedAt: number;
}

export interface HouseholdMember {
  id: string;
  name: string;
  avatar: string;
  swipes: Swipe[];
}

export interface Household {
  id: string;
  code: string;
  members: HouseholdMember[];
  matches: Match[];
}

export interface ShoppingItem extends Ingredient {
  id: string;
  recipeId: string;
  recipeName: string;
}
