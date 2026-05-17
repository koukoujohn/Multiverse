/**
 * Zustand store for favorites, persisted to AsyncStorage via the persist middleware.
 * Stores character IDs only — lookup is O(n) but the list is small.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FavoritesStore {
    favorites: number[];
    addFavorite: (id: number) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favorites: [],
            // Append id — Zustand triggers re-renders in subscribed components
            addFavorite: (id) =>
                set((state) => ({
                    favorites: [...state.favorites, id],
                })),
            // Filter out id
            removeFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.filter((f) => f !== id),
                })),
            // Returns a primitive boolean — Zustand uses Object.is for comparison, so only this card re-renders on change
            isFavorite: (id) => get().favorites.includes(id),
        }),
        {
            name: "favorites-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);

export default useFavoritesStore;
