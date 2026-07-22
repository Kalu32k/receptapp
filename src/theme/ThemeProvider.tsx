import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeContext,
  ThemeContextType,
  ThemeType,
  lightTheme,
  darkTheme,
} from './themeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState(
    systemColorScheme === 'dark' ? darkTheme : lightTheme
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        const selectedTheme = savedTheme === 'dark' ? darkTheme : lightTheme;
        setThemeState(selectedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (themeType: ThemeType) => {
    try {
      const newTheme = themeType === 'dark' ? darkTheme : lightTheme;
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', themeType);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newThemeType = theme.type === 'dark' ? 'light' : 'dark';
    await setTheme(newThemeType);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
