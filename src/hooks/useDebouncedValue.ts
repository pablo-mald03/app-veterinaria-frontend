"use client";

import { useEffect, useState } from "react";

//Delays a fast-changing value (e.g. text filters) to avoid a request per keystroke
export function useDebouncedValue<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
