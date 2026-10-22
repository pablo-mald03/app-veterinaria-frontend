"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Modal from "@/components/ui/common/Modal";
import TextField from "@/components/ui/common/TextField";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import DataTable from "@/components/ui/table/DataTable";
import PageSizeSelect from "@/components/ui/table/PageSizeSelect";
import TablePagination from "@/components/ui/table/TablePagination";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { usePaginationState } from "@/hooks/usePaginationState";
import { inventoryService } from "@/services/inventoryService";
import { productService } from "@/services/productService";
import type { ProductResponse } from "@/types/product";
import type { Purchase, PurchaseDetailRequest } from "@/types/purchase";

const emptyDetail = (): PurchaseDetailRequest => ({ productId: 0, quantity: 1, unitPrice: 0, profitPercentage: 0 });
const dateLabel = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("es-MX") : "—";
const money = (value: number | null | undefined) => typeof value === "number" ? `$${value.toFixed(2)}` : "—";

export default function PurchasePanel() {
    const { hasPermission, hasRole } = useAuth();
    const toast = useToast();
    const canCreate = hasRole("ADMIN") || hasPermission("inventario:crear");
    const [page, setPage] = usePaginationState("purchases");
    const [size, setSize] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState("");
    const [iva, setIva] = useState("0");
    const [details, setDetails] = useState<PurchaseDetailRequest[]>([emptyDetail()]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [detailCounts, setDetailCounts] = useState<Record<number, number>>({});
    const fetchPurchases = useCallback(() => inventoryService.getPurchases(page, size), [page, size]);
    const query = usePagedQuery(fetchPurchases, { errorTitle: "Compras" });

    useEffect(() => {
        if (query.loading || query.rows.length === 0) return;
        let active = true;
        Promise.all(query.rows.map(async (purchase) => {
            if (purchase.details?.length) return [purchase.id, purchase.details.length] as const;
            const detail = await inventoryService.getPurchaseById(purchase.id);
            return [purchase.id, detail.details?.length ?? 0] as const;
        }))
            .then((counts) => {
                if (active) setDetailCounts(Object.fromEntries(counts));
            })
            .catch(() => {
                if (active) setDetailCounts({});
            });
        return () => {
            active = false;
        };
    }, [query.loading, query.rows]);

    useEffect(() => {
        if (!modalOpen) return;
        productService.getAll({ page: 0, size: 100, sortBy: "name", direction: "asc" })
            .then((result) => setProducts(result.content.filter((product) => product.status)))
            .catch((error: unknown) => setProductsError(error instanceof Error ? error.message : "No se pudieron cargar los productos."));
    }, [modalOpen]);

    const productOptions: DropdownOption[] = products.map((product) => ({ value: String(product.id), label: `${product.name} (${product.sku})` }));
    const updateDetail = (index: number, patch: Partial<PurchaseDetailRequest>) => {
        setDetails((current) => current.map((detail, detailIndex) => detailIndex === index ? { ...detail, ...patch } : detail));
    };
    const closeModal = () => {
        setModalOpen(false);
        setDetails([emptyDetail()]);
        setDescription("");
        setIva("0");
        setProductsError(null);
    };
    const savePurchase = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (details.some((detail) => detail.productId === 0 || detail.quantity < 1 || detail.unitPrice <= 0)) {
            toast.error("Completa producto, cantidad y precio unitario en cada detalle.", "Datos incompletos");
            return;
        }
        setSaving(true);
        try {
            await inventoryService.createPurchase({ description, iva: Number(iva) || 0, details });
            toast.success("La compra fue registrada y el inventario fue actualizado.", "Compra registrada");
            closeModal();
            query.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo registrar la compra.", "Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h2 className="text-xl font-bold text-text">Compras</h2><p className="text-sm text-text/60">Registra entradas de productos y genera sus lotes automáticamente.</p></div>
                {canCreate && <Button icon={<Plus className="h-5 w-5" />} onClick={() => setModalOpen(true)}>Nueva compra</Button>}
            </div>
            <DataTable<Purchase>
                columns={[
                    { key: "id", header: "Compra", render: (row) => `#${row.id}` },
                    { key: "description", header: "Descripción", render: (row) => row.description || "Sin descripción" },
                    { key: "date", header: "Fecha", render: (row) => dateLabel(row.date) },
                    { key: "details", header: "Productos", align: "right", render: (row) => detailCounts[row.id] ?? (row.details?.length || "—") },
                    { key: "total", header: "Total", align: "right", render: (row) => money(row.total) },
                    { key: "status", header: "Estado", render: (row) => row.status },
                ]}
                rows={query.rows} getRowKey={(row) => row.id} loading={query.loading} error={query.error}
                loadingLabel="Cargando compras..." emptyState={{ icon: <ShoppingCart />, title: "No hay compras", description: "Registra la primera compra para agregar existencias." }}
            />
            <div className="flex flex-col gap-4 border-t border-mint pt-4 sm:flex-row sm:items-end sm:justify-between">
                <PageSizeSelect value={size} onChange={(next) => { setSize(next); setPage(0); }} />
                <TablePagination page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} />
            </div>
            <Modal open={modalOpen} onClose={closeModal} size="4xl" title="Nueva compra" subtitle="La compra generará automáticamente un lote y un movimiento de entrada.">
                <form onSubmit={savePurchase} className="space-y-5">
                    <div className="grid gap-4 rounded-2xl border border-mint bg-mint/20 p-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
                        <TextField label="Descripción" value={description} onValueChange={setDescription} placeholder="Compra de productos" maxLength={255} />
                        <TextField label="IVA" type="number" min="0" step="0.01" value={iva} onValueChange={setIva} placeholder="0" />
                    </div>
                    {productsError && <Alert variant="error">{productsError}</Alert>}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-text">Productos de la compra</h3>
                        {details.map((detail, index) => (
                            <div key={index} className="grid gap-4 rounded-2xl border border-secondary bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(16rem,2fr)_minmax(7rem,1fr)_minmax(9rem,1fr)_minmax(8rem,1fr)_auto]">
                                <Dropdown label="Producto" options={productOptions} value={detail.productId ? String(detail.productId) : ""} onValueChange={(value) => updateDetail(index, { productId: Number(value) })} placeholder="Selecciona un producto" searchable />
                                <TextField label="Cantidad" type="number" min="1" value={String(detail.quantity)} onValueChange={(value) => updateDetail(index, { quantity: Number(value) || 0 })} required />
                                <TextField label="Precio unitario" type="number" min="0.01" step="0.01" value={String(detail.unitPrice)} onValueChange={(value) => updateDetail(index, { unitPrice: Number(value) || 0 })} required />
                                <TextField label="% ganancia" type="number" min="0" max="100" value={String(detail.profitPercentage)} onValueChange={(value) => updateDetail(index, { profitPercentage: Number(value) || 0 })} required />
                                <Button type="button" variant="ghost" className="self-end justify-self-start lg:justify-self-end" disabled={details.length === 1} icon={<Trash2 className="h-4 w-4" />} onClick={() => setDetails((current) => current.filter((_, detailIndex) => detailIndex !== index))}>Quitar</Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={() => setDetails((current) => [...current, emptyDetail()])}>Agregar producto</Button>
                    <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button><Button type="submit" loading={saving}>Registrar compra</Button></div>
                </form>
            </Modal>
        </section>
    );
}
