"use client";

import { useState } from "react";
import { KeyRound, Tag, FileText } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import {
    roleAliasSchema,
    roleDescriptionSchema,
    roleNameSchema,
} from "@/schemas/role.schema";
import type { Role } from "@/types/roles/role";

interface RoleFormProps {
    role?: Role | null;
    onSubmit: (data: Omit<Role, "id">) => Promise<void>;
    onCancel: () => void;
}

interface RoleFormState {
    alias: string;
    name: string;
    description: string;
}

function buildInitial(role: Role | null | undefined): RoleFormState {
    return {
        alias: role?.alias ?? "",
        name: role?.name ?? "",
        description: role?.description ?? "",
    };
}

//Role form component
export default function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
    const isEditing = Boolean(role);
    const initial = buildInitial(role);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const alias = useField({
        initialValue: initial.alias,
        validator: roleAliasSchema,
        validateOn: "blur",
    });

    const name = useField({
        initialValue: initial.name,
        validator: roleNameSchema,
        validateOn: "blur",
    });

    const description = useField({
        initialValue: initial.description,
        validator: roleDescriptionSchema,
        validateOn: "blur",
    });

    const isFormValid = alias.valid && name.valid && description.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [alias.validate(), name.validate(), description.validate()];
        if (!results.every(Boolean)) return;

        const payload: Omit<Role, "id"> = {
            alias: alias.value.trim().toUpperCase(),
            name: name.value.trim(),
            description: description.value.trim() || undefined,
            active: role?.active ?? true,
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(
                err instanceof Error ? err.message : "No se pudo guardar el rol."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <TextField
                label="Alias"
                icon={<KeyRound />}
                placeholder="VETERINARIO"
                disabled={isEditing}
                message={isEditing ? "El alias no se puede modificar una vez creado." : undefined}
                {...alias.props}
            />

            <TextField
                label="Nombre"
                icon={<Tag />}
                placeholder="Veterinario"
                {...name.props}
            />

            <TextArea
                label="Descripción"
                icon={<FileText />}
                placeholder="Encargado de la atención médica de los pacientes..."
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
                    {isEditing ? "Actualizar" : "Crear Rol"}
                </Button>
            </div>
        </form>
    );
}