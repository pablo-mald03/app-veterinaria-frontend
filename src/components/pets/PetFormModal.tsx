'use client';

import { useState } from "react";
import { X } from "lucide-react";
import { Mascota, Especie } from "@/types/pet";

interface PetFormModalProps {
  open: boolean;
  mascotaEditando: Mascota | null; // null = modo creación
  onClose: () => void;
  onSave: (mascota: Mascota) => void;
}

const especies: Especie[] = ["PERRO", "GATO", "AVE", "OTRO"];

const formVacio: Omit<Mascota, "id"> = {
  name: "",
  especie: "PERRO",
  breed: "",
  color: "",
  age: 0,
  weight: 0,
  clientId: "",
  ownerName: "",
  description: "",
};

export default function PetFormModal({ open, mascotaEditando, onClose, onSave }: PetFormModalProps) {
  const [form, setForm] = useState<Omit<Mascota, "id">>(() =>
    mascotaEditando ? obtenerDatosFormulario(mascotaEditando) : formVacio,
  );

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: mascotaEditando?.id ?? crypto.randomUUID(),
      ...form,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
            {mascotaEditando ? "Editar Mascota" : "Nueva Mascota"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-[#2A2F63]/60 hover:bg-[#E3F6F5]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Nombre">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Campo>
            <Campo label="Especie">
              <select
                value={form.especie}
                onChange={(e) => setForm({ ...form, especie: e.target.value as Especie })}
                className={inputClass}
              >
                {especies.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Raza">
              <input
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className={inputClass}
              />
            </Campo>
            <Campo label="Color">
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className={inputClass}
              />
            </Campo>
            <Campo label="Edad (años)">
              <input
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className={inputClass}
              />
            </Campo>
            <Campo label="Peso (kg)">
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                className={inputClass}
              />
            </Campo>
          </div>

          {/* Texto libre por ahora; cuando exista un buscador real de clientes,
              esto se reemplaza por un <select> o autocompletado contra /api/clientes */}
          <Campo label="Dueño (nombre)">
            <input
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              className={inputClass}
              placeholder="Se reemplazará por un buscador de clientes reales"
            />
          </Campo>

          <Campo label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </Campo>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#2A2F63] hover:bg-[#E3F6F5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#5FB0C9] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3E6D9C]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function obtenerDatosFormulario(mascota: Mascota): Omit<Mascota, "id"> {
  const { id, ...resto } = mascota;
  void id;
  return resto;
}

const inputClass =
  "w-full rounded-xl border border-[#A7E0DB] bg-white px-3 py-2 text-sm text-[#2A2F63] outline-none focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/30";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[#2A2F63]/80">{label}</span>
      {children}
    </label>
  );
}