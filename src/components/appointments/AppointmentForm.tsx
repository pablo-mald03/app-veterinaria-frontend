"use client";

import { useState } from "react";
import { CalendarDays, Clock, DoorOpen, FileText, PawPrint, Stethoscope, UserRound, Wallet } from "lucide-react";
import { useField } from "@/hooks/useField";
import { runValidator } from "@/lib/forms/validator";
import {
    appointmentCostSchema,
    appointmentDateSchema,
    appointmentDescriptionSchema,
    appointmentDiagnosisSchema,
    appointmentHourSchema,
    appointmentPetSchema,
    appointmentRoomSchema,
    appointmentTreatmentSchema,
    appointmentUserSchema,
} from "@/schemas/appointment.schema";
import { DEFAULT_STATUS, STATUS_OPTIONS, todayLocal, validateDateNotPast, validateSchedule } from "@/lib/appointments/utils";
import type { AppointmentCatalogs } from "@/hooks/useAppointmentCatalogs";
import type { AppointmentFormData, AppointmentResponse } from "@/types/appointment";
import TextField from "@/components/ui/common/TextField";
import TextArea from "@/components/ui/common/TextArea";
import Dropdown from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import Alert from "@/components/ui/common/Alert";

interface AppointmentFormProps {
    editingAppointment: AppointmentResponse | null;
    appointments: AppointmentResponse[];
    fixedUserId?: number;
    catalogs: AppointmentCatalogs;
    onSubmit: (data: AppointmentFormData) => Promise<void>;
    onCancel: () => void;
}

function buildInitialData(a: AppointmentResponse | null) {
    return {
        petId: a ? String(a.petId) : "",
        userId: a ? String(a.userId) : "",
        roomId: a ? String(a.roomId) : "",
        date: a?.date ?? "",
        hour: a?.hour?.slice(0, 5) ?? "",
        status: a?.status ?? DEFAULT_STATUS,
        description: a?.description ?? "",
        diagnosis: a?.diagnosis ?? "",
        treatment: a?.treatment ?? "",
        cost: a?.cost ? String(a.cost) : "",
    };
}

export default function AppointmentForm({ editingAppointment, appointments, fixedUserId, catalogs, onSubmit, onCancel }: AppointmentFormProps) {
    const isEditing = Boolean(editingAppointment);
    const initial = buildInitialData(editingAppointment);
    if (fixedUserId !== undefined) initial.userId = String(fixedUserId);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const keepsDate = (d: string) => isEditing && d === initial.date;
    const keepsSchedule = (d: string, h: string) => keepsDate(d) && h === initial.hour;

    const petId = useField({ initialValue: initial.petId, validator: appointmentPetSchema, validateOn: "blur" });
    const userId = useField({ initialValue: initial.userId, validator: appointmentUserSchema, validateOn: "blur" });
    const roomId = useField({ initialValue: initial.roomId, validator: appointmentRoomSchema, validateOn: "blur" });
    const date = useField({
        initialValue: initial.date,
        validator: (v) => runValidator(appointmentDateSchema, v) ?? validateDateNotPast(v, keepsDate(v)),
        validateOn: "blur",
    });
    const hour = useField({
        initialValue: initial.hour,
        validator: (v) =>
            runValidator(appointmentHourSchema, v) ??
            validateSchedule({
                date: date.value,
                hour: v,
                petId: petId.value,
                appointments,
                ignoreId: editingAppointment?.id,
                skipPastCheck: keepsSchedule(date.value, v),
            }),
        validateOn: "blur",
    });
    const status = useField({ initialValue: initial.status });
    const description = useField({ initialValue: initial.description, validator: appointmentDescriptionSchema, validateOn: "blur" });
    const diagnosis = useField({ initialValue: initial.diagnosis, validator: appointmentDiagnosisSchema, validateOn: "blur" });
    const treatment = useField({ initialValue: initial.treatment, validator: appointmentTreatmentSchema, validateOn: "blur" });
    const cost = useField({ initialValue: initial.cost, validator: appointmentCostSchema, validateOn: "blur" });

    const fields = [petId, userId, roomId, date, hour, description, ...(isEditing ? [diagnosis, treatment, cost] : [])];
    const isFormValid = fields.every((f) => f.valid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = fields.map((f) => f.validate());
        if (!results.every(Boolean)) return;

        const payload: AppointmentFormData = {
            petId: Number(petId.value),
            userId: Number(userId.value),
            roomId: Number(roomId.value),
            date: date.value,
            hour: hour.value,
            description: description.value.trim(),
            status: status.value,
            diagnosis: diagnosis.value.trim(),
            treatment: treatment.value.trim(),
            cost: cost.value ? Number(cost.value) : undefined,
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo guardar la cita.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <Dropdown
                label="Mascota"
                icon={<PawPrint />}
                options={catalogs.petOptions}
                placeholder="Selecciona una mascota"
                searchable
                loading={catalogs.loading}
                {...petId.props}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Dropdown
                    label="Veterinario"
                    icon={<UserRound />}
                    options={catalogs.userOptions}
                    placeholder="Selecciona un veterinario"
                    searchable
                    disabled={fixedUserId !== undefined}
                    loading={catalogs.loading}
                    {...userId.props}
                />
                <Dropdown
                    label="Habitación"
                    icon={<DoorOpen />}
                    options={catalogs.roomOptions}
                    placeholder="Selecciona una habitación"
                    loading={catalogs.loading}
                    {...roomId.props}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField label="Fecha" icon={<CalendarDays />} type="date" min={isEditing ? undefined : todayLocal()} {...date.props} />
                <TextField label="Hora" icon={<Clock />} type="time" {...hour.props} />
                {isEditing && (
                    <Dropdown label="Estado" options={STATUS_OPTIONS} value={status.value} onValueChange={status.setValue} />
                )}
            </div>

            <TextArea
                label="Motivo de la consulta"
                icon={<FileText />}
                placeholder="Control general, vacunación, malestar..."
                maxLength={255}
                clearable
                rows={2}
                {...description.props}
            />

            {isEditing && (
                <div className="flex flex-col gap-4 rounded-xl border border-mint bg-mint/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-text/70">Consulta y diagnóstico médico</p>
                    <TextArea
                        label="Diagnóstico"
                        icon={<Stethoscope />}
                        placeholder="Diagnóstico de la consulta..."
                        maxLength={500}
                        clearable
                        rows={2}
                        {...diagnosis.props}
                    />
                    <TextArea
                        label="Tratamiento"
                        placeholder="Tratamiento prescrito..."
                        maxLength={500}
                        clearable
                        rows={2}
                        {...treatment.props}
                    />
                    <TextField
                        label="Costo (Q)"
                        icon={<Wallet />}
                        placeholder="0.00"
                        inputMode="decimal"
                        maxLength={10}
                        clearable
                        {...cost.props}
                    />
                </div>
            )}

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
                    {isEditing ? "Actualizar" : "Agendar Cita"}
                </Button>
            </div>
        </form>
    );
}
