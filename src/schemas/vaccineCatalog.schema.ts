import { z } from "zod";

// Validaciones del formulario "Nueva vacuna" (catálogo). Reflejan las reglas de
// VaccineRequestDTO en el backend, para que el error aparezca antes de enviar la petición.

export const vaccineNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150, "Máximo 150 caracteres.");

export const vaccineDescriptionSchema = z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.");

export const vaccineSpeciesSchema = z
    .string()
    .trim()
    .min(1, "La especie es obligatoria.")
    .max(150, "Máximo 150 caracteres.");

/** Entero positivo (1–99). */
export function vaccineDosesValidator(value: string): string | undefined {
    const text = value.trim();
    if (!text) return "La cantidad de dosis es obligatoria.";
    if (!/^\d+$/.test(text)) return "Debe ser un número entero.";
    const n = Number(text);
    if (n < 1) return "Debe ser al menos 1 dosis.";
    if (n > 99) return "Máximo 99 dosis.";
    return undefined;
}

/** Entero positivo, opcional (si no se da, la vacuna no calcula próxima dosis). */
export function vaccineIntervalValidator(value: string): string | undefined {
    const text = value.trim();
    if (!text) return undefined;
    if (!/^\d+$/.test(text)) return "Debe ser un número entero.";
    const n = Number(text);
    if (n < 1) return "Debe ser al menos 1 día.";
    if (n > 3650) return "Máximo 3650 días (10 años).";
    return undefined;
}
