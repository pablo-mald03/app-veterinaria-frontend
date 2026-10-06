"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail } from "lucide-react";
import { authService } from "@/services/authService";
import { useField } from "@/hooks/useField";
import { emailSchema, loginPasswordSchema } from "@/schemas/auth.schema";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

//Login form component
export default function LoginForm() {
  const router = useRouter();
  const email = useField({ validator: emailSchema, validateOn: "submit" });
  const password = useField({ validator: loginPasswordSchema, validateOn: "submit" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const results = [email.validate(), password.validate()];
    if (!results.every(Boolean)) return;

    setLoading(true);

    try {
      await authService.login({ email: email.value, password: password.value });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && <Alert variant="error">{error}</Alert>}

      <TextField label="Correo Electrónico" type="email" autoComplete="email" placeholder="ejemplo@happypets.com" icon={<Mail />} clearable {...email.props} />

      <TextField label="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" icon={<Lock />} {...password.props} />

      <Button type="submit" loading={loading} loadingLabel="Iniciando sesión..." icon={<LogIn className="h-5 w-5" />} className="mt-2 w-full py-3">
        Iniciar Sesión
      </Button>
    </form>
  );
}