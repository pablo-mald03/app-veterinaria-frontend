"use client";

import { useEffect, useState } from "react";
import { getTreatmentCatalog } from "@/services/vaccineCatalogService";
import type { TreatmentResponse } from "@/types/vaccination-api";

interface CatalogState {
    loaded: boolean;
    treatments: TreatmentResponse[];
    error: string | null;
}

const INITIAL_STATE: CatalogState = { loaded: false, treatments: [], error: null };

/** Catálogo completo de tratamientos para la pantalla de administración. `reload()` lo vuelve a pedir. */
export function useVaccineCatalogAdmin() {
    const [state, setState] = useState<CatalogState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getTreatmentCatalog()
            .then((treatments) => {
                if (!cancelled) setState({ loaded: true, treatments, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar el catálogo.";
                setState({ loaded: true, treatments: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [version]);

    return {
        treatments: state.treatments,
        error: state.error,
        loading: !state.loaded,
        reload: () => setVersion((current) => current + 1),
    };
}
