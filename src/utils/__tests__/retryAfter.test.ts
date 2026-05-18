import { getRetryAfterMs } from "../retryAfter";

/** Creates a minimal object that satisfies axios.isAxiosError's runtime check. */
const makeAxiosError = (retryAfterHeader?: string | string[]) => {
    const error = new Error("request failed") as unknown as Record<string, unknown>;
    error["isAxiosError"] = true;
    error["response"] = {
        headers: retryAfterHeader !== undefined ? { "retry-after": retryAfterHeader } : {},
    };
    return error;
};

describe("getRetryAfterMs", () => {
    it("returns undefined for a plain (non-axios) Error", () => {
        expect(getRetryAfterMs(new Error("plain"))).toBeUndefined();
    });

    it("returns undefined when the retry-after header is absent", () => {
        expect(getRetryAfterMs(makeAxiosError())).toBeUndefined();
    });

    it("parses a seconds value into milliseconds", () => {
        expect(getRetryAfterMs(makeAxiosError("30"))).toBe(30_000);
    });

    it("returns 0 when the seconds value is 0", () => {
        expect(getRetryAfterMs(makeAxiosError("0"))).toBe(0);
    });

    it("parses a future HTTP-date and returns a positive delay", () => {
        const futureDate = new Date(Date.now() + 60_000).toUTCString();
        const result = getRetryAfterMs(makeAxiosError(futureDate));
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(60_000);
    });

    it("clamps a past HTTP-date to 0", () => {
        const pastDate = new Date(Date.now() - 10_000).toUTCString();
        expect(getRetryAfterMs(makeAxiosError(pastDate))).toBe(0);
    });

    it("uses the first element when the header is an array", () => {
        expect(getRetryAfterMs(makeAxiosError(["45", "90"]))).toBe(45_000);
    });

    it("returns undefined for an unparseable string", () => {
        expect(getRetryAfterMs(makeAxiosError("not-a-date"))).toBeUndefined();
    });
});
