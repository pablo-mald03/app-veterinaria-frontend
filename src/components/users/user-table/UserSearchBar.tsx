"use client";

import { Search } from "lucide-react";

interface UserSearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

//User search bar component
export default function UserSearchBar({ value, onChange }: UserSearchBarProps) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-secondary/50 bg-white p-3 shadow-sm">
            <Search className="h-5 w-5 text-accent" />
            <input
                type="text"
                placeholder="Buscar por nombre, correo o usuario..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full text-sm text-text outline-none placeholder:text-text/40"
            />
        </div>
    );
}