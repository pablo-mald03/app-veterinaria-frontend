'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Eye, EyeOff, LogIn, IdCard, KeyRound, CheckCircle2 } from 'lucide-react';
import { authService } from '@/service/auth.service';

export default function AuthForm() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'recover'>('login');

  // Estados
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [dpi, setDpi] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (tab: 'login' | 'recover') => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Por favor llena todos los campos.');
      return;
    }

    setLoading(true);

    try {
      await authService.login({
        email: loginEmail,
        password: loginPassword,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!dpi || !recoverEmail || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (dpi.length < 8 || dpi.length > 13) {
      setError('El DPI debe contener entre 8 y 13 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await authService.recoverPassword({
        dpi,
        email: recoverEmail,
        password: newPassword,
        confirmationPassword: confirmPassword,
      });

      setSuccess('Contraseña restablecida con éxito. Puedes iniciar sesión.');
      setDpi('');
      setRecoverEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-[#A7E0DB]/50">
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
          {activeTab === 'login' ? 'Ingresa a tu cuenta para continuar' : 'Restablecimiento de credenciales'}
        </p>
      </div>

      <div className="mt-6 flex rounded-2xl bg-[#E3F6F5]/60 p-1">
        <button
          type="button"
          onClick={() => switchTab('login')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-[#2A2F63] shadow-sm'
              : 'text-[#3E6D9C] hover:text-[#2A2F63]'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => switchTab('recover')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'recover'
              ? 'bg-white text-[#2A2F63] shadow-sm'
              : 'text-[#3E6D9C] hover:text-[#2A2F63]'
          }`}
        >
          Recuperar Contraseña
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type="email"
                placeholder="ejemplo@happypets.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2.5 pl-10 pr-10 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 text-[#3E6D9C] hover:text-[#2A2F63]"
              >
                {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3E6D9C] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
      )}

      {activeTab === 'recover' && (
        <form onSubmit={handleRecoverSubmit} className="mt-5 flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              DPI
            </label>
            <div className="relative flex items-center">
              <IdCard className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type="text"
                placeholder="Número de DPI"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-10 pr-4 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type="email"
                placeholder="ejemplo@happypets.com"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-10 pr-4 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              Nueva Contraseña
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-10 pr-10 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 text-[#3E6D9C] hover:text-[#2A2F63]"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A2F63]">
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-5 w-5 text-[#3E6D9C]" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-[#A7E0DB] bg-white py-2 pl-10 pr-4 text-sm text-[#2A2F63] outline-none transition-all focus:border-[#5FB0C9] focus:ring-2 focus:ring-[#5FB0C9]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5FB0C9] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3E6D9C] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <span>Restablecer Contraseña</span>
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-[#2A2F63]/60">
        ¿Problemas para acceder? Contacta al administrador del sistema.
      </p>
    </div>
  );
}