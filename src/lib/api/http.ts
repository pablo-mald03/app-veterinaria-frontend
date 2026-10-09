export const JSON_HEADERS = { "Content-Type": "application/json" };

type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params: Record<string, QueryValue>): URLSearchParams {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        query.set(key, String(value));
    }
    return query;
}
