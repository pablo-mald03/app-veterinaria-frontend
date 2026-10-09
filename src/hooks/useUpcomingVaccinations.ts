"use client";

import { useEffect, useState } from "react";
import { VACCINATIONS_CHANGED_EVENT } from "@/lib/vaccination/events";
import { VACCINATION_DUE_SOON_DAYS } from "@/lib/vaccination/status";
import { getUpcomingVaccinations } from "@/services/vaccinationService";
import type { UpcomingVaccinationView } from "@/types/vaccination";

/** Cada cuánto se vuelve a consultar (ms) mientras la pantalla está abierta. */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UpcomingState {
    loaded: boolean;
    items: UpcomingVaccinationView[];
    error: string | null;
}

const INITIAL_STATE: UpcomingState = { loaded: false, items: [], error: null };

/**
 * Vacunas vencidas y por vencer (alimenta la campana).
 * Se actualiza solo: al montar, cada 5 minutos y apenas se registra una vacuna.
 */
export function useUpcomingVaccinations(days = VACCINATION_DUE_SOON_DAYS) {
    const [state, setState] = useState<UpcomingState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getUpcomingVaccinations(days)
            .then((items) => {
                if (!cancelled) setState({ loaded: true, items, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudieron cargar las vacunas por vencer.";
                setState({ loaded: true, items: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [days, version]);

    useEffect(() => {
        const refresh = () => setVersion((current) => current + 1);

        window.addEventListener(VACCINATIONS_CHANGED_EVENT, refresh);
        const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);

        return () => {
            window.removeEventListener(VACCINATIONS_CHANGED_EVENT, refresh);
            window.clearInterval(timer);
        };
    }, []);

    return {
        items: state.items,
        error: state.error,
        loading: !state.loaded,
        reload: () => setVersion((current) => current + 1),
    };
}
