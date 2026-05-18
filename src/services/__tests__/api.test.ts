jest.mock("axios", () => {
    const actual = jest.requireActual("axios");
    return {
        ...actual,
        create: jest.fn().mockReturnValue({
            get: jest.fn(),
            interceptors: {
                response: { use: jest.fn() },
            },
        }),
    };
});

import { getCharacters, getCharactersByIds } from "@/services/api";
import axios from "axios";
import type { ReactotronReactNative } from "reactotron-react-native";

// api.ts calls console.tron.log(); install a no-op proxy so it doesn't crash in tests
console.tron = new Proxy({} as unknown as ReactotronReactNative, { get: () => () => {} });

// api.ts calls axios.create() at module init — grab the mock client it received
const mockClient = (axios.create as jest.Mock).mock.results[0].value;
const mockGet = mockClient.get as jest.Mock;
// api.ts registers client.interceptors.response.use(successFn, errorFn) at module init
const mockInterceptorErrorHandler: (err: unknown) => Promise<unknown> = (mockClient.interceptors.response.use as jest.Mock).mock.calls[0][1];

beforeEach(() => {
    mockGet.mockReset();
});

// ─── Interceptor ────────────────────────────────────────────────────────────

describe("api response interceptor", () => {
    it("converts a 404 response into an empty result set instead of throwing", async () => {
        const error = { isAxiosError: true, response: { status: 404 } };
        const result = await mockInterceptorErrorHandler(error);
        expect(result).toEqual({
            data: { results: [], info: { count: 0, pages: 0, next: null, prev: null } },
        });
    });

    it("converts a no-response AxiosError into a NetworkError", async () => {
        const error = { isAxiosError: true, response: undefined };
        await expect(mockInterceptorErrorHandler(error)).rejects.toMatchObject({
            name: "NetworkError",
        });
    });

    it("re-throws non-404 AxiosErrors unchanged", async () => {
        const error = { isAxiosError: true, response: { status: 500 } };
        await expect(mockInterceptorErrorHandler(error)).rejects.toBe(error);
    });

    it("re-throws non-Axios errors unchanged", async () => {
        const error = new Error("unexpected");
        await expect(mockInterceptorErrorHandler(error)).rejects.toBe(error);
    });
});

// ─── getCharactersByIds ──────────────────────────────────────────────────────

describe("getCharactersByIds()", () => {
    it("returns an empty array without calling the API when given no IDs", async () => {
        const result = await getCharactersByIds([]);
        expect(mockGet).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it("wraps a single-object API response in an array", async () => {
        const character = { id: 1, name: "Rick Sanchez" };
        mockGet.mockResolvedValue({ data: character });
        const result = await getCharactersByIds([1]);
        expect(result).toEqual([character]);
    });

    it("returns a multi-object API response array as-is", async () => {
        const characters = [
            { id: 1, name: "Rick" },
            { id: 2, name: "Morty" },
        ];
        mockGet.mockResolvedValue({ data: characters });
        const result = await getCharactersByIds([1, 2]);
        expect(result).toEqual(characters);
    });
});

// ─── getCharacters ───────────────────────────────────────────────────────────

describe("getCharacters()", () => {
    it("omits empty-string filter params from the request", async () => {
        mockGet.mockResolvedValue({
            data: { results: [], info: { count: 0, pages: 1, next: null, prev: null } },
        });
        await getCharacters({ page: 1, name: "Rick", status: "", species: "", type: "", gender: "" });
        expect(mockGet).toHaveBeenCalledWith("/character", {
            params: { page: 1, name: "Rick" },
        });
    });

    it("sends all non-empty filter params in the request", async () => {
        mockGet.mockResolvedValue({
            data: { results: [], info: { count: 0, pages: 1, next: null, prev: null } },
        });
        await getCharacters({ page: 2, name: "Rick", status: "alive", species: "human", type: "", gender: "male" });
        expect(mockGet).toHaveBeenCalledWith("/character", {
            params: { page: 2, name: "Rick", status: "alive", species: "human", gender: "male" },
        });
    });
});
