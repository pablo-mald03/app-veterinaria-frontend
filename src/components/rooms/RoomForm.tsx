"use client";

import { useState } from "react";
import { DoorOpen, FileText, Hash, MapPin } from "lucide-react";
import { useField } from "@/hooks/useField";
import { digitsOnly } from "@/lib/forms/transform";
import {
    roomDescriptionSchema,
    roomLocationSchema,
    roomNameSchema,
    roomNumberSchema,
} from "@/schemas/room.schema";
import type { RoomDetailResponse, RoomRequest } from "@/types/room";
import TextField from "@/components/ui/common/TextField";
import TextArea from "@/components/ui/common/TextArea";
import Button from "@/components/ui/common/Button";
import Alert from "@/components/ui/common/Alert";

interface RoomFormProps {
    editingRoom: RoomDetailResponse | null;
    onSubmit: (data: RoomRequest) => Promise<void>;
    onCancel: () => void;
}

//Initial values derived from the edit mode
function buildInitialData(room: RoomDetailResponse | null) {
    return {
        name: room?.name ?? "",
        number: room ? String(room.number) : "",
        location: room?.location ?? "",
        description: room?.description ?? "",
    };
}

//Principal room form component
export default function RoomForm({ editingRoom, onSubmit, onCancel }: RoomFormProps) {
    const isEditing = Boolean(editingRoom);
    const initial = buildInitialData(editingRoom);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const name = useField({ initialValue: initial.name, validator: roomNameSchema, validateOn: "blur" });
    const number = useField({ initialValue: initial.number, validator: roomNumberSchema, validateOn: "blur", transform: digitsOnly });
    const location = useField({ initialValue: initial.location, validator: roomLocationSchema, validateOn: "blur" });
    const description = useField({ initialValue: initial.description, validator: roomDescriptionSchema, validateOn: "blur" });

    const fields = [name, number, location, description];
    const isFormValid = fields.every((f) => f.valid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = fields.map((f) => f.validate());
        if (!results.every(Boolean)) return;

        const payload: RoomRequest = {
            name: name.value.trim(),
            number: Number(number.value),
            location: location.value.trim(),
            description: description.value.trim(),
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo guardar la habitación.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <TextField
                        label="Nombre"
                        icon={<DoorOpen />}
                        placeholder="Sala de cirugía"
                        maxLength={100}
                        clearable
                        {...name.props}
                    />
                </div>
                <TextField
                    label="Número"
                    icon={<Hash />}
                    placeholder="101"
                    inputMode="numeric"
                    maxLength={10}
                    {...number.props}
                />
            </div>

            <TextField
                label="Ubicación"
                icon={<MapPin />}
                placeholder="Segundo nivel, ala norte"
                maxLength={100}
                clearable
                {...location.props}
            />

            <TextArea
                label="Descripción"
                icon={<FileText />}
                placeholder="Equipamiento, capacidad, uso de la habitación..."
                maxLength={255}
                clearable
                rows={3}
                {...description.props}
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
                    {isEditing ? "Actualizar" : "Guardar Habitación"}
                </Button>
            </div>
        </form>
    );
}
