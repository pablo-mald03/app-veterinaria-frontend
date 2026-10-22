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

//Product used during a consultation, charged to the appointment account as a SUPPLY item
export interface SupplyLine {
    productId: number;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface PaymentItemRequest {
    description: string;
    quantity: number;
    unitPrice: number;
    referenceType: "CONSULTATION" | "VACCINE" | "TREATMENT" | "SUPPLY" | string;
    referenceId?: number;
}

export type PaymentMethod = "CASH" | "CREDIT_CARD" | "TRANSFER";

export type DetailedPaymentMethod = Exclude<PaymentMethod, "CASH">;

export interface CardPaymentData {
    holder: string;
    number: string;
    expiry: string;
    cvv: string;
}

export interface TransferPaymentData {
    bank: string;
    accountHolder: string;
    reference: string;
}

export type PaymentDetails =
    | { method: "CREDIT_CARD"; data: CardPaymentData }
    | { method: "TRANSFER"; data: TransferPaymentData };

export interface ChargeReceipt {
    transactionId: string;
    method: DetailedPaymentMethod;
    amount: number;
    approvedAt: string;
    summary: string;
}
