"use client";

import { useState } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { useSupplyProducts } from "@/hooks/useSupplyProducts";
import { formatCost } from "@/lib/consultation/money";
import { digitsOnly } from "@/lib/forms/transform";
import { salePrice } from "@/lib/products/pricing";
import type { SupplyLine } from "@/types/payment";
import Dropdown from "@/components/ui/common/Dropdown";
import TextField from "@/components/ui/common/TextField";
import Button from "@/components/ui/common/Button";

interface AppointmentSuppliesProps {
    value: SupplyLine[];
    onChange: (supplies: SupplyLine[]) => void;
    hint?: string;
}

//Products used in the consultation; they are charged to the appointment account when the form is saved
export default function AppointmentSupplies({ value, onChange, hint }: AppointmentSuppliesProps) {
    const products = useSupplyProducts();
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("1");

    const total = value.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const canAdd = productId !== "" && Number(quantity) >= 1;

    const handleAdd = () => {
        const product = products.find(productId);
        if (!product) return;

        const amount = Number(quantity);
        const exists = value.some((line) => line.productId === product.id);

        // Un mismo producto se acumula en una sola línea
        onChange(
            exists
                ? value.map((line) => (line.productId === product.id ? { ...line, quantity: line.quantity + amount } : line))
                : [...value, { productId: product.id, description: product.name, quantity: amount, unitPrice: salePrice(product) }],
        );
        setProductId("");
        setQuantity("1");
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text/70">Productos utilizados</p>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_6rem_auto]">
                <Dropdown
                    label="Producto"
                    icon={<Boxes />}
                    options={products.options}
                    value={productId}
                    onValueChange={setProductId}
                    placeholder="Busca un producto"
                    searchable
                    clearable
                    loading={products.loading}
                />
                <TextField label="Cantidad" inputMode="numeric" maxLength={4} value={quantity} onValueChange={(v) => setQuantity(digitsOnly(v))} />
                <Button type="button" icon={<Plus className="h-4 w-4" />} disabled={!canAdd} onClick={handleAdd}>
                    Agregar
                </Button>
            </div>

            {value.length > 0 && (
                <>
                    <ul className="divide-y divide-mint rounded-xl border border-mint bg-background text-sm">
                        {value.map((line) => (
                            <li key={line.productId} className="flex items-center justify-between gap-3 px-3 py-2">
                                <span className="min-w-0 flex-1 truncate font-medium">{line.description}</span>
                                <span className="text-text/60">
                                    {line.quantity} × {formatCost(line.unitPrice)}
                                </span>
                                <span className="w-24 text-right font-semibold">{formatCost(line.quantity * line.unitPrice)}</span>
                                <button
                                    type="button"
                                    aria-label={`Quitar ${line.description}`}
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => onChange(value.filter((l) => l.productId !== line.productId))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="text-right text-sm text-text/70">
                        Total de productos: <strong className="text-text">{formatCost(total)}</strong>
                    </p>
                </>
            )}
            {hint && <p className="text-xs text-text/50">{hint}</p>}
        </div>
    );
}
