/**
 * Error fallback with optional retry callback.
 * Falls back to a translated "Something went wrong" message if none is provided.
 */

import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
    const { t } = useTranslation();
    const displayMessage = message ?? t("common.somethingWentWrong");

    return (
        <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-3">⚠️</Text>
            <Text className="text-gray-500 text-base mb-4">{displayMessage}</Text>
            {onRetry && (
                <TouchableOpacity className="bg-green-500 px-6 py-2 rounded-full" onPress={onRetry}>
                    <Text className="text-white font-semibold">{t("common.retry")}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
