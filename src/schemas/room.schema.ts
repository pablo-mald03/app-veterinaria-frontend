import { z } from "zod";

const MAX_INT32 = 2_147_483_647;

export const roomNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede exceder 100 caracteres.");

export const roomLocationSchema = z
    .string()
    .trim()
    .max(100, "La ubicación no puede exceder 100 caracteres.");

export const roomDescriptionSchema = z
    .string()
    .trim()
    .max(255, "La descripción no puede exceder 255 caracteres.");

//The number is handled as text in the form and converted on submit
export const roomNumberSchema = z
    .string()
    .trim()
    .min(1, "El número es obligatorio.")
    .regex(/^\d+$/, "El número solo debe contener dígitos.")
    .refine((v) => Number(v) >= 1 && Number(v) <= MAX_INT32, "Ingresa un número entre 1 y 2147483647.");
