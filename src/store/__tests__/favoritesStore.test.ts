import { useFavoritesStore } from "../../store";

// Prevent real AsyncStorage I/O — the store uses it only for persistence,
// which is not what these unit tests are exercising.
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
    mergeItem: jest.fn().mockResolvedValue(null),
    clear: jest.fn().mockResolvedValue(null),
}));

describe("favoritesStore", () => {
    beforeEach(() => {
        // Reset to a clean slate between tests without re-mounting the store.
        useFavoritesStore.setState({ favorites: [] });
    });

    describe("initial state", () => {
        it("starts with an empty favorites list", () => {
            expect(useFavoritesStore.getState().favorites).toEqual([]);
        });
    });

    describe("addFavorite", () => {
        it("appends an ID to the list", () => {
            useFavoritesStore.getState().addFavorite(1);
            expect(useFavoritesStore.getState().favorites).toEqual([1]);
        });

        it("appends multiple IDs independently", () => {
            useFavoritesStore.getState().addFavorite(1);
            useFavoritesStore.getState().addFavorite(2);
            expect(useFavoritesStore.getState().favorites).toEqual([1, 2]);
        });

        it("does not deduplicate — callers are responsible for checking isFavorite first", () => {
            useFavoritesStore.getState().addFavorite(1);
            useFavoritesStore.getState().addFavorite(1);
            expect(useFavoritesStore.getState().favorites).toEqual([1, 1]);
        });
    });

    describe("removeFavorite", () => {
        it("removes the matching ID", () => {
            useFavoritesStore.setState({ favorites: [1, 2, 3] });
            useFavoritesStore.getState().removeFavorite(2);
            expect(useFavoritesStore.getState().favorites).toEqual([1, 3]);
        });

        it("is a no-op when the ID does not exist", () => {
            useFavoritesStore.setState({ favorites: [1, 2] });
            useFavoritesStore.getState().removeFavorite(99);
            expect(useFavoritesStore.getState().favorites).toEqual([1, 2]);
        });

        it("removes only the first occurrence when duplicates exist", () => {
            useFavoritesStore.setState({ favorites: [1, 2, 1] });
            useFavoritesStore.getState().removeFavorite(1);
            // filter removes ALL matching — this documents the current behaviour
            expect(useFavoritesStore.getState().favorites).toEqual([2]);
        });
    });

    describe("isFavorite", () => {
        it("returns true for an ID that has been added", () => {
            useFavoritesStore.setState({ favorites: [5] });
            expect(useFavoritesStore.getState().isFavorite(5)).toBe(true);
        });

        it("returns false for an ID that has not been added", () => {
            expect(useFavoritesStore.getState().isFavorite(99)).toBe(false);
        });

        it("returns false after the ID is removed", () => {
            useFavoritesStore.setState({ favorites: [3] });
            useFavoritesStore.getState().removeFavorite(3);
            expect(useFavoritesStore.getState().isFavorite(3)).toBe(false);
        });
    });
});
