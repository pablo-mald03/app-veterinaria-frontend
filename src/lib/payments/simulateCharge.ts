import { digitsOnly } from "@/lib/forms/transform";
import type { ChargeReceipt, PaymentDetails } from "@/types/payment";

const PROCESSING_MS = 1500;

export const DECLINED_TEST_CARD_ENDING = "0002";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function newTransactionId(): string {
    const random = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, "0")).join("");
    return `SIM-${random.toUpperCase()}`;
}

export async function simulateCharge(details: PaymentDetails, amount: number): Promise<ChargeReceipt> {
    if (!(amount > 0)) throw new Error("El monto a cobrar debe ser mayor a cero.");

    await wait(PROCESSING_MS);

    if (details.method === "CREDIT_CARD") {
        const digits = digitsOnly(details.data.number);
        if (digits.endsWith(DECLINED_TEST_CARD_ENDING)) throw new Error("La tarjeta fue rechazada por el banco emisor.");

        return {
            transactionId: newTransactionId(),
            method: details.method,
            amount,
            approvedAt: new Date().toISOString(),
            summary: `Tarjeta terminada en ${digits.slice(-4)}`,
        };
    }

    return {
        transactionId: newTransactionId(),
        method: details.method,
        amount,
        approvedAt: new Date().toISOString(),
        summary: `Transferencia desde ${details.data.bank}, ref. ${details.data.reference.trim()}`,
    };
}
