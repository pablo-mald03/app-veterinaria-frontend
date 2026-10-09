export interface AppointmentResponse {
    id: number;
    petId: number;
    userId: number;
    roomId: number;
    date: string;
    hour: string;
    description: string;
    diagnosis?: string;
    treatment?: string;
    cost?: number;
    status: string;
}

export interface AppointmentRequest {
    petId: number;
    userId: number;
    roomId: number;
    date: string;
    hour: string;
    description: string;
}

export interface AppointmentDiagnosisRequest {
    diagnosis: string;
    treatment?: string;
    cost?: number;
}

export interface AppointmentFilterParams {
    date?: string;
    status?: string;
    petId?: number;
    userId?: number;
}

export interface AppointmentFormData extends AppointmentRequest {
    status?: string;
    diagnosis?: string;
    treatment?: string;
    cost?: number;
}
