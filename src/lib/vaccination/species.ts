// Compatibilidad entre la especie de la mascota y las especies de un tratamiento.
//
// El backend entrega `species` del tratamiento como arreglo de textos (["PERRO", "GATO"]).
// Se compara por palabras clave, sin acentos ni mayúsculas, y también se tolera un texto
// libre ("Perros y gatos") por si algún tratamiento antiguo viene así.

const SPECIES_MATCHERS: Record<string, RegExp> = {
    PERRO: /\b(PERROS?|CANINOS?|CANINAS?)\b/,
    GATO: /\b(GATOS?|FELINOS?|FELINAS?)\b/,
    AVE: /\b(AVES?|PAJAROS?)\b/,
    OTRO: /\bOTROS?\b/,
};

const UNIVERSAL = /\bTOD[OA]S?\b/;

function normalize(value: string): string {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

/**
 * ¿El tratamiento aplica para la especie de la mascota?
 * Es permisivo a propósito: si el tratamiento no menciona ninguna especie conocida
 * (lista vacía o formato desconocido) no se bloquea, para no impedir un registro válido.
 */
export function isTreatmentForSpecies(
    treatmentSpecies: string[] | string | null | undefined,
    petSpecies: string,
): boolean {
    const raw = Array.isArray(treatmentSpecies) ? treatmentSpecies.join(", ") : (treatmentSpecies ?? "");
    const text = normalize(raw);

    if (text.trim() === "" || UNIVERSAL.test(text)) return true;

    const mentionsKnownSpecies = Object.values(SPECIES_MATCHERS).some((matcher) => matcher.test(text));
    if (!mentionsKnownSpecies) return true;

    const matcher = SPECIES_MATCHERS[normalize(petSpecies)];
    return matcher ? matcher.test(text) : false;
}
