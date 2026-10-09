import AppointmentsTable from "@/components/appointments/AppointmentsTable";

export const metadata = {
    title: "Agenda de Citas · Happy Pets",
    description: "Agenda y seguimiento de las consultas médicas de la clínica.",
};

//Appointments page view
export default function AppointmentsPage() {
    return <AppointmentsTable />;
}