"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, RefreshCw, Syringe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/common/Button";
import Spinner from "@/components/ui/common/Spinner";
import { VACCINATION_BADGES } from "@/components/vaccination/types/vaccinationStatus";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useUpcomingVaccinations } from "@/hooks/useUpcomingVaccinations";
import { daysFromToday, describeDue, formatDate } from "@/lib/vaccination/dates";
import type { UpcomingVaccinationView } from "@/types/vaccination";

const MAX_BADGE_COUNT = 9;

//Campana de avisos del header: vacunas vencidas y por vencer
export default function NotificationBell() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const panelId = useId();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const { items, loading, error, reload } = useUpcomingVaccinations();

    const canOpenPet = hasPermission("mascotas:ver");
    const count = items.length;
    const hasOverdue = items.some((item) => item.status === "VENCIDA");

    const close = useCallback(() => setOpen(false), []);
    useClickOutside(wrapperRef, close, open);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Lleva al expediente de la mascota, directo a la pestaña de vacunas.
    const openPet = (item: UpcomingVaccinationView) => {
        setOpen(false);
        router.push(`/dashboard/pets?mascota=${item.idPet}&tab=vacunas`);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label={count > 0 ? `Vacunas pendientes: ${count}` : "Vacunas pendientes"}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full md:h-11 md:w-11 border border-secondary/50 bg-white/60 text-accent shadow-sm transition-all hover:bg-white hover:text-text hover:shadow-md"
            >
                <Bell className="h-5 w-5" />

                {count > 0 && (
                    <span
                        className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white ${hasOverdue ? "bg-danger" : "bg-warning"}`}
                    >
                        {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
                    </span>
                )}
            </button>

            {open && (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Vacunas por vencer"
                    className="fixed inset-x-4 top-[4.5rem] z-50 overflow-hidden rounded-2xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-96 border border-secondary bg-white shadow-lg motion-safe:animate-modal-in"
                >
                    <div className="flex items-center gap-2 border-b border-mint px-4 py-3">
                        <Syringe className="h-4 w-4 text-accent" aria-hidden="true" />
                        <h2 className="text-sm font-bold text-text">Vacunas por vencer</h2>
                        {count > 0 && <span className="ml-auto text-xs text-text/60">{count} pendientes</span>}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-text/70">
                            <Spinner className="h-5 w-5" />
                            <span>Cargando avisos...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                            <p className="text-sm text-danger-strong">{error}</p>
                            <Button type="button" variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
                                Reintentar
                            </Button>
                        </div>
                    ) : count === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
                            <p className="text-sm font-medium text-text">No hay vacunas pendientes</p>
                            <p className="text-xs text-text/60">Los pacientes están al día.</p>
                        </div>
                    ) : (
                        <ul className="max-h-80 divide-y divide-mint overflow-y-auto">
                            {items.map((item) => {
                                const badge = VACCINATION_BADGES[item.status];
                                const Icon = badge.icon;
                                const days = item.nextDoseDate ? daysFromToday(item.nextDoseDate) : null;

                                const content = (
                                    <>
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${badge.classes}`}>
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>

                                        <span className="min-w-0 flex-1 text-left">
                                            <span className="block truncate text-sm font-semibold text-text">
                                                {item.petName} · {item.vaccineName}
                                            </span>
                                            <span className="block text-xs font-medium text-text/70">
                                                {describeDue(days)} · {formatDate(item.nextDoseDate)}
                                            </span>
                                            {item.ownerName && (
                                                <span className="block truncate text-xs text-text/60">Dueño: {item.ownerName}</span>
                                            )}
                                        </span>
                                    </>
                                );

                                return (
                                    <li key={item.idVaccination}>
                                        {canOpenPet && item.idPet > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => openPet(item)}
                                                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-mint/50"
                                            >
                                                {content}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3">{content}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}