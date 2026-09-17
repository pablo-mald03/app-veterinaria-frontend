'use client';

import { useMemo, useRef, useState } from "react";
import { X, Search, ChevronDown, Check } from "lucide-react";
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

function nombreCliente(cliente: ClientResponse) {
  return `${cliente.firstName ?? cliente.firtsName ?? ""} ${cliente.lastName}`.trim();
}

export default function PetFormModal({ open, mascotaEditando, clientes, onClose, onSave }: PetFormModalProps) {
  const [form, setForm] = useState<Omit<Mascota, "id">>(() =>
    mascotaEditando ? obtenerDatosFormulario(mascotaEditando) : formVacio,
  );
  // Buffers de texto libre para edad y peso: permiten escribir directamente
  // (incluyendo decimales a medio escribir) sin que React los "corrija" en cada tecla.
  const [ageText, setAgeText] = useState(String(form.age ?? ""));
  const [weightText, setWeightText] = useState(String(form.weight ?? ""));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (!open) return null;

  const handleAgeChange = (value: string) => {
    if (/^\d*$/.test(value)) setAgeText(value);
  };

  const handleWeightChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) setWeightText(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.clientId) {
      setError("Selecciona un dueño para la mascota.");
      return;
    }

    const age = ageText === "" ? 0 : parseInt(ageText, 10);
    const weight = weightText === "" || weightText === "." ? 0 : parseFloat(weightText);

    setGuardando(true);
    try {
      await onSave({
        id: mascotaEditando?.id ?? "",
        ...form,
        age,
        weight,
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la mascota.");
    } finally {
      setGuardando(false);
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={ageText}
                onChange={(e) => handleAgeChange(e.target.value)}
                className={numberInputClass}
              />
            </Campo>
            <Campo label="Peso (kg)">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={weightText}
                onChange={(e) => handleWeightChange(e.target.value)}
                className={numberInputClass}
              />
            </Campo>
          </div>

          <Campo label="Dueño">
            <ClienteSelector
              clientes={clientes}
              clientIdSeleccionado={form.clientId}
              onSeleccionar={(cliente) =>
                setForm({
                  ...form,
                  clientId: String(cliente.id),
                  ownerName: nombreCliente(cliente),
                })
              }
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
              disabled={guardando}
              className="rounded-xl bg-[#5FB0C9] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3E6D9C] disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ClienteSelectorProps {
  clientes: ClientResponse[];
  clientIdSeleccionado: string;
  onSeleccionar: (cliente: ClientResponse) => void;
}

function ClienteSelector({ clientes, clientIdSeleccionado, onSeleccionar }: ClienteSelectorProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);

  const clienteSeleccionado = clientes.find((c) => String(c.id) === clientIdSeleccionado);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => `${nombreCliente(c)} ${c.dpi}`.toLowerCase().includes(q));
  }, [clientes, busqueda]);

  const handleBlur = () => {
    // Pequeño delay para permitir que el click en una opción se registre antes de cerrar.
    setTimeout(() => setAbierto(false), 120);
  };

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        onBlur={handleBlur}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={clienteSeleccionado ? "text-[#2A2F63]" : "text-[#2A2F63]/40"}>
          {clienteSeleccionado ? nombreCliente(clienteSeleccionado) : "Selecciona un dueño"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#3E6D9C]" />
      </button>

      {abierto && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#A7E0DB] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#E3F6F5] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#3E6D9C]" />
            <input
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o DPI..."
              className="w-full text-sm text-[#2A2F63] outline-none placeholder:text-[#2A2F63]/40"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtrados.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-[#2A2F63]/60">
                Sin resultados. Registra el cliente primero en el módulo de Clientes.
              </li>
            ) : (
              filtrados.map((cliente) => {
                const seleccionado = String(cliente.id) === clientIdSeleccionado;
                return (
                  <li key={cliente.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSeleccionar(cliente);
                        setBusqueda("");
                        setAbierto(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#E3F6F5] ${
                        seleccionado ? "bg-[#E3F6F5]/60 font-semibold text-[#2A2F63]" : "text-[#2A2F63]"
                      }`}
                    >
                      <span>
                        {nombreCliente(cliente)}
                        <span className="ml-2 text-xs text-[#2A2F63]/50">{cliente.dpi}</span>
                      </span>
                      {seleccionado && <Check className="h-4 w-4 text-[#5FB0C9]" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
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

// Igual que inputClass, pero sin las flechas nativas del navegador (ya no se usa type="number").
const numberInputClass = inputClass;

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-[#2A2F63]/80">{label}</span>
      {children}
    </label>
  );
}