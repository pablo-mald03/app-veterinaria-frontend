import { z } from "zod";

//Principal role schema validation
export const roleAliasSchema = z
    .string()
    .trim()
    .min(1, "El alias es obligatorio.")
    .min(3, "El alias debe tener al menos 3 caracteres.")
    .max(30, "El alias no puede exceder 30 caracteres.")
    .regex(
        /^[A-Z][A-Z0-9_]*$/,
        "El alias debe empezar con mayúscula y solo contener A-Z, 0-9 y guión bajo."
    );

export const roleNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(60, "El nombre no puede exceder 60 caracteres.");

export const roleDescriptionSchema = z
    .string()
    .trim()
    .max(200, "La descripción no puede exceder 200 caracteres.");