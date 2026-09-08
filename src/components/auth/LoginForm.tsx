'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();

  // Estados locales para el manejo de credenciales y UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Procesamiento del formulario de autenticación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación de campos vacíos
    if (!email || !password) {
      setError('Por favor llena todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // TODO: Conectar con el servicio de autenticación del backend (ej. authService.login)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirigir al dashboard si es un inicio de sesión exitoso
      router.push('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-[#A7E0DB]/50">
      
      {/* Identidad visual de la marca */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#A7E0DB] bg-white shadow-sm mb-4">
          <Image
            src="/HappyPetsIcon.jpeg"
            alt="Logo Happy Pets"
            width={65}
            height={65}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
            priority
          />
        </div>
        <h1 
          className="text-3xl font-bold text-[#2A2F63]"
          style={{ fontFamily: "'Young Serif', serif" }}
        >
          Happy Pets
        </h1>
        <p className="mt-1 text-sm font-medium text-[#3E6D9C]">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Inputs de credenciales */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        
        {/* Campo Correo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
            Correo Electrónico
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
            <input
              type="email"
              placeholder="ejemplo@happypets.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
            Contraseña
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-10 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#3E6D9C] hover:text-[#2A2F63]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3E6D9C] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <span>Iniciando sesión...</span>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#2A2F63]/60">
        ¿Problemas para acceder? Contacta al administrador del sistema.
      </p>
    </div>
  );
}