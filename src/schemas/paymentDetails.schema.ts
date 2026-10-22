import { z } from "zod";
import { digitsOnly } from "@/lib/forms/transform";
import { isFutureExpiry, passesLuhn } from "@/lib/payments/card";

//Tarjeta
export const cardHolderSchema = z
    .string()
    .trim()
    .min(1, "El nombre del titular es obligatorio.")
    .min(3, "El nombre del titular es muy corto.")
    .max(60, "El nombre del titular no puede exceder 60 caracteres.")
    .regex(/^[\p{L}][\p{L}\s.'-]*$/u, "El nombre solo puede contener letras y espacios.");

export const cardNumberSchema = z
    .string()
    .min(1, "El número de tarjeta es obligatorio.")
    .refine((v) => {
        const length = digitsOnly(v).length;
        return length >= 13 && length <= 19;
    }, "El número de tarjeta debe tener entre 13 y 19 dígitos.")
    .refine(passesLuhn, "El número de tarjeta no es válido.");

export const cardExpirySchema = z
    .string()
    .min(1, "La fecha de vencimiento es obligatoria.")
    .regex(/^\d{2}\/\d{2}$/, "Usa el formato MM/AA.")
    .refine((v) => isFutureExpiry(v), "La tarjeta está vencida o la fecha no es válida.");

export const cardCvvSchema = z
    .string()
    .min(1, "El CVV es obligatorio.")
    .regex(/^\d{3,4}$/, "El CVV debe tener 3 o 4 dígitos.");

//Transferencia
export const transferBankSchema = z.string().min(1, "Selecciona el banco de origen.");

export const transferHolderSchema = z
    .string()
    .trim()
    .min(1, "El nombre del titular es obligatorio.")
    .max(60, "El nombre del titular no puede exceder 60 caracteres.");

export const transferReferenceSchema = z
    .string()
    .trim()
    .min(1, "El número de referencia es obligatorio.")
    .regex(/^[A-Za-z0-9-]{6,25}$/, "La referencia debe tener entre 6 y 25 caracteres (letras, números o guiones).");
