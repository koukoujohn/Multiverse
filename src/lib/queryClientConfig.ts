import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

// Cache durations for React Query
const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

/**
 * Extracts retry-after duration from error response headers
 * Handles both HTTP-date and second-delta formats per RFC 7231
 */
function getRetryAfterMs(error: unknown): number | undefined {
    if (!axios.isAxiosError(error)) return undefined;

    const header = error.response?.headers?.["retry-after"];
    if (!header) return undefined;

    const raw = Array.isArray(header) ? header[0] : String(header);
    const seconds = Number(raw);

    // Check if header value is in seconds format
    if (!Number.isNaN(seconds)) {
        return Math.max(0, seconds * 1000);
    }

    // Try parsing as HTTP-date format
    const dateMs = Date.parse(raw);
    if (Number.isNaN(dateMs)) return undefined;

    return Math.max(0, dateMs - Date.now());
}

/**
 * Creates a singleton QueryClient with optimized caching and retry strategies
 * - Stale data is kept for 5 minutes before revalidation
 * - Cached data is garbage collected after 30 minutes
 * - Failed requests retry intelligently based on error type
 * - Rate-limited (429) requests get exponential backoff
 * - Network errors fall back to stale cache instead of retrying
 */
let queryClientInstance: QueryClient | null = null;

export function getQueryClient(): QueryClient {
    if (!queryClientInstance) {
        queryClientInstance = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: FIVE_MINUTES,
                    gcTime: THIRTY_MINUTES,
                    retry: (failureCount, error) => {
                        // Don't retry on network errors — serve stale cache instead
                        if (error instanceof Error && error.name === "NetworkError") {
                            return false;
                        }

                        if (axios.isAxiosError(error)) {
                            const status = error.response?.status;

                            // Never retry client errors (4xx) except rate limiting
                            if (status && status >= 400 && status < 500 && status !== 429) {
                                return false;
                            }

                            // Give rate-limited requests a few more attempts with backoff
                            if (status === 429) {
                                return failureCount < 5;
                            }
                        }

                        // Server errors (5xx) and unknown errors get up to 3 retries
                        return failureCount < 3;
                    },
                    retryDelay: (failureCount, error) => {
                        // Use server's suggested retry delay if available
                        const retryAfter = getRetryAfterMs(error);
                        if (retryAfter !== undefined) {
                            // Cap max wait to avoid extremely long stalls from bad headers
                            return Math.min(retryAfter, 60_000);
                        }

                        // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
                        return Math.min(1000 * 2 ** failureCount, 30_000);
                    },
                },
            },
        });
    }
    return queryClientInstance;
}
