"use client";

interface RowAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger" | "success";
    visible: boolean;
}

interface RowActionsProps {
    actions: RowAction[];
}

const VARIANT_CLASSES: Record<NonNullable<RowAction["variant"]>, string> = {
    default: "text-accent hover:bg-secondary/30",
    danger: "text-red-500 hover:bg-red-50",
    success: "text-green-500 hover:bg-green-50",
};

//Row actions component 
export default function RowActions({ actions }: RowActionsProps) {
    const visible = actions.filter((a) => a.visible);
    if (visible.length === 0) return null;

    return (
        <>
            {visible.map((action, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={action.onClick}
                    className={`cursor-pointer rounded-lg p-2 transition-colors ${VARIANT_CLASSES[action.variant ?? "default"]}`}
                    aria-label={action.label}
                    title={action.label}
                >
                    {action.icon}
                </button>
            ))}
        </>
    );
}