"use client";

export default function FilterPanel({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid gap-4 rounded-2xl border border-secondary/50 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {children}
        </div>
    );
}
