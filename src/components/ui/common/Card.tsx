"use client";

interface CardProps {
    hoverable?: boolean;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
}

/*Card component for card layouts (with hovereable props)*/
export default function Card({ hoverable = false, selected = false, onClick, className = "", children }: CardProps) {
    const interactive = Boolean(onClick);

    const classes = [
        "rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
        hoverable || interactive ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:shadow-md" : "",
        className,
    ].filter(Boolean).join(" ");

    return (
        <div
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => {
                if (interactive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className={classes}
        >
            {children}
        </div>
    );
}