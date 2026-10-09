// Estado de la vacuna más reciente de un carnet.
// Lo calcula el BACKEND (a partir de la fecha de próxima dosis); el frontend solo lo muestra.
export type EstadoVacuna = "AL_DIA" | "POR_VENCER" | "VENCIDA";
