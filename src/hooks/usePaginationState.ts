"use client";

import { useState } from "react";

/**
 * Current page (0-based) that goes back to the first page whenever `resetKey` changes
 * (filters, page size, sort...), without effects or extra requests.
 */
export function usePaginationState(resetKey: string) {
    const [state, setState] = useState({ key: resetKey, page: 0 });

    if (state.key !== resetKey) setState({ key: resetKey, page: 0 });

    const page = state.key === resetKey ? state.page : 0;
    const setPage = (next: number) => setState({ key: resetKey, page: next });

    return [page, setPage] as const;
}
