"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Tag, FileText } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Spinner from "@/components/ui/common/Spinner";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import DualListBox, {
    type DualListBoxItem,
} from "@/components/ui/common/DualListBox";
import { useField } from "@/hooks/useField";
import {
    roleAliasSchema,
    roleDescriptionSchema,
    roleNameSchema,
} from "@/schemas/role.schema";
import { roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import type { Permission } from "@/types/permissions/permission";
import type { Role } from "@/types/roles/role";

export type RoleFormValues = Omit<Role, "id"> & { permissionIds?: number[] };

interface RoleFormProps {
    role?: Role | null;
    onSubmit: (data: RoleFormValues) => Promise<void>;
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

function toItem(permission: Permission): DualListBoxItem {
    return {
        id: permission.id,
        label: permission.description,
        hint: `${permission.module}:${permission.action}`,
        group: permission.module,
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

    // --- Permissions (DualListBox) ---
    const roleId = role?.id;
    const [loadingPerms, setLoadingPerms] = useState(true);
    const [permsError, setPermsError] = useState<string | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
    const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());

    // Load the permission catalog (and the role's current ones when editing)
    useEffect(() => {
        let active = true;
        setLoadingPerms(true);
        setPermsError(null);

        Promise.all([
            permissionService.getAll(),
            roleId !== undefined ? roleService.getWithPermissions(roleId) : Promise.resolve(null),
        ])
            .then(([permissions, detail]) => {
                if (!active) return;
                const ids = new Set(detail?.permissions.map((p) => p.id) ?? []);
                setAllPermissions(permissions);
                setInitialIds(ids);
                setAssignedIds(new Set(ids));
            })
            .catch((err) => {
                if (!active) return;
                setPermsError(
                    err instanceof Error ? err.message : "No se pudieron cargar los permisos."
                );
            })
            .finally(() => {
                if (active) setLoadingPerms(false);
            });

        return () => {
            active = false;
        };
    }, [roleId]);

    const availableItems = useMemo(
        () => allPermissions.filter((p) => !assignedIds.has(p.id)).map(toItem),
        [allPermissions, assignedIds]
    );

    const assignedItems = useMemo(
        () => allPermissions.filter((p) => assignedIds.has(p.id)).map(toItem),
        [allPermissions, assignedIds]
    );

    const handlePermissionsChange = (next: DualListBoxItem[]) => {
        setAssignedIds(new Set(next.map((i) => i.id)));
    };

    const permissionsChanged =
        assignedIds.size !== initialIds.size ||
        [...assignedIds].some((id) => !initialIds.has(id));

    const isFormValid = alias.valid && name.valid && description.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [alias.validate(), name.validate(), description.validate()];
        if (!results.every(Boolean)) return;

        // Create: always send the selection. Edit: only when it changed and the
        // current permissions were loaded (otherwise we'd wipe them by mistake).
        const permissionIds = isEditing
            ? permissionsChanged && !permsError
                ? [...assignedIds]
                : undefined
            : [...assignedIds];

        const payload: RoleFormValues = {
            alias: alias.value.trim().toUpperCase(),
            name: name.value.trim(),
            description: description.value.trim() || undefined,
            active: role?.active ?? true,
            permissionIds,
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

            <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-text">
                    Permisos
                    <span className="ml-1 font-normal text-text/50">({assignedIds.size} asignados)</span>
                </p>

                {loadingPerms ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        {permsError && (
                            <Alert variant="error">
                                {permsError}
                                {isEditing
                                    ? " Puedes guardar la información del rol; sus permisos no se modificarán."
                                    : " El rol se creará sin permisos."}
                            </Alert>
                        )}
                        {!permsError && (
                            // Enter inside the search box must not submit the form
                            <div
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <DualListBox
                                    available={availableItems}
                                    assigned={assignedItems}
                                    onChange={handlePermissionsChange}
                                    availableLabel="Permisos disponibles"
                                    assignedLabel="Permisos asignados"
                                    searchPlaceholder="Buscar permiso por nombre o módulo..."
                                    emptyAvailableMessage="Todos los permisos están asignados."
                                    emptyAssignedMessage="Este rol no tiene permisos asignados."
                                    disabled={submitting}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    loadingLabel="Guardando..."
                    disabled={!isFormValid || submitting || loadingPerms}
                >
                    {isEditing ? "Actualizar" : "Crear Rol"}
                </Button>
            </div>
        </form>
    );
}