import CharacterCard from "@/components/CharacterCard";
import CharacterFilterPanel from "@/components/CharacterFilterPanel";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import SkeletonCard from "@/components/SkeletonLoader";
import { useCharacters } from "@/hooks/useCharacters";
import { useLanguage } from "@/hooks/useLanguage";
import { Character } from "@/types/character";
import { getErrorMessage } from "@/utils/errorMessage";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CharactersScreen() {
    // Main characters listing screen with search and filter capabilities
    const { t } = useTranslation();
    const { currentLanguage, toggleLanguage } = useLanguage();
    const filterSheetRef = useRef<BottomSheetModal>(null);

    // Search and filter state
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [gender, setGender] = useState("");
    const [species, setSpecies] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Check if any filters are active to show visual indicator
    const hasActiveFilters = useMemo(() => Boolean(status || gender || species || search.trim()), [gender, search, species, status]);

    // Clear all filters back to defaults
    const resetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setStatus("");
        setGender("");
        setSpecies("");
    };

    // Fetch paginated characters with current filters
    const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useCharacters({
        name: debouncedSearch,
        status,
        species,
        type: "",
        gender,
    });

    // Flatten paginated results into single array
    const characters = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);

    const openFilterSheet = () => filterSheetRef.current?.present();

    const renderItem = useCallback(({ item, index }: { item: Character; index: number }) => <CharacterCard character={item} index={index} />, []);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return <ActivityIndicator className="py-4" />;
    }, [isFetchingNextPage]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage]);

    if (isError) {
        const message = getErrorMessage(error);
        return <ErrorState message={message} onRetry={refetch} />;
    }

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-gray-100">
            {/* Header with language toggle, search, and filter button */}
            <View className="px-4 pt-4 pb-4 flex-row gap-2 items-center">
                <Pressable onPress={toggleLanguage} className="flex-row items-center gap-1 rounded-full px-3 py-2 bg-white border border-gray-200">
                    <Ionicons name="globe-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 font-medium">{currentLanguage.toUpperCase()}</Text>
                </Pressable>
                <TextInput
                    className="bg-white rounded-xl px-4 py-3 text-base shadow-sm flex-1"
                    placeholder={t("search.placeholder")}
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                />
                <Pressable
                    onPress={openFilterSheet}
                    className={`flex-row items-center gap-1 rounded-full px-2 py-2 ${hasActiveFilters ? "bg-green-500" : "bg-white border border-gray-200"}`}
                >
                    <Ionicons name="options-outline" size={16} color={hasActiveFilters ? "#FFFFFF" : "#6B7280"} />
                </Pressable>
            </View>

            {/* Character list with loading skeleton fallback */}
            {isLoading ? (
                <View className="flex-1 bg-gray-100 px-4 pt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </View>
            ) : (
                <FlashList
                    data={characters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                    ListEmptyComponent={<EmptyState message={t("common.noCharacters")} />}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.1}
                />
            )}

            {/* Filter panel in bottom sheet modal */}
            <CharacterFilterPanel
                filterSheetRef={filterSheetRef}
                status={status}
                setStatus={setStatus}
                gender={gender}
                setGender={setGender}
                species={species}
                setSpecies={setSpecies}
                onResetFilters={resetFilters}
            />
        </SafeAreaView>
    );
}
