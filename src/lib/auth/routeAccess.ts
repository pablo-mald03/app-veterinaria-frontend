import { NAV_ITEMS } from "@/config/navigation";

//Required permission evaluation
export function requiredPermissionFor(pathname: string): string | null {
    const match = NAV_ITEMS
        .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
        .sort((a, b) => b.href.length - a.href.length)[0];

    return match?.permission ?? null;
}