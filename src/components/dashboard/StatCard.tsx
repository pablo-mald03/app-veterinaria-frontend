import { ReactNode } from "react";

/**
 * Los datos de las StatCardProps son definidios de Dashsboard
 * en la seccion Grid de estadísticas:
 */
interface StatCardProps {
  /** Título de la métrica, ej. "Pacientes Registrados" */
  title: string;
  /** Valor principal a mostrar */
  value: string | number;
  /** Ícono representativo (componente de lucide-react u otro ReactNode) */
  icon: ReactNode;
  /** Texto pequeño opcional debajo del valor, ej. "+3 hoy" */
  trend?: string;
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border-l-4 border-[#5FB0C9] bg-white p-5 shadow-md">
      {/* Contenedor circular del ícono, usando el color secundario como fondo suave */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A7E0DB]/30 text-[#3E6D9C]">
        {icon}
      </div>

      <div className="flex flex-col">
        <p className="text-sm font-medium text-[#2A2F63]/70">{title}</p>
        <p className="text-2xl font-bold text-[#2A2F63]">{value}</p>

        {/* El trend solo se renderiza si viene definido */}
        {trend && (
          <p className="mt-1 text-xs font-medium text-[#3E6D9C]">{trend}</p>
        )}
      </div>
    </div>
  );
}