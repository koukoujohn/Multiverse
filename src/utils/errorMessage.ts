/**
 * Converts API/network errors to user-facing i18n strings.
 * 429 errors parse the Retry-After header (R&M API enforces strict rate limits).
 */

import { i18n } from "@/lib";
import axios from "axios";

// Parses the Retry-After header (seconds or HTTP-date) into milliseconds
function getRetryAfterMs(error: unknown): number | undefined {
    if (!axios.isAxiosError(error)) return undefined;

    const header = error.response?.headers?.["retry-after"];
    if (!header) return undefined;

    const raw = Array.isArray(header) ? header[0] : String(header);

    const seconds = Number(raw);
    if (!Number.isNaN(seconds)) {
        return Math.max(0, seconds * 1000);
    }

    const dateMs = Date.parse(raw);
    if (Number.isNaN(dateMs)) return undefined;

    return Math.max(0, dateMs - Date.now());
}

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
