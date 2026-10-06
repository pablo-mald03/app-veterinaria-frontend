import Link from "next/link";

//Page for the forbidden or denied permission
export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <h1 className="text-2xl font-semibold text-text">Sin acceso</h1>
            <p className="text-sm text-text/70">No tienes permiso para ver esta sección.</p>
            <Link href="/dashboard" className="font-medium text-accent underline">Volver al inicio</Link>
        </div>
    );
}