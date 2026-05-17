import { getQueryClient } from "@/lib/queryClientConfig";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Providers - Wraps app with all required context providers
 * Layers:
 * 1. GestureHandlerRootView - Enables gesture handling (swipe, pan, etc.)
 * 2. SafeAreaProvider - Handles safe area insets (notches, status bar)
 * 3. QueryClientProvider - Manages server state (caching, refetching)
 * 4. BottomSheetModalProvider - Enables bottom sheet modals throughout app
 */
export default function Providers({ children }: ProvidersProps) {
    const queryClient = getQueryClient();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
