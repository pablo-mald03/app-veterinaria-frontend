"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getGreeting } from "@/lib/greet/greeting";

//Use for the greeting for user
export function useGreeting(): { text: string; period: ReturnType<typeof getGreeting>["period"] } {
    const { user } = useAuth();
    const { text, period } = getGreeting();

    const firstName = user?.name?.trim().split(/\s+/)[0];

    return {
        text: firstName ? `${text}, ${firstName}` : text,
        period,
    };
}