import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { JSON_HEADERS } from "@/lib/api/http";
import type { Payment, PaymentItemRequest } from "@/types/payment";

export const paymentService = {
    getByAppointment: async (appointmentId: number): Promise<Payment> => {
        const response = await apiFetch(ENDPOINTS.PAYMENTS.BY_APPOINTMENT(appointmentId));
        await ensureOk(response, "Error al obtener la cuenta de cobro.");
        return response.json();
    },

    open: async (appointmentId: number): Promise<Payment> => {
        const response = await apiFetch(ENDPOINTS.PAYMENTS.OPEN(appointmentId), { method: "POST" });
        await ensureOk(response, "Error al abrir la cuenta de cobro.");
        return response.json();
    },

    addItem: async (appointmentId: number, data: PaymentItemRequest): Promise<Payment> => {
        const response = await apiFetch(ENDPOINTS.PAYMENTS.ADD_ITEM(appointmentId), {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        await ensureOk(response, "Error al agregar el cargo.");
        return response.json();
    },

    process: async (paymentId: number, paymentMethod: string): Promise<Payment> => {
        const response = await apiFetch(ENDPOINTS.PAYMENTS.PAY(paymentId), {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify({ paymentMethod }),
        });
        await ensureOk(response, "Error al procesar el pago.");
        return response.json();
    },

    downloadInvoice: async (paymentId: number): Promise<Blob> => {
        const response = await apiFetch(ENDPOINTS.PAYMENTS.INVOICE(paymentId));
        await ensureOk(response, "Error al descargar la factura.");
        return response.blob();
    },
};
