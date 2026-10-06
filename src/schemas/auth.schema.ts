import { z } from "zod";

/*Authentication schema validations definition */

export const emailSchema = z.string().trim().min(1, "El correo es obligatorio.").pipe(z.email("Ingresa un correo válido."));

export const loginPasswordSchema = z.string().min(1, "La contraseña es obligatoria.");

export const newPasswordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres.");

export const dpiSchema = z.string().min(1, "El DPI es obligatorio.").min(13, "El DPI debe contener 13 dígitos.").max(13, "El DPI debe contener 13 dígitos.");