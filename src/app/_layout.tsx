import AppInitializer from "@/components/AppInitializer";
import NavigationStack from "@/components/NavigationStack";
import Providers from "@/components/Providers";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "../global.css";
import "../lib/ReactotronConfig";

// Suppress warning caused by an incompatibility between @gorhom/bottom-sheet v5 and
// react-native-reanimated v4 (Expo SDK 55). findNodeHandle() returns null under Fabric
// (New Architecture). The library is unmaintained with no upstream fix available.
// Dismiss/scroll gestures are unaffected. https://github.com/gorhom/react-native-bottom-sheet/discussions/2641
//
// LogBox.ignoreLogs hides the in-app overlay; the console.warn patch silences Metro terminal output.
LogBox.ignoreLogs(["Couldn't find the scrollable node handle id!"]);
const _warn = console.warn.bind(console);
console.warn = (...args: Parameters<typeof console.warn>) => {
    if (typeof args[0] === "string" && args[0].includes("Couldn't find the scrollable node handle id!")) return;
    _warn(...args);
};

SplashScreen.preventAutoHideAsync().catch(() => {});

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
