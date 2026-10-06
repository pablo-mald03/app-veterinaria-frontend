"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Modal from "@/components/ui/common/Modal";
import Spinner from "@/components/ui/common/Spinner";
import DualListBox, {
    type DualListBoxItem,
} from "@/components/ui/common/DualListBox";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { Role, roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import type { Permission } from "@/types/permissions/permission";
import { RoleWithPermissions } from "@/types/roles/role";

interface RolePermissionsModalProps {
    open: boolean;
    role: Role | null;
    onClose: () => void;
    onSaved?: () => void;
}

function toItem(permission: Permission): DualListBoxItem {
    return {
        id: permission.id,
        label: permission.description,
        hint: `${permission.module}:${permission.action}`,
        group: permission.module,
    };
}

//Role permission component
export default function RolePermissionsModal({
    open,
    role,
    onClose,
    onSaved,
}: RolePermissionsModalProps) {
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [roleDetail, setRoleDetail] = useState<RoleWithPermissions | null>(null);
    const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());

    // Fetch permissions and current role permissions when the modal opens
    useEffect(() => {
        if (!open || !role) return;

        let active = true;
        setLoading(true);
        setLoadError(null);
        setRoleDetail(null);
        setAssignedIds(new Set());

        Promise.all([
            permissionService.getAll(),
            roleService.getWithPermissions(role.id),
        ])
            .then(([permissions, detail]) => {
                if (!active) return;
                setAllPermissions(permissions);
                setRoleDetail(detail);
                setAssignedIds(new Set(detail.permissions.map((p) => p.id)));
            })
            .catch((err) => {
                if (!active) return;
                const message =
                    err instanceof Error ? err.message : "No se pudieron cargar los permisos.";
                setLoadError(message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [open, role]);

    const availableItems = useMemo(
        () => allPermissions.filter((p) => !assignedIds.has(p.id)).map(toItem),
        [allPermissions, assignedIds]
    );

    const assignedItems = useMemo(
        () => allPermissions.filter((p) => assignedIds.has(p.id)).map(toItem),
        [allPermissions, assignedIds]
    );

    const handleChange = (nextAssigned: DualListBoxItem[]) => {
        setAssignedIds(new Set(nextAssigned.map((i) => i.id)));
    };

    const handleSave = async () => {
        if (!role || !roleDetail) return;

        const current = new Set(roleDetail.permissions.map((p) => p.id));
        const next = assignedIds;

        const sameSize = current.size === next.size;
        const sameContent = sameSize && [...current].every((id) => next.has(id));
        if (sameContent) {
            toast.info("Sin cambios que guardar", role.name);
            onClose();
            return;
        }

        try {
            setSaving(true);
            await roleService.updatePermissions(role.id, [...next]);
            toast.success("Permisos actualizados", role.name);
            onSaved?.();
            onClose();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "No se pudieron guardar los permisos.";
            toast.error(message, "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const busy = loading || saving;
    const canSave = !loading && !saving && !loadError && roleDetail !== null;

    return (
        <Modal
            open={open}
            onClose={busy ? () => { } : onClose}
            size="2xl"
            title={`Permisos · ${role?.name ?? ""}`}
            subtitle="Asigna o revoca los permisos de este rol."
            dismissible={!busy}
        >
            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner />
                </div>
            ) : loadError ? (
                <div className="flex flex-col gap-4">
                    <Alert variant="error">{loadError}</Alert>
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    <DualListBox
                        available={availableItems}
                        assigned={assignedItems}
                        onChange={handleChange}
                        availableLabel="Permisos disponibles"
                        assignedLabel="Permisos asignados"
                        searchPlaceholder="Buscar permiso por nombre o módulo..."
                        emptyAvailableMessage="Todos los permisos están asignados."
                        emptyAssignedMessage="Este rol no tiene permisos asignados."
                        disabled={saving}
                    />

                    <div className="flex justify-end gap-3 border-t border-mint pt-4">
                        <Button variant="ghost" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            loading={saving}
                            loadingLabel="Guardando..."
                            disabled={!canSave}
                        >
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}