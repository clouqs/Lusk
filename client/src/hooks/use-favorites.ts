import { createContext, useContext, useState, useEffect, useCallback } from "react";

const KEY = "lusk-favorites";

interface FavoritesContextValue {
  favorites: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  toggle: () => {},
  isFavorite: () => false,
});

/** Mount once at the top of the tree (inside AppLayout) */
export function useFavoritesProvider(): FavoritesContextValue {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Sync across browser tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        try { setFavorites(JSON.parse(e.newValue || "[]")); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}

/** Use anywhere inside AppLayout */
export function useFavorites() {
  return useContext(FavoritesContext);
}
