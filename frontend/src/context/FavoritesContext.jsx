import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const item = window.localStorage.getItem('musicverse_favorites');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('musicverse_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error(error);
    }
  }, [favorites]);

  const addFavorite = useCallback((track) => {
    setFavorites(prev => {
      if (prev.find(t => t.title === track.title)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFavorite = useCallback((trackTitle) => {
    setFavorites(prev => prev.filter(t => t.title !== trackTitle));
  }, []);

  const isFavorite = useCallback((trackTitle) => {
    return favorites.some(t => t.title === trackTitle);
  }, [favorites]);

  const toggleFavorite = useCallback((track) => {
    if (isFavorite(track.title)) {
      removeFavorite(track.title);
    } else {
      addFavorite(track);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
