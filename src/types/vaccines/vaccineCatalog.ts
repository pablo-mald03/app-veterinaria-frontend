// Formulario "Nueva vacuna". Los campos numéricos viajan como texto mientras se editan
// (igual que el resto del proyecto) y se convierten al enviar.
export interface VaccineCatalogInput {
  name: string;
  description: string;
  species: string;
  dosesRequired: number;
  intervalDays: number | null;
  status: boolean;
}
