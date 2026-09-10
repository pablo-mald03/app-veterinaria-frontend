export interface UserFormData {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  username: string;
  identification: string;
  idRol: string;
  password?: string;
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

  if (!data.username.trim()) {
    errors.username = 'El usuario es obligatorio.';
  } else if (data.username.length < 3) {
    errors.username = 'Mínimo 3 caracteres.';
  }

  if (!data.identification.trim()) errors.identification = 'La identificación es obligatoria.';
  if (!data.idRol) errors.idRol = 'Selecciona un rol.';

  if (!isEditing) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!data.password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (data.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres.';
    } else if (!passwordRegex.test(data.password)) {
      errors.password = 'Debe incluir letras y números.';
    }
  }

  return errors;
};