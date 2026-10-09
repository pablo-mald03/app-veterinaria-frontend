import { z } from "zod";

// Validaciones del formulario "Registrar consulta". Se registra una consulta YA REALIZADA
// (no se agenda una cita futura), por eso no hay fecha ni hora: las pone el servidor al guardar.

export const consultationReasonSchema = z
    .string()
    .trim()
    .min(1, "El motivo de la consulta es obligatorio.")
    .max(255, "Máximo 255 caracteres.");

export const consultationDiagnosisSchema = z
    .string()
    .trim()
    .min(1, "El diagnóstico es obligatorio.")
    .max(2000, "Máximo 2000 caracteres.");

export const consultationTreatmentSchema = z
    .string()
    .trim()
    .min(1, "El tratamiento es obligatorio.")
    .max(2000, "Máximo 2000 caracteres.");

const MAX_COST = 999_999.99;

/** Entero o decimal con hasta 2 decimales, entre 0 y MAX_COST. */
export function consultationCostValidator(value: string): string | undefined {
    const text = value.trim();

    if (!text) return "El costo es obligatorio.";
    // El signo "-" se admite aquí solo para poder mostrar el mensaje específico de "negativo";
    // cualquier otro formato inválido usa el mensaje genérico.
    if (!/^-?\d+(\.\d{1,2})?$/.test(text)) return "Ingresa un monto válido (hasta 2 decimales).";

    const cost = Number(text);
    if (cost < 0) return "El costo no puede ser negativo.";
    if (cost > MAX_COST) return `El costo no puede superar ${MAX_COST.toLocaleString("es-GT")}.`;

    return undefined;
}
