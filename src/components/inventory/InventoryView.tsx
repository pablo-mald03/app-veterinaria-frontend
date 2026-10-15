"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, Package, Pill, Plus, Power, Tags } from "lucide-react";
import Button from "@/components/ui/common/Button";
import Modal from "@/components/ui/common/Modal";
import PageHeader from "@/components/ui/common/PageHeader";
import StatusBadge from "@/components/ui/common/StatusBadge";
import TextField from "@/components/ui/common/TextField";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { categoryService } from "@/services/categoryService";
import type { Category, CategoryRequest } from "@/types/category";

const STATUS_OPTIONS: DropdownOption[] = [
    { value: "", label: "Todas" },
    { value: "true", label: "Activas" },
    { value: "false", label: "Inactivas" },
];

const EMPTY_FORM: CategoryRequest = { name: "", description: "" };

export default function InventoryView() {
    const { hasPermission, hasRole } = useAuth();
    const toast = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState<CategoryRequest>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [pendingId, setPendingId] = useState<number | null>(null);

    const canCreate = hasRole("ADMIN") || hasPermission("inventario:crear");
    const canEdit = hasRole("ADMIN") || hasPermission("inventario:editar");
    const canChangeStatus = hasRole("ADMIN") || hasPermission("inventario:eliminar");

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await categoryService.getAll({
                status: statusFilter ? statusFilter === "true" : undefined,
            });
            setCategories(result.categories);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudieron cargar las categorías.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        void Promise.resolve().then(loadCategories);
    }, [loadCategories]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setForm({ name: category.name, description: category.description });
        setModalOpen(true);
    };

    const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await categoryService.update(editing.id, form);
                toast.success("Categoría actualizada", form.name);
            } else {
                await categoryService.create(form);
                toast.success("Categoría creada", form.name);
            }
            setModalOpen(false);
            await loadCategories();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo guardar la categoría.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (category: Category) => {
        setPendingId(category.id);
        try {
            await categoryService.setStatus(category.id, !category.status);
            toast.success(category.status ? "Categoría desactivada" : "Categoría activada", category.name);
            await loadCategories();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo actualizar la categoría.", "Error");
        } finally {
            setPendingId(null);
        }
    };

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Farmacia e Inventario"
                subtitle="Administra las categorías que organizarán los productos e insumos de la clínica."
                action={canCreate ? <Button icon={<Plus className="h-5 w-5" />} onClick={openCreate}>Nueva categoría</Button> : undefined}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-secondary bg-mint/40 p-5">
                    <div className="mb-3 flex items-center gap-3 text-accent"><Tags className="h-5 w-5" /><span className="font-semibold">Categorías</span></div>
                    <p className="text-3xl font-bold text-text">{categories.length}</p>
                    <p className="mt-1 text-sm text-text/60">Mostradas en esta consulta</p>
                </div>
                <div className="rounded-2xl border border-secondary bg-background p-5">
                    <div className="mb-3 flex items-center gap-3 text-accent"><Package className="h-5 w-5" /><span className="font-semibold">Productos</span></div>
                    <p className="text-lg font-semibold text-text">Próximamente</p>
                    <p className="mt-1 text-sm text-text/60">Aún no existe endpoint de productos.</p>
                </div>
                <div className="rounded-2xl border border-secondary bg-background p-5">
                    <div className="mb-3 flex items-center gap-3 text-accent"><Pill className="h-5 w-5" /><span className="font-semibold">Movimientos</span></div>
                    <p className="text-lg font-semibold text-text">Próximamente</p>
                    <p className="mt-1 text-sm text-text/60">Entradas y salidas pendientes del backend.</p>
                </div>
            </div>

            <section className="rounded-2xl border border-secondary bg-white shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-mint p-5">
                    <div>
                        <h2 className="text-xl font-bold text-text">Categorías de inventario</h2>
                        <p className="text-sm text-text/60">Este catálogo quedará dentro de Farmacia e Inventario.</p>
                    </div>
                    <Dropdown label="Estado" icon={<Power />} options={STATUS_OPTIONS} value={statusFilter} onValueChange={setStatusFilter} />
                </div>

                {loading ? (
                    <p className="p-8 text-center text-text/60">Cargando categorías...</p>
                ) : error ? (
                    <div className="p-8 text-center">
                        <p className="text-danger">{error}</p>
                        <Button className="mx-auto mt-4" onClick={() => void loadCategories()}>Reintentar</Button>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-10 text-center text-text/60">No hay categorías para este filtro.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background text-xs uppercase tracking-wide text-text/60">
                                <tr><th className="px-5 py-4">Nombre</th><th className="px-5 py-4">Descripción</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acciones</th></tr>
                            </thead>
                            <tbody className="divide-y divide-mint">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-background/60">
                                        <td className="px-5 py-4 font-semibold text-text">{category.name}</td>
                                        <td className="px-5 py-4 text-text/70">{category.description}</td>
                                        <td className="px-5 py-4"><StatusBadge active={category.status} activeLabel="Activa" inactiveLabel="Inactiva" /></td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                {canEdit && <Button variant="ghost" className="px-3" icon={<Edit3 className="h-4 w-4" />} onClick={() => openEdit(category)}>Editar</Button>}
                                                {canChangeStatus && <Button variant="ghost" className="px-3" disabled={pendingId === category.id} onClick={() => void toggleStatus(category)}>{category.status ? "Desactivar" : "Activar"}</Button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"} subtitle="Los campos son obligatorios." >
                <form onSubmit={saveCategory} className="space-y-4">
                    <TextField label="Nombre" value={form.name} onValueChange={(value) => setForm((current) => ({ ...current, name: value }))} maxLength={120} required />
                    <TextField label="Descripción" value={form.description} onValueChange={(value) => setForm((current) => ({ ...current, description: value }))} maxLength={255} required />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" loading={saving}>{editing ? "Guardar cambios" : "Crear categoría"}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
