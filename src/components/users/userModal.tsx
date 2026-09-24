'use client';

import { useState, useEffect } from 'react';
import { UserFormData, FormErrors, validateUserForm } from '@/schemas/user.schema';
import { UserResponse } from '@/services/userService';
import { roleService, Role } from '@/services/roleService';
import { X, Lock, Mail, User, Phone, IdCard, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

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
  userRegistry: '',
  identification: '',
  roleAliases: [],
  rawPassword: '',
};

export default function UserModal({ isOpen, editingUser, onClose, onSubmit }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setFormData({
          name: editingUser.name ?? '',
          firstName: editingUser.firstName ?? '',
          email: editingUser.email ?? '',
          phone: editingUser.phone ?? '',
          userRegistry: editingUser.userRegistry ?? '',
          identification: editingUser.identification ?? '',
          roleAliases: editingUser.roles?.map((r) => r.alias) ?? [], // Se mantiene tal cual viene del servidor
          rawPassword: '',
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [isOpen, editingUser]);

  useEffect(() => {
    if (isOpen) {
      roleService
          .getAll()
          .then((data) => setRoles(data))
          .catch((err) => console.error('Error al cargar roles:', err));
    }
  }, [isOpen]);

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

      // Se envía roleAliases exactamente sin modificaciones
      const payload: UserFormData = {
        ...formData,
        roleAliases: formData.roleAliases,
        rawPassword: editingUser
            ? (formData.rawPassword?.trim() ? formData.rawPassword : undefined)
            : formData.rawPassword,
      };

      await onSubmit(payload);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Error al guardar usuario.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2F63]/40 p-4 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-2xl rounded-3xl border border-[#A7E0DB] bg-white p-6 shadow-2xl">

          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-[#E3F6F5] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#2A2F63]">
                {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h2>
              <p className="text-xs text-[#3E6D9C]">
                {editingUser ? 'Actualiza los datos del perfil.' : 'Crea un nuevo acceso al sistema.'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensaje de error general */}
          {errors.general && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Nombre</label>
                <div className="relative mt-1 flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Apellido</label>
                <div className="relative mt-1 flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Correo Electrónico</label>
                <div className="relative mt-1 flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Teléfono</label>
                <div className="relative mt-1 flex items-center">
                  <Phone className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Usuario, DPI y Rol */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Usuario</label>
                <input
                    type="text"
                    value={formData.userRegistry}
                    onChange={(e) => setFormData({ ...formData, userRegistry: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#A7E0DB] p-2 text-sm outline-none focus:border-[#5FB0C9]"
                />
                {errors.userRegistry && <p className="mt-1 text-xs text-red-500">{errors.userRegistry}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Identificación / DPI</label>
                <div className="relative mt-1 flex items-center">
                  <IdCard className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  <input
                      type="text"
                      value={formData.identification}
                      onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                      className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  />
                </div>
                {errors.identification && <p className="mt-1 text-xs text-red-500">{errors.identification}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#2A2F63]">Rol del Sistema</label>
                <div className="relative mt-1 flex items-center">
                  <Shield className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                  {/* Asignación directa sin transformar el valor */}
                  <select
                      value={formData.roleAliases[0] ?? ''}
                      onChange={(e) => setFormData({ ...formData, roleAliases: [e.target.value] })}
                      className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                  >
                    <option value="" disabled>Selecciona un rol</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.alias}>
                          {r.name}
                        </option>
                    ))}
                  </select>
                </div>
                {errors.roleAliases && <p className="mt-1 text-xs text-red-500">{errors.roleAliases}</p>}
              </div>
            </div>

            {/* Campo Contraseña (Oculto en modo Edición) */}
            {!editingUser && (
                <div>
                  <label className="text-xs font-bold uppercase text-[#2A2F63]">Contraseña</label>
                  <div className="relative mt-1 flex items-center">
                    <Lock className="absolute left-3 h-4 w-4 text-[#3E6D9C]" />
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.rawPassword ?? ''}
                        onChange={(e) => setFormData({ ...formData, rawPassword: e.target.value })}
                        className="w-full rounded-xl border border-[#A7E0DB] py-2 pr-3 pl-9 text-sm outline-none focus:border-[#5FB0C9]"
                    />
                  </div>
                  {errors.rawPassword && <p className="mt-1 text-xs text-red-500">{errors.rawPassword}</p>}
                </div>
            )}

            {/* Botones de acción */}
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