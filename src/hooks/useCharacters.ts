/**
 * Infinite-scroll character list with filter support.
 * queryKey includes all filter params — TanStack Query re-fetches automatically when any change.
 */

import { getCharacters } from "@/services/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useCharacters({ name, status, species, type, gender }: { name: string; status: string; species: string; type: string; gender: string }) {
    return useInfiniteQuery({
        queryKey: ["characters", name, status, species, type, gender],

        queryFn: ({ pageParam = 1 }) =>
            getCharacters({
                page: pageParam,
                name,
                status,
                species,
                type,
                gender,
            }),

        // Extract the next page number from the API's pagination URL
        getNextPageParam: (lastPage) => {
            if (!lastPage.info.next) return undefined;
            const url = new URL(lastPage.info.next);
            return Number(url.searchParams.get("page"));
        },

        initialPageParam: 1,
    });
}
