'use client';

import { useState } from 'react';
import { X, User, Mail, Phone, IdCard, MapPin } from 'lucide-react';
import { ClientRequest, ClientResponse } from '@/types/client-api';

interface ClientFormModalProps {
  open: boolean;
  clienteEditando: ClientResponse | null;
  onClose: () => void;
  onSave: (cliente: ClientRequest) => Promise<void>;
}

const formVacio: ClientRequest = {
  dpi: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};

function obtenerDatosFormulario(cliente: ClientResponse): ClientRequest {
  return {
    dpi: cliente.dpi || '',
    firstName: cliente.firstName ?? cliente.firtsName ?? '',
    lastName: cliente.lastName || '',
    email: cliente.email ?? '',
    phone: cliente.phone ?? '',
    address: cliente.address ?? '',
  };
}

export default function ClientFormModal({ open, clienteEditando, onClose, onSave }: ClientFormModalProps) {
  if (!open) return null;

  // La key obliga a React a reinicializar el estado con los datos actualizados cada vez que se abre
  const key = clienteEditando ? `edit-${clienteEditando.id}` : 'new-client';

  return (
    <ClientFormContent
      key={key}
      clienteEditando={clienteEditando}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function ClientFormContent({
  clienteEditando,
  onClose,
  onSave,
}: Omit<ClientFormModalProps, 'open'>) {
  const [form, setForm] = useState<ClientRequest>(() =>
    clienteEditando ? obtenerDatosFormulario(clienteEditando) : formVacio
  );
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.dpi || !form.firstName || !form.lastName) {
      setError('Completa los campos obligatorios: DPI, Nombres y Apellidos.');
      return;
    }

    setGuardando(true);
    try {
      await onSave(form);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle = "w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-9 pr-3 text-sm text-[#2A2F63] placeholder-gray-400 outline-none focus:border-[#5FB0C9]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2F63]/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-[#A7E0DB]">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[#E3F6F5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
              {clienteEditando ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <p className="text-xs text-[#3E6D9C]">
              {clienteEditando ? 'Actualiza la información del perfil del cliente.' : 'Crea un nuevo registro de cliente en el sistema.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          
          {/* DPI e Identificación / Teléfono */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">DPI / Identificación *</label>
              <div className="relative flex items-center mt-1">
                <IdCard className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  required
                  value={form.dpi}
                  onChange={(e) => setForm({ ...form, dpi: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Teléfono</label>
              <div className="relative flex items-center mt-1">
                <Phone className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Nombres *</label>
              <div className="relative flex items-center mt-1">
                <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Apellidos *</label>
              <div className="relative flex items-center mt-1">
                <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="text-xs font-bold uppercase text-[#2A2F63]">Correo Electrónico</label>
            <div className="relative flex items-center mt-1">
              <Mail className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="text-xs font-bold uppercase text-[#2A2F63]">Dirección</label>
            <div className="relative flex mt-1">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#3E6D9C]" />
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-4 flex justify-end gap-3 border-t border-[#E3F6F5] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-[#5FB0C9] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3E6D9C] disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : clienteEditando ? 'Actualizar' : 'Guardar Cliente'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}