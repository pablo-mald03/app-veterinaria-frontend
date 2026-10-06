"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import InfiniteScroll from "@/components/ui/common/InfiniteScroll";
import Spinner from "@/components/ui/common/Spinner";
import PageHeader from "@/components/ui/common/PageHeader";
import RoleCard from "@/components/roles/RoleCard";
import RoleModal from "@/components/roles/RoleModal";
import RolePermissionsModal from "@/components/roles/RolePermissionsModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { roleService } from "@/services/roleService";
import type { Role } from "@/types/roles/role";
import ConfirmDialog from "../ui/dialogs/Confirmdialog";

const PAGE_SIZE = 12;

type PendingToggle = { role: Role; nextActive: boolean } | null;

//Role view component
export default function RoleView() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const canCreate = hasPermission("roles:crear");
    const canEdit = hasPermission("roles:editar");
    const canDelete = hasPermission("roles:eliminar");

    const [roles, setRoles] = useState<Role[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
    const [pendingToggle, setPendingToggle] = useState<PendingToggle>(null);

    const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);

    const fetchingRef = useRef(false);

    const fetchPage = useCallback(async (nextPage: number, replace = false) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        setLoading(true);
        setLoadError(null);

        try {
            const data = await roleService.getPage(nextPage, PAGE_SIZE);
            setRoles((current) => (replace ? data.content : [...current, ...data.content]));
            setHasMore(nextPage + 1 < data.totalPages);
            setPage(nextPage);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudieron cargar los roles.";
            setLoadError(message);
            toast.error(message, "Error al cargar roles");
        } finally {
            setLoading(false);
            setInitialLoading(false);
            fetchingRef.current = false;
        }
    }, [toast]);

    useEffect(() => {
        void fetchPage(0, true);
    }, [fetchPage]);

    const handleLoadMore = () => {
        if (!hasMore || loading) return;
        void fetchPage(page + 1);
    };

    const handleReload = () => {
        setRoles([]);
        setHasMore(true);
        setPage(0);
        void fetchPage(0, true);
    };

    // --- Modal CRUD ---
    const openCreate = () => {
        setEditingRole(null);
        setModalOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setModalOpen(true);
    };

    const handleSubmit = async (data: Omit<Role, "id">) => {
        try {
            if (editingRole) {
                await roleService.update(editingRole.id, {
                    alias: data.alias,
                    name: data.name,
                    description: data.description,
                });
                toast.success("Rol actualizado", data.name);
            } else {
                await roleService.create({
                    alias: data.alias,
                    name: data.name,
                    description: data.description,
                    permissionIds: [],
                });
                toast.success("Rol creado", data.name);
            }
            setModalOpen(false);
            handleReload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo guardar el rol.";
            toast.error(message, "Error al guardar");
            throw err;
        }
    };

    // --- Delete ---
    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await roleService.delete(pendingDelete.id);
            toast.warning(`${pendingDelete.name} eliminado`, "Rol removido");
            setPendingDelete(null);
            handleReload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo eliminar el rol.";
            toast.error(message, "Error al eliminar");
            throw err;
        }
    };

    // --- Toggle status ---
    const confirmToggle = async () => {
        if (!pendingToggle) return;
        try {
            await roleService.updateStatus(pendingToggle.role.id, pendingToggle.nextActive);
            toast.success(
                pendingToggle.nextActive ? "Rol activado" : "Rol desactivado",
                pendingToggle.role.name
            );
            setPendingToggle(null);
            handleReload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo cambiar el estado.";
            toast.error(message, "Error al actualizar");
            throw err;
        }
    };

    // --- Permissions modal ---
    const openPermissions = (role: Role) => setPermissionsRole(role);

    const filteredRoles = search.trim()
        ? roles.filter((r) => {
            const q = search.trim().toLowerCase();
            return (
                r.name.toLowerCase().includes(q) ||
                r.alias.toLowerCase().includes(q) ||
                (r.description?.toLowerCase().includes(q) ?? false)
            );
        })
        : roles;

    const showEmpty = !initialLoading && !loadError && filteredRoles.length === 0;

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Gestión de Roles"
                subtitle="Administra los roles y permisos del sistema."
                action={
                    canCreate && (
                        <Button
                            type="button"
                            variant="primary"
                            icon={<Plus className="h-5 w-5" />}
                            onClick={openCreate}
                        >
                            Crear Rol
                        </Button>
                    )
                }
            />

            <div className="flex items-center gap-3 rounded-2xl border border-secondary/50 bg-white p-3 shadow-sm">
                <Search className="h-5 w-5 text-accent" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, alias o descripción..."
                    className="w-full text-sm text-text outline-none placeholder:text-text/40"
                />
            </div>

            {loadError && !initialLoading && <Alert variant="error">{loadError}</Alert>}

            <InfiniteScroll
                onLoadMore={handleLoadMore}
                hasMore={hasMore && !search.trim()}
                loading={loading && !initialLoading}
                endMessage={!hasMore && filteredRoles.length > 0 ? "No hay más roles." : null}
                className=""
            >
                {initialLoading ? (
                    <div className="flex justify-center py-14">
                        <Spinner />
                    </div>
                ) : showEmpty ? (
                    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-secondary py-14 text-center">
                        <p className="text-sm font-medium text-text">
                            {search.trim() ? "No se encontraron roles" : "Aún no hay roles registrados"}
                        </p>
                        <p className="text-xs text-text/60">
                            {search.trim() ? "Ajusta la búsqueda." : "Crea el primer rol para empezar."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRoles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canToggle={canEdit}
                                onEdit={openEdit}
                                onDelete={setPendingDelete}
                                onManagePermissions={openPermissions}
                                onToggleStatus={(r) =>
                                    setPendingToggle({ role: r, nextActive: !(r.active ?? true) })
                                }
                            />
                        ))}
                    </div>
                )}
            </InfiniteScroll>

            <RoleModal
                open={modalOpen}
                role={editingRole}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <RolePermissionsModal
                open={permissionsRole !== null}
                role={permissionsRole}
                onClose={() => setPermissionsRole(null)}
                onSaved={handleReload}
            />

            <ConfirmDialog
                open={pendingDelete !== null}
                variant="danger"
                title="Eliminar rol"
                description={
                    <>
                        Vas a eliminar el rol <strong>{pendingDelete?.name}</strong>. Los usuarios que lo
                        tengan asignado perderán los permisos asociados. Esta acción no se puede deshacer.
                    </>
                }
                confirmLabel="Eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />

            <ConfirmDialog
                open={pendingToggle !== null}
                variant={pendingToggle?.nextActive ? "info" : "warning"}
                title={pendingToggle?.nextActive ? "Activar rol" : "Desactivar rol"}
                description={
                    pendingToggle?.nextActive ? (
                        <>
                            Vas a activar <strong>{pendingToggle.role.name}</strong>. Los usuarios con este
                            rol volverán a heredar sus permisos.
                        </>
                    ) : (
                        <>
                            Vas a desactivar <strong>{pendingToggle?.role.name}</strong>. Los usuarios con
                            este rol perderán temporalmente los permisos asociados.
                        </>
                    )
                }
                confirmLabel={pendingToggle?.nextActive ? "Activar" : "Desactivar"}
                onConfirm={confirmToggle}
                onCancel={() => setPendingToggle(null)}
            />
        </div>
    );
}