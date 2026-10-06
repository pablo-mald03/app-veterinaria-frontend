
/*Spinner component to show the loading status */
export default function Spinner({ className = "h-6 w-6" }: { className?: string }) {
    return (
        <div role="status" aria-label="Cargando" className={`animate-spin rounded-full border-2 border-border border-t-primary ${className}`} />
    );
}