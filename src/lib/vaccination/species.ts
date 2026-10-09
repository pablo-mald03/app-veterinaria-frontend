// Compatibilidad entre la especie de la mascota y la(s) especie(s) de una vacuna.
//
// El backend guarda `species` de la vacuna como texto libre ("PERRO", "Perros y gatos",
// "PERRO, GATO"...), así que se compara por palabras clave, sin acentos ni mayúsculas.

const SPECIES_MATCHERS: Record<string, RegExp> = {
    PERRO: /\b(PERROS?|CANINOS?|CANINAS?)\b/,
    GATO: /\b(GATOS?|FELINOS?|FELINAS?)\b/,
    AVE: /\b(AVES?|PAJAROS?)\b/,
    OTRO: /\bOTROS?\b/,
};

const UNIVERSAL = /\bTOD[OA]S?\b/;

function normalize(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/**
 * ¿La vacuna aplica para la especie de la mascota?
 * Es permisivo a propósito: si el texto de la vacuna no menciona ninguna especie conocida
 * (formato desconocido) no se bloquea, para no impedir un registro válido.
 */
export function isVaccineForSpecies(vaccineSpecies: string | null | undefined, petSpecies: string): boolean {
    const text = normalize(vaccineSpecies ?? "");

    if (text.trim() === "" || UNIVERSAL.test(text)) return true;

    const mentionsKnownSpecies = Object.values(SPECIES_MATCHERS).some((matcher) => matcher.test(text));
    if (!mentionsKnownSpecies) return true;

    const matcher = SPECIES_MATCHERS[normalize(petSpecies)];
    return matcher ? matcher.test(text) : false;
}
