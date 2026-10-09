"use client";

import { useEffect, useState } from "react";
import { getVaccineCatalog } from "@/services/vaccinationService";
import type { VaccineResponse } from "@/types/vaccination-api";

interface CatalogState {
    loaded: boolean;
    catalog: VaccineResponse[];
    error: string | null;
}

const INITIAL_STATE: CatalogState = { loaded: false, catalog: [], error: null };

/**
 * Catálogo de vacunas. Solo se pide cuando `enabled` es true (por ejemplo, al abrir el formulario).
 * `reload()` reintenta después de un error.
 */
export function useVaccineCatalog(enabled: boolean) {
    const [state, setState] = useState<CatalogState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        getVaccineCatalog()
            .then((catalog) => {
                if (!cancelled) setState({ loaded: true, catalog, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar el catálogo de vacunas.";
                setState({ loaded: true, catalog: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [enabled, version]);

    return {
        catalog: state.catalog,
        error: state.error,
        loading: enabled && !state.loaded,
        reload: () => {
            setState(INITIAL_STATE);
            setVersion((current) => current + 1);
        },
    };
}
