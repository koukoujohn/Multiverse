import { getErrorMessage } from "../errorMessage";

// Mock @/lib to prevent i18next and Reactotron initialisation during tests.
// i18n.t returns the key (plus serialised options) so assertions stay readable.
jest.mock("@/lib", () => ({
    i18n: {
        t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    },
}));

/** Minimal AxiosError-shaped object (axios.isAxiosError checks for .isAxiosError === true). */
const makeAxiosError = ({ status, retryAfter, hasResponse = true }: { status?: number; retryAfter?: string; hasResponse?: boolean }) => {
    const error = new Error("request failed") as unknown as Record<string, unknown>;
    error["isAxiosError"] = true;
    if (hasResponse) {
        error["response"] = {
            status,
            headers: retryAfter ? { "retry-after": retryAfter } : {},
        };
    }
    return error;
};

describe("getErrorMessage", () => {
    it("returns the rateLimited key for a 429 with no Retry-After header", () => {
        expect(getErrorMessage(makeAxiosError({ status: 429 }))).toBe("errors.rateLimited");
    });

    it("returns the rateLimitedWithTime key for a 429 with a Retry-After seconds header", () => {
        const result = getErrorMessage(makeAxiosError({ status: 429, retryAfter: "30" }));
        expect(result).toContain("errors.rateLimitedWithTime");
        expect(result).toContain("30s");
    });

    it("returns the rateLimitedWithTime key with minutes for a large Retry-After value", () => {
        const result = getErrorMessage(makeAxiosError({ status: 429, retryAfter: "180" }));
        expect(result).toContain("errors.rateLimitedWithTime");
        expect(result).toContain("3m");
    });

    it("returns the noInternet key when the error has no response", () => {
        expect(getErrorMessage(makeAxiosError({ hasResponse: false }))).toBe("errors.noInternet");
    });

    it("returns the error message for a plain Error instance", () => {
        expect(getErrorMessage(new Error("disk full"))).toBe("disk full");
    });

    it("returns the custom fallback for an unrecognised error", () => {
        expect(getErrorMessage("unexpected", "my fallback")).toBe("my fallback");
    });

    it("returns the somethingWentWrong key when no fallback is provided", () => {
        expect(getErrorMessage("unexpected")).toBe("common.somethingWentWrong");
    });
});
