import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from './index';
import { theme as defaultTheme } from './index';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme: initialTheme = defaultTheme 
}) => {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = (newTheme: Partial<Theme>) => {
    setThemeState(prev => ({
      ...prev,
      ...newTheme,
      colors: {
        ...prev.colors,
        ...(newTheme.colors || {}),
      },
      spacing: {
        ...prev.spacing,
        ...(newTheme.spacing || {}),
      },
      borderRadius: {
        ...prev.borderRadius,
        ...(newTheme.borderRadius || {}),
      },
      fontSize: {
        ...prev.fontSize,
        ...(newTheme.fontSize || {}),
      },
      fontWeight: {
        ...prev.fontWeight,
        ...(newTheme.fontWeight || {}),
      },
      lineHeight: {
        ...prev.lineHeight,
        ...(newTheme.lineHeight || {}),
      },
      boxShadow: {
        ...prev.boxShadow,
        ...(newTheme.boxShadow || {}),
      },
      animation: {
        ...prev.animation,
        ...(newTheme.animation || {}),
      },
      transition: {
        duration: {
          ...prev.transition.duration,
          ...(newTheme.transition?.duration || {}),
        },
        ease: {
          ...prev.transition.ease,
          ...(newTheme.transition?.ease || {}),
        },
      },
    }));
  };

  const resetTheme = () => {
    setThemeState(initialTheme);
  };

  // Apply theme variables to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--color-${key}-${subKey}`, subValue);
        });
      }
    });

    // Apply spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius variables
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Apply font size variables
    Object.entries(theme.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value[0]);
      root.style.setProperty(`--line-height-${key}`, value[1]);
    });

    // Apply font weight variables
    Object.entries(theme.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });

    // Apply line height variables
    Object.entries(theme.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--leading-${key}`, value);
    });

    // Apply box shadow variables
    Object.entries(theme.boxShadow).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animation variables
    Object.entries(theme.animation).forEach(([key, value]) => {
      root.style.setProperty(`--animate-${key}`, value);
    });

    // Apply transition variables
    Object.entries(theme.transition.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });
    Object.entries(theme.transition.ease).forEach(([key, value]) => {
      root.style.setProperty(`--ease-${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook to get theme values
export const useThemeValue = <K extends keyof Theme>(key: K): Theme[K] => {
  const { theme } = useTheme();
  return theme[key];
};
