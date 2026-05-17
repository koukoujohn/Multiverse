import OfflineBanner from "@/components/OfflineBanner";
import { ENUMS } from "@/enums";
import { useNetworkState } from "@/hooks/useNetworkState";
import { i18n } from "@/lib";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import * as SplashScreen from "expo-splash-screen";
import { ReactNode, useEffect, useState } from "react";
import { View } from "react-native";

const LANG_KEY = ENUMS.LANG_KEY;

/**
 * Initialize app language on first load
 * Tries to use saved language preference, falls back to device locale
 * Default to English if no locale is available
 */
async function initializeLanguage(): Promise<void> {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
    const lang = saved ?? (deviceLang === "el" ? "el" : "en");
    await i18n.changeLanguage(lang);
}

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * AppInitializer - Handles app startup sequence
 * - Initializes language from saved preference or device locale
 * - Hides splash screen when ready
 * - Shows offline banner when no network connection
 * - Renders children only after initialization is complete
 * - More initialization logic can be added here in the future (e.g. theme, analytics, authentication flow)
 * - SplashScreen.hideAsync can be moved to other components. Here user might see a blank screen for some ms.
 */
export default function AppInitializer({ children }: AppInitializerProps) {
    const [ready, setReady] = useState(false);
    const { isOnline } = useNetworkState();

    useEffect(() => {
        // Initialize app and hide splash screen when ready
        initializeLanguage()
            .catch(() => {})
            .finally(() => {
                setReady(true);
                SplashScreen.hideAsync().catch(() => {});
            });
    }, []);

    // Return null during initialization to prevent rendering until ready
    if (!ready) return null;

    return (
        <View className="flex-1">
            {/* Show banner when device is offline */}
            <OfflineBanner visible={!isOnline} />
            {children}
        </View>
    );
}
