export interface PetRequest {
  name: string;
  breed: string;
  idClient: number;
  color: string;
  age: number;
  weight: number;
  species: string;
  description?: string;
}

export interface PetResponse extends PetRequest {
  idPet: number;
}

export interface PaginationResult<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}