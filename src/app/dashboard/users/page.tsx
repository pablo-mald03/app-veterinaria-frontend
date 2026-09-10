'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Search, Edit3, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { userService, UserResponse } from '@/service/user.service';
import { UserFormData } from '@/schemas/user.schema';
import UserModal from '@/components/users/userModal';

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData: UserFormData) => {
    if (editingUser) {
      await userService.update(editingUser.id, formData);
    } else {
      await userService.create(formData);
    }
    setIsModalOpen(false);
    cargarUsuarios();
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('¿Está seguro de revocar el acceso a este usuario?')) {
      try {
        await userService.delete(id);
        cargarUsuarios();
      } catch (err) {
        alert('Error al eliminar el usuario.');
      }
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.firstName} ${u.firstName} ${u.email} ${u.username}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-full flex-col gap-6 bg-white p-8">
      
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2A2F63]" style={{ fontFamily: "'Young Serif', serif" }}>
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm text-[#2A2F63]/70">
            Administración de accesos y credenciales del personal de Happy Pets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3E6D9C] cursor-pointer"
        >
          <UserPlus className="h-5 w-5" />
          <span>Registrar Usuario</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#A7E0DB]/50 bg-white p-3 shadow-sm">
        <Search className="h-5 w-5 text-[#3E6D9C]" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-sm text-[#2A2F63] outline-none placeholder:text-[#2A2F63]/40"
        />
      </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-hidden rounded-2xl border border-[#A7E0DB]/50 bg-white shadow-md">
        <table className="w-full text-left text-sm text-[#2A2F63]">
          <thead className="bg-[#E3F6F5] text-xs font-bold uppercase tracking-wider text-[#3E6D9C]">
            <tr>
              <th className="p-4">Usuario</th>
              <th className="p-4">Identificación</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3F6F5]">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#2A2F63]/60">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-[#5FB0C9]" />
                    <span>Cargando usuarios...</span>
                  </div>
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#2A2F63]/60">
                  No hay usuarios registrados que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-[#E3F6F5]/30">
                  <td className="p-4">
                    <div className="font-semibold text-[#2A2F63]">{u.name} {u.firstName}</div>
                    <div className="text-xs font-medium text-[#3E6D9C]">@{u.username}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{u.identification}</td>
                  <td className="p-4">
                    <div>{u.email}</div>
                    <div className="text-xs text-[#2A2F63]/60">{u.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#A7E0DB]/30 px-2.5 py-1 text-xs font-bold text-[#3E6D9C]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {u.rolName || `Rol ID: ${u.idRol}`}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="rounded-lg p-2 text-[#3E6D9C] hover:bg-[#E3F6F5] cursor-pointer"
                        title="Editar usuario"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        editingUser={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
      />
    </div>
  );
}