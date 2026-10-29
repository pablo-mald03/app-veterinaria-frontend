import { z } from "zod";

const MAX_INT32 = 2_147_483_647;

export const productSkuSchema = z
    .string()
    .trim()
    .min(1, "El SKU es obligatorio.")
    .max(12, "El SKU no puede exceder 12 caracteres.");

export const productNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "El nombre no puede exceder 120 caracteres.");

export const productBrandSchema = z.string().trim().max(120, "La marca no puede exceder 120 caracteres.");

export const productProviderSchema = z.string().trim().max(150, "El proveedor no puede exceder 150 caracteres.");

export const productDescriptionSchema = z.string().trim().max(255, "La descripción no puede exceder 255 caracteres.");

export const productCategorySchema = z.string().min(1, "Selecciona una categoría.");

export const productPriceSchema = z
    .string()
    .trim()
    .min(1, "El precio es obligatorio.")
    .regex(/^\d{1,10}(\.\d{1,2})?$/, "Ingresa un monto válido (hasta 10 enteros y 2 decimales).");

export const productProfitSchema = z
    .string()
    .trim()
    .min(1, "El porcentaje de ganancia es obligatorio.")
    .regex(/^\d+$/, "El porcentaje debe ser un número entero.")
    .refine((v) => Number(v) <= 100, "El porcentaje máximo es 100.");

export const productMinStockSchema = z
    .string()
    .trim()
    .min(1, "El stock mínimo es obligatorio.")
    .regex(/^\d+$/, "El stock mínimo solo debe contener dígitos.")
    .refine((v) => Number(v) >= 0 && Number(v) <= MAX_INT32, "Ingresa un número igual o mayor a 0.");

export const productDiscountSchema = z
    .string()
    .trim()
    .min(1, "El descuento es obligatorio.")
    .regex(/^\d+$/, "El descuento debe ser un número entero.")
    .refine((v) => Number(v) <= 100, "El descuento máximo es 100.");

export const productExpirationSchema = z
    .string()
    .trim()
    .min(1, "La fecha de vencimiento es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Ingresa una fecha válida.")
    .refine((value) => {
        const normalized = value.length === 16 ? `${value}:00` : value;
        const now = new Date();
        const pad = (part: number) => String(part).padStart(2, "0");
        const current = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        return normalized >= current;
    }, "La fecha no puede ser anterior al momento actual.");
