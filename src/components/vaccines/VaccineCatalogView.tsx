"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Plus, RefreshCw, Search, Syringe } from "lucide-react";
import Can from "@/components/auth/Can";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/common/Button";
import PageHeader from "@/components/ui/common/PageHeader";
import TextField from "@/components/ui/common/TextField";
import ConfirmDialog from "@/components/ui/dialogs/Confirmdialog";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import { useToast } from "@/components/ui/toast/ToastProvider";
import VaccineModal from "@/components/vaccines/VaccineModal";
import { useSupplyProducts } from "@/hooks/useSupplyProducts";
import { useVaccineCatalogAdmin } from "@/hooks/useVaccineCatalogAdmin";
import { formatCost } from "@/lib/consultation/money";
import { createTreatment, deactivateTreatment } from "@/services/vaccineCatalogService";
import type { TreatmentResponse } from "@/types/vaccination-api";
import type { TreatmentCatalogInput } from "@/types/vaccines/vaccineCatalog";

//Administración del catálogo de tratamientos y los productos que consumen
export default function VaccineCatalogView() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const { treatments, loading, error, reload } = useVaccineCatalogAdmin();
    const supply = useSupplyProducts(true);
    const [search, setSearch] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [treatmentToDeactivate, setTreatmentToDeactivate] = useState<TreatmentResponse | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return treatments;
        return treatments.filter(
            (t) => t.name.toLowerCase().includes(term) || t.species.some((s) => s.toLowerCase().includes(term)),
        );
    }, [treatments, search]);

    const handleCreate = async (input: TreatmentCatalogInput) => {
        try {
            await createTreatment(input);
            toast.success("Tratamiento creado", input.name);
            setFormOpen(false);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo crear el tratamiento.";
            toast.error(message, "Error al crear tratamiento");
            throw err;
        }
    };

    const handleDeactivate = async () => {
        if (!treatmentToDeactivate) return;
        try {
            setDeactivating(true);
            await deactivateTreatment(treatmentToDeactivate.idTreatment);
            toast.success("Tratamiento desactivado", treatmentToDeactivate.name);
            setTreatmentToDeactivate(null);
            reload();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo desactivar el tratamiento.", "Error");
        } finally {
            setDeactivating(false);
        }
    };

    const columns: TableColumn<TreatmentResponse>[] = [
        { key: "name", header: "Nombre", render: (t) => <span className="font-semibold text-text">{t.name}</span> },
        { key: "species", header: "Especies", render: (t) => (t.species.length > 0 ? t.species.join(", ") : "—") },
        {
            key: "intervalDays",
            header: "Intervalo",
            align: "center",
            render: (t) => (t.intervalDays ? `${t.intervalDays} días` : "Única"),
        },
        {
            key: "products",
            header: "Productos que consume",
            render: (t) =>
                t.products.length === 0 ? (
                    "—"
                ) : (
                    <ul className="flex flex-col gap-0.5 text-xs">
                        {t.products.map((product) => (
                            <li key={product.productId}>
                                {supply.find(String(product.productId))?.name ?? `Producto #${product.productId}`}
                                <span className="text-text/60"> × {product.quantity}</span>
                            </li>
                        ))}
                    </ul>
                ),
        },
        {
            key: "estimatedCost",
            header: "Costo estimado",
            align: "center",
            render: (t) => formatCost(t.estimatedCost),
        },
        {
            key: "status",
            header: "Estado",
            align: "center",
            render: (t) =>
                t.status ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary bg-mint px-2.5 py-1 text-xs font-semibold text-text/60">
                        <Ban className="h-3.5 w-3.5" /> Inactivo
                    </span>
                ),
        },
    ];

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Catálogo de tratamientos"
                subtitle="Tratamientos disponibles y los productos del inventario que consume cada aplicación."
                action={
                    <Can permission="vacunacion:crear">
                        <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                            Nuevo Tratamiento
                        </Button>
                    </Can>
                }
            />

            <TextField
                label="Buscar"
                icon={<Search />}
                placeholder="Nombre o especie..."
                value={search}
                onValueChange={setSearch}
                clearable
            />

            <DataTable
                columns={columns}
                rows={filtered}
                getRowKey={(t) => t.idTreatment}
                loading={loading}
                error={error}
                loadingLabel="Cargando catálogo..."
                emptyState={{
                    title: search ? "Sin resultados" : "Aún no hay tratamientos registrados",
                    description: search ? "Prueba con otro nombre o especie." : "Crea el primer tratamiento del catálogo.",
                    icon: <Syringe className="h-6 w-6 text-accent" />,
                }}
                actions={
                    hasPermission("vacunacion:eliminar")
                        ? {
                            header: "Acciones",
                            render: (t) => (
                                <RowActions
                                    actions={[
                                        {
                                            icon: <Ban className="h-4 w-4" />,
                                            label: "Desactivar",
                                            onClick: () => setTreatmentToDeactivate(t),
                                            variant: "danger",
                                            visible: t.status,
                                        },
                                    ]}
                                />
                            ),
                        }
                        : undefined
                }
            />

            {error && (
                <Button type="button" variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
                    Reintentar
                </Button>
            )}

            <VaccineModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleCreate} />

            <ConfirmDialog
                open={treatmentToDeactivate !== null}
                title="Desactivar Tratamiento"
                description={
                    <>
                        ¿Desactivar <strong>{treatmentToDeactivate?.name}</strong>? Dejará de aparecer como opción al
                        registrar nuevos tratamientos, pero el historial ya registrado no se modifica.
                    </>
                }
                variant="warning"
                confirmLabel="Desactivar"
                loading={deactivating}
                onConfirm={handleDeactivate}
                onCancel={() => setTreatmentToDeactivate(null)}
            />
        </div>
    );
}
