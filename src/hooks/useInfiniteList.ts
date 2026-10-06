"use client";

import { useCallback, useRef, useState } from "react";
import { Page } from "@/types/pagination";

//Hook to use the infinite list for components and (delimite the pageable data)
export function useInfiniteList<T>(fetchPage: (page: number) => Promise<Page<T>>) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const nextPage = useRef(0);
    const busy = useRef(false);
    const fetchRef = useRef(fetchPage);
    fetchRef.current = fetchPage;

    const loadMore = useCallback(async () => {
        if (busy.current) return;
        busy.current = true;
        setLoading(true);
        setError(null);

        try {
            const data = await fetchRef.current(nextPage.current);
            setItems((prev) => [...prev, ...data.content]);
            nextPage.current += 1;
            setHasMore(nextPage.current < data.totalPages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar los datos.");
            setHasMore(false);
        } finally {
            busy.current = false;
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        nextPage.current = 0;
        setItems([]);
        setError(null);
        setHasMore(true);
    }, []);

    return { items, loading, hasMore, error, loadMore, reset };
}