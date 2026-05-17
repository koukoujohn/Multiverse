/**
 * Amber banner shown app-wide when the device goes offline.
 * paddingTop uses safe area insets so it renders below the notch, not behind it.
 */

import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OfflineBannerProps {
    visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    return (
        <View style={{ paddingTop: insets.top }} className="flex-row items-center justify-center bg-amber-100 px-4 py-2">
            <Text className="text-xs font-medium text-amber-900">{t("offline.message")}</Text>
        </View>
    );
}
