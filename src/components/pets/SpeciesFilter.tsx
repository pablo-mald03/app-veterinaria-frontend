"use client";

import type { Especie } from "@/types/pet";

const OPTIONS: (Especie | "TODAS")[] = ["TODAS", "PERRO", "GATO", "AVE", "OTRO"];

interface SpeciesFilterProps {
    value: Especie | "TODAS";
    onChange: (value: Especie | "TODAS") => void;
}

//Principal species filter component
export default function SpeciesFilter({ value, onChange }: SpeciesFilterProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as Especie | "TODAS")}
            className="cursor-pointer rounded-xl border border-secondary bg-white px-4 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
            {OPTIONS.map((esp) => (
                <option key={esp} value={esp}>
                    {esp === "TODAS" ? "Todas las especies" : esp}
                </option>
            ))}
        </select>
    );
}