"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, PawPrint, AlertTriangle, DollarSign } from "lucide-react";
import Can from "@/components/auth/Can";
import { useAuth } from "@/components/auth/AuthProvider";
import { appointmentService } from "@/services/appointmentService";
import { useAppointmentCatalogs } from "@/hooks/useAppointmentCatalogs";
import { useAppointmentScope } from "@/hooks/useAppointmentScope";
import { appointmentsOfDay, formatHour, statusLabel, statusVariant, todayLocal } from "@/lib/appointments/utils";
import DataTable from "@/components/ui/table/DataTable";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import StatusBadgeVariant from "@/components/ui/common/StatusBadgeVariant";
import type { AppointmentResponse } from "@/types/appointment";
import StatCard from "./StatCard";
import DashboardGreeting from "./DashboardGreeting";

//Principal dashboard layout
export default function Dashboard() {
  const { hasPermission } = useAuth();
  const { isVeterinarian, myUserId } = useAppointmentScope();
  const canSeeAppointments = hasPermission("citas:ver");

  const catalogs = useAppointmentCatalogs();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(canSeeAppointments);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canSeeAppointments) return;

    let active = true;
    appointmentService
        .getAll()
        .then((all) => {
          if (active) setAppointments(isVeterinarian ? all.filter((a) => a.userId === myUserId) : all);
        })
        .catch((err) => {
          if (active) setError(err instanceof Error ? err.message : "No se pudieron cargar las citas.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    return () => {
      active = false;
    };
  }, [canSeeAppointments, isVeterinarian, myUserId]);

  const columns: TableColumn<AppointmentResponse>[] = [
    { key: "hour", header: "Hora", className: "font-mono text-xs", render: (a) => formatHour(a.hour) },
    { key: "pet", header: "Mascota", className: "font-semibold", render: (a) => catalogs.petName(a.petId) },
    { key: "description", header: "Motivo", render: (a) => a.description || <span className="text-text/40">—</span> },
    { key: "room", header: "Sala", render: (a) => catalogs.roomName(a.roomId) },
    ...(isVeterinarian ? [] : [{ key: "vet", header: "Veterinario", render: (a: AppointmentResponse) => catalogs.userName(a.userId) }]),
    {
      key: "status",
      header: "Estado",
      render: (a) => <StatusBadgeVariant variant={statusVariant(a.status)}>{statusLabel(a.status)}</StatusBadgeVariant>,
    },
  ];

  const todayAppointments = useMemo(() => appointmentsOfDay(appointments, todayLocal()), [appointments]);

  return (
      <div className="flex min-h-full flex-col gap-8 bg-white p-8">
        <DashboardGreeting />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Can permission="citas:ver">
            <StatCard
                title={isVeterinarian ? "Mis Citas de Hoy" : "Citas de Hoy"}
                value={loading ? "…" : todayAppointments.length}
                icon={<CalendarCheck className="h-6 w-6" />}
                trend="Agenda del día"
            />
          </Can>
          <Can permission="mascotas:ver">
            <StatCard
                title="Pacientes Atendidos"
                value={0}
                icon={<PawPrint className="h-6 w-6" />}
                trend="Historial médico"
            />
          </Can>
          <Can permission="inventario:ver">
            <StatCard
                title="Alertas de Inventario"
                value={0}
                icon={<AlertTriangle className="h-6 w-6" />}
                trend="Medicamentos en nivel bajo"
            />
          </Can>
          <Can permission="facturacion:ver">
            <StatCard
                title="Ingresos del Día"
                value="Q0.00"
                icon={<DollarSign className="h-6 w-6" />}
                trend="Facturación"
            />
          </Can>
        </div>

        <Can permission="citas:ver">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-text">
              {isVeterinarian ? "Mis Citas de Hoy" : "Citas de Hoy"}
            </h2>

            <DataTable<AppointmentResponse>
                columns={columns}
                rows={todayAppointments}
                getRowKey={(a) => a.id}
                loading={loading || catalogs.loading}
                error={error}
                loadingLabel="Cargando citas..."
                emptyState={{
                  title: isVeterinarian ? "No tienes citas agendadas para hoy" : "Aún no hay citas registradas para hoy",
                  description: "Las citas del día aparecerán aquí.",
                  icon: <CalendarCheck className="h-8 w-8" />,
                }}
            />
          </div>
        </Can>
      </div>
  );
}