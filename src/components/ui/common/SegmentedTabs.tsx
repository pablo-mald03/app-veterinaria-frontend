interface Tab<T extends string> {
    value: T;
    label: string;
}

interface SegmentedTabsProps<T extends string> {
    tabs: Tab<T>[];
    active: T;
    onChange: (value: T) => void;
}

//Segmented tabs component
export default function SegmentedTabs<T extends string>({ tabs, active, onChange }: SegmentedTabsProps<T>) {
    return (
        <div role="tablist" className="flex rounded-2xl bg-mint/60 p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active === tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`flex-1 cursor-pointer rounded-xl py-2 text-xs font-bold transition-all ${active === tab.value ? "bg-white text-text shadow-sm" : "text-accent hover:text-text"}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}