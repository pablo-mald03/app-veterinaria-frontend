"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "./SidebarContext";

//Principal header component for the mobile and desktop view
export default function Header() {
  const { user } = useAuth();
  const { openMobile } = useSidebar();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-3 border-b-2 border-primary bg-mint px-4 shadow-md md:h-24 md:border-b-4 md:px-8">

      {/* Icon*/}
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={openMobile}
          aria-label="Abrir menú"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-text shadow-sm transition-colors hover:bg-white md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-white shadow-sm md:h-[60px] md:w-[60px]">
          <Image
            src="/HappyPetsIcon.jpeg"
            alt="Logo Happy Pets"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <h1
            className="truncate text-xl font-bold tracking-wide text-text md:text-3xl"
            style={{ fontFamily: "'Young Serif', serif" }}
          >
            Happy Pets
          </h1>
          <p className="hidden text-sm font-medium italic text-accent md:block">
            Para colitas felices y dueños tranquilos
          </p>
        </div>
      </div>

      {/* Sección de Usuario */}
      <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-secondary/50 bg-white/60 px-2 py-1.5 shadow-sm transition-all hover:bg-white hover:shadow-md md:gap-4 md:px-4 md:py-2">
        <div className="hidden flex-col items-end sm:flex">
          <p className="max-w-[160px] truncate font-bold text-text">{user.name}</p>
          <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-semibold text-accent">
            {user.roles[0] ?? "Usuario"}
          </span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-base font-bold text-white shadow-inner md:h-11 md:w-11 md:text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

    </header>
  );
}