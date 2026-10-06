import Spinner from "@/components/ui/common/Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "danger";
    loading?: boolean;
    loadingLabel?: string;
    icon?: React.ReactNode;
}

const VARIANTS = {
    primary: "bg-primary text-white shadow-md hover:bg-accent",
    ghost: "text-text hover:bg-background",
    danger: "bg-danger text-white shadow-md hover:bg-danger-strong",
};

//Button component
export default function Button({
    variant = "primary",
    loading = false,
    loadingLabel,
    icon,
    disabled,
    className = "",
    children,
    ...buttonProps
}: ButtonProps) {
    const classes = [
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
    ].join(" ");

    return (
        <button disabled={disabled || loading} className={classes} {...buttonProps}>
            {loading ? (
                <>
                    <Spinner className="h-4 w-4" />
                    {loadingLabel ?? children}
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    );
}