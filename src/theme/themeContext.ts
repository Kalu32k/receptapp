import React from 'react';

export type ThemeType = 'light' | 'dark';

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}

export interface Theme {
  type: ThemeType;
  colors: Colors;
}

export const lightTheme: Theme = {
  type: 'light',
  colors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#004E89',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
  },
};

export const darkTheme: Theme = {
  type: 'dark',
  colors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#4FBAFF',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#E8E8E8',
    textSecondary: '#AAAAAA',
    border: '#333333',
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFB74D',
  },
};

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: ThemeType) => Promise<void>;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
