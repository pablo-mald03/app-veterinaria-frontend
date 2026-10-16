"use client";

import { useCallback, useState } from "react";
import { Ban, Edit3, Package, Plus, ShieldCheck } from "lucide-react";
import { productService } from "@/services/productService";
import type { ProductRequest, ProductResponse } from "@/types/product";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
/*import { useInventoryPermissions } from "@/hooks/useInventoryPermissions";*/
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { usePaginationState } from "@/hooks/usePaginationState";
import { useProductCategories } from "@/hooks/useProductCategories";
import { digitsOnly } from "@/lib/forms/transform";
import { formatCost } from "@/lib/consultation/money";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import TablePagination from "@/components/ui/table/TablePagination";
import PageSizeSelect, { DEFAULT_PAGE_SIZE } from "@/components/ui/table/PageSizeSelect";
import FilterPanel from "@/components/ui/common/FilterPanel";
import StatusBadge from "@/components/ui/common/StatusBadge";
import TextField from "@/components/ui/common/TextField";
import Dropdown from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import ConfirmDialog from "@/components/ui/dialogs/Confirmdialog";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import ProductModal from "@/components/products/ProductModal";
import {useAuth} from "@/components/auth/AuthProvider";

type PendingAction = { type: "deactivate" | "reactivate"; product: ProductResponse } | null;

const COLUMNS: TableColumn<ProductResponse>[] = [
    { key: "sku", header: "SKU", className: "font-mono text-xs" },
    {
        key: "name",
        header: "Producto",
        render: (p) => (
            <>
                <span className="font-semibold">{p.name}</span>
                {p.brand && <span className="block text-xs text-text/60">{p.brand}</span>}
            </>
        ),
    },
    { key: "category", header: "Categoría", render: (p) => p.category?.name ?? <span className="text-text/40">—</span> },
    { key: "provider", header: "Proveedor", render: (p) => p.provider || <span className="text-text/40">—</span> },
    { key: "price", header: "Precio", align: "right", render: (p) => formatCost(p.price) },
    { key: "minimumStock", header: "Stock mín.", align: "right" },
    {
        key: "status",
        header: "Estado",
        render: (p) => <StatusBadge active={p.status} activeLabel="Activo" inactiveLabel="Inactivo" />,
    },
];

//Products table component (the products list is the "Productos" tab of Farmacia e Inventario)
export default function ProductTable() {
    const { hasPermission, hasRole } = useAuth();
    const toast = useToast();
    const categories = useProductCategories();

    // Filtros: el texto se envía con debounce para no hacer una petición por tecla
    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const [skuFilter, setSkuFilter] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priceFromFilter, setPriceFromFilter] = useState("");
    const [priceToFilter, setPriceToFilter] = useState("");

    const sku = useDebouncedValue(skuFilter.trim());
    const provider = useDebouncedValue(providerFilter.trim());
    const priceFrom = useDebouncedValue(priceFromFilter);
    const priceTo = useDebouncedValue(priceToFilter);

    // Cualquier cambio de filtro regresa a la primera página
    const [page, setPage] = usePaginationState([size, sku, provider, categoryFilter, priceFrom, priceTo].join("|"));

    const fetchProducts = useCallback(
        () =>
            productService.getAll({
                page,
                size,
                sku,
                provider,
                categoryId: categoryFilter ? Number(categoryFilter) : undefined,
                priceFrom: priceFrom ? Number(priceFrom) : undefined,
                priceTo: priceTo ? Number(priceTo) : undefined,
            }),
        [page, size, sku, provider, categoryFilter, priceFrom, priceTo],
    );

    const { rows, totalPages, totalElements, loading, error, reload } = usePagedQuery(fetchProducts, {
        errorTitle: "Error al cargar productos",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const canCreate = hasRole("ADMIN") || hasPermission("inventario:crear");
    const canEdit = hasRole("ADMIN") || hasPermission("inventario:editar");
    const canChangeStatus = hasRole("ADMIN") || hasPermission("inventario:eliminar");

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    // El listado ya trae todos los campos del producto, no hace falta consultar el detalle
    const handleOpenEdit = (product: ProductResponse) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (data: ProductRequest) => {
        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, data);
                toast.success("Producto actualizado", data.name);
            } else {
                await productService.create(data);
                toast.success("Producto registrado", data.name);
            }
            setIsModalOpen(false);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al guardar el producto.";
            toast.error(message, "Error al guardar");
            throw err;
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        const { type, product } = pendingAction;

        try {
            if (type === "deactivate") {
                await productService.setStatus(product.id, false);
                toast.warning(`${product.name} desactivado`, "Producto inhabilitado");
            } else {
                await productService.setStatus(product.id, true);
                toast.success(`${product.name} reactivado`, "Producto habilitado");
            }
            setPendingAction(null);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al actualizar el estado.";
            toast.error(message, "Operación fallida");
            throw err;
        }
    };

    const isDeactivating = pendingAction?.type === "deactivate";

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text">Productos</h2>
                    <p className="text-sm text-text/60">Insumos, medicamentos y vacunas disponibles en la clínica.</p>
                </div>
                {canCreate && (
                    <Button type="button" icon={<Plus className="h-5 w-5" />} onClick={handleOpenCreate}>
                        Nuevo Producto
                    </Button>
                )}
            </div>

            <FilterPanel>
                <TextField label="SKU" placeholder="Buscar por SKU..." value={skuFilter} onValueChange={setSkuFilter} clearable />
                <TextField label="Proveedor" placeholder="Buscar por proveedor..." value={providerFilter} onValueChange={setProviderFilter} clearable />
                <Dropdown
                    label="Categoría"
                    options={categories.filterOptions}
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    placeholder="Todas"
                    searchable
                    clearable
                />
                <PageSizeSelect value={size} onChange={setSize} />
                <TextField
                    label="Precio desde (Q)"
                    placeholder="Ej. 50"
                    inputMode="numeric"
                    maxLength={12}
                    value={priceFromFilter}
                    onValueChange={(v) => setPriceFromFilter(digitsOnly(v))}
                    clearable
                />
                <TextField
                    label="Precio hasta (Q)"
                    placeholder="Ej. 500"
                    inputMode="numeric"
                    maxLength={12}
                    value={priceToFilter}
                    onValueChange={(v) => setPriceToFilter(digitsOnly(v))}
                    clearable
                />
            </FilterPanel>

            <DataTable<ProductResponse>
                columns={COLUMNS}
                rows={rows}
                getRowKey={(p) => p.id}
                loading={loading}
                error={error}
                loadingLabel="Cargando productos..."
                emptyState={{
                    title: "No hay productos para mostrar",
                    description: "Ajusta los filtros o registra un nuevo producto.",
                    icon: <Package className="h-8 w-8" />,
                }}
                actions={
                    canEdit || canChangeStatus
                        ? {
                              render: (p) => (
                                  <RowActions
                                      actions={[
                                          {
                                              icon: <Edit3 className="h-4 w-4" />,
                                              label: `Editar ${p.name}`,
                                              onClick: () => handleOpenEdit(p),
                                              variant: "default",
                                              visible: canEdit,
                                          },
                                          {
                                              icon: <Ban className="h-4 w-4" />,
                                              label: `Desactivar ${p.name}`,
                                              onClick: () => setPendingAction({ type: "deactivate", product: p }),
                                              variant: "danger",
                                              visible: canChangeStatus && p.status,
                                          },
                                          {
                                              icon: <ShieldCheck className="h-4 w-4" />,
                                              label: `Reactivar ${p.name}`,
                                              onClick: () => setPendingAction({ type: "reactivate", product: p }),
                                              variant: "success",
                                              visible: canChangeStatus && !p.status,
                                          },
                                      ]}
                                  />
                              ),
                          }
                        : undefined
                }
            />

            <TablePagination
                page={page}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
                itemLabel="productos"
                disabled={loading}
                onPageChange={setPage}
            />

            <ProductModal
                open={isModalOpen}
                editingProduct={editingProduct}
                categoryOptions={categories.formOptions}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveProduct}
            />

            <ConfirmDialog
                open={pendingAction !== null}
                variant={isDeactivating ? "danger" : "warning"}
                title={isDeactivating ? "Desactivar producto" : "Reactivar producto"}
                description={
                    isDeactivating ? (
                        <>
                            Vas a desactivar <strong>{pendingAction?.product.name}</strong>. Dejará de estar disponible, pero podrás
                            reactivarlo después.
                        </>
                    ) : (
                        <>
                            Vas a reactivar <strong>{pendingAction?.product.name}</strong>. Volverá a estar disponible.
                        </>
                    )
                }
                confirmLabel={isDeactivating ? "Desactivar" : "Reactivar"}
                onConfirm={handleConfirmAction}
                onCancel={() => setPendingAction(null)}
            />
        </section>
    );
}
