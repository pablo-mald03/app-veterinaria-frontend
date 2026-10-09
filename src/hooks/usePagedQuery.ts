"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { Page } from "@/types/pagination";

type Fetcher<T> = () => Promise<Page<T>>;

interface Snapshot<T> {
    fetcher: Fetcher<T>;
    token: number;
    page: Page<T> | null;
    error: string | null;
}

interface UsePagedQueryOptions {
    /** When false no request is made (e.g. invalid filters) */
    enabled?: boolean;
    errorTitle?: string;
}

/**
 * Server-side paginated query.
 * `fetcher` must be memoized (useCallback) with the filters/page as dependencies:
 * when it changes, a new request is made and the old response is discarded.
 * `loading` is derived (the stored result no longer matches the fetcher), so no state is set synchronously in the effect.
 */
export function usePagedQuery<T>(fetcher: Fetcher<T>, { enabled = true, errorTitle = "Error al cargar los datos" }: UsePagedQueryOptions = {}) {
    const toast = useToast();
    const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);
    const [token, setToken] = useState(0);

    const current = snapshot?.fetcher === fetcher && snapshot.token === token ? snapshot : null;
    const loading = enabled && current === null;

    useEffect(() => {
        if (!enabled) return;

        let active = true;
        fetcher()
            .then((page) => {
                if (active) setSnapshot({ fetcher, token, page, error: null });
            })
            .catch((err) => {
                if (!active) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar la información.";
                setSnapshot({ fetcher, token, page: null, error: message });
                toast.error(message, errorTitle);
            });

        return () => {
            active = false;
        };
    }, [fetcher, token, enabled, errorTitle, toast]);

    const reload = useCallback(() => setToken((n) => n + 1), []);

    const lastPage = snapshot?.page ?? null;

    return {
        rows: lastPage?.content ?? [],
        totalPages: lastPage?.totalPages ?? 0,
        totalElements: lastPage?.totalElements ?? 0,
        loading,
        error: current?.error ?? null,
        reload,
    };
}
