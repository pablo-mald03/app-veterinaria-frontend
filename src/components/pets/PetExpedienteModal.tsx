"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Alert from "@/components/ui/common/Alert";
import SegmentedTabs from "@/components/ui/common/SegmentedTabs";
import ConsultationHistoryTab from "@/components/consultation/ConsultationHistoryTab";
import PetVaccinationsTab from "@/components/vaccination/PetVaccinationsTab";
import { useConsultationHistory } from "@/hooks/useConsultationHistory";
import { usePetVaccinations } from "@/hooks/usePetVaccinations";
import { describeSummary, summarizeVaccinations } from "@/lib/vaccination/records";
import { Mascota, ConsultaExpediente } from "@/types/pet";

/** Pestañas del expediente. "vacunas" solo se muestra con el permiso vacunacion:ver. */
export type ExpedienteTab = "consultas" | "vacunas";

interface PetExpedienteModalProps {
  open: boolean;
  mascota: Mascota | null;
  /** @deprecated El historial ahora se carga del backend (o de mocks); esta prop ya no se usa. */
  consultas?: ConsultaExpediente[];
  /** Pestaña con la que se abre el expediente (por defecto "consultas"). */
  initialTab?: ExpedienteTab;
  onClose: () => void;
}

//Expediente clínico de la mascota (el contenido se monta solo mientras está abierto)
export default function PetExpedienteModal({
  open,
  mascota,
  initialTab = "consultas",
  onClose,
}: PetExpedienteModalProps) {
  if (!open || !mascota) return null;

  return <ExpedienteContent key={mascota.id} mascota={mascota} initialTab={initialTab} onClose={onClose} />;
}

interface ExpedienteContentProps {
  mascota: Mascota;
  initialTab: ExpedienteTab;
  onClose: () => void;
}

function ExpedienteContent({ mascota, initialTab, onClose }: ExpedienteContentProps) {
  const { hasPermission } = useAuth();
  const canViewVaccines = hasPermission("vacunacion:ver");

  const tabs: { value: ExpedienteTab; label: string }[] = canViewVaccines
    ? [
        { value: "consultas", label: "Consultas" },
        { value: "vacunas", label: "Vacunas" },
      ]
    : [{ value: "consultas", label: "Consultas" }];

  const [tab, setTab] = useState<ExpedienteTab>(canViewVaccines ? initialTab : "consultas");

  const petId = Number(mascota.id);
  const validPetId = Number.isInteger(petId) ? petId : null;
  

  const consultations = useConsultationHistory(validPetId);
  // Se pasa null cuando no hay permiso: así no se hace ninguna petición.
  const vaccinations = usePetVaccinations(canViewVaccines ? validPetId : null);

  const vaccinationSummary = summarizeVaccinations(vaccinations.records);
  const vaccinationSummaryText = describeSummary(vaccinationSummary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mint p-6">
          <div>
            <h2 className="text-xl font-bold text-text">Expediente clínico</h2>
            <p className="text-sm text-text/70">
              {mascota.name} · {mascota.especie} · {mascota.breed}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-text/60 hover:bg-mint" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-text">
          {/* Datos básicos de la mascota */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-mint/50 p-4 text-sm">
            <div>
              <span className="font-semibold text-text">Dueño: </span>
              {mascota.ownerName ?? "—"}
            </div>
            <div>
              <span className="font-semibold text-text">Color: </span>
              {mascota.color}
            </div>
            <div>
              <span className="font-semibold text-text">Edad: </span>
              {mascota.age} años
            </div>
            <div>
              <span className="font-semibold text-text">Peso: </span>
              {mascota.weight} kg
            </div>
          </div>

          {/* Aviso de vacunas vencidas o por vencer (visible en cualquier pestaña) */}
          {canViewVaccines && vaccinationSummaryText && (
            <div className="mb-4">
              <Alert variant={vaccinationSummary.overdue > 0 ? "error" : "warning"}>
                {vaccinationSummaryText}
                {tab !== "vacunas" && (
                  <button
                    type="button"
                    onClick={() => setTab("vacunas")}
                    className="ml-2 cursor-pointer font-bold underline"
                  >
                    Ver carnet
                  </button>
                )}
              </Alert>
            </div>
          )}

          {tabs.length > 1 && (
            <div className="mb-4">
              <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
            </div>
          )}

          {tab === "vacunas" && canViewVaccines ? (
            <PetVaccinationsTab
              mascota={mascota}
              records={vaccinations.records}
              loading={vaccinations.loading}
              error={vaccinations.error}
              onReload={vaccinations.reload}
            />
          ) : (
            <ConsultationHistoryTab
              mascota={mascota}
              history={consultations.history}
              loading={consultations.loading}
              error={consultations.error}
              onReload={consultations.reload}
            />
          )}
        </div>
      </div>
    </div>
  );
}
