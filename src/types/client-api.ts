export interface ClientRequest {
  dpi: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ClientResponse {
  id: number;
  dpi: string;
  firstName?: string;
  firtsName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}