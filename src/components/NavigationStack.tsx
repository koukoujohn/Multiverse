import { Stack } from "expo-router";

/**
 * NavigationStack - Defines all routes and their screen options
 * Tab routes and character detail routes are configured here with default behaviors
 * This is not necessary, it can be removed and added into each pages _layout to specify Screen customizations. But since this is a small app I added them here.
 */
export default function NavigationStack() {
    return (
        <Stack>
            {/* Tabs navigation with custom header hidden */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Character detail page with custom header hidden */}
            <Stack.Screen name="character/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
