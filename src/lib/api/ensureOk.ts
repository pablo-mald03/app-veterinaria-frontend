interface ApiErrorBody {
    message?: string;
    errors?: Record<string, string>;
}

//Get error message pipe
async function getErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body: ApiErrorBody = await response.json();
        if (body.message) return body.message;
        if (body.errors) return Object.values(body.errors).join(" ");
        return fallback;
    } catch {
        return fallback;
    }
}

//Get the error message fallback
export async function ensureOk(response: Response, fallback: string): Promise<void> {
    if (!response.ok) {
        throw new Error(await getErrorMessage(response, fallback));
    }
}