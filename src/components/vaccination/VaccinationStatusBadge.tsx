import {
    VACCINATION_BADGES,
    type VaccinationBadgeKind,
} from "@/components/vaccination/types/vaccinationStatus";

interface VaccinationStatusBadgeProps {
    kind: VaccinationBadgeKind;
}

//Insignia con icono y texto del estado de una vacuna (no depende solo del color)
export default function VaccinationStatusBadge({ kind }: VaccinationStatusBadgeProps) {
    const { label, icon: Icon, classes } = VACCINATION_BADGES[kind];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
        </span>
    );
}
