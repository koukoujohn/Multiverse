/**
 * Animated heart button used in CharacterCard (variant="card") and the detail screen (variant="detail").
 * isFavorite and onToggle are controlled by the parent — this component handles only animation.
 * Resets animation state on characterId change to avoid stale values after FlashList view recycling.
 */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GestureResponderEvent, Pressable } from "react-native";
import Animated, { cancelAnimation, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

type FavoriteButtonVariant = "card" | "detail";

interface FavoriteButtonProps {
    characterId: number;
    isFavorite: boolean;
    onToggle: () => void;
    variant?: FavoriteButtonVariant;
    stopPropagation?: boolean;
    removeCharacterButton?: boolean;
}

// Style configurations for each variant
// "card" = list rows with background
// "detail" = large header button without background
const variantStyles: Record<FavoriteButtonVariant, { className?: string; size: number }> = {
    card: {
        className: "mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100",
        size: 24,
    },
    detail: {
        size: 28,
    },
};

function FavoriteButton({ characterId, isFavorite, onToggle, variant = "card", stopPropagation = false, removeCharacterButton = false }: FavoriteButtonProps) {
    const { t } = useTranslation();
    // Guards against double-tap while the removal animation is still running
    const isRemoveAnimatingRef = useRef(false);
    // Reanimated shared values driving the heart's scale and opacity
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Apply animated values to the heart icon style
    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // FlashList recycles view slots: the same component instance is reused for a different character.
    // Without this reset, the old animation state (e.g. scale=0.1 from a shrink) carries over
    // and the new character's heart visually glitches before snapping back.
    useEffect(() => {
        cancelAnimation(scale);
        cancelAnimation(opacity);
        scale.value = 1;
        opacity.value = 1;
        isRemoveAnimatingRef.current = false;
    }, [characterId]);

    // Unlocks the button after the removal animation completes
    const clearRemoveAnimationLock = useCallback(() => {
        isRemoveAnimatingRef.current = false;
    }, []);

    const onPress = useCallback(
        (event: GestureResponderEvent) => {
            // Prevent the parent Pressable (CharacterCard) from also registering the tap
            if (stopPropagation) {
                event.stopPropagation();
            }

            // Ignore taps while the removal animation is in progress
            if (isRemoveAnimatingRef.current) {
                return;
            }

            // Add: immediate state update, grow-bounce animation
            if (!isFavorite) {
                onToggle();
                scale.value = withSequence(withTiming(1.4, { duration: 300 }), withSpring(1));
                return;
            }

            // Remove: lock, shrink to near-zero, call onToggle, then spring back
            isRemoveAnimatingRef.current = true;

            scale.value = withTiming(0.1, { duration: 300 }, (finished) => {
                if (!finished) return;
                runOnJS(onToggle)();
                runOnJS(clearRemoveAnimationLock)();
                scale.value = withSpring(1);
            });

            // Fade out while shrinking, then fade back in
            opacity.value = withSequence(withTiming(0.25, { duration: 300 }), withTiming(1, { duration: 130 }));
        },
        [characterId, isFavorite, onToggle, opacity, scale, stopPropagation],
    );

    const styles = variantStyles[variant];

    return (
        <Pressable
            onPress={onPress}
            className={styles.className}
            // Accessibility: Screen readers will announce the button's purpose
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? t("a11y.removeFromFavorites") : t("a11y.addToFavorites")}
        >
            <Animated.View style={iconAnimatedStyle}>
                {removeCharacterButton ? (
                    <Ionicons name="trash-outline" size={styles.size} color="#EF4444" />
                ) : (
                    <>
                        {/* Heart icon: filled if favorited, outline if not */}
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={styles.size} color={isFavorite ? "#10B981" : "#9CA3AF"} />
                    </>
                )}
            </Animated.View>
        </Pressable>
    );
}

/**
 * EXPORT WITH MEMOIZATION
 *
 * memo() skips re-rendering if props didn't change.
 * All props are primitives (number, boolean, string) except onToggle, which is
 * stabilized via useCallback in the parent — so the default shallow comparison works correctly.
 */
export default memo(FavoriteButton);
