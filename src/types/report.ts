export interface AttendedPetReport {
    appointmentId: number;
    petId: number;
    petName: string;
    species: string;
    date: string;
    treatment: string | null;
    diagnosis: string | null;
    cost: number | null;
}

export interface FrequentTreatmentReport {
    treatment: string;
    timesApplied: number;
    totalCost: number | null;
}

export interface PendingVaccineReport {
    idPet: number;
    petName: string;
    species: string;
    treatmentName: string;
    applicationNumber: number | null;
    nextDoseDate: string | null;
}
