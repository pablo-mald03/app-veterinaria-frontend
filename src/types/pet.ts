export type Especie = "PERRO" | "GATO" | "AVE" | "OTRO";

export interface Mascota {
  id: string;
  name: string;
  especie: Especie; 
  breed: string;
  color: string;
  age: number;  
  weight: number;              
  clientId: string;             // dueño, FK a Client (coincide con el diagrama)
  ownerName?: string;            // nombre del dueño expandido, si el backend hace el join
  description?: string;
}

export interface ConsultaExpediente {
  id: string;
  mascotaId: string;
  fecha: string;
  veterinario: string;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  pesoRegistrado?: number;
}