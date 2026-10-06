// src/components/users/UserTable.tsx
"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { userService, type UserResponse } from "@/services/userService";
import type { UserFormData } from "@/schemas/user.schema";
import { useAuth } from "@/components/auth/AuthProvider";
import UserModal from "@/components/users/UserModal";
import UserTableHeader from "@/components/users/user-table/UserTableHeader";
import UserSearchBar from "@/components/users/user-table/UserSearchBar";
import UserRow from "@/components/users/user-table/UserRow";
import ConfirmDialog from "../ui/Confirmdialog";
import { useToast } from "../ui/toast/ToastProvider";

type PendingAction = { type: "deactivate" | "reactivate"; user: UserResponse } | null;

const COLUMNS = ["Usuario", "Identificación", "Contacto", "Rol", "Estado", "Acciones"] as const;

//Users table component 
export default function UserTable() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const canCreate = hasPermission("usuarios:crear");
    const canEdit = hasPermission("usuarios:editar");
    const canDeactivate = hasPermission("usuarios:eliminar");

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            setUsuarios(data);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleOpenCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserResponse) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);


    const handleSaveUser = async (formData: UserFormData) => {
        try {
            if (editingUser) {
                await Promise.all([
                    userService.update(editingUser.id, formData),
                    userService.updateUserRoles(editingUser.id, formData.roleAliases),
                ]);
            } else {
                await userService.create(formData);
            }
            setIsModalOpen(false);
            cargarUsuarios();
            toast.success("Usuario guardado", editingUser ? "Actualizado" : "Creado");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Error al guardar usuario",
                "No se pudo guardar"
            );
            throw err;
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        const { type, user } = pendingAction;

        try {
            if (type === "deactivate") {
                await userService.delete(user.id);
                toast.warning(`${user.name} fue desactivado`, "Acceso inhabilitado");
            } else {
                await userService.reactivate(user.id);
                toast.success(`${user.name} fue reactivado`, "Acceso restaurado");
            }
            setPendingAction(null);
            cargarUsuarios();
        } catch (err) {
            toast.error(
                type === "deactivate"
                    ? "Error al desactivar el usuario."
                    : "Error al reactivar el usuario.",
                "Operación fallida"
            );
        }
    };

    const usuariosFiltrados = usuarios.filter((u) =>
        `${u.name} ${u.firstName} ${u.email} ${u.userRegistry}`
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    const nombrePendiente = pendingAction
        ? `${pendingAction.user.name} ${pendingAction.user.firstName}`.trim()
        : "";

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <UserTableHeader canCreate={canCreate} onCreate={handleOpenCreate} />

            <UserSearchBar value={busqueda} onChange={setBusqueda} />

            <div className="overflow-hidden rounded-2xl border border-secondary/50 bg-white shadow-md">
                <table className="w-full text-left text-sm text-text">
                    <thead className="bg-mint text-xs font-bold uppercase tracking-wider text-accent">
                        <tr>
                            {COLUMNS.map((col) => (
                                <th key={col} className={`p-4 ${col === "Acciones" ? "text-center" : ""}`}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mint">
                        {loading ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="p-8 text-center text-text/60">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                                        <span>Cargando usuarios...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : usuariosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="p-8 text-center text-text/60">
                                    No hay usuarios registrados que coincidan con la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            usuariosFiltrados.map((u) => (
                                <UserRow
                                    key={u.id}
                                    user={u}
                                    canEdit={canEdit}
                                    canDeactivate={canDeactivate}
                                    onEdit={handleOpenEdit}
                                    onDeactivate={(user) => setPendingAction({ type: "deactivate", user })}
                                    onReactivate={(user) => setPendingAction({ type: "reactivate", user })}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                editingUser={editingUser}
                onClose={handleCloseModal}
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