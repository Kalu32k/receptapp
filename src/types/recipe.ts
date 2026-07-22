export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookTime: number; // minuter
  servings: number;
  rating: number; // 0-5
  reviews: Review[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Ingredient = {
  id: string;
  name: string;
  amount: number;
  unit: string; // gram, ml, msk, tsk, etc
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: Date;
};
