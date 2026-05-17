/**
 * Converts API/network errors to user-facing i18n strings.
 * 429 errors parse the Retry-After header (R&M API enforces strict rate limits).
 */

import { i18n } from "@/lib";
import { getRetryAfterMs } from "@/utils/retryAfter";
import axios from "axios";

// Formats a millisecond duration as "30s" or "5m"
function formatRetryAfter(ms: number): string {
    const totalSeconds = Math.max(1, Math.ceil(ms / 1000));

    if (totalSeconds < 60) {
        return `${totalSeconds}s`;
    }

    const minutes = Math.ceil(totalSeconds / 60);
    return `${minutes}m`;
}

export function getErrorMessage(error: unknown, fallback?: string): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 429) {
            const retryAfterMs = getRetryAfterMs(error);

            if (retryAfterMs !== undefined) {
                return i18n.t("errors.rateLimitedWithTime", { time: formatRetryAfter(retryAfterMs) });
            }

            return i18n.t("errors.rateLimited");
        }

        if (!error.response) {
            return i18n.t("errors.noInternet");
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback ?? i18n.t("common.somethingWentWrong");
}
