import { z } from "zod";

export const clientDpiSchema = z
    .string()
    .trim()
    .min(1, "El DPI es obligatorio.")
    .length(13, "El DPI debe tener exactamente 13 dígitos.")
    .regex(/^\d+$/, "El DPI solo debe contener números.");

export const clientFirstNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.");

export const clientLastNameSchema = z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio.");

export const clientPhoneSchema = z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 8, "El teléfono debe tener al menos 8 caracteres.");

export const clientEmailSchema = z
    .string()
    .trim()
    .refine(
        (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Correo electrónico inválido."
    );

export const clientAddressSchema = z
    .string()
    .trim()
    .max(200, "La dirección no puede exceder 200 caracteres.");