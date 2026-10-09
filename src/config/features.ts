// Banderas de funcionalidad para el desarrollo del frontend.

/**
 * Activa los datos simulados (mocks) de módulos que aún no tienen backend conectado
 * (hoy: consultas; antes también vacunación, antes de que su PR se fusionara).
 *
 * - Solo se activa con NEXT_PUBLIC_USE_MOCKS=true en el .env.local.
 * - NUNCA se activa en producción (NODE_ENV === "production"), aunque la variable exista,
 *   para no mostrar datos falsos a los usuarios reales.
 * - Se evalúa al compilar: después de cambiar la variable hay que reiniciar `npm run dev`.
 */
export const USE_MOCKS =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_USE_MOCKS === "true";
