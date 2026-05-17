/**
 * Subscribes to device network state via expo-network.
 * Returns { isOnline } that updates reactively when connectivity changes.
 * Cleans up the listener on unmount to prevent memory leaks.
 */

import * as Network from "expo-network";
import { useEffect, useState } from "react";

export function useNetworkState() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const setupNetworkListener = async () => {
            const subscription = Network.addNetworkStateListener((state) => {
                setIsOnline(state.isConnected ?? true);
            });

            unsubscribe = subscription.remove;

            // Also check current state — network may have changed before the listener was attached
            const initialState = await Network.getNetworkStateAsync();
            setIsOnline(initialState.isConnected ?? true);
        };

        setupNetworkListener();

        return () => {
            unsubscribe?.();
        };
    }, []);

    return { isOnline };
}
