'use client';

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react";
import { Mascota, Especie } from "@/types/pet";
import PetFormModal from "./PetFormModal";
import PetExpedienteModal from "./PetExpedienteModal";
import ConfirmDialog from "../ui/Confirmdialog";
import { getClients } from "@/services/clientsService";
import { createPet, deletePet, getPets, updatePet } from "@/services/petsService";
import { ClientResponse } from "@/types/client-api";
import { PetRequest, PetResponse } from "@/types/pet-api";

const especies: (Especie | "TODAS")[] = ["TODAS", "PERRO", "GATO", "AVE", "OTRO"];

export default function PetTable() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [clientes, setClientes] = useState<ClientResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [especieFiltro, setEspecieFiltro] = useState<Especie | "TODAS">("TODAS");

  const [formAbierto, setFormAbierto] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<Mascota | null>(null);

  const [expedienteAbierto, setExpedienteAbierto] = useState(false);
  const [mascotaExpediente, setMascotaExpediente] = useState<Mascota | null>(null);

  // Mascota pendiente de confirmar eliminación (null = diálogo cerrado)
  const [mascotaAEliminar, setMascotaAEliminar] = useState<Mascota | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const [petsPage, clients] = await Promise.all([getPets(), getClients()]);
      setClientes(clients);
      setMascotas(petsPage.content.map((pet) => mapPetToMascota(pet, clients)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([getPets(), getClients()])
      .then(([petsPage, clients]) => {
        if (!mounted) return;
        setClientes(clients);
        setMascotas(petsPage.content.map((pet) => mapPetToMascota(pet, clients)));
      })
      .catch((loadError: unknown) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos.");
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const mascotasFiltradas = useMemo(() => {
    return mascotas.filter((m) => {
      const texto = `${m.name} ${m.ownerName ?? ""}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());
      const coincideEspecie = especieFiltro === "TODAS" || m.especie === especieFiltro;
      return coincideBusqueda && coincideEspecie;
    });
  }, [mascotas, busqueda, especieFiltro]);

  const abrirCrear = () => {
    setMascotaEditando(null);
    setFormAbierto(true);
  };

  const abrirEditar = (mascota: Mascota) => {
    setMascotaEditando(mascota);
    setFormAbierto(true);
  };

  const guardarMascota = async (mascota: Mascota) => {
    const request: PetRequest = {
      name: mascota.name,
      breed: mascota.breed,
      idClient: Number(mascota.clientId),
      color: mascota.color,
      age: mascota.age,
      weight: mascota.weight,
      species: mascota.especie,
      description: mascota.description,
    };

    if (mascotaEditando) {
      await updatePet(Number(mascota.id), request);
    } else {
      await createPet(request);
    }
    await cargarDatos();
  };

  // Solo abre el diálogo; el borrado real ocurre en confirmarEliminar()
  const pedirConfirmacionEliminar = (mascota: Mascota) => {
    setMascotaAEliminar(mascota);
  };

  const confirmarEliminar = async () => {
    if (!mascotaAEliminar) return;
    try {
      await deletePet(Number(mascotaAEliminar.id));
      setMascotaAEliminar(null);
      await cargarDatos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la mascota.");
    }
  };

  const abrirExpediente = (mascota: Mascota) => {
    setMascotaExpediente(mascota);
    setExpedienteAbierto(true);
  };

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
            Mascotas
          </h1>
          <p className="mt-1 text-sm text-[#2A2F63]/70">
            Pacientes registrados y su expediente clínico.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#3E6D9C]"
        >
          <Plus className="h-5 w-5" />
          Nueva Mascota
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A2F63]/50" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por mascota o dueño..."
            className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2A2F63] outline-none focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/30"
          />
        </div>
        <select
          value={especieFiltro}
          onChange={(e) => setEspecieFiltro(e.target.value as Especie | "TODAS")}
          className="rounded-xl border border-[#A7E0DB] bg-white px-4 py-2.5 text-sm text-[#2A2F63] outline-none focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/30"
        >
          {especies.map((esp) => (
            <option key={esp} value={esp}>
              {esp === "TODAS" ? "Todas las especies" : esp}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {cargando ? (
          <div className="p-14 text-center text-sm text-[#2A2F63]/70">Cargando mascotas...</div>
        ) : error ? (
          <div className="p-14 text-center text-sm text-red-600">{error}</div>
        ) : mascotasFiltradas.length === 0 ? (
          <div className="m-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#A7E0DB] py-14 text-center">
            <p className="text-sm font-medium text-[#2A2F63]">No se encontraron mascotas</p>
            <p className="text-xs text-[#2A2F63]/60">
              Ajusta la búsqueda o el filtro de especie, o registra una nueva.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#E3F6F5] text-xs font-semibold uppercase tracking-wide text-[#2A2F63]/70">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Especie / Raza</th>
                  <th className="px-6 py-3">Edad</th>
                  <th className="px-6 py-3">Peso</th>
                  <th className="px-6 py-3">Dueño</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3F6F5]">
                {mascotasFiltradas.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-[#E3F6F5]/40">
                    <td className="px-6 py-4 font-medium text-[#2A2F63]">{m.name}</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{m.especie} · {m.breed}</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{m.age} años</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{m.weight} kg</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{m.ownerName ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirExpediente(m)}
                          className="rounded-lg p-2 text-[#3E6D9C] transition-colors hover:bg-[#A7E0DB]/30"
                          aria-label={`Ver expediente de ${m.name}`}
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => abrirEditar(m)}
                          className="rounded-lg p-2 text-[#3E6D9C] transition-colors hover:bg-[#A7E0DB]/30"
                          aria-label={`Editar a ${m.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => pedirConfirmacionEliminar(m)}
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                          aria-label={`Eliminar a ${m.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PetFormModal
        key={`${formAbierto}-${mascotaEditando?.id ?? "nueva"}`}
        open={formAbierto}
        mascotaEditando={mascotaEditando}
        clientes={clientes}
        onClose={() => setFormAbierto(false)}
        onSave={guardarMascota}
      />
      <PetExpedienteModal
        open={expedienteAbierto}
        mascota={mascotaExpediente}
        consultas={[]}
        onClose={() => setExpedienteAbierto(false)}
      />
      <ConfirmDialog
        open={mascotaAEliminar !== null}
        title="Eliminar mascota"
        description={
          mascotaAEliminar
            ? `¿Seguro que quieres eliminar a ${mascotaAEliminar.name} del listado? Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={confirmarEliminar}
        onCancel={() => setMascotaAEliminar(null)}
      />
    </div>
  );
}

function mapPetToMascota(pet: PetResponse, clientes: ClientResponse[]): Mascota {
  const cliente = clientes.find((item) => item.id === pet.idClient);
  return {
    id: String(pet.idPet),
    name: pet.name,
    especie: pet.species as Especie,
    breed: pet.breed,
    color: pet.color,
    age: pet.age,
    weight: pet.weight,
    clientId: String(pet.idClient),
    ownerName: cliente ? `${cliente.firstName ?? cliente.firtsName ?? ""} ${cliente.lastName}`.trim() : undefined,
    description: pet.description,
  };
}