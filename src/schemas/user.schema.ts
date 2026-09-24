export interface UserFormData {
  identification: string;
  name: string;
  firstName: string;
  userRegistry: string;
  phone: string;
  email: string;
  rawPassword?: string;   // obligatorio en creación, opcional en edición
  roleAliases: string[];  // ej: ["admin"]
}


export type FormErrors = Partial<Record<keyof UserFormData | 'general', string>>;

export const validateUserForm = (data: UserFormData, isEditing = false): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!data.firstName.trim()) errors.firstName = 'El apellido es obligatorio.';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'El correo es obligatorio.';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Correo electrónico inválido.';
  }

  const phoneRegex = /^[0-9]{8,15}$/;
  if (!data.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio.';
  } else if (!phoneRegex.test(data.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Mínimo 8 dígitos numéricos.';
  }

  if (!data.userRegistry.trim()) {
    errors.userRegistry = 'El usuario es obligatorio.';
  } else if (data.userRegistry.length < 3) {
    errors.userRegistry = 'Mínimo 3 caracteres.';
  }

  if (!data.identification.trim()) errors.identification = 'La identificación es obligatoria.';
  if (!data.roleAliases || data.roleAliases.length === 0 || !data.roleAliases[0]?.trim()) {
    errors.roleAliases = 'Selecciona un rol.';
  }

  if (!isEditing) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!data.rawPassword) {
      errors.rawPassword = 'La contraseña es obligatoria.';
    } else if (data.rawPassword.length < 8) {
      errors.rawPassword = 'Mínimo 8 caracteres.';
    } else if (!passwordRegex.test(data.rawPassword)) {
      errors.rawPassword = 'Debe incluir letras y números.';
    }
  }

  return errors;
};