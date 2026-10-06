import { z } from "zod";

// Species catalog 
export const PET_SPECIES = ["PERRO", "GATO", "AVE", "OTRO"] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

// Pet validation schemas

export const petNameSchema = z
    .string()
    .trim()
    .min(1, "El nombre de la mascota es obligatorio.");

export const petSpeciesSchema = z.enum(PET_SPECIES, {
    message: "Selecciona una especie válida.",
});

export const petClientSchema = z
    .string()
    .trim()
    .min(1, "Selecciona un dueño válido.");

export const petBreedSchema = z
    .string()
    .trim()
    .max(60, "Máximo 60 caracteres.");

export const petColorSchema = z
    .string()
    .trim()
    .max(60, "Máximo 60 caracteres.");

export const petAgeSchema = z
    .string()
    .trim()
    .min(1, "La edad es obligatoria.")
    .refine((v) => !Number.isNaN(Number(v)), "La edad debe ser un número.")
    .transform((v) => Number(v))
    .refine((n) => n >= 0, "La edad no puede ser negativa.")
    .refine((n) => n <= 100, "La edad máxima es 100 años.");

export const petWeightSchema = z
    .string()
    .trim()
    .min(1, "El peso es obligatorio.")
    .refine((v) => !Number.isNaN(Number(v)), "El peso debe ser un número.")
    .transform((v) => Number(v))
    .refine((n) => n >= 0, "El peso no puede ser negativo.")
    .refine((n) => n <= 200, "El peso máximo es 200 kg.");

export const petDescriptionSchema = z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.");