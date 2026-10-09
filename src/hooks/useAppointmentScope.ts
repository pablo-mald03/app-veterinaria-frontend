"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { isVeterinarianRole } from "@/lib/appointments/utils";

//A veterinarian only works with their own appointments; the rest of the roles see all of them
export function useAppointmentScope() {
  const { user } = useAuth();

  const isVeterinarian = Boolean(user?.roles.some(isVeterinarianRole));
  const myUserId = user ? Number(user.id) : undefined;

  return { isVeterinarian, myUserId };
}
