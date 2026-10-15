export interface PaymentItem {
    id?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    referenceType: string;
    referenceId?: number;
}

export interface Payment {
    id: number;
    appointmentId: number;
    totalAmount: number;
    paymentMethod?: string;
    status: "PENDING" | "PAID" | string;
    paymentDate?: string;
    createdAt?: string;
    items: PaymentItem[];
}

export interface PaymentItemRequest {
    description: string;
    quantity: number;
    unitPrice: number;
    referenceType: "CONSULTATION" | "VACCINE" | "TREATMENT" | "SUPPLY" | string;
    referenceId?: number;
}
