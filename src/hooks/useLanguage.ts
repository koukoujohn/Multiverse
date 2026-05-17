/**
 * Wraps i18next language switching with AsyncStorage persistence.
 * Saved preference is loaded at startup by AppInitializer.
 */

import { ENUMS } from "@/enums";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const LANG_KEY = ENUMS.LANG_KEY;

export function useLanguage() {
    const { i18n } = useTranslation();

    // Toggle between en/el and persist the choice so it survives app restarts
    const toggleLanguage = async () => {
        const next = i18n.language === "en" ? "el" : "en";
        await i18n.changeLanguage(next);
        await AsyncStorage.setItem(LANG_KEY, next);
    };

    return {
        currentLanguage: i18n.language as "en" | "el",
        toggleLanguage,
    };
}
