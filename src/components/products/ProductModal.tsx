"use client";

import Modal from "@/components/ui/common/Modal";
import ProductForm from "@/components/products/ProductForm";
import type { DropdownOption } from "@/components/ui/common/Dropdown";
import type { ProductRequest, ProductResponse } from "@/types/product";

interface ProductModalProps {
    open: boolean;
    editingProduct: ProductResponse | null;
    categoryOptions: DropdownOption[];
    onClose: () => void;
    onSubmit: (data: ProductRequest) => Promise<void>;
}

//Product modal component
export default function ProductModal({ open, editingProduct, categoryOptions, onClose, onSubmit }: ProductModalProps) {
    const isEditing = Boolean(editingProduct);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="2xl"
            title={isEditing ? "Editar Producto" : "Registrar Nuevo Producto"}
            subtitle={isEditing ? "Actualiza la información del producto." : "Agrega un producto al inventario de la clínica."}
        >
            <ProductForm editingProduct={editingProduct} categoryOptions={categoryOptions} onSubmit={onSubmit} onCancel={onClose} />
        </Modal>
    );
}
