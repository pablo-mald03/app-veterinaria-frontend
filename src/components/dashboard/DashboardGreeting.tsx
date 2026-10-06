"use client";

import { useGreeting } from "@/hooks/useGreeting";

//Greeting component
export default function DashboardGreeting() {
    const { text } = useGreeting();

    return (
        <div>
            <h1
                className="text-3xl font-bold text-text"
                style={{ fontFamily: "'Young Serif', serif" }}
            >
                {text}
            </h1>
            <p className="mt-1 text-sm text-text/70">
                Este es el resumen de actividad de hoy en Happy Pets.
            </p>
        </div>
    );
}