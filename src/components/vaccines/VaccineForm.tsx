"use client";

import { useRef, useState } from "react";
import { CalendarClock, FileText, Package, Plus, Syringe, Trash2 } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown from "@/components/ui/common/Dropdown";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { useSupplyProducts } from "@/hooks/useSupplyProducts";
import { digitsOnly } from "@/lib/forms/transform";
import {
    TREATMENT_SPECIES_OPTIONS,
    treatmentDescriptionSchema,
    treatmentIntervalValidator,
    treatmentNameSchema,
    treatmentQuantityValidator,
    treatmentSpeciesError,
} from "@/schemas/vaccineCatalog.schema";
import type { TreatmentCatalogInput } from "@/types/vaccines/vaccineCatalog";

interface TreatmentFormProps {
    onSubmit: (input: TreatmentCatalogInput) => Promise<void>;
    onCancel: () => void;
}

/** Fila editable de "productos que consume": el producto y la cantidad por aplicación. */
interface ProductRow {
    key: number;
    productId: string;
    quantity: string;
    touched: boolean;
}

const productError = (row: ProductRow) => (row.productId ? undefined : "Selecciona un producto.");

//Formulario para crear un tratamiento en el catálogo
export default function VaccineForm({ onSubmit, onCancel }: TreatmentFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const name = useField({ validator: treatmentNameSchema, validateOn: "blur" });
    const description = useField({ validator: treatmentDescriptionSchema, validateOn: "blur" });
    const interval = useField({ validator: treatmentIntervalValidator, validateOn: "blur", transform: digitsOnly });

    // ---- Especies ----
    const [species, setSpecies] = useState<string[]>([]);
    const [speciesTouched, setSpeciesTouched] = useState(false);
    const speciesError = treatmentSpeciesError(species);

    const toggleSpecies = (value: string) => {
        setSpeciesTouched(true);
        setSpecies((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    };

    // ---- Productos que consume ----
    const supply = useSupplyProducts(true);
    const nextKey = useRef(1);
    const [rows, setRows] = useState<ProductRow[]>([]);

    const addRow = () => {
        setRows((current) => [...current, { key: nextKey.current++, productId: "", quantity: "1", touched: false }]);
    };
    const updateRow = (key: number, changes: Partial<ProductRow>) => {
        setRows((current) => current.map((row) => (row.key === key ? { ...row, ...changes } : row)));
    };
    const removeRow = (key: number) => {
        setRows((current) => current.filter((row) => row.key !== key));
    };

    const rowsValid = rows.every((row) => !productError(row) && !treatmentQuantityValidator(row.quantity));

    const isFormValid = name.valid && description.valid && interval.valid && !speciesError && rowsValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [name.validate(), description.validate(), interval.validate()];
        setSpeciesTouched(true);
        setRows((current) => current.map((row) => ({ ...row, touched: true })));
        if (!results.every(Boolean) || speciesError || !rowsValid) return;

        const input: TreatmentCatalogInput = {
            name: name.value.trim(),
            description: description.value.trim(),
            species,
            intervalDays: interval.value.trim() ? Number(interval.value) : null,
            products: rows.map((row) => ({ productId: Number(row.productId), quantity: Number(row.quantity) })),
        };

        try {
            setSubmitting(true);
            await onSubmit(input);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo crear el tratamiento.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <TextField label="Nombre" icon={<Syringe />} placeholder="Ej. Vacuna antirrábica" {...name.props} />

            <TextArea
                label="Descripción"
                icon={<FileText />}
                placeholder="Ej. Refuerzo anual contra la rabia"
                rows={2}
                {...description.props}
            />

            <div className="flex flex-col gap-1.5">
                <span id="treatment-species-label" className="text-xs font-bold uppercase tracking-wider text-text">
                    Especies
                </span>
                <div role="group" aria-labelledby="treatment-species-label" className="flex flex-wrap gap-2">
                    {TREATMENT_SPECIES_OPTIONS.map((option) => {
                        const selected = species.includes(option);

                        return (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleSpecies(option)}
                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    selected
                                        ? "border-accent bg-mint text-accent"
                                        : "border-secondary bg-white text-text/70 hover:bg-mint/50"
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                {speciesTouched && speciesError && (
                    <p role="alert" className="text-xs text-danger-strong">{speciesError}</p>
                )}
            </div>

            <TextField
                label="Intervalo entre aplicaciones (días)"
                icon={<CalendarClock />}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="Opcional"
                {...interval.props}
            />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-text">Productos que consume</span>
                    <Button type="button" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={addRow}>
                        Agregar producto
                    </Button>
                </div>

                {rows.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-secondary px-4 py-3 text-xs text-text/60">
                        Sin productos: la aplicación no descontará nada del inventario. Agrega los productos y la
                        cantidad que usa cada aplicación.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {rows.map((row) => {
                            const options = supply.options.map((option) => ({
                                ...option,
                                disabled: rows.some((other) => other.key !== row.key && other.productId === option.value),
                            }));

                            return (
                                <li
                                    key={row.key}
                                    className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_7rem_auto]"
                                >
                                    <Dropdown
                                        label="Producto"
                                        icon={<Package />}
                                        options={options}
                                        value={row.productId}
                                        onValueChange={(value) => updateRow(row.key, { productId: value, touched: true })}
                                        error={row.touched ? productError(row) : undefined}
                                        placeholder="Selecciona un producto"
                                        searchable
                                        searchPlaceholder="Buscar producto..."
                                        noResultsMessage="No se encontraron productos con esa búsqueda."
                                        emptyMessage="No hay productos activos."
                                        loading={supply.loading}
                                    />

                                    <TextField
                                        label="Cantidad"
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        step={1}
                                        value={row.quantity}
                                        onValueChange={(value) => updateRow(row.key, { quantity: digitsOnly(value) })}
                                        onBlur={() => updateRow(row.key, { touched: true })}
                                        error={row.touched ? treatmentQuantityValidator(row.quantity) : undefined}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.key)}
                                        aria-label="Quitar producto"
                                        className="mt-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-danger-strong transition-colors hover:bg-danger-soft"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={submitting} loadingLabel="Guardando..." disabled={!isFormValid || submitting}>
                    Crear tratamiento
                </Button>
            </div>
        </form>
    );
}
