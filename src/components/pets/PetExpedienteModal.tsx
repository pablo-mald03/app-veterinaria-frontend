"use client";

import { X, FileText } from "lucide-react";
import { Mascota, ConsultaExpediente } from "@/types/pet";

interface PetExpedienteModalProps {
  open: boolean;
  mascota: Mascota | null;
  consultas: ConsultaExpediente[];
  onClose: () => void;
}

export default function PetExpedienteModal({
  open,
  mascota,
  consultas,
  onClose,
}: PetExpedienteModalProps) {
  if (!open || !mascota) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mint p-6">
          <div>
            <h2 className="text-xl font-bold text-text">
              Expediente clínico
            </h2>
            <p className="text-sm text-text/70">
              {mascota.name} · {mascota.especie} · {mascota.breed}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text/60 hover:bg-mint"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-text">
          {/* Datos básicos de la mascota */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-mint/50 p-4 text-sm">              <div>
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

          {/* Historial de consultas */}
          <h3 className="mb-3 text-sm font-bold text-text">
            Historial de consultas
          </h3>

          {consultas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary py-10 text-center">
              <FileText className="h-6 w-6 text-accent" />
              <p className="text-sm font-medium text-text">
                Aún no hay consultas registradas
              </p>
              <p className="text-xs text-text/60">
                Cuando se registre una consulta para esta mascota, va a
                aparecer acá.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-mint">
              {consultas.map((consulta) => (
                <li key={consulta.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">
                      {consulta.motivo}
                    </span>
                    <span className="text-xs text-text/60">
                      {consulta.fecha}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text/70">
                    Dr(a). {consulta.veterinario}
                  </p>
                  {consulta.diagnostico && (
                    <p className="mt-1 text-sm text-text/70">
                      Diagnóstico: {consulta.diagnostico}
                    </p>
                  )}
                  {consulta.tratamiento && (
                    <p className="mt-1 text-sm text-text/70">
                      Tratamiento: {consulta.tratamiento}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}