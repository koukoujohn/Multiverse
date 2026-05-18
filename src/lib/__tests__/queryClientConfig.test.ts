import { getQueryClient } from "@/lib/queryClientConfig";

// Duck-typed AxiosError — axios.isAxiosError() only checks `value?.isAxiosError === true`
function makeAxiosError(status?: number, retryAfterHeader?: string): unknown {
    return {
        isAxiosError: true,
        response: status !== undefined ? { status, headers: retryAfterHeader ? { "retry-after": retryAfterHeader } : {} } : undefined,
    };
}

function makeNetworkError(): Error {
    const e = new Error("No internet");
    e.name = "NetworkError";
    return e;
}

describe("queryClientConfig", () => {
    // Retrieve the retry and retryDelay functions from the singleton's default options.
    // They are not exported directly but are accessible via getDefaultOptions().
    let retry: (failureCount: number, error: unknown) => boolean;
    let retryDelay: (failureCount: number, error: unknown) => number;

    beforeAll(() => {
        const qc = getQueryClient();
        const queries = qc.getDefaultOptions().queries!;
        retry = queries.retry as unknown as typeof retry;
        retryDelay = queries.retryDelay as unknown as typeof retryDelay;
    });

    describe("retry()", () => {
        it("does not retry a NetworkError", () => {
            expect(retry(0, makeNetworkError())).toBe(false);
        });

        it("does not retry 4xx client errors (excluding 429)", () => {
            expect(retry(0, makeAxiosError(400))).toBe(false);
            expect(retry(0, makeAxiosError(403))).toBe(false);
            expect(retry(0, makeAxiosError(404))).toBe(false);
            expect(retry(0, makeAxiosError(422))).toBe(false);
        });

        it("retries a 429 when failureCount is below 5", () => {
            expect(retry(0, makeAxiosError(429))).toBe(true);
            expect(retry(4, makeAxiosError(429))).toBe(true);
        });

        it("stops retrying a 429 at failureCount 5", () => {
            expect(retry(5, makeAxiosError(429))).toBe(false);
        });

        it("retries 5xx server errors when failureCount is below 3", () => {
            expect(retry(0, makeAxiosError(500))).toBe(true);
            expect(retry(2, makeAxiosError(503))).toBe(true);
        });

        it("stops retrying 5xx server errors at failureCount 3", () => {
            expect(retry(3, makeAxiosError(500))).toBe(false);
        });

        it("retries unknown errors when failureCount is below 3", () => {
            expect(retry(0, new Error("unknown"))).toBe(true);
            expect(retry(2, new Error("unknown"))).toBe(true);
        });

        it("stops retrying unknown errors at failureCount 3", () => {
            expect(retry(3, new Error("unknown"))).toBe(false);
        });
    });

    describe("retryDelay()", () => {
        it("uses the Retry-After header value (seconds) when present", () => {
            expect(retryDelay(0, makeAxiosError(429, "30"))).toBe(30_000);
        });

        it("caps the Retry-After delay at 60 seconds", () => {
            expect(retryDelay(0, makeAxiosError(429, "120"))).toBe(60_000);
        });

        it("falls back to exponential backoff when no Retry-After header is present", () => {
            expect(retryDelay(0, makeAxiosError(500))).toBe(1_000);
            expect(retryDelay(1, makeAxiosError(500))).toBe(2_000);
            expect(retryDelay(2, makeAxiosError(500))).toBe(4_000);
        });

        it("caps exponential backoff at 30 seconds", () => {
            expect(retryDelay(10, makeAxiosError(500))).toBe(30_000);
        });
    });
});
