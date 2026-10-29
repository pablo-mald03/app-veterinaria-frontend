"use client";

import { useState } from "react";
import { Banknote, Barcode, Boxes, CalendarClock, FileText, Package, Percent, Tag, Tags, Truck } from "lucide-react";
import { useField } from "@/hooks/useField";
import { decimalOnly, digitsOnly } from "@/lib/forms/transform";
import {
    productBrandSchema,
    productCategorySchema,
    productDescriptionSchema,
    productDiscountSchema,
    productExpirationSchema,
    productMinStockSchema,
    productNameSchema,
    productPriceSchema,
    productProfitSchema,
    productProviderSchema,
    productSkuSchema,
} from "@/schemas/product.schema";
import type { ProductRequest, ProductResponse } from "@/types/product";
import TextField from "@/components/ui/common/TextField";
import TextArea from "@/components/ui/common/TextArea";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import Alert from "@/components/ui/common/Alert";

interface ProductFormProps {
    editingProduct: ProductResponse | null;
    categoryOptions: DropdownOption[];
    onSubmit: (data: ProductRequest) => Promise<void>;
    onCancel: () => void;
}

//Initial values derived from the edit mode
function buildInitialData(product: ProductResponse | null) {
    return {
        sku: product?.sku ?? "",
        name: product?.name ?? "",
        brand: product?.brand ?? "",
        provider: product?.provider ?? "",
        description: product?.description ?? "",
        categoryId: product?.category ? String(product.category.id) : "",
        price: product ? String(product.price) : "",
        profit: product ? String(product.profitPercentage) : "",
        minStock: product ? String(product.minimumStock) : "",
        discount: "",
        expirationDate: "",
    };
}

//Principal product form component
export default function ProductForm({ editingProduct, categoryOptions, onSubmit, onCancel }: ProductFormProps) {
    const isEditing = Boolean(editingProduct);
    const initial = buildInitialData(editingProduct);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const sku = useField({ initialValue: initial.sku, validator: productSkuSchema, validateOn: "blur" });
    const name = useField({ initialValue: initial.name, validator: productNameSchema, validateOn: "blur" });
    const brand = useField({ initialValue: initial.brand, validator: productBrandSchema, validateOn: "blur" });
    const provider = useField({ initialValue: initial.provider, validator: productProviderSchema, validateOn: "blur" });
    const description = useField({ initialValue: initial.description, validator: productDescriptionSchema, validateOn: "blur" });
    const categoryId = useField({ initialValue: initial.categoryId, validator: productCategorySchema, validateOn: "blur" });
    const price = useField({ initialValue: initial.price, validator: productPriceSchema, validateOn: "blur", transform: decimalOnly });
    const profit = useField({ initialValue: initial.profit, validator: productProfitSchema, validateOn: "blur", transform: digitsOnly });
    const minStock = useField({ initialValue: initial.minStock, validator: productMinStockSchema, validateOn: "blur", transform: digitsOnly });
    const discount = useField({ initialValue: initial.discount, validator: productDiscountSchema, validateOn: "blur", transform: digitsOnly });
    const expirationDate = useField({ initialValue: initial.expirationDate, validator: productExpirationSchema, validateOn: "blur" });

    const fields = [sku, name, brand, provider, description, categoryId, price, profit, minStock, discount, expirationDate];
    const isFormValid = fields.every((f) => f.valid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        // Se validan todos (no solo hasta el primer error) para marcar cada campo inválido
        const results = fields.map((f) => f.validate());
        if (!results.every(Boolean)) return;

        const payload: ProductRequest = {
            sku: sku.value.trim(),
            name: name.value.trim(),
            brand: brand.value.trim(),
            provider: provider.value.trim(),
            description: description.value.trim(),
            categoryId: Number(categoryId.value),
            price: Number(price.value),
            profitPercentage: Number(profit.value),
            minimumStock: Number(minStock.value),
            discountPercentage: Number(discount.value),
            expirationDate: expirationDate.value.length === 16 ? `${expirationDate.value}:00` : expirationDate.value,
        };

        try {
            setSubmitting(true);
            await onSubmit(payload);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo guardar el producto.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField label="SKU" icon={<Barcode />} placeholder="VAC-001" maxLength={12} clearable {...sku.props} />
                <div className="sm:col-span-2">
                    <TextField label="Nombre" icon={<Package />} placeholder="Vacuna antirrábica" maxLength={120} clearable {...name.props} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Marca" icon={<Tag />} placeholder="Zoetis" maxLength={120} clearable {...brand.props} />
                <TextField label="Proveedor" icon={<Truck />} placeholder="Distribuidora Vet" maxLength={150} clearable {...provider.props} />
            </div>

            <Dropdown
                label="Categoría"
                icon={<Tags />}
                options={categoryOptions}
                placeholder="Selecciona una categoría"
                searchable
                clearable
                {...categoryId.props}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <TextField label="Precio (Q)" icon={<Banknote />} placeholder="0.00" inputMode="decimal" maxLength={13} {...price.props} />
                <TextField label="Ganancia (%)" icon={<Percent />} placeholder="30" inputMode="numeric" maxLength={3} {...profit.props} />
                <TextField label="Descuento (%)" icon={<Percent />} placeholder="0" inputMode="numeric" maxLength={3} message={isEditing ? "El sistema no devuelve este dato: vuelve a capturarlo" : undefined} {...discount.props} />
                <TextField label="Stock mínimo" icon={<Boxes />} placeholder="5" inputMode="numeric" maxLength={10} {...minStock.props} />
            </div>

            <TextField
                label="Fecha de vencimiento"
                icon={<CalendarClock />}
                type="datetime-local"
                message={isEditing ? "El sistema no devuelve este dato: vuelve a capturarlo" : undefined}
                {...expirationDate.props}
            />

            <TextArea
                label="Descripción"
                icon={<FileText />}
                placeholder="Presentación, dosis, indicaciones..."
                maxLength={255}
                clearable
                rows={3}
                {...description.props}
            />

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    loadingLabel="Guardando..."
                    disabled={!isFormValid || submitting}
                >
                    {isEditing ? "Actualizar" : "Guardar Producto"}
                </Button>
            </div>
        </form>
    );
}
