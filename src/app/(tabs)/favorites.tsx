import CharacterCard from "@/components/CharacterCard";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import SkeletonCard from "@/components/SkeletonLoader";
import { getCharactersByIds } from "@/services/api";
import { useFavoritesStore } from "@/store";
import { Character } from "@/types/character";
import { getErrorMessage } from "@/utils/errorMessage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";

function FavoritesScreen() {
    // Favorites screen displaying user's bookmarked characters
    const { t } = useTranslation();
    // Select favorites with explicit comparison to avoid unnecessary recalculations
    const favorites = useFavoritesStore((state) => state.favorites);
    // Sort favorite IDs numerically for consistent ordering across renders
    // Use favorites.length as dependency (primitive) since array can only be added to or removed from, not replaced
    const sortedFavorites = useMemo(() => [...favorites].sort((a, b) => a - b), [favorites.length]);

    // Fetch character data for all favorite IDs
    const {
        data: favoriteCharacters,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["favoriteCharacters", sortedFavorites],
        queryFn: () => getCharactersByIds(sortedFavorites),
        enabled: sortedFavorites.length > 0,
        placeholderData: (previousData) => previousData,
    });

    // Maintain user's preferred order by mapping sorted IDs to fetched character data
    // Same .length rationale as sortedFavorites: favorites can only be added or removed,
    // never swapped in place, so a length change is the only meaningful signal.
    const orderedCharacters = useMemo(() => {
        if (!favoriteCharacters?.length) return [];

        const byId = new Map(favoriteCharacters.map((character) => [character.id, character]));
        return sortedFavorites.map((id) => byId.get(id)).filter((character): character is Character => !!character);
    }, [favoriteCharacters?.length, sortedFavorites.length]);

    const renderItem = useCallback(({ item }: { item: Character }) => <CharacterCard character={item} removeCharacterButton />, []);

    // Show error state if query failed
    if (isError) {
        const message = getErrorMessage(error);
        return <ErrorState message={message} onRetry={refetch} />;
    }

    return (
        <View className="flex-1 bg-gray-100 pt-4">
            {/* Show loading skeletons while fetching data */}
            {isLoading && !favoriteCharacters ? (
                <View className="flex-1 bg-gray-100 px-4 pt-4">
                    {Array.from({ length: Math.max(sortedFavorites.length, 3) }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </View>
            ) : (
                // We use FlatList instead of FlashList here because the list is expected to be small (user's favorites) and FlatList has better performance with very short lists due to lower overhead.
                // FlashList shines with larger datasets, but for a favorites screen where users typically have a limited number of items, FlatList provides a more efficient rendering experience.
                <FlatList
                    data={orderedCharacters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerClassName="px-4 pb-4"
                    ListEmptyComponent={<EmptyState message={t("common.noFavorites")} />}
                    removeClippedSubviews
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    windowSize={10}
                />
            )}
        </View>
    );
}

export default FavoritesScreen;
