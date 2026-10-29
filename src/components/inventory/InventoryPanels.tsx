"use client";

import { AlertTriangle, PackageSearch, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import Alert from "@/components/ui/common/Alert";
import TextField from "@/components/ui/common/TextField";
import StatusBadge from "@/components/ui/common/StatusBadge";
import DataTable from "@/components/ui/table/DataTable";
import PageSizeSelect from "@/components/ui/table/PageSizeSelect";
import TablePagination from "@/components/ui/table/TablePagination";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { usePaginationState } from "@/hooks/usePaginationState";
import { inventoryService } from "@/services/inventoryService";
import type { ExpiringProduct, InventoryBatch, InventoryMovement, LowStockProduct, ProductStockSummary } from "@/types/inventory";

const formatDate = (value: string | undefined) => value ? new Date(value).toLocaleDateString("es-MX") : "—";
const formatMoney = (value: number | undefined) => value === undefined ? "—" : `$${value.toFixed(2)}`;
const formatLocalDateTime = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}` : "Fecha no disponible";
};

function Pager({ page, size, totalPages, totalElements, onPageChange, onSizeChange }: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onSizeChange: (size: number) => void;
}) {
    return (
        <div className="flex flex-col gap-4 border-t border-mint p-5 sm:flex-row sm:items-end sm:justify-between">
            <PageSizeSelect value={size} onChange={onSizeChange} />
            <TablePagination page={page} size={size} totalPages={totalPages} totalElements={totalElements} onPageChange={onPageChange} />
        </div>
    );
}

export function StockSummary() {
    const [page, setPage] = usePaginationState("stock");
    const [size, setSize] = useStateWithReset(20, () => setPage(0));
    const fetchStockSummary = useCallback(() => inventoryService.getStockSummary(page, size), [page, size]);
    const query = usePagedQuery(fetchStockSummary, { errorTitle: "Existencias" });
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-text">Existencias por producto</h2>
                <p className="text-sm text-text/60">Consulta el stock disponible y el mínimo configurado.</p>
            </div>
            <DataTable<ProductStockSummary>
                columns={[
                    { key: "productName", header: "Producto", render: (row) => <span className="font-semibold">{row.productName}</span> },
                    { key: "productSku", header: "SKU", render: (row) => row.productSku || "—" },
                    { key: "totalAvailableStock", header: "Stock total", align: "right" },
                    { key: "minimumStock", header: "Stock mínimo", align: "right" },
                    { key: "status", header: "Estado", render: (row) => <StatusBadge active={row.totalAvailableStock > row.minimumStock} activeLabel="Disponible" inactiveLabel="Stock bajo" /> },
                ]}
                rows={query.rows} getRowKey={(row) => row.productId} loading={query.loading} error={query.error}
                loadingLabel="Cargando existencias..." emptyState={{ icon: <PackageSearch />, title: "No hay existencias", description: "No existen productos con resumen de stock." }}
            />
            <Pager page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} onSizeChange={setSize} />
        </section>
    );
}

export function LowStockAlerts() {
    const [page, setPage] = usePaginationState("low");
    const [size, setSize] = useStateWithReset(20, () => setPage(0));
    const fetchLowStock = useCallback(() => inventoryService.getLowStock(page, size), [page, size]);
    const query = usePagedQuery(fetchLowStock, { errorTitle: "Stock bajo" });
    if (!query.loading && !query.error && query.rows.length === 0) return null;
    return (
        <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-text"><AlertTriangle className="h-5 w-5 text-warning" /> Alertas de stock bajo</h2>
            {query.error ? <Alert variant="error">{query.error}</Alert> : query.loading ? <p className="text-sm text-text/60">Cargando alertas...</p> : (
                <>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {query.rows.map((row) => <Alert key={row.productId} variant="warning"><strong>{row.name}</strong> ({row.sku || "sin SKU"}): {row.currentStock} disponibles, mínimo {row.minimumStock}.</Alert>)}
                    </div>
                    <Pager page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} onSizeChange={setSize} />
                </>
            )}
        </section>
    );
}

export function ExpiringProductsAlerts() {
    const [size, setSize] = useStateWithReset(20, () => setPage(0));
    const [days, setDays] = useStateWithReset(5, () => setPage(0));
    const [page, setPage] = usePaginationState(`expiring-${days}`);
    const fetchExpiring = useCallback(() => inventoryService.getExpiringProducts(days, page, size), [days, page, size]);
    const query = usePagedQuery(fetchExpiring, { errorTitle: "Productos por vencer" });
    const updateDays = (value: string) => {
        const parsed = Number(value);
        setDays(Number.isFinite(parsed) ? Math.min(365, Math.max(1, parsed)) : 1);
    };

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-text"><AlertTriangle className="h-5 w-5 text-warning" /> Productos por vencer</h2>
                    <p className="text-sm text-text/60">Productos activos cuya fecha de vencimiento está próxima.</p>
                </div>
                <div className="w-36">
                    <TextField label="Próximos días" type="number" min="1" max="365" value={String(days)} onValueChange={updateDays} />
                </div>
            </div>
            {query.error ? <Alert variant="error">{query.error}</Alert> : query.loading ? <p className="text-sm text-text/60">Cargando productos por vencer...</p> : query.rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-secondary p-4 text-sm text-text/60">Ningún producto vence en los próximos {days} días.</div>
            ) : (
                <>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {query.rows.map((row: ExpiringProduct) => <Alert key={row.id} variant="warning"><strong>{row.name}</strong> ({row.sku || "sin SKU"}): vence el {formatLocalDateTime(row.expirationDate)}.</Alert>)}
                    </div>
                    <Pager page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} onSizeChange={setSize} />
                </>
            )}
        </section>
    );
}

export function BatchList() {
    const [page, setPage] = usePaginationState("batches");
    const [size, setSize] = useStateWithReset(20, () => setPage(0));
    const fetchBatches = useCallback(() => inventoryService.getBatches(page, size), [page, size]);
    const query = usePagedQuery(fetchBatches, { errorTitle: "Lotes" });
    return (
        <section className="space-y-4">
            <div><h2 className="text-xl font-bold text-text">Lotes de inventario</h2><p className="text-sm text-text/60">Consulta cantidades, fechas y estado de cada lote.</p></div>
            <DataTable<InventoryBatch>
                columns={[
                    { key: "product", header: "Producto", render: (row) => <><span className="font-semibold">{row.product.name}</span><span className="block text-xs text-text/60">{row.product.sku || "sin SKU"}</span></> },
                    { key: "id", header: "Lote", render: (row) => `#${row.id}` },
                    { key: "availableQuantity", header: "Disponible", align: "right" },
                    { key: "entryDate", header: "Ingreso", render: (row) => formatDate(row.entryDate) },
                    { key: "status", header: "Estado", render: (row) => <StatusBadge active={row.status} activeLabel="Activo" inactiveLabel="Inactivo" /> },
                ]}
                rows={query.rows} getRowKey={(row) => row.id} loading={query.loading} error={query.error}
                loadingLabel="Cargando lotes..." emptyState={{ icon: <PackageSearch />, title: "No hay lotes", description: "No existen lotes de inventario registrados." }}
            />
            <Pager page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} onSizeChange={setSize} />
        </section>
    );
}

export function MovementHistory() {
    const [page, setPage] = usePaginationState("movements");
    const [size, setSize] = useStateWithReset(20, () => setPage(0));
    const fetchMovements = useCallback(() => inventoryService.getMovements(page, size), [page, size]);
    const query = usePagedQuery(fetchMovements, { errorTitle: "Movimientos" });
    return (
        <section className="space-y-4">
            <div><h2 className="text-xl font-bold text-text">Historial de movimientos</h2><p className="text-sm text-text/60">Entradas y salidas registradas en inventario.</p></div>
            <DataTable<InventoryMovement>
                columns={[
                    { key: "product", header: "Producto", render: (row) => row.product.name },
                    { key: "type", header: "Tipo", render: (row) => row.type },
                    { key: "quantity", header: "Cantidad", align: "right" },
                    { key: "unitCost", header: "Costo unitario", align: "right", render: (row) => formatMoney(row.unitCost) },
                    { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
                    { key: "origin", header: "Origen", render: (row) => row.origin || "—" },
                    { key: "batch", header: "Lote", render: (row) => row.batch ? `#${row.batch.id}` : "—" },
                ]}
                rows={query.rows} getRowKey={(row) => row.id} loading={query.loading} error={query.error}
                loadingLabel="Cargando movimientos..." emptyState={{ icon: <RefreshCw />, title: "No hay movimientos", description: "No existen movimientos de inventario registrados." }}
            />
            <Pager page={page} size={size} totalPages={query.totalPages} totalElements={query.totalElements} onPageChange={setPage} onSizeChange={setSize} />
        </section>
    );
}

function useStateWithReset(initial: number, reset: () => void) {
    const [value, setValue] = useState(initial);
    const set = (next: number) => {
        setValue(next);
        reset();
    };
    return [value, set] as const;
}
