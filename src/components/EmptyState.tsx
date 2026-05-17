/** Shown when a list has no items to display — empty search results, empty favorites, etc. */

import { Text, View } from "react-native";

interface Props {
    message?: string;
}

export default function EmptyState({ message = "No results found" }: Props) {
    return (
        <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-3">🛸</Text>
            <Text className="text-gray-500 text-base">{message}</Text>
        </View>
    );
}
