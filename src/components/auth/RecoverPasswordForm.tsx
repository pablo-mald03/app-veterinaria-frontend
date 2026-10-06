// src/components/auth/RecoverPasswordForm.tsx
"use client";

import { useState } from "react";
import { IdCard, KeyRound, Lock, Mail } from "lucide-react";
import { authService } from "@/services/authService";
import { useField } from "@/hooks/useField";
import { dpiSchema, emailSchema, newPasswordSchema } from "@/schemas/auth.schema";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import TextField from "@/components/ui/common/TextField";
import { digitsOnly } from "@/lib/forms/transform";

//Recover password form
export default function RecoverPasswordForm() {
    const dpi = useField({ validator: dpiSchema, validateOn: "change", transform: digitsOnly });
    const email = useField({ validator: emailSchema });
    const newPassword = useField({ validator: newPasswordSchema });
    const confirmPassword = useField({
        validateOn: "change",
        validator: (value) => {
            if (!value) return "Confirma tu contraseña.";
            return value === newPassword.value ? undefined : "Las contraseñas no coinciden.";
        },
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const fields = [dpi, email, newPassword, confirmPassword];
        const results = fields.map((field) => field.validate());
        if (!results.every(Boolean)) return;

        setLoading(true);

        try {
            await authService.recoverPassword({
                dpi: dpi.value,
                email: email.value,
                password: newPassword.value,
                confirmationPassword: confirmPassword.value,
            });

            setSuccess("Contraseña restablecida con éxito. Puedes iniciar sesión.");
            fields.forEach((field) => field.reset());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Ocurrió un error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <TextField label="DPI" inputMode="numeric" maxLength={13} placeholder="Número de DPI (solo números)" icon={<IdCard />} clearable {...dpi.props} />

            <TextField label="Correo Electrónico" type="email" autoComplete="email" placeholder="ejemplo@happypets.com" icon={<Mail />} clearable {...email.props} />

            <TextField label="Nueva Contraseña" type="password" autoComplete="new-password" placeholder="••••••••" icon={<KeyRound />} message="Mínimo 6 caracteres." {...newPassword.props} />

            <TextField label="Confirmar Contraseña" type="password" autoComplete="new-password" placeholder="••••••••" icon={<Lock />} {...confirmPassword.props} />

            <Button type="submit" loading={loading} loadingLabel="Procesando..." className="mt-2 w-full py-3">
                Restablecer Contraseña
            </Button>
        </form>
    );
}