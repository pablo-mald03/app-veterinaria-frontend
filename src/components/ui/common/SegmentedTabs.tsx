interface Tab<T extends string> {
    value: T;
    label: string;
}

interface SegmentedTabsProps<T extends string> {
    tabs: Tab<T>[];
    active: T;
    onChange: (value: T) => void;
    className?: string;
}

//Segmented tabs component
export default function SegmentedTabs<T extends string>({ tabs, active, onChange, className = "" }: SegmentedTabsProps<T>) {
    return (
        <div role="tablist" className={`flex gap-1 rounded-2xl bg-mint/60 p-1 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`min-w-max flex-1 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${active === tab.value ? "bg-white text-text shadow-sm" : "text-accent hover:text-text"}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}