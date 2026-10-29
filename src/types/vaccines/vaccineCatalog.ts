import type { TreatmentProduct } from "@/types/vaccination-api";

// Formulario "Nuevo tratamiento". Los campos numéricos viajan como texto mientras se editan
// (igual que el resto del proyecto) y se convierten al enviar.
export interface TreatmentCatalogInput {
  name: string;
  description: string;
  species: string[];
  intervalDays: number | null;
  products: TreatmentProduct[];
}
