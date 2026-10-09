"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import PetModal from "@/components/pets/PetModal";
import PetExpedienteModal, { type ExpedienteTab } from "@/components/pets/PetExpedienteModal";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import PageHeader from "@/components/ui/common/PageHeader";
import SearchBar from "@/components/ui/common/SearchBar";
import SpeciesFilter from "@/components/pets/SpeciesFilter";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { getClients } from "@/services/clientsService";
import { createPet, deletePet, getPetById, getPets, updatePet } from "@/services/petsService";
import type { ClientResponse } from "@/types/client-api";
import type { Especie, Mascota } from "@/types/pet";
import type { PetRequest, PetResponse } from "@/types/pet-api";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import ConfirmDialog from "../ui/dialogs/Confirmdialog";

// ---- Helpers ----

function getClientFullName(c: ClientResponse): string {
  return `${c.firstName ?? c.firtsName ?? ""} ${c.lastName}`.trim();
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
    ownerName: cliente ? getClientFullName(cliente) : undefined,
    description: pet.description,
  };
}

// ---- Components ----

//Principal pet table component
export default function PetTable() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Enlace profundo desde la campana de vacunas: /dashboard/pets?mascota=ID&tab=vacunas
  const mascotaParam = searchParams.get("mascota");
  const tabParam = searchParams.get("tab");

  const canCreate = hasPermission("mascotas:crear");
  const canEdit = hasPermission("mascotas:editar");
  const canDelete = hasPermission("mascotas:eliminar");
  const canViewRecord = hasPermission("mascotas:ver");

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [clientes, setClientes] = useState<ClientResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [especieFiltro, setEspecieFiltro] = useState<Especie | "TODAS">("TODAS");

  const [formAbierto, setFormAbierto] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<Mascota | null>(null);
  const [expedienteAbierto, setExpedienteAbierto] = useState(false);
  const [mascotaExpediente, setMascotaExpediente] = useState<Mascota | null>(null);
  const [mascotaAEliminar, setMascotaAEliminar] = useState<Mascota | null>(null);
  const [mascotaRemota, setMascotaRemota] = useState<Mascota | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setLoadError(null);
    try {
      const [petsPage, clients] = await Promise.all([getPets(), getClients()]);
      setClientes(clients);
      setMascotas(petsPage.content.map((pet) => mapPetToMascota(pet, clients)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los datos.";
      setLoadError(message);
      toast.error(message, "Error al cargar mascotas");
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  // La tabla solo carga la primera página: si la mascota del enlace no está en ella, se pide por id.
  const mascotaLocal = mascotaParam ? mascotas.find((m) => m.id === mascotaParam) : undefined;

  useEffect(() => {
    if (cargando || !mascotaParam || mascotaLocal) return;

    const petId = Number(mascotaParam);
    if (!Number.isInteger(petId)) {
      router.replace("/dashboard/pets");
      return;
    }

    let cancelado = false;

    getPetById(petId)
      .then((pet) => {
        if (!cancelado) setMascotaRemota(mapPetToMascota(pet, clientes));
      })
      .catch(() => {
        if (cancelado) return;
        toast.error("No se pudo abrir el expediente de la mascota indicada.", "Mascota no encontrada");
        router.replace("/dashboard/pets");
      });

    return () => {
      cancelado = true;
    };
  }, [cargando, mascotaParam, mascotaLocal, clientes, toast, router]);

  // El expediente se abre por clic en la tabla o por el enlace; se deriva sin estado extra.
  const mascotaEnlace = mascotaLocal ?? (mascotaRemota?.id === mascotaParam ? mascotaRemota : null);
  const expedienteVisible = expedienteAbierto || mascotaEnlace !== null;
  const expedienteMascota = mascotaEnlace ?? mascotaExpediente;
  const expedienteTab: ExpedienteTab = mascotaEnlace && tabParam === "vacunas" ? "vacunas" : "consultas";

  const cerrarExpediente = () => {
    setExpedienteAbierto(false);
    if (mascotaParam) router.replace("/dashboard/pets");
  };

  const mascotasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return mascotas.filter((m) => {
      const coincideBusqueda = `${m.name} ${m.ownerName ?? ""}`.toLowerCase().includes(q);
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

  const abrirExpediente = (mascota: Mascota) => {
    setMascotaExpediente(mascota);
    setExpedienteAbierto(true);
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

    try {
      if (mascotaEditando) {
        await updatePet(Number(mascotaEditando.id), request);
        toast.success("Mascota actualizada", mascota.name);
      } else {
        await createPet(request);
        toast.success("Mascota registrada", mascota.name);
      }
      setFormAbierto(false);
      await cargarDatos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar la mascota.";
      toast.error(message, "Error al guardar");
      throw err;
    }
  };

  const confirmarEliminar = async () => {
    if (!mascotaAEliminar) return;
    try {
      await deletePet(Number(mascotaAEliminar.id));
      toast.warning(`${mascotaAEliminar.name} eliminada`, "Mascota removida");
      setMascotaAEliminar(null);
      await cargarDatos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar la mascota.";
      toast.error(message, "Error al eliminar");
      throw err;
    }
  };

  const columns: TableColumn<Mascota>[] = [
    { key: "name", header: "Nombre", className: "font-medium text-text" },
    {
      key: "species",
      header: "Especie / Raza",
      className: "text-text/80",
      render: (m) => `${m.especie} · ${m.breed || "—"}`,
    },
    {
      key: "age",
      header: "Edad",
      className: "text-text/80",
      render: (m) => `${m.age} años`,
    },
    {
      key: "weight",
      header: "Peso",
      className: "text-text/80",
      render: (m) => `${m.weight} kg`,
    },
    {
      key: "owner",
      header: "Dueño",
      className: "text-text/80",
      render: (m) => m.ownerName ?? "—",
    },
  ];

  const showActions = canViewRecord || canEdit || canDelete;
  const nombreAEliminar = mascotaAEliminar?.name ?? "";

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <PageHeader
        title="Mascotas"
        subtitle="Pacientes registrados y su expediente clínico."
        action={
          canCreate && (
            <button
              type="button"
              onClick={abrirCrear}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-accent"
            >
              <Plus className="h-5 w-5" />
              Nueva Mascota
            </button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por mascota o dueño..."
          />
        </div>
        <SpeciesFilter value={especieFiltro} onChange={setEspecieFiltro} />
      </div>

      <DataTable<Mascota>
        columns={columns}
        rows={mascotasFiltradas}
        getRowKey={(m) => m.id}
        loading={cargando}
        error={loadError}
        loadingLabel="Cargando mascotas..."
        emptyState={{
          title: "No se encontraron mascotas",
          description: "Ajusta la búsqueda o el filtro de especie, o registra una nueva.",
        }}
        actions={
          showActions
            ? {
              render: (m) => (
                <RowActions
                  actions={[
                    {
                      icon: <FileText className="h-4 w-4" />,
                      label: `Ver expediente de ${m.name}`,
                      onClick: () => abrirExpediente(m),
                      variant: "default",
                      visible: canViewRecord,
                    },
                    {
                      icon: <Pencil className="h-4 w-4" />,
                      label: `Editar a ${m.name}`,
                      onClick: () => abrirEditar(m),
                      variant: "default",
                      visible: canEdit,
                    },
                    {
                      icon: <Trash2 className="h-4 w-4" />,
                      label: `Eliminar a ${m.name}`,
                      onClick: () => setMascotaAEliminar(m),
                      variant: "danger",
                      visible: canDelete,
                    },
                  ]}
                />
              ),
            }
            : undefined
        }
      />

      <PetModal
        open={formAbierto}
        mascotaEditando={mascotaEditando}
        clientes={clientes}
        onClose={() => setFormAbierto(false)}
        onSave={guardarMascota}
      />

      <PetExpedienteModal
        open={expedienteVisible}
        mascota={expedienteMascota}
        consultas={[]}
        initialTab={expedienteTab}
        onClose={cerrarExpediente}
      />

      <ConfirmDialog
        open={mascotaAEliminar !== null}
        variant="danger"
        title="Eliminar mascota"
        description={
          <>
            Vas a eliminar a <strong>{nombreAEliminar}</strong> del listado. Esta acción no se
            puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setMascotaAEliminar(null)}
      />
    </div>
  );
}