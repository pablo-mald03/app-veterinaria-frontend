"use client";

import { Moon } from "lucide-react";
import Button from "@/components/ui/common/Button";
import { AFTER_HOURS_SURCHARGE } from "@/lib/appointments/utils";
import { formatCost } from "@/lib/consultation/money";

interface AfterHoursNoticeProps {
    hour: string;
    submitting: boolean;
    onConfirm: () => void;
    onBack: () => void;
}

export default function AfterHoursNotice({ hour, submitting, onConfirm, onBack }: AfterHoursNoticeProps) {
    return (
        <div role="alertdialog" aria-label="Recargo por horario extraordinario" className="mt-4 flex flex-col gap-4 rounded-xl border border-warning-border bg-warning-soft p-4">
            <div className="flex items-start gap-3">
                <Moon className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                <div className="text-sm text-text">
                    <p className="font-semibold text-warning">Cita en horario extraordinario</p>
                    <p className="mt-1">
                        Las citas entre las 8:00 p. m. y las 8:00 a. m. o en fin de semana tienen un cargo extra de <strong>{formatCost(AFTER_HOURS_SURCHARGE)}</strong>.
                        La cita de las <strong>{hour.slice(0, 5)}</strong> se registrará con ese recargo, que se suma automáticamente a la cuenta de cobro.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>Cambiar horario</Button>
                <Button type="button" onClick={onConfirm} loading={submitting} loadingLabel="Guardando..." autoFocus>Confirmar y agendar</Button>
            </div>
        </div>
    );
}
