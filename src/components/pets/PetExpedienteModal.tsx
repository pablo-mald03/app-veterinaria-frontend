'use client';

import { X, Stethoscope } from "lucide-react";
import { Mascota, ConsultaExpediente } from "@/types/pet";

interface PetExpedienteModalProps {
  open: boolean;
  mascota: Mascota | null;
  consultas: ConsultaExpediente[];
  onClose: () => void;
}

// Representa el "expediente propio" de la mascota. Hasta que el backend defina
// una tabla real de historial clínico, esto vive con datos mock por mascota.
export default function PetExpedienteModal({ open, mascota, consultas, onClose }: PetExpedienteModalProps) {
  if (!open || !mascota) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
              Expediente de {mascota.name}
            </h2>
            <p className="text-sm text-[#2A2F63]/70">
              {mascota.especie} · {mascota.breed} · {mascota.age} años · {mascota.weight} kg
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-[#2A2F63]/60 hover:bg-[#E3F6F5]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {consultas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#A7E0DB] py-12 text-center">
              <Stethoscope className="h-8 w-8 text-[#A7E0DB]" />
              <p className="text-sm font-medium text-[#2A2F63]">Sin consultas registradas</p>
              <p className="text-xs text-[#2A2F63]/60">
                El historial clínico de {mascota.name} aparecerá aquí conforme se agenden citas.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[#E3F6F5]">
              {consultas.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2A2F63]">{c.fecha}</span>
                    <span className="text-xs text-[#3E6D9C]">{c.veterinario}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#2A2F63]/80">{c.motivo}</p>
                  {c.diagnostico && (
                    <p className="text-xs text-[#2A2F63]/60">Diagnóstico: {c.diagnostico}</p>
                  )}
                  {c.pesoRegistrado && (
                    <p className="text-xs text-[#2A2F63]/60">Peso registrado: {c.pesoRegistrado} kg</p>
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