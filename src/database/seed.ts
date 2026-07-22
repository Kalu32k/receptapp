import { addRecipe } from './recipes.db';
import { Recipe } from '../types/recipe';

const mockRecipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>[] = [
  {
    title: 'Spaghetti Carbonara',
    description: 'En klassisk italiensk pasta med ägg, bacon och parmesan. Enkel men elegant.',
    instructions: [
      'Koka spaghetti enligt paketets instruktioner',
      'Steka bacon tills det är knapigt',
      'Blanda ägg, gurkemeja och parmesan',
      'Häll pastan i stekpannan med bacon',
      'Tillsätt äggblandningen medan det är varmt',
      'Röra fort så att ägget blir gräddig sås',
    ],
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: 400, unit: 'g' },
      { id: '2', name: 'Bacon', amount: 200, unit: 'g' },
      { id: '3', name: 'Ägg', amount: 3, unit: 'st' },
      { id: '4', name: 'Parmesan', amount: 100, unit: 'g' },
      { id: '5', name: 'Salt och peppar', amount: 1, unit: 'msk' },
    ],
    cookTime: 20,
    servings: 4,
    rating: 4.8,
    reviews: [
      {
        id: '1',
        author: 'Maria',
        rating: 5,
        comment: 'Superenkelt och otroligt gott!',
        createdAt: new Date(),
      },
    ],
  },
  {
    title: 'Swedish Meatballs',
    description: 'Klassiska svenska köttbullar serverade med lingonsylt och gräddsås.',
    instructions: [
      'Blanda köttfärs med lök och bindmedel',
      'Forma till bollar och frys i 30 min',
      'Steka i smör tills gyllene',
      'Häll på grädden och simra i 10 min',
      'Servera med lingonsylt och pressgurka',
    ],
    ingredients: [
      { id: '1', name: 'Köttfärs', amount: 500, unit: 'g' },
      { id: '2', name: 'Lök', amount: 1, unit: 'st' },
      { id: '3', name: 'Grädde', amount: 200, unit: 'ml' },
      { id: '4', name: 'Lingonsylt', amount: 100, unit: 'g' },
      { id: '5', name: 'Smör', amount: 50, unit: 'g' },
    ],
    cookTime: 45,
    servings: 4,
    rating: 4.6,
    reviews: [
      {
        id: '1',
        author: 'Johan',
        rating: 5,
        comment: 'Som i Hemavan!',
        createdAt: new Date(),
      },
      {
        id: '2',
        author: 'Lisa',
        rating: 4,
        comment: 'Gott men lite tidskrävande',
        createdAt: new Date(),
      },
    ],
  },
  {
    title: 'Falafel',
    description: 'Krispiga fritters gjorda av kikärter med kryddor och hummus.',
    instructions: [
      'Blötlägg torkade kikärter över natten',
      'Mixa med lök, vitlök och kryddor',
      'Forma till bollar och kyld i 1 timme',
      'Friteringssteka tills gyllene bruna',
      'Servera med hummus och salat',
    ],
    ingredients: [
      { id: '1', name: 'Kikärter', amount: 500, unit: 'g' },
      { id: '2', name: 'Lök', amount: 1, unit: 'st' },
      { id: '3', name: 'Vitlök', amount: 3, unit: 'klyftor' },
      { id: '4', name: 'Koriander', amount: 1, unit: 'msk' },
      { id: '5', name: 'Kamomun', amount: 1, unit: 'msk' },
    ],
    cookTime: 30,
    servings: 4,
    rating: 4.5,
    reviews: [],
  },
  {
    title: 'Lax med Citron och Dill',
    description: 'Saftig lax grillad med citron och färsk dill. Perfekt huvudrätt.',
    instructions: [
      'Förvärm ugnen till 200°C',
      'Placera lax på bakpapper',
      'Toppa med citronskivor och dill',
      'Ringla olivolja och salt',
      'Baka i 15-20 minuter tills laxen är genomkokt',
    ],
    ingredients: [
      { id: '1', name: 'Laxfilé', amount: 4, unit: 'st' },
      { id: '2', name: 'Citron', amount: 2, unit: 'st' },
      { id: '3', name: 'Dill', amount: 1, unit: 'bunt' },
      { id: '4', name: 'Olivolja', amount: 50, unit: 'ml' },
      { id: '5', name: 'Salt och peppar', amount: 1, unit: 'msk' },
    ],
    cookTime: 25,
    servings: 4,
    rating: 4.7,
    reviews: [
      {
        id: '1',
        author: 'Anna',
        rating: 5,
        comment: 'Enkel och elegant!',
        createdAt: new Date(),
      },
    ],
  },
  {
    title: 'Vegetarisk Buddha Bowl',
    description: 'Näringsrik skål med rostad grönsaker, quinoa och tahini-dressing.',
    instructions: [
      'Rosta grönsaker med olivolja och kryddor',
      'Koka quinoa enligt paketets instruktioner',
      'Skala och skivor avokado',
      'Montera skålen med alla ingredienser',
      'Ringla tahini-dressing på toppen',
    ],
    ingredients: [
      { id: '1', name: 'Quinoa', amount: 200, unit: 'g' },
      { id: '2', name: 'Brocoli', amount: 300, unit: 'g' },
      { id: '3', name: 'Morot', amount: 2, unit: 'st' },
      { id: '4', name: 'Avokado', amount: 1, unit: 'st' },
      { id: '5', name: 'Tahini', amount: 50, unit: 'ml' },
    ],
    cookTime: 35,
    servings: 2,
    rating: 4.4,
    reviews: [],
  },
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with mock recipes...');
    for (const recipe of mockRecipes) {
      await addRecipe(recipe);
    }
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
