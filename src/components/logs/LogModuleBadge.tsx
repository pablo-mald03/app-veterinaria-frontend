"use client";

//Log module badge component
export default function LogModuleBadge({ module }: { module: string }) {
    return (
        <span className="inline-flex items-center rounded-lg bg-mint px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            {module}
        </span>
    );
}
