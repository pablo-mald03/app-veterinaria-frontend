// src/components/clients/ClientTable.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import ClientModal from "@/components/clients/ClientModal";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "@/services/clientsService";
import type { ClientRequest, ClientResponse } from "@/types/client-api";
import ConfirmDialog from "../ui/Confirmdialog";

// Helper: maneja el typo histórico "firtsName" del backend
function getFirstName(client: ClientResponse): string {
  return client.firstName ?? client.firtsName ?? "";
}

function getFullName(client: ClientResponse): string {
  return `${getFirstName(client)} ${client.lastName}`.trim();
}

export default function ClientTable() {
  const toast = useToast();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("clientes:crear");
  const canEdit = hasPermission("clientes:editar");
  const canDelete = hasPermission("clientes:eliminar");

  const [clientes, setClientes] = useState<ClientResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClientResponse | null>(null);

  const [clienteAEliminar, setClienteAEliminar] = useState<ClientResponse | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const clients = await getClients();
      setClientes(clients);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los clientes.";
      setError(message);
      toast.error(message, "Error al cargar clientes");
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const clientesFiltrados = useMemo(() => {
    const query = busqueda.toLowerCase();
    return clientes.filter((c) => {
      const texto = `${getFullName(c)} ${c.dpi} ${c.email ?? ""}`.toLowerCase();
      return texto.includes(query);
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

  const cerrarModal = () => setFormAbierto(false);

  const guardarCliente = async (data: ClientRequest) => {
    try {
      if (clienteEditando) {
        await updateClient(clienteEditando.id, data);
        toast.success("Cliente actualizado", getFullName(clienteEditando));
      } else {
        await createClient(data);
        toast.success("Cliente registrado", `${data.firstName} ${data.lastName}`.trim());
      }
      setFormAbierto(false);
      await cargarDatos();
    } catch (saveError) {
      // Re-lanzamos para que ClientForm lo muestre en su Alert y bloquee el cierre
      const message =
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el cliente.";
      toast.error(message, "Error al guardar");
      throw saveError;
    }
  };

  const confirmarEliminar = async () => {
    if (!clienteAEliminar) return;

    try {
      await deleteClient(clienteAEliminar.id);
      toast.warning(`${getFullName(clienteAEliminar)} eliminado`, "Cliente removido");
      setClienteAEliminar(null);
      await cargarDatos();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el cliente.";
      toast.error(message, "Error al eliminar");
      // No cerramos el dialog: se queda abierto con el spinner apagado
      // para que el usuario pueda reintentar o cancelar.
      throw deleteError;
    }
  };

  const nombreAEliminar = clienteAEliminar ? getFullName(clienteAEliminar) : "";

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      {/* Header con RBAC */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-text"
            style={{ fontFamily: "'Young Serif', serif" }}
          >
            Clientes
          </h1>
          <p className="mt-1 text-sm text-text/70">Dueños registrados en el sistema.</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={abrirCrear}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-accent"
          >
            <Plus className="h-5 w-5" />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/50" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DPI o correo..."
            className="w-full rounded-xl border border-secondary bg-white py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {cargando ? (
          <div className="p-14 text-center text-sm text-text/70">Cargando clientes...</div>
        ) : error ? (
          <div className="p-14 text-center text-sm text-red-600">{error}</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="m-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-secondary py-14 text-center">
            <p className="text-sm font-medium text-text">No se encontraron clientes</p>
            <p className="text-xs text-text/60">
              Ajusta la búsqueda o registra un nuevo cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-mint text-xs font-semibold uppercase tracking-wide text-text/70">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">DPI</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Dirección</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-mint">
                {clientesFiltrados.map((c) => {
                  const fullName = getFullName(c);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-mint/40">
                      <td className="px-6 py-4 font-medium text-text">{fullName}</td>
                      <td className="px-6 py-4 text-text/80">{c.dpi}</td>
                      <td className="px-6 py-4 text-text/80">{c.phone || "—"}</td>
                      <td className="px-6 py-4 text-text/80">{c.email || "—"}</td>
                      <td className="px-6 py-4 text-text/80">{c.address || "—"}</td>
                      {(canEdit || canDelete) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => abrirEditar(c)}
                                className="cursor-pointer rounded-lg p-2 text-accent transition-colors hover:bg-secondary/30"
                                aria-label={`Editar a ${fullName}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setClienteAEliminar(c)}
                                className="cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                                aria-label={`Eliminar a ${fullName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <ClientModal
        open={formAbierto}
        clienteEditando={clienteEditando}
        onClose={cerrarModal}
        onSave={guardarCliente}
      />

      {/* ConfirmDialog */}
      <ConfirmDialog
        open={clienteAEliminar !== null}
        variant="danger"
        title="Eliminar cliente"
        description={
          <>
            Vas a eliminar a <strong>{nombreAEliminar}</strong> del listado. Esta acción no se
            puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setClienteAEliminar(null)}
      />
    </div>
  );
}