export const JSON_HEADERS = { "Content-Type": "application/json" };

//Parses a JSON list body. An empty body (204, or 200 without content) means "no results" instead of a JSON parse error
export async function readList<T>(response: Response): Promise<T[]> {
    const text = response.status === 204 ? "" : await response.text();
    return text.trim() ? (JSON.parse(text) as T[]) : [];
}

type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params: Record<string, QueryValue>): URLSearchParams {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        query.set(key, String(value));
    }
    return query;
}
