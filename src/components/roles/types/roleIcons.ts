import {
    BriefcaseMedical,
    Cross,
    ShieldCheck,
    Stethoscope,
    UserCog,
    type LucideIcon,
} from "lucide-react";

/** Icons for the well-known */
const KNOWN_ICONS: Record<string, LucideIcon> = {
    VETERINARIO: Stethoscope,
    ADMIN: ShieldCheck,
    DOCTOR: Cross,
};

/** Fallback icon for roles without a specific match. */
const FALLBACK_ICON: LucideIcon = UserCog;

/**
 * Method to resolve the icon for a role by its alias.
 */
export function getRoleIcon(alias: string): LucideIcon {
    return KNOWN_ICONS[alias.toUpperCase()] ?? FALLBACK_ICON;
}