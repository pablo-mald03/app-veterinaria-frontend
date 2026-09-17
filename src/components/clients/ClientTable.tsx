'use client';

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import ClientFormModal from "./ClientFormModal";
import ConfirmDialog from "../ui/Confirmdialog";
import { createClient, deleteClient, getClients, updateClient } from "@/services/clientsService";
import { ClientRequest, ClientResponse } from "@/types/client-api";

export default function ClientTable() {
  const [clientes, setClientes] = useState<ClientResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClientResponse | null>(null);

  // Cliente pendiente de confirmar eliminación (null = diálogo cerrado)
  const [clienteAEliminar, setClienteAEliminar] = useState<ClientResponse | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const clients = await getClients();
      setClientes(clients);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los clientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    getClients()
      .then((clients) => {
        if (!mounted) return;
        setClientes(clients);
      })
      .catch((loadError: unknown) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los clientes.");
        }
      })
      .finally(() => {
        if (mounted) setCargando(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const nombre = `${c.firstName ?? c.firtsName ?? ""} ${c.lastName}`.toLowerCase();
      const texto = `${nombre} ${c.dpi} ${c.email ?? ""}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [clientes, busqueda]);

  const abrirCrear = () => {
    setClienteEditando(null);
    setFormAbierto(true);
  };

  const abrirEditar = (cliente: ClientResponse) => {
    setClienteEditando(cliente);
    setFormAbierto(true);
  };

  const guardarCliente = async (cliente: ClientRequest) => {
    if (clienteEditando) {
      await updateClient(clienteEditando.id, cliente);
    } else {
      await createClient(cliente);
    }
    await cargarDatos();
  };

  // Solo abre el diálogo; el borrado real ocurre en confirmarEliminar()
  const pedirConfirmacionEliminar = (cliente: ClientResponse) => {
    setClienteAEliminar(cliente);
  };

  const confirmarEliminar = async () => {
    if (!clienteAEliminar) return;
    try {
      await deleteClient(clienteAEliminar.id);
      setClienteAEliminar(null);
      await cargarDatos();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el cliente.");
    }
  };

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[#2A2F63]/70">
            Dueños registrados en el sistema.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-[#3E6D9C]"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A2F63]/50" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DPI o correo..."
            className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2A2F63] outline-none focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/30"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {cargando ? (
          <div className="p-14 text-center text-sm text-[#2A2F63]/70">Cargando clientes...</div>
        ) : error ? (
          <div className="p-14 text-center text-sm text-red-600">{error}</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="m-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#A7E0DB] py-14 text-center">
            <p className="text-sm font-medium text-[#2A2F63]">No se encontraron clientes</p>
            <p className="text-xs text-[#2A2F63]/60">
              Ajusta la búsqueda o registra un nuevo cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#E3F6F5] text-xs font-semibold uppercase tracking-wide text-[#2A2F63]/70">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">DPI</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3F6F5]">
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#E3F6F5]/40">
                    <td className="px-6 py-4 font-medium text-[#2A2F63]">
                      {c.firstName ?? c.firtsName ?? ""} {c.lastName}
                    </td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{c.dpi}</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{c.phone || "—"}</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-[#2A2F63]/80">{c.address || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(c)}
                          className="rounded-lg p-2 text-[#3E6D9C] transition-colors hover:bg-[#A7E0DB]/30"
                          aria-label={`Editar a ${c.firstName ?? c.firtsName ?? ""} ${c.lastName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => pedirConfirmacionEliminar(c)}
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                          aria-label={`Eliminar a ${c.firstName ?? c.firtsName ?? ""} ${c.lastName}`}
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

      <ClientFormModal
        key={`${formAbierto}-${clienteEditando?.id ?? "nuevo"}`}
        open={formAbierto}
        clienteEditando={clienteEditando}
        onClose={() => setFormAbierto(false)}
        onSave={guardarCliente}
      />
      <ConfirmDialog
        open={clienteAEliminar !== null}
        title="Eliminar cliente"
        description={
          clienteAEliminar
            ? `¿Seguro que quieres eliminar a ${clienteAEliminar.firstName ?? clienteAEliminar.firtsName ?? ""} ${clienteAEliminar.lastName} del listado? Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={confirmarEliminar}
        onCancel={() => setClienteAEliminar(null)}
      />
    </div>
  );
}
