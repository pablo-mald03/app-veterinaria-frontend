"use client";

import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";

export const DEFAULT_PAGE_SIZE = 20;

const OPTIONS: DropdownOption[] = [10, 20, 50].map((n) => ({ value: String(n), label: `${n} por página` }));

interface PageSizeSelectProps {
    value: number;
    onChange: (size: number) => void;
}

//Page size selector for paginated tables
export default function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
    return (
        <Dropdown
            label="Registros"
            options={OPTIONS}
            value={String(value)}
            onValueChange={(v) => onChange(Number(v) || DEFAULT_PAGE_SIZE)}
        />
    );
}
