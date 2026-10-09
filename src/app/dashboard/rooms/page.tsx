import RoomTable from "@/components/rooms/RoomTable";

export const metadata = {
    title: "Habitaciones · Happy Pets",
    description: "Gestión de las habitaciones de la clínica.",
};

//Rooms page view
export default function RoomsPage() {
    return <RoomTable />;
}
