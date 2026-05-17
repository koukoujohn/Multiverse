import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FavoriteButton from "@/components/FavoriteButton";
import { SkeletonDetailCard } from "@/components/SkeletonLoader";
import { getCharacter } from "@/services/api";
import { useFavoritesStore } from "@/store";
import { getErrorMessage } from "@/utils/errorMessage";

export default function CharacterDetail() {
    // Character detail page showing full profile of selected character
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    // Subscribe to this character's favorite status
    const isFavorite = useFavoritesStore((state) => state.isFavorite(Number(id)));
    const onToggleFavorite = useCallback(() => {
        const { addFavorite, removeFavorite, isFavorite: check } = useFavoritesStore.getState();
        if (check(Number(id))) removeFavorite(Number(id));
        else addFavorite(Number(id));
    }, [id]);

    // Fetch single character data by ID
    const {
        data: character,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["character", id],
        queryFn: () => getCharacter(Number(id)),
        enabled: !!id,
    });

    // Show skeleton while loading
    if (isLoading) {
        return (
            <SafeAreaView edges={["top"]} className="flex-1 bg-white">
                <SkeletonDetailCard />
            </SafeAreaView>
        );
    }

    // Show error state if query failed
    if (isError) {
        const message = getErrorMessage(error, t("common.failedToLoadCharacter"));
        return (
            <View className="flex-1 items-center justify-center px-6 bg-white">
                <Text className="text-lg font-semibold text-red-500">{t("common.somethingWentWrong")}</Text>
                <Text className="mt-2 text-center text-gray-500">{message}</Text>
            </View>
        );
    }

    // Show not found state if no character data
    if (!character) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-base text-gray-500">{t("character.notFound")}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white">
                {/* Hero section with character image and back button */}
                <View>
                    <Image source={character.image} style={{ height: 288, width: "100%" }} contentFit="cover" cachePolicy="memory-disk" />
                    <Pressable onPress={() => router.back()} className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/20">
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </Pressable>
                </View>

                {/* Character details and info cards */}
                <View className="flex-1 px-4 pb-6">
                    <View className="mt-4 flex-row items-center justify-between">
                        <Text className="text-3xl font-bold text-gray-900">{character.name}</Text>
                        <FavoriteButton characterId={character.id} isFavorite={isFavorite} onToggle={onToggleFavorite} variant="detail" />
                    </View>

                    <View className="mt-1">
                        <Text className="text-base text-gray-500">
                            {character.status} · {character.species}
                        </Text>
                    </View>

                    {/* Info cards grid */}
                    <View className="mt-6 gap-4">
                        <View className="rounded-2xl border-b border-gray-200 p-4">
                            <Text className="text-sm text-gray-400">{t("character.gender")}</Text>
                            <Text className="mt-1 text-base font-medium text-gray-900">{character.gender}</Text>
                        </View>

                        <View className="rounded-2xl border-b border-gray-200 p-4">
                            <Text className="text-sm text-gray-400">{t("character.origin")}</Text>
                            <Text className="mt-1 text-base font-medium text-gray-900">{character.origin.name}</Text>
                        </View>

                        <View className="rounded-2xl border-b border-gray-200 p-4">
                            <Text className="text-sm text-gray-400">{t("character.location")}</Text>
                            <Text className="mt-1 text-base font-medium text-gray-900">{character.location.name}</Text>
                        </View>

                        <View className="rounded-2xl border-b border-gray-200 p-4">
                            <Text className="text-sm text-gray-400">{t("character.episodes")}</Text>
                            <Text className="mt-1 text-base font-medium text-gray-900">{character.episode.length}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
