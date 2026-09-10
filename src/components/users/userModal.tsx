'use client';

import { useState, useEffect } from 'react';
import { UserFormData, FormErrors, validateUserForm } from '@/schemas/user.schema';
import { UserResponse } from '@/service/user.service';
import { X, Lock, Mail, User, Phone, IdCard, Shield } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  editingUser: UserResponse | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

const initialFormState: UserFormData = {
  name: '',
  firstName: '',
  email: '',
  phone: '',
  username: '',
  identification: '',
  idRol: '',
  password: '',
};

export default function UserModal({ isOpen, editingUser, onClose, onSubmit }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        firstName   : editingUser.firstName || '',
        email: editingUser.email || '',
        phone: editingUser.phone || '',
        username: editingUser.username || '',
        identification: editingUser.identification || '',
        idRol: editingUser.idRol || '',
        password: '',
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateUserForm(formData, Boolean(editingUser));
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      await onSubmit(formData);
    } catch (err: any) {
      setErrors({ general: err.message || 'Error al guardar usuario.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2F63]/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-[#A7E0DB]">
        
        <div className="flex items-center justify-between border-b border-[#E3F6F5] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
              {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h2>
            <p className="text-xs text-[#3E6D9C]">
              {editingUser ? 'Actualiza los datos del perfil seleccionado.' : 'Crea un nuevo acceso de personal al sistema.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors.general && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Nombre</label>
              <div className="relative flex items-center mt-1">
                <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Apellido</label>
              <div className="relative flex items-center mt-1">
                <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Correo Electrónico</label>
              <div className="relative flex items-center mt-1">
                <Mail className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Teléfono</label>
              <div className="relative flex items-center mt-1">
                <Phone className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          {/* Usuario, DPI/Identificación y Rol */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Usuario</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#A7E0DB] p-2 text-sm outline-none focus:border-[#5FB0C9]"
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Identificación / DPI</label>
              <div className="relative flex items-center mt-1">
                <IdCard className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="text"
                  value={formData.identification}
                  onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.identification && <p className="mt-1 text-xs text-red-500">{errors.identification}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">Rol del Sistema</label>
              <div className="relative flex items-center mt-1">
                <Shield className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <select
                  value={formData.idRol}
                  onChange={(e) => setFormData({ ...formData, idRol: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                >
                  <option value="">Selecciona...</option>
                  <option value="1">Administrador</option>
                  <option value="2">Veterinario</option>
                  <option value="3">Recepcionista</option>
                </select>
              </div>
              {errors.idRol && <p className="mt-1 text-xs text-red-500">{errors.idRol}</p>}
            </div>
          </div>

          {/* Contraseña (Solo activa o requerida al crear) */}
          {(!editingUser || formData.password !== undefined) && (
            <div>
              <label className="text-xs font-bold uppercase text-[#2A2F63]">
                {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
              </label>
              <div className="relative flex items-center mt-1">
                <Lock className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-[#A7E0DB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5FB0C9]"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
          )}

          {/* Botones */}
          <div className="mt-4 flex justify-end gap-3 border-t border-[#E3F6F5] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#5FB0C9] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3E6D9C] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}