"use client";

import { useEffect, useState } from "react";
import { getVaccineCatalog } from "@/services/vaccineCatalogService";
import type { VaccineResponse } from "@/types/vaccination-api";

interface CatalogState {
    loaded: boolean;
    vaccines: VaccineResponse[];
    error: string | null;
}

const INITIAL_STATE: CatalogState = { loaded: false, vaccines: [], error: null };

/** Catálogo completo de vacunas para la pantalla de administración. `reload()` lo vuelve a pedir. */
export function useVaccineCatalogAdmin() {
    const [state, setState] = useState<CatalogState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getVaccineCatalog()
            .then((vaccines) => {
                if (!cancelled) setState({ loaded: true, vaccines, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar el catálogo.";
                setState({ loaded: true, vaccines: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [version]);

    return {
        vaccines: state.vaccines,
        error: state.error,
        loading: !state.loaded,
        reload: () => setVersion((current) => current + 1),
    };
}
