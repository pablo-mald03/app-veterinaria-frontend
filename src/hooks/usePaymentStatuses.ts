"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService } from "@/services/paymentService";
import type { Payment } from "@/types/payment";

//Payment account of each appointment: undefined = loading, null = no account yet
type PaymentCache = Record<number, Payment | null>;

//The API only exposes one account per appointment, so only the given (visible) appointments are requested, once each
export function usePaymentStatuses(appointmentIds: number[]) {
    const [cache, setCache] = useState<PaymentCache>({});
    const key = appointmentIds.join(",");

    useEffect(() => {
        const missing = (key ? key.split(",").map(Number) : []).filter((id) => !(id in cache));
        if (missing.length === 0) return;
        let active = true;

        Promise.all(
            missing.map((id) =>
                paymentService
                    .getByAppointment(id)
                    .then((payment) => [id, payment] as const)
                    // El backend responde error cuando la cita aún no tiene cuenta abierta
                    .catch(() => [id, null] as const),
            ),
        ).then((entries) => {
            if (active) setCache((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
        });

        return () => {
            active = false;
        };
    }, [key, cache]);

    //Forgets the given appointments (or all) so they are requested again, e.g. after charging or paying
    const refresh = useCallback((ids?: number[]) => {
        setCache((prev) => {
            if (!ids) return {};
            const next = { ...prev };
            ids.forEach((id) => delete next[id]);
            return next;
        });
    }, []);

    return { get: (id: number) => cache[id], refresh };
}
