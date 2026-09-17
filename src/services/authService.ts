import { ENDPOINTS } from '@/config/api';
import { LoginRequestDto, AuthUserDto, RecoverPasswordRequestDto } from '@/types/auth';

export const authService = {
  // Iniciar Sesión
  login: async (credentials: LoginRequestDto): Promise<void> => {
    const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Credenciales inválidas o error de inicio de sesión.');
    }
  },

  // Obtener usuario autenticado actual
  getCurrentUser: async (): Promise<AuthUserDto> => {
    const res = await fetch(ENDPOINTS.AUTH.ME, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('No hay una sesión activa.');
    }

    return res.json();
  },

  // Cerrar Sesión
  logout: async (): Promise<void> => {
    const res = await fetch(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Error al cerrar la sesión.');
    }
  },

  // Recuperar Contraseña
  recoverPassword: async (data: RecoverPasswordRequestDto): Promise<void> => {
    const res = await fetch(ENDPOINTS.USERS.RECOVER_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al procesar la recuperación de contraseña.');
    }
  },

};