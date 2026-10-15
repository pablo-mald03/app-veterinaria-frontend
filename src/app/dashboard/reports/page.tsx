"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileBarChart, FileText, PawPrint, Syringe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import TextField from "@/components/ui/common/TextField";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { reportService } from "@/services/reportService";
import type { AttendedPetReport, FrequentTreatmentReport, PendingVaccineReport } from "@/types/report";

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function formatDate(value: string | null) {
    if (!value) return "—";
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatMoney(value: number | null) {
    return value === null ? "—" : `Q ${value.toFixed(2)}`;
}

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

export default function ReportsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [from, setFrom] = useState(monthAgo);
    const [to, setTo] = useState(today);
    const [days, setDays] = useState("30");
    const [attendedPets, setAttendedPets] = useState<AttendedPetReport[]>([]);
    const [frequentTreatments, setFrequentTreatments] = useState<FrequentTreatmentReport[]>([]);
    const [pendingVaccines, setPendingVaccines] = useState<PendingVaccineReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        if (!from || !to || from > to) {
            setError("Selecciona un período válido: la fecha inicial no puede ser posterior a la fecha final.");
            return;
        }
        const parsedDays = Number(days);
        if (!Number.isInteger(parsedDays) || parsedDays < 1) {
            setError("Los días de vacunas pendientes deben ser un número mayor que cero.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const [attended, treatments, vaccines] = await Promise.all([
                reportService.attendedPets(from, to),
                reportService.frequentTreatments(from, to),
                reportService.pendingVaccines(parsedDays),
            ]);
            setAttendedPets(attended);
            setFrequentTreatments(treatments);
            setPendingVaccines(vaccines);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los reportes.");
        } finally {
            setLoading(false);
        }
    }, [days, from, to]);

    useEffect(() => {
        void loadReports();
    }, [loadReports]);

    const download = async (report: string, fileName: string, request: () => Promise<Blob>) => {
        setDownloading(report);
        try {
            downloadBlob(await request(), fileName);
        } catch (downloadError) {
            toast.error(downloadError instanceof Error ? downloadError.message : "No se pudo descargar el PDF.", "Error");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="flex min-h-full flex-col gap-8 bg-white p-8">
            <header className="flex items-center gap-3">
                <FileBarChart className="h-7 w-7 text-accent" aria-hidden="true" />
                <div>
                    <h1 className="text-2xl font-bold text-text">Reportes</h1>
                    <p className="text-sm text-text/70">Consulta y descarga los reportes operativos de la veterinaria.</p>
                </div>
            </header>

            <section className="rounded-2xl border border-mint bg-background p-5" aria-labelledby="filters-title">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 id="filters-title" className="text-lg font-bold text-text">Filtros</h2>
                    <span className="text-xs text-text/60">Administrador: {user?.name ?? "—"}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <TextField label="Desde" type="date" value={from} onValueChange={setFrom} />
                    <TextField label="Hasta" type="date" value={to} onValueChange={setTo} />
                    <TextField label="Días de vacunas pendientes" type="number" min={1} value={days} onValueChange={setDays} />
                </div>
                <Button className="mt-4" onClick={() => void loadReports()} loading={loading}>
                    Actualizar reportes
                </Button>
            </section>

            {error && <Alert variant="error">{error}</Alert>}

            <section className="grid gap-6 xl:grid-cols-3" aria-label="Reportes disponibles">
                <ReportCard
                    title="Mascotas atendidas"
                    description="Pacientes atendidos dentro del período seleccionado."
                    icon={<PawPrint className="h-6 w-6 text-accent" />}
                    count={attendedPets.length}
                    loading={downloading === "attended"}
                    onDownload={() => void download("attended", "mascotas-atendidas.pdf", () => reportService.downloadAttendedPetsPdf(from, to))}
                >
                    <div className="max-h-64 overflow-auto">
                        {attendedPets.map((row) => (
                            <div key={row.appointmentId} className="border-b border-mint py-2 text-sm last:border-0">
                                <div className="flex justify-between gap-3 font-semibold text-text">
                                    <span>{row.petName}</span><span>{formatMoney(row.cost)}</span>
                                </div>
                                <p className="text-xs text-text/60">{formatDate(row.date)} · {row.species}</p>
                            </div>
                        ))}
                        {!attendedPets.length && <p className="py-4 text-sm text-text/60">Sin registros en este período.</p>}
                    </div>
                </ReportCard>

                <ReportCard
                    title="Tratamientos frecuentes"
                    description="Tratamientos registrados y costos acumulados."
                    icon={<FileText className="h-6 w-6 text-accent" />}
                    count={frequentTreatments.length}
                    loading={downloading === "treatments"}
                    onDownload={() => void download("treatments", "tratamientos-frecuentes.pdf", () => reportService.downloadFrequentTreatmentsPdf(from, to))}
                >
                    <div className="max-h-64 overflow-auto">
                        {frequentTreatments.map((row) => (
                            <div key={row.treatment} className="flex justify-between gap-3 border-b border-mint py-2 text-sm last:border-0">
                                <span className="text-text">{row.treatment}</span>
                                <span className="text-right text-text/70">{row.timesApplied} · {formatMoney(row.totalCost)}</span>
                            </div>
                        ))}
                        {!frequentTreatments.length && <p className="py-4 text-sm text-text/60">Sin registros en este período.</p>}
                    </div>
                </ReportCard>

                <ReportCard
                    title="Vacunas pendientes"
                    description={`Vacunas con próxima dosis dentro de ${days} días.`}
                    icon={<Syringe className="h-6 w-6 text-accent" />}
                    count={pendingVaccines.length}
                    loading={downloading === "vaccines"}
                    onDownload={() => void download("vaccines", "vacunas-pendientes.pdf", () => reportService.downloadPendingVaccinesPdf(Number(days)))}
                >
                    <div className="max-h-64 overflow-auto">
                        {pendingVaccines.map((row) => (
                            <div key={`${row.petId}-${row.vaccineName}-${row.nextDoseDate}`} className="border-b border-mint py-2 text-sm last:border-0">
                                <div className="font-semibold text-text">{row.petName} · {row.vaccineName}</div>
                                <p className="text-xs text-text/60">Próxima dosis: {formatDate(row.nextDoseDate)}</p>
                            </div>
                        ))}
                        {!pendingVaccines.length && <p className="py-4 text-sm text-text/60">Sin vacunas pendientes.</p>}
                    </div>
                </ReportCard>
            </section>
        </div>
    );
}

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    count: number;
    loading: boolean;
    onDownload: () => void;
    children: React.ReactNode;
}

function ReportCard({ title, description, icon, count, loading, onDownload, children }: ReportCardProps) {
    return (
        <article className="rounded-2xl border border-mint bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-3">{icon}</div>
                    <h3 className="font-semibold text-text">{title}</h3>
                    <p className="mt-1 text-sm text-text/70">{description}</p>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-text">{count}</span>
            </div>
            <div className="mt-4">{children}</div>
            <Button className="mt-4 w-full" onClick={onDownload} loading={loading} icon={<Download className="h-4 w-4" />}>
                Descargar PDF
            </Button>
        </article>
    );
}
