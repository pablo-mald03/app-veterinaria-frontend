import { z } from "zod";

//User validation schema

export const nameSchema = z.string().trim().min(1, "El nombre es obligatorio.");

export const lastNameSchema = z.string().trim().min(1, "El apellido es obligatorio.");

export const phoneSchema = z.string().trim().min(1, "El teléfono es obligatorio.").min(8, "El teléfono debe tener al menos 8 caracteres.");

export const userRegistrySchema = z.string().trim().min(1, "El usuario es obligatorio.").min(3, "El usuario debe tener al menos 3 caracteres.");

export const roleSchema = z.string().min(1, "Selecciona un rol.");