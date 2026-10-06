// src/components/clients/ClientTable.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ClientModal from "@/components/clients/ClientModal";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "@/services/clientsService";
import type { ClientRequest, ClientResponse } from "@/types/client-api";
import { TableColumn } from "../ui/types/tableTypes";
import PageHeader from "../ui/common/PageHeader";
import SearchBar from "../ui/common/SearchBar";
import ConfirmDialog from "../ui/dialogs/Confirmdialog";

function getFirstName(client: ClientResponse): string {
  return client.firstName ?? client.firtsName ?? "";
}

function getFullName(client: ClientResponse): string {
  return `${getFirstName(client)} ${client.lastName}`.trim();
}

export default function ClientTable() {
  const { hasPermission } = useAuth();
  const toast = useToast();

  const canCreate = hasPermission("clientes:crear");
  const canEdit = hasPermission("clientes:editar");
  const canDelete = hasPermission("clientes:eliminar");

  const [clientes, setClientes] = useState<ClientResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClientResponse | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<ClientResponse | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setLoadError(null);
    try {
      const clients = await getClients();
      setClientes(clients);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los clientes.";
      setLoadError(message);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el cliente.";
      toast.error(message, "Error al guardar");
      throw err;
    }
  };

  const confirmarEliminar = async () => {
    if (!clienteAEliminar) return;

    try {
      await deleteClient(clienteAEliminar.id);
      toast.warning(`${getFullName(clienteAEliminar)} eliminado`, "Cliente removido");
      setClienteAEliminar(null);
      await cargarDatos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el cliente.";
      toast.error(message, "Error al eliminar");
      throw err;
    }
  };

  const columns: TableColumn<ClientResponse>[] = [
    {
      key: "name",
      header: "Nombre",
      className: "font-medium text-text",
      render: (c) => getFullName(c),
    },
    { key: "dpi", header: "DPI", className: "text-text/80" },
    {
      key: "phone",
      header: "Teléfono",
      className: "text-text/80",
      render: (c) => c.phone || "—",
    },
    {
      key: "email",
      header: "Correo",
      className: "text-text/80",
      render: (c) => c.email || "—",
    },
    {
      key: "address",
      header: "Dirección",
      className: "text-text/80",
      render: (c) => c.address || "—",
    },
  ];

  const nombreAEliminar = clienteAEliminar ? getFullName(clienteAEliminar) : "";

  return (
    <div className="flex min-h-full flex-col gap-8 bg-white p-8">
      <PageHeader
        title="Clientes"
        subtitle="Dueños registrados en el sistema."
        action={
          canCreate && (
            <button
              type="button"
              onClick={abrirCrear}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-accent"
            >
              <Plus className="h-5 w-5" />
              Nuevo Cliente
            </button>
          )
        }
      />

      <SearchBar
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por nombre, DPI o correo..."
      />

      <DataTable<ClientResponse>
        columns={columns}
        rows={clientesFiltrados}
        getRowKey={(c) => c.id}
        loading={cargando}
        error={loadError}
        loadingLabel="Cargando clientes..."
        emptyState={{
          title: "No se encontraron clientes",
          description: "Ajusta la búsqueda o registra un nuevo cliente.",
        }}
        actions={
          canEdit || canDelete
            ? {
              render: (c) => (
                <RowActions
                  actions={[
                    {
                      icon: <Pencil className="h-4 w-4" />,
                      label: `Editar a ${getFullName(c)}`,
                      onClick: () => abrirEditar(c),
                      variant: "default",
                      visible: canEdit,
                    },
                    {
                      icon: <Trash2 className="h-4 w-4" />,
                      label: `Eliminar a ${getFullName(c)}`,
                      onClick: () => setClienteAEliminar(c),
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

      <ClientModal
        open={formAbierto}
        clienteEditando={clienteEditando}
        onClose={() => setFormAbierto(false)}
        onSave={guardarCliente}
      />

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