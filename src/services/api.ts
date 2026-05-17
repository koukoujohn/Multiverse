/**
 * HTTP client for the Rick and Morty API.
 * 404 → empty result set; no response → NetworkError for distinct offline handling.
 */

import { ApiResponse, Character } from "@/types/character";
import axios from "axios";

/** Thrown when there is no response at all, so callers can distinguish offline from server errors. */
class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
    }
}

const client = axios.create({
    baseURL: "https://rickandmortyapi.com/api",
    timeout: 10000,
});

// 404 = nothing matched the filters — return empty results instead of throwing
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 404) {
                return Promise.resolve({
                    data: { results: [], info: { count: 0, pages: 0, next: null, prev: null } },
                });
            }

            if (!error.response) {
                return Promise.reject(new NetworkError("No internet connection"));
            }
        }
        return Promise.reject(error);
    },
);

/** Fetches a paginated + filtered character list. All params are optional. */
export const getCharacters = async ({
    page = 1,
    name = "",
    status = "",
    species = "",
    type = "",
    gender = "",
}: {
    page?: number;
    name?: string;
    status?: string;
    species?: string;
    type?: string;
    gender?: string;
}): Promise<ApiResponse> => {
    const response = await client.get("/character", {
        params: {
            page,
            // Only send non-empty filter values
            ...(name ? { name } : {}),
            ...(status ? { status } : {}),
            ...(species ? { species } : {}),
            ...(type ? { type } : {}),
            ...(gender ? { gender } : {}),
        },
    });

    console.tron.log("GET Characters Response:", response);
    return response.data;
};

/** Fetches a single character by ID. */
export const getCharacter = async (id: number): Promise<Character> => {
    const response = await client.get(`/character/${id}`);
    console.tron.log("GET Character Response:", response);
    return response.data;
};

/**
 * Fetches multiple characters by ID in one request (used for the favorites list).
 * The API returns a single object for 1 ID and an array for 2+ — normalized here.
 */
export const getCharactersByIds = async (ids: number[]): Promise<Character[]> => {
    if (!ids.length) return [];

    const response = await client.get(`/character/${ids.join(",")}`);
    const data = response.data;

    // Normalize: single-object vs array depending on how many IDs were requested
    if (Array.isArray(data)) return data;
    return [data];
};
