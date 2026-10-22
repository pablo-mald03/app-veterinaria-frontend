"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import Modal from "@/components/ui/common/Modal";
import TextField from "@/components/ui/common/TextField";
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
import type { Sale, SaleItemRequest } from "@/types/sale";
import type { ProductStockSummary } from "@/types/inventory";

const emptyItem = (): SaleItemRequest => ({ productId: 0, quantity: 1, unitPrice: 0 });
const money = (value: number | null | undefined) => typeof value === "number" ? `$${value.toFixed(2)}` : "—";
const dateLabel = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString("es-MX") : "—";

export default function SalesView() {
    const { hasRole } = useAuth();
    const toast = useToast();
    const canCreate = hasRole("ADMIN") || hasRole("RECEPCIONISTA");
    const [page, setPage] = usePaginationState("sales");
    const [size, setSize] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [billNumber, setBillNumber] = useState("");
    const [iva, setIva] = useState("12");
    const [items, setItems] = useState<SaleItemRequest[]>([emptyItem()]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [stockByProduct, setStockByProduct] = useState<Record<number, number>>({});
    const [productsError, setProductsError] = useState<string | null>(null);
    const fetchSales = useCallback(() => inventoryService.getSales(page, size), [page, size]);
    const query = usePagedQuery(fetchSales, { errorTitle: "Ventas" });

    useEffect(() => {
        if (!modalOpen) return;
        Promise.all([
            productService.getAll({ page: 0, size: 100, sortBy: "name", direction: "asc" }),
            inventoryService.getStockSummary(0, 100),
        ])
            .then(([productResult, stockResult]) => {
                setProducts(productResult.content.filter((product) => product.status));
                setStockByProduct(
                    Object.fromEntries(stockResult.content.map((summary: ProductStockSummary) => [summary.productId, summary.totalAvailableStock])),
                );
            })
            .catch((error: unknown) => setProductsError(error instanceof Error ? error.message : "No se pudieron cargar los productos y sus existencias."));
    }, [modalOpen]);

    const options: DropdownOption[] = products.map((product) => ({ value: String(product.id), label: `${product.name} (${product.sku})` }));
    const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const ivaPercentage = Math.max(0, Number(iva) || 0);
    const ivaAmount = subtotal * (ivaPercentage / 100);
    const totalToPay = subtotal + ivaAmount;
    const updateItem = (index: number, patch: Partial<SaleItemRequest>) => {
        setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
    };
    const selectProduct = (index: number, productId: string) => {
        const product = products.find((item) => item.id === Number(productId));
        updateItem(index, { productId: Number(productId), unitPrice: product?.price ?? 0 });
    };
    const selectedProduct = (productId: number) => products.find((product) => product.id === productId);
    const closeModal = () => {
        setModalOpen(false);
        setItems([emptyItem()]);
        setBillNumber("");
        setIva("12");
        setProductsError(null);
    };
    const saveSale = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ivaValue = Number(iva);
        if (!iva.trim() || !Number.isFinite(ivaValue) || ivaValue < 0 || ivaValue > 100) {
            toast.error("El IVA es obligatorio y debe ser un porcentaje válido.", "Datos incompletos");
            return;
        }
        if (items.some((item) => item.productId === 0 || item.quantity < 1 || item.unitPrice < 0)) {
            toast.error("Completa producto, cantidad y precio en cada detalle.", "Datos incompletos");
            return;
        }
        setSaving(true);
        try {
            await inventoryService.createSale({ billNumber, iva: ivaValue, items });
            toast.success("La venta fue registrada y el inventario fue actualizado.", "Venta registrada");
            closeModal();
            query.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo registrar la venta.", "Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="space-y-5 bg-white p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-text">Ventas</h1><p className="text-sm text-text/60">Registra ventas y descuenta automáticamente el inventario.</p></div>
                {canCreate && <Button icon={<Plus className="h-5 w-5" />} onClick={() => setModalOpen(true)}>Nueva venta</Button>}
            </div>
            <DataTable<Sale>
                columns={[
                    { key: "id", header: "Venta", render: (row) => `#${row.id}` },
                    { key: "billNumber", header: "Factura", render: (row) => row.billNumber || "Sin factura" },
                    { key: "date", header: "Fecha", render: (row) => dateLabel(row.date) },
                    { key: "details", header: "Productos", align: "right", render: (row) => row.details?.length ?? 0 },
                    { key: "total", header: "Total", align: "right", render: (row) => money(row.total) },
                    { key: "status", header: "Estado", render: (row) => row.status },
                ]}
                rows={query.rows} getRowKey={(row) => row.id} loading={query.loading} error={query.error}
                loadingLabel="Cargando ventas..." emptyState={{ icon: <ReceiptText />, title: "No hay ventas", description: "Registra la primera venta." }}
            />
            <div className="flex flex-col gap-4 border-t border-mint pt-4 sm:flex-row sm:items-end sm:justify-between">
                <PageSizeSelect value={size} onChange={(next) => { setSize(next); setPage(0); }} />
                <TablePagination page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} />
            </div>
            <Modal open={modalOpen} onClose={closeModal} size="4xl" title="Nueva venta" subtitle="La venta descontará existencias y registrará movimientos de salida.">
                <form onSubmit={saveSale} className="space-y-5">
                    <div className="grid gap-4 rounded-2xl border border-mint bg-mint/20 p-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
                        <TextField label="Número de factura" value={billNumber} onValueChange={setBillNumber} placeholder="Factura opcional" maxLength={30} />
                        <TextField label="IVA (%)" type="number" min="0" max="100" step="0.01" value={iva} onValueChange={setIva} placeholder="12" required message="Obligatorio para calcular el total." />
                    </div>
                    {productsError && <Alert variant="error">{productsError}</Alert>}
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-text/80">
                        <p className="font-semibold text-text">Cómo se calcula esta venta</p>
                        <p className="mt-1">
                            El cliente paga el precio de venta configurado para el producto. El sistema aplica UEPS internamente
                            para descontar los lotes más recientes, pero los costos de esos lotes no cambian el precio cobrado.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-text">Productos de la venta</h2>
                        {items.map((item, index) => (
                            <div key={index} className="grid gap-4 rounded-2xl border border-secondary p-4 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,2fr)_minmax(7rem,1fr)_minmax(9rem,1fr)_auto]">
                                <div className="min-w-0">
                                    <Dropdown label="Producto" options={options} value={item.productId ? String(item.productId) : ""} onValueChange={(value) => selectProduct(index, value)} placeholder="Selecciona un producto" searchable />
                                    {item.productId > 0 && (
                                        <p className={`mt-1.5 text-xs font-semibold ${stockByProduct[item.productId] > 0 ? "text-success" : "text-danger"}`}>
                                            Existencia disponible: {stockByProduct[item.productId] ?? 0} unidades
                                        </p>
                                    )}
                                </div>
                                <TextField label="Cantidad" type="number" min="1" value={String(item.quantity)} onValueChange={(value) => updateItem(index, { quantity: Number(value) || 0 })} required />
                                <TextField label="Precio de venta al cliente" type="number" value={String(item.unitPrice)} onValueChange={() => undefined} readOnly message="Tomado del precio configurado en el producto" required />
                                <Button type="button" variant="ghost" className="self-end justify-self-start lg:justify-self-end" disabled={items.length === 1} icon={<Trash2 className="h-4 w-4" />} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Quitar</Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={() => setItems((current) => [...current, emptyItem()])}>Agregar producto</Button>
                    <div className="rounded-2xl border border-primary/30 bg-mint/30 p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-bold text-text">Resumen de pago</h2>
                            <span className="text-xs text-text/60">Precio de venta configurado</span>
                        </div>
                        <div className="ml-auto max-w-sm space-y-2 text-sm">
                            <div className="flex justify-between gap-4 text-text/70"><span>Subtotal a cobrar</span><strong className="text-text">{money(subtotal)}</strong></div>
                            <div className="flex justify-between gap-4 text-text/70"><span>IVA ({ivaPercentage.toFixed(2)}%)</span><strong className="text-text">{money(ivaAmount)}</strong></div>
                            <div className="flex justify-between gap-4 border-t border-primary/20 pt-3 text-base"><span className="font-bold text-text">Total a pagar</span><strong className="text-lg text-primary">{money(totalToPay)}</strong></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button><Button type="submit" loading={saving}>Registrar venta</Button></div>
                </form>
            </Modal>
        </section>
    );
}
