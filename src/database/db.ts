import * as SQLite from 'expo-sqlite';
import { Recipe, Ingredient, Review } from '../types/recipe';

const DATABASE_NAME = 'receptapp.db';

// Initialisera databas
const db = SQLite.openDatabase(DATABASE_NAME);

// Säkerställ databas-schema
export const initializeDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      // Recipes table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS recipes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          cook_time INTEGER,
          servings INTEGER,
          difficulty TEXT,
          cuisine TEXT,
          dietary_tags TEXT,
          rating REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          is_synced BOOLEAN DEFAULT 0
        );`,
        [],
        () => console.log('✓ Recipes table created'),
        (_, error) => {
          console.error('✗ Error creating recipes table:', error);
          return false;
        }
      );

      // Ingredients table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ingredients (
          id TEXT PRIMARY KEY,
          recipe_id TEXT NOT NULL,
          name TEXT NOT NULL,
          amount REAL,
          unit TEXT,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        );`,
        [],
        () => console.log('✓ Ingredients table created'),
        (_, error) => console.error('✗ Error creating ingredients table:', error)
      );

      // Instructions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS instructions (
          id TEXT PRIMARY KEY,
          recipe_id TEXT NOT NULL,
          step_number INTEGER,
          instruction TEXT NOT NULL,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        );`,
        [],
        () => console.log('✓ Instructions table created'),
        (_, error) => console.error('✗ Error creating instructions table:', error)
      );

      // Reviews table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          recipe_id TEXT NOT NULL,
          author TEXT,
          rating INTEGER,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        );`,
        [],
        () => console.log('✓ Reviews table created'),
        (_, error) => console.error('✗ Error creating reviews table:', error)
      );

      // Favorites table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          recipe_id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        );`,
        [],
        () => console.log('✓ Favorites table created'),
        (_, error) => console.error('✗ Error creating favorites table:', error)
      );

      // Indexes
      tx.executeSql(
        `CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);`,
        [],
        () => console.log('✓ Indexes created'),
        (_, error) => console.error('✗ Error creating indexes:', error)
      );
    });
  });
};

// Query helpers
export const queryAsync = (sql: string, args: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        args,
        (_, result) => resolve(result.rows._array),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const executeAsync = (sql: string, args: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        args,
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export default db;
