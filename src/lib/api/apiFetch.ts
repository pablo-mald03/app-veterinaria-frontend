export class ForbiddenError extends Error { }

//Principal api fetching data
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(input, { ...init, credentials: "include" });

    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        throw new Error("Sesión expirada.");
    }

    if (res.status === 403) {
        throw new ForbiddenError("No tienes permiso para esta acción.");
    }

    return res;
}