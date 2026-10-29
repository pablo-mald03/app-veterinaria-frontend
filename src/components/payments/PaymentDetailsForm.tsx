"use client";

import { useState } from "react";
import { Calendar, CreditCard, Hash, Landmark, Lock, User } from "lucide-react";
import { useField } from "@/hooks/useField";
import { formatCardExpiry, formatCardNumber } from "@/lib/payments/card";
import { simulateCharge } from "@/lib/payments/simulateCharge";
import {
    cardCvvSchema,
    cardExpirySchema,
    cardHolderSchema,
    cardNumberSchema,
    transferBankSchema,
    transferHolderSchema,
    transferReferenceSchema,
} from "@/schemas/paymentDetails.schema";
import { digitsOnly } from "@/lib/forms/transform";
import TextField from "@/components/ui/common/TextField";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import Alert from "@/components/ui/common/Alert";
import type { ChargeReceipt, DetailedPaymentMethod, PaymentDetails } from "@/types/payment";

const BANKS: DropdownOption[] = [
    { value: "Banrural", label: "Banrural" },
    { value: "BAC Credomatic", label: "BAC Credomatic" },
    { value: "Banco Industrial", label: "Banco Industrial" },
    { value: "G&T Continental", label: "G&T Continental" },
    { value: "Bantrab", label: "Bantrab" },
    { value: "Banco Promerica", label: "Banco Promerica" },
];

function money(value: number) {
    return `Q ${Number(value).toFixed(2)}`;
}

interface PaymentDetailsFormProps {
    method: DetailedPaymentMethod;
    amount: number;
    onApproved: (receipt: ChargeReceipt) => void | Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
}

interface MethodFieldsProps {
    amount: number;
    submitting: boolean;
    submitLabel: string;
    onCharge: (details: PaymentDetails) => Promise<void>;
    onCancel?: () => void;
    error: string | null;
}

export default function PaymentDetailsForm({ method, amount, onApproved, onCancel, submitLabel = "Cobrar" }: PaymentDetailsFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const charge = async (details: PaymentDetails) => {
        setError(null);
        setSubmitting(true);
        try {
            const receipt = await simulateCharge(details, amount);
            await onApproved(receipt);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo procesar el cobro.");
        } finally {
            setSubmitting(false);
        }
    };

    const shared: MethodFieldsProps = { amount, submitting, submitLabel, onCharge: charge, onCancel, error };

    return method === "CREDIT_CARD" ? <CardFields {...shared} /> : <TransferFields {...shared} />;
}

function CardFields({ amount, submitting, submitLabel, onCharge, onCancel, error }: MethodFieldsProps) {
    const holder = useField({ validator: cardHolderSchema });
    const number = useField({ validator: cardNumberSchema, transform: formatCardNumber });
    const expiry = useField({ validator: cardExpirySchema, transform: formatCardExpiry });
    const cvv = useField({ validator: cardCvvSchema, transform: (v) => digitsOnly(v).slice(0, 4) });

    const fields = [holder, number, expiry, cvv];
    const isFormValid = fields.every((f) => f.valid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fields.map((f) => f.validate()).every(Boolean)) return;

        await onCharge({
            method: "CREDIT_CARD",
            data: { holder: holder.value.trim(), number: number.value, expiry: expiry.value, cvv: cvv.value },
        });
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && <Alert variant="error">{error}</Alert>}

            <TextField label="Titular de la tarjeta" icon={<User />} placeholder="Nombre como aparece en la tarjeta" autoComplete="cc-name" maxLength={60} clearable disabled={submitting} {...holder.props} />
            <TextField label="Número de tarjeta" icon={<CreditCard />} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" maxLength={23} disabled={submitting} {...number.props} />

            <div className="grid grid-cols-2 gap-4">
                <TextField label="Vencimiento" icon={<Calendar />} placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" maxLength={5} disabled={submitting} {...expiry.props} />
                <TextField label="CVV" type="password" icon={<Lock />} placeholder="123" inputMode="numeric" autoComplete="cc-csc" maxLength={4} disabled={submitting} {...cvv.props} />
            </div>

            <Footer amount={amount} submitting={submitting} submitLabel={submitLabel} disabled={!isFormValid} onCancel={onCancel} />
        </form>
    );
}

function TransferFields({ amount, submitting, submitLabel, onCharge, onCancel, error }: MethodFieldsProps) {
    const bank = useField({ validator: transferBankSchema });
    const accountHolder = useField({ validator: transferHolderSchema });
    const reference = useField({ validator: transferReferenceSchema });

    const fields = [bank, accountHolder, reference];
    const isFormValid = fields.every((f) => f.valid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fields.map((f) => f.validate()).every(Boolean)) return;

        await onCharge({
            method: "TRANSFER",
            data: { bank: bank.value, accountHolder: accountHolder.value.trim(), reference: reference.value.trim() },
        });
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Dropdown label="Banco de origen" icon={<Landmark />} options={BANKS} placeholder="Selecciona un banco" disabled={submitting} {...bank.props} />
            <TextField label="Titular de la cuenta" icon={<User />} placeholder="Quien realizó la transferencia" maxLength={60} clearable disabled={submitting} {...accountHolder.props} />
            <TextField label="Número de referencia" icon={<Hash />} placeholder="Boleta o número de autorización" maxLength={25} disabled={submitting} {...reference.props} />

            <Footer amount={amount} submitting={submitting} submitLabel={submitLabel} disabled={!isFormValid} onCancel={onCancel} />
        </form>
    );
}

interface FooterProps {
    amount: number;
    submitting: boolean;
    submitLabel: string;
    disabled: boolean;
    onCancel?: () => void;
}

function Footer({ amount, submitting, submitLabel, disabled, onCancel }: FooterProps) {
    return (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-mint pt-4">
            <p className="text-sm text-text/60">Monto a cobrar: <span className="font-bold text-text">{money(amount)}</span></p>
            <div className="flex gap-3">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancelar</Button>}
                <Button type="submit" loading={submitting} loadingLabel="Procesando cobro..." disabled={disabled || submitting}>{submitLabel}</Button>
            </div>
        </div>
    );
}
