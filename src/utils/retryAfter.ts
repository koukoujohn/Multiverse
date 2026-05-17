/**
 * Parses the Retry-After response header into milliseconds.
 * Handles both second-delta (RFC 7231 §7.1.3) and HTTP-date formats.
 * Returns undefined when the header is absent or unparseable.
 */

import axios from "axios";

export function getRetryAfterMs(error: unknown): number | undefined {
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
