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
import { useVaccineCatalogAdmin } from "@/hooks/useVaccineCatalogAdmin";
import { createVaccine, deactivateVaccine } from "@/services/vaccineCatalogService";
import type { VaccineResponse } from "@/types/vaccination-api";
import type { VaccineCatalogInput } from "@/types/vaccines/vaccineCatalog";

//Administración del catálogo de vacunas (módulo temporal, ver docs/vaccine-catalog-frontend.md)
export default function VaccineCatalogView() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const { vaccines, loading, error, reload } = useVaccineCatalogAdmin();
    const [search, setSearch] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [vaccineToDeactivate, setVaccineToDeactivate] = useState<VaccineResponse | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return vaccines;
        return vaccines.filter(
            (v) => v.name.toLowerCase().includes(term) || v.species.toLowerCase().includes(term),
        );
    }, [vaccines, search]);

    const handleCreate = async (input: VaccineCatalogInput) => {
        try {
            await createVaccine(input);
            toast.success("Vacuna creada", input.name);
            setFormOpen(false);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo crear la vacuna.";
            toast.error(message, "Error al crear vacuna");
            throw err;
        }
    };

    const handleDeactivate = async () => {
        if (!vaccineToDeactivate) return;
        try {
            setDeactivating(true);
            await deactivateVaccine(vaccineToDeactivate.idVaccine);
            toast.success("Vacuna desactivada", vaccineToDeactivate.name);
            setVaccineToDeactivate(null);
            reload();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo desactivar la vacuna.", "Error");
        } finally {
            setDeactivating(false);
        }
    };

    const columns: TableColumn<VaccineResponse>[] = [
        { key: "name", header: "Nombre", render: (v) => <span className="font-semibold text-text">{v.name}</span> },
        { key: "species", header: "Especie" },
        { key: "dosesRequired", header: "Dosis", align: "center", render: (v) => v.dosesRequired },
        {
            key: "intervalDays",
            header: "Intervalo",
            align: "center",
            render: (v) => (v.intervalDays ? `${v.intervalDays} días` : "—"),
        },
        {
            key: "status",
            header: "Estado",
            align: "center",
            render: (v) =>
                v.status ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activa
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary bg-mint px-2.5 py-1 text-xs font-semibold text-text/60">
                        <Ban className="h-3.5 w-3.5" /> Inactiva
                    </span>
                ),
        },
    ];

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Catálogo de Vacunas"
                subtitle="Alta temporal de vacunas mientras no existe un módulo de inventario."
                action={
                    <Can permission="vacunacion:crear">
                        <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                            Nueva vacuna
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
                getRowKey={(v) => v.idVaccine}
                loading={loading}
                error={error}
                loadingLabel="Cargando catálogo..."
                emptyState={{
                    title: search ? "Sin resultados" : "Aún no hay vacunas registradas",
                    description: search ? "Prueba con otro nombre o especie." : "Crea la primera vacuna del catálogo.",
                    icon: <Syringe className="h-6 w-6 text-accent" />,
                }}
                actions={
                    hasPermission("vacunacion:eliminar")
                        ? {
                              header: "Acciones",
                              render: (v) => (
                                  <RowActions
                                      actions={[
                                          {
                                              icon: <Ban className="h-4 w-4" />,
                                              label: "Desactivar",
                                              onClick: () => setVaccineToDeactivate(v),
                                              variant: "danger",
                                              visible: v.status,
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
                open={vaccineToDeactivate !== null}
                title="Desactivar vacuna"
                description={
                    <>
                        ¿Desactivar <strong>{vaccineToDeactivate?.name}</strong>? Dejará de aparecer como opción al
                        registrar nuevas vacunas, pero el historial ya registrado no se modifica.
                    </>
                }
                variant="warning"
                confirmLabel="Desactivar"
                loading={deactivating}
                onConfirm={handleDeactivate}
                onCancel={() => setVaccineToDeactivate(null)}
            />
        </div>
    );
}
