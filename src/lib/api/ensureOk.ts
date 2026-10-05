async function getErrorMessage(response: Response, fallback: string) {
    try {
        const body = await response.json();
        return body.message || fallback;
    } catch {
        return fallback;
    }
}

export async function ensureOk(response: Response, fallback: string) {
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, fallback));
    }
}