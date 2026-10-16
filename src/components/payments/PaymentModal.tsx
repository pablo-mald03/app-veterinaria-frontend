"use client";

import { useEffect, useState } from "react";
import { CreditCard, Download, Plus, Receipt, Wallet } from "lucide-react";
import Modal from "@/components/ui/common/Modal";
import Button from "@/components/ui/common/Button";
import TextField from "@/components/ui/common/TextField";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import StatusBadge from "@/components/ui/common/StatusBadge";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { paymentService } from "@/services/paymentService";
import AppointmentSupplies from "@/components/appointments/AppointmentSupplies";
import type { Payment, PaymentItemRequest, SupplyLine } from "@/types/payment";

interface PaymentModalProps {
    open: boolean;
    appointmentId: number | null;
    petName: string;
    onClose: () => void;
}

const PAYMENT_METHODS: DropdownOption[] = [
    { value: "CASH", label: "Efectivo" },
    { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
    { value: "TRANSFER", label: "Transferencia" },
];

const ITEM_TYPES: DropdownOption[] = [
    { value: "CONSULTATION", label: "Consulta" },
    { value: "VACCINE", label: "Vacuna" },
    { value: "TREATMENT", label: "Tratamiento" },
];

const EMPTY_ITEM: PaymentItemRequest = {
    description: "",
    quantity: 1,
    unitPrice: 0,
    referenceType: "CONSULTATION",
};

function money(value: number) {
    return `Q ${Number(value).toFixed(2)}`;
}

export default function PaymentModal({ open, appointmentId, petName, onClose }: PaymentModalProps) {
    const toast = useToast();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [item, setItem] = useState<PaymentItemRequest>(EMPTY_ITEM);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [supplyLines, setSupplyLines] = useState<SupplyLine[]>([]);

    useEffect(() => {
        if (!open || appointmentId === null) return;
        void Promise.resolve().then(() => {
            setPayment(null);
            setSupplyLines([]);
            setLoading(true);
            return paymentService.getByAppointment(appointmentId)
                .then(setPayment)
                .catch((error: unknown) => {
                    const message = error instanceof Error ? error.message : "No se pudo cargar la cuenta.";
                    toast.error(message, "Error al cargar cobro");
                })
                .finally(() => setLoading(false));
        });
    }, [open, appointmentId, toast]);

    const openPayment = async () => {
        if (appointmentId === null) return;
        setSaving(true);
        try {
            setPayment(await paymentService.open(appointmentId));
            toast.success("Cuenta de cobro abierta", petName);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo abrir la cuenta.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const addItem = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (appointmentId === null) return;
        setSaving(true);
        try {
            setPayment(await paymentService.addItem(appointmentId, item));
            setItem(EMPTY_ITEM);
            toast.success("Cargo agregado", item.description);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo agregar el cargo.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const addSupplies = async () => {
        if (appointmentId === null || supplyLines.length === 0) return;
        setSaving(true);
        try {
            setPayment(await paymentService.addSupplies(appointmentId, supplyLines));
            setSupplyLines([]);
            toast.success("Productos agregados a la cuenta", petName);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudieron agregar los productos.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const processPayment = async () => {
        if (!payment || !paymentMethod) return;
        setSaving(true);
        try {
            setPayment(await paymentService.process(payment.id, paymentMethod));
            toast.success("Pago procesado", "La cuenta quedó pagada");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo procesar el pago.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const downloadInvoice = async () => {
        if (!payment) return;
        try {
            const blob = await paymentService.downloadInvoice(payment.id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `factura_${payment.id}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo descargar la factura.", "Error");
        }
    };

    return (
        <Modal open={open} onClose={onClose} size="2xl" title={`Cobro de ${petName}`} subtitle={`Cita #${appointmentId ?? ""}`}>
            {loading ? <p className="py-8 text-center text-text/60">Cargando cuenta...</p> : !payment ? (
                <div className="space-y-4 text-center">
                    <Receipt className="mx-auto h-12 w-12 text-accent" />
                    <p className="text-text/70">Esta cita aún no tiene una cuenta de cobro.</p>
                    <Button onClick={() => void openPayment()} loading={saving} icon={<Wallet className="h-4 w-4" />}>Abrir cuenta</Button>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mint/30 p-4">
                        <div><p className="text-sm text-text/60">Total</p><p className="text-2xl font-bold text-text">{money(payment.totalAmount)}</p></div>
                        <StatusBadge active={payment.status === "PAID"} activeLabel="Pagada" inactiveLabel="Pendiente" />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-secondary">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background text-xs uppercase text-text/60"><tr><th className="px-3 py-3">Cargo</th><th className="px-3 py-3">Cantidad</th><th className="px-3 py-3">Precio</th><th className="px-3 py-3">Subtotal</th></tr></thead>
                            <tbody className="divide-y divide-mint">{payment.items.map((charge, index) => <tr key={charge.id ?? `${charge.description}-${index}`}><td className="px-3 py-3">{charge.description}</td><td className="px-3 py-3">{charge.quantity}</td><td className="px-3 py-3">{money(charge.unitPrice)}</td><td className="px-3 py-3 font-semibold">{money(charge.subtotal)}</td></tr>)}</tbody>
                        </table>
                    </div>

                    {payment.status !== "PAID" && (
                        <>
                            <div className="space-y-3 rounded-xl border border-secondary p-4">
                                <AppointmentSupplies value={supplyLines} onChange={setSupplyLines} hint="Arma la lista y cárgala a la cuenta con un solo clic." />
                                <Button type="button" disabled={supplyLines.length === 0} loading={saving} icon={<Plus className="h-4 w-4" />} onClick={() => void addSupplies()}>Agregar productos a la cuenta</Button>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-secondary p-4">
                                <Dropdown label="Método de pago" options={PAYMENT_METHODS} value={paymentMethod} onValueChange={setPaymentMethod} placeholder="Selecciona un método" />
                                <Button disabled={!paymentMethod} loading={saving} icon={<CreditCard className="h-4 w-4" />} onClick={() => void processPayment()}>Procesar pago</Button>
                            </div>
                        </>
                    )}
                    {payment.status === "PAID" && <Button onClick={() => void downloadInvoice()} icon={<Download className="h-4 w-4" />}>Descargar factura PDF</Button>}
                </div>
            )}
        </Modal>
    );
}
