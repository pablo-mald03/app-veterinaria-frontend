import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

export const appointmentPetSchema = required("Selecciona una mascota.");
export const appointmentUserSchema = required("Selecciona un veterinario.");
export const appointmentRoomSchema = required("Selecciona una habitación.");
export const appointmentDateSchema = required("La fecha es obligatoria.").regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida.");
export const appointmentHourSchema = required("La hora es obligatoria.").regex(/^\d{2}:\d{2}/, "La hora no es válida.");

export const appointmentDescriptionSchema = z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres.")
    .max(255, "El motivo no puede exceder 255 caracteres.");

export const appointmentDiagnosisSchema = z.string().trim().max(500, "El diagnóstico no puede exceder 500 caracteres.");
export const appointmentTreatmentSchema = z.string().trim().max(500, "El tratamiento no puede exceder 500 caracteres.");

export const appointmentCostSchema = z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d+(\.\d{1,2})?$/.test(v), "Ingresa un monto válido (máx. 2 decimales).");
