import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { JSON_HEADERS } from "@/lib/api/http";
import type { Payment, PaymentItemRequest, SupplyLine } from "@/types/payment";

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

    // Returns the appointment account, opening it first if it does not exist yet
    ensureOpen: async (appointmentId: number): Promise<Payment> => {
        try {
            return await paymentService.getByAppointment(appointmentId);
        } catch {
            return paymentService.open(appointmentId);
        }
    },

    // Charges the supplies to the appointment account
    addSupplies: async (appointmentId: number, supplies: SupplyLine[]): Promise<Payment> => {
        let payment = await paymentService.ensureOpen(appointmentId);

        for (const { productId, ...line } of supplies) {
            payment = await paymentService.addItem(appointmentId, { ...line, referenceType: "SUPPLY", referenceId: productId });
        }
        return payment;
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
