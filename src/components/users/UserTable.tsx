"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Edit3, ShieldCheck, UserPlus } from "lucide-react";
import { userService, type UserResponse } from "@/services/userService";
import type { UserFormData } from "@/schemas/user.schema";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import UserModal from "@/components/users/UserModal";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import UserRoleBadge from "@/components/users/user-table/UserRoleBadge";
import UserStatusBadge from "@/components/users/user-table/UserStatusBadge";
import { TableColumn } from "../ui/types/tableTypes";
import PageHeader from "../ui/common/PageHeader";
import SearchBar from "../ui/common/SearchBar";
import ConfirmDialog from "../ui/dialogs/Confirmdialog";

type PendingAction = { type: "deactivate" | "reactivate"; user: UserResponse } | null;


//Users table component 
export default function UserTable() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const canCreate = hasPermission("usuarios:crear");
    const canEdit = hasPermission("usuarios:editar");
    const canDeactivate = hasPermission("usuarios:eliminar");

    const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const cargarUsuarios = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await userService.getAll();
            setUsuarios(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudieron cargar los usuarios.";
            setLoadError(message);
            toast.error(message, "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void cargarUsuarios();
    }, [cargarUsuarios]);

    const handleOpenCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserResponse) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (formData: UserFormData) => {
        try {
            if (editingUser) {
                await Promise.all([
                    userService.update(editingUser.id, formData),
                    userService.updateUserRoles(editingUser.id, formData.roleAliases),
                ]);
                toast.success("Usuario actualizado", `${editingUser.name} ${editingUser.firstName}`);
            } else {
                await userService.create(formData);
                toast.success("Usuario creado", `${formData.name} ${formData.firstName}`);
            }
            setIsModalOpen(false);
            await cargarUsuarios();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al guardar usuario.";
            toast.error(message, "Error al guardar");
            throw err;
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        const { type, user } = pendingAction;
        const fullName = `${user.name} ${user.firstName}`.trim();

        try {
            if (type === "deactivate") {
                await userService.delete(user.id);
                toast.warning(`${fullName} desactivado`, "Acceso inhabilitado");
            } else {
                await userService.reactivate(user.id);
                toast.success(`${fullName} reactivado`, "Acceso restaurado");
            }
            setPendingAction(null);
            await cargarUsuarios();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al actualizar el estado.";
            toast.error(message, "Operación fallida");
            throw err;
        }
    };

    const usuariosFiltrados = usuarios.filter((u) =>
        `${u.name} ${u.firstName} ${u.email} ${u.userRegistry}`
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    const columns: TableColumn<UserResponse>[] = [
        {
            key: "name",
            header: "Usuario",
            render: (u) => (
                <>
                    <div className="font-semibold text-text">
                        {u.name} {u.firstName}
                    </div>
                    <div className="text-xs font-medium text-accent">@{u.userRegistry}</div>
                </>
            ),
        },
        {
            key: "identification",
            header: "Identificación",
            className: "font-mono text-xs",
        },
        {
            key: "email",
            header: "Contacto",
            render: (u) => (
                <>
                    <div>{u.email}</div>
                    <div className="text-xs text-text/60">{u.phone}</div>
                </>
            ),
        },
        {
            key: "role",
            header: "Rol",
            render: (u) => <UserRoleBadge roleName={u.roles?.[0]?.name} />,
        },
        {
            key: "status",
            header: "Estado",
            render: (u) => <UserStatusBadge active={u.status} />,
        },
    ];

    const nombrePendiente = pendingAction
        ? `${pendingAction.user.name} ${pendingAction.user.firstName}`.trim()
        : "";

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Gestión de Usuarios"
                subtitle="Administración de accesos y credenciales del personal de Happy Pets."
                action={
                    canCreate && (
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-accent"
                        >
                            <UserPlus className="h-5 w-5" />
                            <span>Registrar Usuario</span>
                        </button>
                    )
                }
            />

            <SearchBar
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por nombre, correo o usuario..."
            />

            <DataTable<UserResponse>
                columns={columns}
                rows={usuariosFiltrados}
                getRowKey={(u) => u.id}
                loading={loading}
                error={loadError}
                loadingLabel="Cargando usuarios..."
                emptyState={{
                    title: "No hay usuarios registrados",
                    description: "Ajusta la búsqueda o registra un nuevo usuario.",
                }}
                actions={
                    canEdit || canDeactivate
                        ? {
                            render: (u) => (
                                <RowActions
                                    actions={[
                                        {
                                            icon: <Edit3 className="h-4 w-4" />,
                                            label: `Editar a ${u.name} ${u.firstName}`,
                                            onClick: () => handleOpenEdit(u),
                                            variant: "default",
                                            visible: canEdit,
                                        },
                                        {
                                            icon: <Ban className="h-4 w-4" />,
                                            label: `Desactivar a ${u.name} ${u.firstName}`,
                                            onClick: () => setPendingAction({ type: "deactivate", user: u }),
                                            variant: "danger",
                                            visible: canDeactivate && u.status,
                                        },
                                        {
                                            icon: <ShieldCheck className="h-4 w-4" />,
                                            label: `Reactivar a ${u.name} ${u.firstName}`,
                                            onClick: () => setPendingAction({ type: "reactivate", user: u }),
                                            variant: "success",
                                            visible: canDeactivate && !u.status,
                                        },
                                    ]}
                                />
                            ),
                        }
                        : undefined
                }
            />

            <UserModal
                isOpen={isModalOpen}
                editingUser={editingUser}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveUser}
            />

            <ConfirmDialog
                open={pendingAction !== null}
                variant={pendingAction?.type === "deactivate" ? "danger" : "warning"}
                title={pendingAction?.type === "deactivate" ? "Desactivar usuario" : "Reactivar usuario"}
                description={
                    pendingAction?.type === "deactivate" ? (
                        <>
                            Vas a desactivar a <strong>{nombrePendiente}</strong>. Ya no podrá acceder al
                            sistema, pero podrás reactivarlo después.
                        </>
                    ) : (
                        <>
                            Vas a reactivar a <strong>{nombrePendiente}</strong>. Volverá a tener acceso al
                            sistema.
                        </>
                    )
                }
                confirmLabel={pendingAction?.type === "deactivate" ? "Desactivar" : "Reactivar"}
                onConfirm={handleConfirmAction}
                onCancel={() => setPendingAction(null)}
            />
        </div>
    );
}