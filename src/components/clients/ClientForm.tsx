"use client";

import { useState } from "react";
import { IdCard, Mail, MapPin, Phone, User } from "lucide-react";
import { useField } from "@/hooks/useField";
import {
    clientAddressSchema,
    clientDpiSchema,
    clientEmailSchema,
    clientFirstNameSchema,
    clientLastNameSchema,
    clientPhoneSchema,
} from "@/schemas/client.schema";
import type { ClientRequest, ClientResponse } from "@/types/client-api";
import TextField from "../ui/common/TextField";
import Button from "../ui/common/Button";
import TextArea from "../ui/common/TextArea";
import Alert from "../ui/common/Alert";

interface ClientFormProps {
    clienteEditando: ClientResponse | null;
    onSubmit: (data: ClientRequest) => Promise<void>;
    onCancel: () => void;
}

// Derivate the data with the edit mode
function buildInitialData(cliente: ClientResponse | null): ClientRequest {
    if (!cliente) {
        return { dpi: "", firstName: "", lastName: "", email: "", phone: "", address: "" };
    }
    return {
        dpi: cliente.dpi ?? "",
        firstName: cliente.firstName ?? cliente.firtsName ?? "",
        lastName: cliente.lastName ?? "",
        email: cliente.email ?? "",
        phone: cliente.phone ?? "",
        address: cliente.address ?? "",
    };
}

//Principal client form component
export default function ClientForm({ clienteEditando, onSubmit, onCancel }: ClientFormProps) {
    const isEditing = Boolean(clienteEditando);
    const initial = buildInitialData(clienteEditando);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const dpi = useField({
        initialValue: initial.dpi,
        validator: clientDpiSchema,
        validateOn: "blur",
    });

    const firstName = useField({
        initialValue: initial.firstName,
        validator: clientFirstNameSchema,
        validateOn: "blur",
    });

    const lastName = useField({
        initialValue: initial.lastName,
        validator: clientLastNameSchema,
        validateOn: "blur",
    });

    const email = useField({
        initialValue: initial.email,
        validator: clientEmailSchema,
        validateOn: "blur",
    });

    const phone = useField({
        initialValue: initial.phone,
        validator: clientPhoneSchema,
        validateOn: "blur",
    });

    const address = useField({
        initialValue: initial.address,
        validator: clientAddressSchema,
        validateOn: "blur",
    });

    const isFormValid =
        dpi.valid &&
        firstName.valid &&
        lastName.valid &&
        email.valid &&
        phone.valid &&
        address.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [
            dpi.validate(),
            firstName.validate(),
            lastName.validate(),
            email.validate(),
            phone.validate(),
            address.validate(),
        ];

        if (!results.every(Boolean)) return;

        const payload: ClientRequest = {
            dpi: dpi.value.trim(),
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim(),
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo guardar el cliente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="DPI / Identificación"
                    icon={<IdCard />}
                    placeholder="1234567890123"
                    maxLength={13}
                    {...dpi.props}
                />
                <TextField
                    label="Teléfono"
                    icon={<Phone />}
                    placeholder="5555-5555"
                    {...phone.props}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Nombres"
                    icon={<User />}
                    placeholder="Juan Carlos"
                    {...firstName.props}
                />
                <TextField
                    label="Apellidos"
                    icon={<User />}
                    placeholder="Pérez López"
                    {...lastName.props}
                />
            </div>

            <TextField
                label="Correo Electrónico"
                type="email"
                icon={<Mail />}
                placeholder="juan@happypets.com"
                clearable
                {...email.props}
            />

            <TextArea
                label="Dirección"
                icon={<MapPin />}
                placeholder="Ciudad, zona, referencias..."
                clearable
                rows={3}
                {...address.props}
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
                    {isEditing ? "Actualizar" : "Guardar Cliente"}
                </Button>
            </div>
        </form>
    );
}