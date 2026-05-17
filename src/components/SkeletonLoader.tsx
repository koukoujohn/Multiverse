/**
 * Skeleton loading placeholders that mimic the card and detail screen layouts.
 * Shown while data fetches to avoid a blank screen — replaced by real content when ready.
 */

import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

/** Single pulsing gray block — composable into larger skeleton layouts. */
function SkeletonBox({ className }: { className: string }) {
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Pulse: fade to 0.3 and back forever
        opacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle} className={`bg-gray-200 rounded-lg ${className}`} />;
}

/** Fake character card matching the CharacterCard layout — shown during list load. */
function SkeletonCard() {
    return (
        <View className="flex-row items-center bg-white rounded-xl mb-3 overflow-hidden p-3">
            {/* Fake image placeholder (w-24 = 96px, h-24 = 96px) */}
            <SkeletonBox className="w-24 h-24 rounded-xl" />
            {/* Fake text content on the right */}
            <View className="flex-1 px-3 gap-2">
                {/* Fake title (name) - wide line */}
                <SkeletonBox className="h-4 w-3/4" />
                {/* Fake subtitle (status) - medium line */}
                <SkeletonBox className="h-3 w-1/2" />
                {/* Fake location - another medium line */}
                <SkeletonBox className="h-3 w-2/3" />
            </View>
        </View>
    );
}

/** Fake detail page skeleton matching the CharacterDetail layout. */
export function SkeletonDetailCard() {
    return (
        <View className="flex-1 bg-white">
            {/* Hero image */}
            <SkeletonBox className="w-full h-72" />

            <View className="flex-1 px-4 pb-6">
                {/* Name and species lines */}
                <View className="mt-4 gap-2">
                    <SkeletonBox className="h-8 w-3/4" />
                    <SkeletonBox className="h-4 w-1/2" />
                </View>

                {/* Info card rows */}
                <View className="mt-6 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} className="rounded-2xl border border-gray-200 p-4">
                            <SkeletonBox className="h-3 w-1/3 mb-2" />
                            <SkeletonBox className="h-4 w-1/2" />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

export default SkeletonCard;
