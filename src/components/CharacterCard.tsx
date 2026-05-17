/**
 * Character list card: image, name, status, species, location, and favorite button.
 * Rendered inside FlashList — memoized to prevent unnecessary re-renders across 100+ items.
 * CardImage and CardDetails are split into sub-components so their renders are independent.
 */

import { useFavoritesStore } from "@/store";
import { Character } from "@/types/character";
import { Image } from "expo-image";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import FavoriteButton from "./FavoriteButton";

interface Props {
    character: Character;
    index?: number;
    removeCharacterButton?: boolean;
}

// Color mapping: alive = green dot, dead = red dot, unknown = gray dot
// This is shown next to the character's status text
const statusColor = {
    Alive: "bg-green-500",
    Dead: "bg-red-500",
    unknown: "bg-gray-400",
};

/** Memoized so an image-only change doesn't re-render the text section, and vice versa. */
const CardImage = memo(function CardImage({ image }: { image: string }) {
    return <Image source={image} style={{ width: 96, height: 96 }} contentFit="cover" cachePolicy="memory-disk" />;
});

/** Memoized so a text-only change doesn't re-render the image, and vice versa. */
const CardDetails = memo(function CardDetails({ name, status, species, location }: { name: string; status: Character["status"]; species: string; location: string }) {
    return (
        <View className="flex-1 px-3">
            <Text className="text-base font-bold text-gray-900">{name}</Text>
            <View className="flex-row items-center gap-1 mt-1">
                {/* Colored dot indicates alive/dead/unknown */}
                <View className={`w-2 h-2 rounded-full ${statusColor[status]}`} />
                <Text className="text-sm text-gray-500">
                    {status} · {species}
                </Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">{location}</Text>
        </View>
    );
});

function CharacterCard({ character, index, removeCharacterButton }: Props) {
    const onPress = useCallback(() => router.push(`/character/${character.id}`), [character.id]);

    // Subscribe only to this character's favorite status (boolean comparison — no unnecessary re-renders)
    const isFavorite = useFavoritesStore((state) => state.isFavorite(character.id));

    // Read actions from getState() so this callback has no extra store subscriptions
    const onToggleFavorite = useCallback(() => {
        const { addFavorite, removeFavorite, isFavorite: check } = useFavoritesStore.getState();

        if (check(character.id)) removeFavorite(character.id);
        else addFavorite(character.id);
    }, [character.id]);

    return (
        <Animated.View
            entering={
                // Stagger only the first 10 cards — animating all items on scroll is too expensive
                typeof index === "number" && index < 10
                    ? FadeInDown.delay(index * 60)
                          .duration(500)
                          .springify()
                    : undefined
            }
        >
            <Pressable className="flex-row items-center bg-white rounded-xl mb-3 overflow-hidden shadow-sm" onPress={onPress}>
                <CardImage image={character.image} />
                <CardDetails name={character.name} status={character.status} species={character.species} location={character.location.name} />
                <FavoriteButton
                    characterId={character.id}
                    isFavorite={isFavorite}
                    onToggle={onToggleFavorite}
                    variant="card"
                    stopPropagation // Prevent card tap when favorite button is tapped
                    removeCharacterButton={removeCharacterButton}
                />
            </Pressable>
        </Animated.View>
    );
}

/**
 * Reference equality on `character` works here because TanStack Query returns
 * the same cached object reference when the data hasn't changed.
 */
export default memo(CharacterCard, (prevProps, nextProps) => {
    return prevProps.character === nextProps.character && prevProps.index === nextProps.index && prevProps.removeCharacterButton === nextProps.removeCharacterButton;
});
