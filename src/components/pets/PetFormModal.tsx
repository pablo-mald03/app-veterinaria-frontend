'use client';

import { useState } from "react";
import { X } from "lucide-react";
import { Mascota, Especie } from "@/types/pet";
import { ClientResponse } from "@/types/client-api";

interface PetFormModalProps {
  open: boolean;
  mascotaEditando: Mascota | null; // null = modo creación
  clientes: ClientResponse[];
  onClose: () => void;
  onSave: (mascota: Mascota) => Promise<void>;
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

export default function PetFormModal({ open, mascotaEditando, clientes, onClose, onSave }: PetFormModalProps) {
  const [form, setForm] = useState<Omit<Mascota, "id">>(() =>
    mascotaEditando ? obtenerDatosFormulario(mascotaEditando) : formVacio,
  );
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.clientId) {
      setError("Selecciona un dueño para la mascota.");
      return;
    }

    try {
      await onSave({
        id: mascotaEditando?.id ?? "",
        ...form,
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la mascota.");
    }
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
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
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

          <Campo label="Dueño">
            <select
              required
              value={form.clientId}
              onChange={(e) => {
                const clientId = e.target.value;
                const cliente = clientes.find((item) => String(item.id) === clientId);
                setForm({
                  ...form,
                  clientId,
                  ownerName: cliente ? `${cliente.firstName ?? cliente.firtsName ?? ""} ${cliente.lastName}`.trim() : "",
                });
              }}
              className={inputClass}
            >
              <option value="">Selecciona un dueño</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.firstName ?? cliente.firtsName ?? ""} {cliente.lastName}
                </option>
              ))}
            </select>
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