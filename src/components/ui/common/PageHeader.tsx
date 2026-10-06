"use client";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

//Page header component for the principal action RBAC module
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1
                    className="text-3xl font-bold text-text"
                    style={{ fontFamily: "'Young Serif', serif" }}
                >
                    {title}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-text/70">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}