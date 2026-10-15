"use client";

import { FileBarChart, FileText, PawPrint, Syringe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Alert from "@/components/ui/common/Alert";

const REPORTS = [
  {
    title: "Mascotas atendidas",
    description: "Resumen de pacientes atendidos por período.",
    icon: PawPrint,
  },
  {
    title: "Vacunas pendientes",
    description: "Mascotas con vacunas próximas o vencidas.",
    icon: Syringe,
  },
  {
    title: "Reportes clínicos",
    description: "Consultas y tratamientos registrados.",
    icon: FileText,
  },
];

export default function ReportsPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <header>
        <div className="flex items-center gap-3">
          <FileBarChart className="h-7 w-7 text-accent" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-text">Reportes</h1>
            <p className="text-sm text-text/70">
              Consulta y descarga los reportes operativos de la veterinaria.
            </p>
          </div>
        </div>
      </header>

      <Alert variant="warning">
        Los reportes estarán disponibles cuando el backend exponga sus endpoints.
      </Alert>

      <section aria-labelledby="reports-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="reports-title" className="text-lg font-bold text-text">
            Reportes disponibles
          </h2>
          <span className="text-xs text-text/60">
            Administrador: {user?.name ?? "—"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REPORTS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-mint bg-white p-5 shadow-sm">
              <Icon className="mb-4 h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="mt-2 text-sm text-text/70">{description}</p>
              <button
                type="button"
                disabled
                className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-text/50"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Generar PDF próximamente
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
