"use client";

import { useEffect, useState } from "react";
import { getPetVaccinations } from "@/services/vaccinationService";
import type { VaccinationResponse } from "@/types/vaccination-api";

interface PetVaccinationsState {
    /** Mascota a la que pertenece el resultado guardado. */
    petId: number | null;
    records: VaccinationResponse[];
    error: string | null;
}

const INITIAL_STATE: PetVaccinationsState = { petId: null, records: [], error: null };

/**
 * Carnet de vacunación de una mascota.
 * - Pasar `null` desactiva la carga (por ejemplo, si el usuario no tiene permiso).
 * - `loading` es true hasta que llegue la primera respuesta de ESA mascota.
 * - `reload()` vuelve a pedir el carnet (se usa después de registrar una vacuna).
 */
export function usePetVaccinations(petId: number | null) {
    const [state, setState] = useState<PetVaccinationsState>(INITIAL_STATE);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (petId === null) return;

        let cancelled = false;

        getPetVaccinations(petId)
            .then((records) => {
                if (!cancelled) setState({ petId, records, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "No se pudo cargar el carnet de vacunación.";
                setState({ petId, records: [], error: message });
            });

        return () => {
            cancelled = true;
        };
    }, [petId, version]);

    const ready = petId !== null && state.petId === petId;

    return {
        records: ready ? state.records : [],
        error: ready ? state.error : null,
        loading: petId !== null && !ready,
        reload: () => setVersion((current) => current + 1),
    };
}
