"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import RecoverPasswordForm from "@/components/auth/RecoverPasswordForm";
import SegmentedTabs from "@/components/ui/SegmentedTabs";

type AuthTab = "login" | "recover";

const TABS: { value: AuthTab; label: string }[] = [
    { value: "login", label: "Iniciar Sesión" },
    { value: "recover", label: "Recuperar Contraseña" },
];

const SUBTITLES: Record<AuthTab, string> = {
    login: "Ingresa a tu cuenta para continuar",
    recover: "Restablecimiento de credenciales",
};

//Auth form view
export default function AuthForm() {
    const [activeTab, setActiveTab] = useState<AuthTab>("login");

    return (
        <div className="w-full max-w-md rounded-3xl border border-secondary/50 bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-white shadow-sm">
                    <Image src="/HappyPetsIcon.jpeg" alt="Logo Happy Pets" width={65} height={65} style={{ width: "auto", height: "auto" }} className="object-contain" priority />
                </div>
                <h1 className="font-display text-3xl font-bold text-text">Happy Pets</h1>
                <p className="mt-1 text-sm font-medium text-accent">{SUBTITLES[activeTab]}</p>
            </div>

            <div className="mt-6">
                <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
            </div>

            <div className="mt-5">
                {activeTab === "login" ? <LoginForm /> : <RecoverPasswordForm />}
            </div>

            <p className="mt-6 text-center text-xs text-text/60">
                ¿Problemas para acceder? Contacta al administrador del sistema.
            </p>
        </div>
    );
}