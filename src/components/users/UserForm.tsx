// src/components/users/UserForm.tsx
"use client";

import { useEffect, useState } from "react";
import { AtSign, IdCard, Lock, Mail, Phone, Shield, User } from "lucide-react";
import Button from "@/components/ui/common/Button";
import Dropdown from "@/components/ui/common/Dropdown";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { roleService } from "@/services/roleService";
import type { Role } from "@/types/roles/role";
import {
    lastNameSchema,
    nameSchema,
    phoneSchema,
    roleSchema,
    userRegistrySchema,
} from "@/schemas/user-fields.schema";
import { dpiSchema, emailSchema, loginPasswordSchema } from "@/schemas/auth.schema";
import type { UserFormData } from "@/schemas/user.schema";
import type { UserResponse } from "@/services/userService";

interface UserFormProps {
    editingUser: UserResponse | null;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel: () => void;
}

//Principal user form model component
export default function UserForm({ editingUser, onSubmit, onCancel }: UserFormProps) {
    const isEditing = Boolean(editingUser);
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [rolesError, setRolesError] = useState(false);

    useEffect(() => {
        let active = true;

        roleService
            .getAll()
            .then((data) => {
                if (active) setRoles(data);
            })
            .catch(() => {
                if (active) setRolesError(true);
            })
            .finally(() => {
                if (active) setRolesLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const name = useField({
        initialValue: editingUser?.name ?? "",
        validator: nameSchema,
        validateOn: "blur",
    });

    const lastName = useField({
        initialValue: editingUser?.firstName ?? "",
        validator: lastNameSchema,
        validateOn: "blur",
    });

    const email = useField({
        initialValue: editingUser?.email ?? "",
        validator: emailSchema,
        validateOn: "blur",
    });

    const phone = useField({
        initialValue: editingUser?.phone ?? "",
        validator: phoneSchema,
        validateOn: "blur",
    });

    const userRegistry = useField({
        initialValue: editingUser?.userRegistry ?? "",
        validator: userRegistrySchema,
        validateOn: "blur",
    });

    const identification = useField({
        initialValue: editingUser?.identification ?? "",
        validator: dpiSchema,
        validateOn: "blur",
    });

    const rawPassword = useField({
        initialValue: "",
        validator: loginPasswordSchema,
        validateOn: "blur",
    });

    const [roleAlias, setRoleAlias] = useState<string>(editingUser?.roles?.[0]?.alias ?? "");
    const [roleError, setRoleError] = useState<string | undefined>();

    const validateRole = () => {
        const result = roleSchema.safeParse(roleAlias);
        setRoleError(result.success ? undefined : result.error.issues[0]?.message);
        return result.success;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const nameOk = name.validate();
        const lastNameOk = lastName.validate();
        const emailOk = email.validate();
        const phoneOk = phone.validate();
        const userRegistryOk = userRegistry.validate();
        const identificationOk = identification.validate();
        const passwordOk = isEditing ? true : rawPassword.validate();
        const roleOk = validateRole();

        if (
            !nameOk ||
            !lastNameOk ||
            !emailOk ||
            !phoneOk ||
            !userRegistryOk ||
            !identificationOk ||
            !passwordOk ||
            !roleOk
        ) {
            return;
        }

        const payload: UserFormData = {
            name: name.value.trim(),
            firstName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            userRegistry: userRegistry.value.trim(),
            identification: identification.value.trim(),
            roleAliases: [roleAlias],
            rawPassword: isEditing
                ? rawPassword.value.trim()
                    ? rawPassword.value
                    : undefined
                : rawPassword.value,
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "Error al guardar usuario.");
        } finally {
            setSubmitting(false);
        }
    };

    const roleOptions = roles.map((r) => ({ value: r.alias, label: r.name }));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {generalError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                    <span>{generalError}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Nombre" icon={<User />} placeholder="Juan" {...name.props} />
                <TextField label="Apellido" icon={<User />} placeholder="Pérez" {...lastName.props} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Correo Electrónico"
                    type="email"
                    icon={<Mail />}
                    placeholder="juan@happypets.com"
                    {...email.props}
                />
                <TextField
                    label="Teléfono"
                    type="tel"
                    inputMode="numeric"
                    icon={<Phone />}
                    placeholder="55555555"
                    {...phone.props}
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 8);
                    }}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField
                    label="Usuario"
                    icon={<AtSign />}
                    placeholder="jperez"
                    {...userRegistry.props}
                />
                <TextField
                    label="Identificación / DPI"
                    type="text"
                    inputMode="numeric"
                    icon={<IdCard />}
                    placeholder="1234567890123"
                    {...identification.props}
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 13);
                    }}
                />
                <Dropdown
                    label="Rol del Sistema"
                    icon={<Shield />}
                    options={roleOptions}
                    value={roleAlias}
                    onValueChange={(v) => {
                        setRoleAlias(v);
                        if (roleError) setRoleError(undefined);
                    }}
                    onBlur={validateRole}
                    error={roleError}
                    message={rolesError ? "No se pudieron cargar los roles." : undefined}
                    messageVariant="warning"
                    loading={rolesLoading}
                    placeholder="Selecciona un rol"
                    emptyMessage="No hay roles disponibles."
                    disabled={submitting}
                />
            </div>

            {!isEditing && (
                <TextField
                    label="Contraseña"
                    type="password"
                    icon={<Lock />}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...rawPassword.props}
                />
            )}

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={submitting} loadingLabel="Guardando...">
                    {isEditing ? "Actualizar" : "Crear Usuario"}
                </Button>
            </div>
        </form>
    );
}