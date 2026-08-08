import React, { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentArtist, setCurrentArtist] = useState(null);

  const setTheme = useCallback((artistData) => {
    setCurrentArtist(artistData);
    if (!artistData || !artistData.themeColors) return;

    const root = document.documentElement;
    const colors = artistData.themeColors;
    const fonts = artistData.themeFonts;

    if (colors) {
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-card', colors.card);
      root.style.setProperty('--color-text', colors.text);
      root.style.setProperty('--color-accent', colors.accent);
    }

    if (fonts) {
      root.style.setProperty('--font-heading', fonts.heading);
      root.style.setProperty('--font-body', fonts.body);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentArtist, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
