'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Dog, 
  Dna, 
  Palette, 
  Calendar, 
  Scale, 
  User, 
  FileText, 
  Search, 
  ChevronDown,
  Check
} from 'lucide-react';
import { Mascota, Especie } from '@/types/pet';
import { ClientResponse } from '@/types/client-api';

interface PetFormModalProps {
  open: boolean;
  mascotaEditando: Mascota | null;
  clientes: ClientResponse[];
  onClose: () => void;
  onSave: (mascota: Mascota) => Promise<void>;
}

const especies: Especie[] = ['PERRO', 'GATO', 'AVE', 'OTRO'];

const formVacio: Omit<Mascota, 'id'> = {
  name: '',
  especie: 'PERRO',
  breed: '',
  color: '',
  age: 0,
  weight: 0,
  clientId: '',
  ownerName: '',
  description: '',
};

function obtenerDatosFormulario(mascota: Mascota): Omit<Mascota, 'id'> {
  const { id, ...resto } = mascota;
  void id;
  return resto;
}

export default function PetFormModal({ open, mascotaEditando, clientes, onClose, onSave }: PetFormModalProps) {
  if (!open) return null;

  const key = mascotaEditando ? `edit-${mascotaEditando.id}` : 'new-pet';

  return (
    <PetFormContent
      key={key}
      mascotaEditando={mascotaEditando}
      clientes={clientes}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function PetFormContent({
  mascotaEditando,
  clientes,
  onClose,
  onSave,
}: Omit<PetFormModalProps, 'open'>) {
  const [form, setForm] = useState<Omit<Mascota, 'id'>>(() =>
    mascotaEditando ? obtenerDatosFormulario(mascotaEditando) : formVacio
  );

  // Busca y pre-llena el nombre del dueño en la barra de búsqueda si estamos editando
  const [clientSearch, setClientSearch] = useState(() => {
    if (!mascotaEditando) return '';
    if (mascotaEditando.ownerName) return mascotaEditando.ownerName;
    const cliente = clientes.find((c) => String(c.id) === String(mascotaEditando.clientId));
    return cliente ? `${cliente.firstName ?? cliente.firtsName ?? ''} ${cliente.lastName}`.trim() : '';
  });

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCompleto = `${c.firstName ?? c.firtsName ?? ''} ${c.lastName}`.toLowerCase();
    const dpi = c.dpi ? c.dpi.toLowerCase() : '';
    const query = clientSearch.toLowerCase();
    return nombreCompleto.includes(query) || dpi.includes(query);
  });

  const handleSelectCliente = (cliente: ClientResponse) => {
    const nombreCliente = `${cliente.firstName ?? cliente.firtsName ?? ''} ${cliente.lastName}`.trim();
    setForm((prev) => ({
      ...prev,
      clientId: String(cliente.id),
      ownerName: nombreCliente,
    }));
    setClientSearch(nombreCliente);
    setIsClientDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientId) {
      setError('Selecciona un dueño válido para la mascota.');
      return;
    }

    if (!form.name.trim()) {
      setError('El nombre de la mascota es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      await onSave({
        id: mascotaEditando?.id ?? '',
        ...form,
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la mascota.');
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle = "w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-9 pr-3 text-sm text-[#2A2F63] placeholder-gray-400 outline-none focus:border-[#5FB0C9]";
  const inputNumberStyle = `${inputStyle} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2F63]/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-[#A7E0DB]">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-[#E3F6F5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
              {mascotaEditando ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            </h2>
            <p className="text-xs text-[#3E6D9C]">
              {mascotaEditando ? 'Actualiza la información médica y datos del paciente.' : 'Crea una nueva ficha de paciente en el sistema.'}
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
          
          {/* Nombre y Especie */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Nombre de la Mascota *</label>
              <div className="relative flex items-center mt-1">
                <Dog className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Bucky, Luna..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Especie *</label>
              <div className="relative flex items-center mt-1">
                <Dna className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <select
                  value={form.especie}
                  onChange={(e) => setForm({ ...form, especie: e.target.value as Especie })}
                  className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-9 pr-8 text-sm text-[#2A2F63] outline-none focus:border-[#5FB0C9] appearance-none cursor-pointer"
                >
                  {especies.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-[#3E6D9C] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Raza y Color */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Raza</label>
              <div className="relative flex items-center mt-1">
                <Dna className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  placeholder="Ej. French Poodle, Criollo..."
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Color / Pelaje</label>
              <div className="relative flex items-center mt-1">
                <Palette className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  placeholder="Ej. Blanco con manchas café..."
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Edad y Peso */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Edad (Años)</label>
              <div className="relative flex items-center mt-1">
                <Calendar className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="0"
                  value={form.age === 0 ? '' : form.age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, age: val === '' ? 0 : Number(val) });
                  }}
                  className={inputNumberStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Peso (Kg)</label>
              <div className="relative flex items-center mt-1">
                <Scale className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                  value={form.weight === 0 ? '' : form.weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, weight: val === '' ? 0 : Number(val) });
                  }}
                  className={inputNumberStyle}
                />
              </div>
            </div>
          </div>

          {/* Dueño / Cliente */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-bold uppercase text-[#2A2F63]">Dueño / Cliente *</label>
            <div className="relative flex items-center mt-1">
              <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
              <input
                type="text"
                placeholder="Escribe el nombre o DPI del dueño..."
                value={clientSearch}
                onFocus={() => setIsClientDropdownOpen(true)}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setIsClientDropdownOpen(true);
                  if (form.clientId) {
                    setForm({ ...form, clientId: '', ownerName: '' });
                  }
                }}
                className={inputStyle}
              />
              <Search className="absolute right-3 h-4 w-4 text-[#3E6D9C] pointer-events-none" />
            </div>

            {isClientDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#A7E0DB] bg-white shadow-xl">
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => {
                    const nombreCliente = `${cliente.firstName ?? cliente.firtsName ?? ''} ${cliente.lastName}`.trim();
                    const isSelected = String(cliente.id) === form.clientId;

                    return (
                      <button
                        type="button"
                        key={cliente.id}
                        onClick={() => handleSelectCliente(cliente)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#E3F6F5] ${
                          isSelected ? 'bg-[#E3F6F5] font-semibold text-[#2A2F63]' : 'text-gray-700'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-[#2A2F63]">{nombreCliente}</p>
                          {cliente.dpi && <p className="text-xs text-[#3E6D9C]">DPI: {cliente.dpi}</p>}
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#5FB0C9]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">
                    No se encontraron clientes con esa búsqueda.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-bold uppercase text-[#2A2F63]">Observaciones / Notas Clínicas</label>
            <div className="relative flex mt-1">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#3E6D9C]" />
              <textarea
                rows={2}
                placeholder="Alergias, temperamento, señas particulares..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Botones */}
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
              {guardando ? 'Guardando...' : mascotaEditando ? 'Actualizar' : 'Guardar Mascota'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}