"use client";

import { useState } from "react";
import { ClipboardList, Coins, Stethoscope, Syringe } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import {
    consultationCostValidator,
    consultationDiagnosisSchema,
    consultationReasonSchema,
    consultationTreatmentSchema,
} from "@/schemas/consultation.schema";
import type { ConsultationInput } from "@/types/consultation";

interface ConsultationFormProps {
    onSubmit: (input: ConsultationInput) => Promise<void>;
    onCancel: () => void;
}

//Formulario para registrar una consulta ya realizada a una mascota
export default function ConsultationForm({ onSubmit, onCancel }: ConsultationFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const reason = useField({ validator: consultationReasonSchema, validateOn: "blur" });
    const diagnosis = useField({ validator: consultationDiagnosisSchema, validateOn: "blur" });
    const treatment = useField({ validator: consultationTreatmentSchema, validateOn: "blur" });
    const cost = useField({ validator: consultationCostValidator, validateOn: "blur" });

    const isFormValid = reason.valid && diagnosis.valid && treatment.valid && cost.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [reason.validate(), diagnosis.validate(), treatment.validate(), cost.validate()];
        if (!results.every(Boolean)) return;

        const input: ConsultationInput = {
            reason: reason.value.trim(),
            diagnosis: diagnosis.value.trim(),
            treatment: treatment.value.trim(),
            cost: Number(cost.value),
        };

        try {
            setSubmitting(true);
            await onSubmit(input);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo registrar la consulta.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <TextField
                label="Motivo de la consulta"
                icon={<ClipboardList />}
                placeholder="Ej. Vómito y decaimiento desde ayer"
                {...reason.props}
            />

            <TextArea
                label="Diagnóstico"
                icon={<Stethoscope />}
                placeholder="Hallazgos del examen, diagnóstico presuntivo o confirmado..."
                rows={3}
                {...diagnosis.props}
            />

            <TextArea
                label="Tratamiento"
                icon={<Syringe />}
                placeholder="Medicamentos, indicaciones, próximos pasos..."
                rows={3}
                {...treatment.props}
            />

            <TextField
                label="Costo de la consulta (Q)"
                icon={<Coins />}
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                placeholder="0.00"
                {...cost.props}
            />

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    loadingLabel="Guardando..."
                    disabled={!isFormValid || submitting}
                >
                    Registrar consulta
                </Button>
            </div>
        </form>
    );
}
