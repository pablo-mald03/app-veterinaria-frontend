"use client";

import { useEffect, useMemo, useState } from "react";
import { getPets } from "@/services/petsService";
import { userService, type UserResponse } from "@/services/userService";
import { roomService } from "@/services/roomService";
import { isVeterinarianRole } from "@/lib/appointments/utils";
import type { DropdownOption } from "@/components/ui/common/Dropdown";

interface CatalogItem {
  id: number;
  name: string;
}

//Only active users with the veterinarian role can be assigned to an appointment
const isVeterinarian = (u: UserResponse) =>
    u.status && u.roles?.some((r) => isVeterinarianRole(r.alias) || isVeterinarianRole(r.name));

//The catalogs are not paginated in the UI, so a large page is requested
const CATALOG_SIZE = 200;

//Pets, veterinarians and rooms used by the appointments filters and form
export function useAppointmentCatalogs() {
  const [pets, setPets] = useState<CatalogItem[]>([]);
  const [users, setUsers] = useState<CatalogItem[]>([]);
  const [rooms, setRooms] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      getPets(0, CATALOG_SIZE).then((p) => p.content.map((x) => ({ id: x.idPet, name: x.name }))).catch(() => []),
      userService.getAll(0, CATALOG_SIZE).then((u) => u.filter(isVeterinarian).map((x) => ({ id: x.id, name: `${x.name} ${x.firstName ?? ""}`.trim() }))).catch(() => []),
      roomService.getAll({ size: CATALOG_SIZE, status: true }).then((r) => r.content.map((x) => ({ id: x.id, name: x.name }))).catch(() => []),
    ]).then(([p, u, r]) => {
      if (!active) return;
      setPets(p);
      setUsers(u);
      setRooms(r);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const toOptions = (items: CatalogItem[]): DropdownOption[] => items.map((i) => ({ value: String(i.id), label: i.name }));
    const nameOf = (items: CatalogItem[], fallback: string) => (id: number) =>
        items.find((i) => i.id === id)?.name ?? `${fallback} #${id}`;

    return {
      loading,
      petOptions: toOptions(pets),
      userOptions: toOptions(users),
      roomOptions: toOptions(rooms),
      petName: nameOf(pets, "Mascota"),
      userName: nameOf(users, "Veterinario"),
      roomName: nameOf(rooms, "Habitación"),
    };
  }, [loading, pets, users, rooms]);
}

export type AppointmentCatalogs = ReturnType<typeof useAppointmentCatalogs>;
