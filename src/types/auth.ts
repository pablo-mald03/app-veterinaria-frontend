export interface LoginRequestDto {
  email: string;
  password?: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface RecoverPasswordRequestDto {
  dpi: string;
  email: string;
  password?: string;
  confirmationPassword?: string;
}