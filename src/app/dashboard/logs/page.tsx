import LogTable from "@/components/logs/LogTable";

export const metadata = {
    title: "Logs · Happy Pets",
    description: "Bitácora de actividad del sistema.",
};

//Logs page view
export default function LogsPage() {
    return <LogTable />;
}
