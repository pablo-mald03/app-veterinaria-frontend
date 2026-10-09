import { AlertTriangle, Check, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import type { EstadoVacuna } from "@/types/vaccination";

// "APLICADA" es solo visual: se usa para las dosis anteriores que ya fueron superadas
// por una dosis más reciente de la misma vacuna (no deben mostrarse como vencidas).
export type VaccinationBadgeKind = EstadoVacuna | "APLICADA";

interface BadgeConfig {
    label: string;
    icon: LucideIcon;
    classes: string;
}

//Colores e iconos por estado (usa los tokens de globals.css)
export const VACCINATION_BADGES: Record<VaccinationBadgeKind, BadgeConfig> = {
    AL_DIA: {
        label: "Al día",
        icon: CheckCircle2,
        classes: "border-success-border bg-success-soft text-success",
    },
    POR_VENCER: {
        label: "Por vencer",
        icon: Clock,
        classes: "border-warning-border bg-warning-soft text-warning",
    },
    VENCIDA: {
        label: "Vencida",
        icon: AlertTriangle,
        classes: "border-danger-border bg-danger-soft text-danger-strong",
    },
    APLICADA: {
        label: "Aplicada",
        icon: Check,
        classes: "border-secondary bg-mint text-accent",
    },
};
