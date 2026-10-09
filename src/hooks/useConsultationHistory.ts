"use client";

import { useEffect, useState } from "react";
import { getConsultationHistory } from "@/services/consultationService";
import type { ConsultationView } from "@/types/consultation";

interface ConsultationHistoryState {
    /** Mascota a la que pertenece el resultado guardado. */
    petId: number | null;
    history: ConsultationView[];
    error: string | null;
}

const INITIAL_STATE: ConsultationHistoryState = { petId: null, history: [], error: null };

/**
 * Historial de consultas completadas de una mascota.
 * - Pasar `null` desactiva la carga (por ejemplo, si el usuario no tiene permiso).
 * - `reload()` vuelve a pedir el historial (se usa después de registrar una consulta).
 */
export function useConsultationHistory(petId: number | null) {
    const [state, setState] = useState<ConsultationHistoryState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (petId === null) return;

        let cancelled = false;

        getConsultationHistory(petId)
            .then((history) => {
                if (!cancelled) setState({ petId, history, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar el historial de consultas.";
                setState({ petId, history: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [petId, version]);

    const ready = petId !== null && state.petId === petId;

    return {
        history: ready ? state.history : [],
        error: ready ? state.error : null,
        loading: petId !== null && !ready,
        reload: () => setVersion((current) => current + 1),
    };
}
