import { CalendarCheck, PawPrint, AlertTriangle, DollarSign } from "lucide-react";
import Can from "@/components/auth/Can";
import StatCard from "./StatCard";
import DashboardGreeting from "./DashboardGreeting";

// Forma de una cita para la lista de "Próximas Citas".
// Cuando se conecte con la API, este arreglo vendrá de userService/citasService.
interface CitaResumen {
  paciente: string;
  hora: string;
  motivo: string;
}

// Placeholder vacío hasta conectar con el backend real
const proximasCitas: CitaResumen[] = [];

//Principal dashboard layout
export default function Dashboard() {
  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <DashboardGreeting />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Can permission="citas:ver">
          <StatCard
            title="Citas de Hoy"
            value={0}
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
            Próximas Citas
          </h2>

          {proximasCitas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-secondary py-10 text-center">
              <p className="text-sm font-medium text-text">
                Aún no hay citas registradas para hoy
              </p>
              <p className="text-xs text-text/60">
                Las próximas citas agendadas aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-mint">
              {proximasCitas.map((cita, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <span className="font-medium text-text">{cita.paciente}</span>
                  <span className="text-sm text-text/70">{cita.motivo}</span>
                  <span className="text-sm font-semibold text-accent">{cita.hora}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Can>
    </div>
  );
}