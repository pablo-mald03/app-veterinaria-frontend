import { CalendarCheck, PawPrint, AlertTriangle, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

// Forma de una cita para la lista de "Próximas Citas".
// Cuando se conecte con la API, este arreglo vendrá de userService/citasService.
interface CitaResumen {
  paciente: string;
  hora: string;
  motivo: string;
}

// Placeholder vacío hasta conectar con el backend real
const proximasCitas: CitaResumen[] = [];

export default function Dashboard() {
  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <div>
        <h1
          className="text-3xl font-bold text-[#2A2F63]"
          style={{ fontFamily: "'Young Serif', serif" }}
        >
          Bienvenido de nuevo
        </h1>
        <p className="mt-1 text-sm text-[#2A2F63]/70">
          Este es el resumen de actividad de hoy en Happy Pets.
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Citas de Hoy"
          value={0}
          icon={<CalendarCheck className="h-6 w-6" />}
          trend="Agenda del día"
        />
        <StatCard
          title="Pacientes Atendidos"
          value={0}
          icon={<PawPrint className="h-6 w-6" />}
          trend="Historial médico"
        />
        <StatCard
          title="Alertas de Inventario"
          value={0}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend="Medicamentos en nivel bajo"
        />
        <StatCard
          title="Ingresos del Día"
          value="Q0.00"
          icon={<DollarSign className="h-6 w-6" />}
          trend="Facturación"
        />
      </div>

      {/* Sección de próximas citas: tabla/lista simple con estado vacío */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold text-[#2A2F63]">
          Próximas Citas
        </h2>

        {proximasCitas.length === 0 ? (
          // Estado vacío: le dice al usuario qué esperar, no solo que "no hay nada"
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#A7E0DB] py-10 text-center">
            <p className="text-sm font-medium text-[#2A2F63]">
              Aún no hay citas registradas para hoy
            </p>
            <p className="text-xs text-[#2A2F63]/60">
              Las próximas citas agendadas aparecerán aquí.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[#E3F6F5]">
            {proximasCitas.map((cita, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <span className="font-medium text-[#2A2F63]">{cita.paciente}</span>
                <span className="text-sm text-[#2A2F63]/70">{cita.motivo}</span>
                <span className="text-sm font-semibold text-[#3E6D9C]">{cita.hora}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}