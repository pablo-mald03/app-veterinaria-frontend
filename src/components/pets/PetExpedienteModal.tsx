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
          <div className="flex items-center justify-between border-b border-[#E3F6F5] p-6">
            <div>
              <h2 className="text-xl font-bold text-[#2A2F63]">
                Expediente clínico
              </h2>
              <p className="text-sm text-[#2A2F63]/70">
                {mascota.name} · {mascota.especie} · {mascota.breed}
              </p>
            </div>
            <button
                onClick={onClose}
                className="rounded-full p-2 text-[#2A2F63]/60 hover:bg-[#E3F6F5]"
                aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Datos básicos de la mascota */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-[#E3F6F5]/50 p-4 text-sm">              <div>
                <span className="font-semibold text-[#2A2F63]">Dueño: </span>
                {mascota.ownerName ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-[#2A2F63]">Color: </span>
                {mascota.color}
              </div>
              <div>
                <span className="font-semibold text-[#2A2F63]">Edad: </span>
                {mascota.age} años
              </div>
              <div>
                <span className="font-semibold text-[#2A2F63]">Peso: </span>
                {mascota.weight} kg
              </div>
            </div>

            {/* Historial de consultas */}
            <h3 className="mb-3 text-sm font-bold text-[#2A2F63]">
              Historial de consultas
            </h3>

            {consultas.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#A7E0DB] py-10 text-center">
                  <FileText className="h-6 w-6 text-[#3E6D9C]" />
                  <p className="text-sm font-medium text-[#2A2F63]">
                    Aún no hay consultas registradas
                  </p>
                  <p className="text-xs text-[#2A2F63]/60">
                    Cuando se registre una consulta para esta mascota, va a
                    aparecer acá.
                  </p>
                </div>
            ) : (
                <ul className="flex flex-col divide-y divide-[#E3F6F5]">
                  {consultas.map((consulta) => (
                      <li key={consulta.id} className="py-3">
                        <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2A2F63]">
                      {consulta.motivo}
                    </span>
                          <span className="text-xs text-[#2A2F63]/60">
                      {consulta.fecha}
                    </span>
                        </div>
                        <p className="mt-1 text-sm text-[#2A2F63]/70">
                          Dr(a). {consulta.veterinario}
                        </p>
                        {consulta.diagnostico && (
                            <p className="mt-1 text-sm text-[#2A2F63]/70">
                              Diagnóstico: {consulta.diagnostico}
                            </p>
                        )}
                        {consulta.tratamiento && (
                            <p className="mt-1 text-sm text-[#2A2F63]/70">
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