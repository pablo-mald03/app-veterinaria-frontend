export type GreetingPeriod = "morning" | "afternoon" | "evening";

/**
 * Returns the greeting for the user.
 * - 05:00–11:59 → "Buenos días"
 * - 12:00–18:59 → "Buenas tardes"
 * - 19:00–04:59 → "Buenas noches"
 */
export function getGreeting(date: Date = new Date()): {
    text: string;
    period: GreetingPeriod;
} {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return { text: "Buenos días", period: "morning" };
    if (hour >= 12 && hour < 19) return { text: "Buenas tardes", period: "afternoon" };
    return { text: "Buenas noches", period: "evening" };
}