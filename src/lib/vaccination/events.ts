// Aviso interno para que la campana se actualice apenas se registra una vacuna,
// sin esperar al siguiente refresco automático.

export const VACCINATIONS_CHANGED_EVENT = "vaccinations:changed";

export function notifyVaccinationsChanged(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(VACCINATIONS_CHANGED_EVENT));
}
