import { z } from "zod";

// Validaciones del formulario "Nuevo tratamiento" (catálogo), para que el error aparezca
// antes de enviar la petición. El backend siempre tiene la última palabra.

export const treatmentNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150, "Máximo 150 caracteres.");

export const treatmentDescriptionSchema = z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.");

/** Especies que se pueden elegir (las mismas que usa el expediente de la mascota). */
export const TREATMENT_SPECIES_OPTIONS = ["PERRO", "GATO", "AVE", "OTRO"] as const;

/** Al menos una especie. */
export function treatmentSpeciesError(selected: string[]): string | undefined {
    return selected.length === 0 ? "Selecciona al menos una especie." : undefined;
}

/** Entero positivo, opcional (si no se da, el tratamiento es de aplicación única y no calcula próxima fecha). */
export function treatmentIntervalValidator(value: string): string | undefined {
    const text = value.trim();
    if (!text) return undefined;
    if (!/^\d+$/.test(text)) return "Debe ser un número entero.";
    const n = Number(text);
    if (n < 1) return "Debe ser al menos 1 día.";
    if (n > 3650) return "Máximo 3650 días (10 años).";
    return undefined;
}

/** Cantidad de un producto por aplicación: entero entre 1 y 9999. */
export function treatmentQuantityValidator(value: string): string | undefined {
    const text = value.trim();
    if (!text) return "La cantidad es obligatoria.";
    if (!/^\d+$/.test(text)) return "Debe ser un número entero.";
    const n = Number(text);
    if (n < 1) return "Debe ser al menos 1.";
    if (n > 9999) return "Máximo 9999.";
    return undefined;
}
