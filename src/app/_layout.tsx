import AppInitializer from "@/components/AppInitializer";
import NavigationStack from "@/components/NavigationStack";
import Providers from "@/components/Providers";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

// To debug with reactotron in dev client apps only
if (__DEV__) {
    import("../lib/ReactotronConfig");
}

/**
 * RootLayout - App root with all providers and initialization
 *
 * Architecture:
 * 1. Providers - Context providers (gestures, safe area, queries, modals)
 * 2. AppInitializer - Handles language init and splash screen
 * 3. StatusBar - Status bar styling
 * 4. NavigationStack - Route definitions
 */
export default function RootLayout() {
    return (
        <Providers>
            <AppInitializer>
                <StatusBar style="dark" />
                <NavigationStack />
            </AppInitializer>
        </Providers>
    );
}
