"use client";

import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 flex h-24 items-center justify-between bg-mint px-8 shadow-md border-b-4 border-primary">
      
      {/* Sección de Logo y Marca */}
      <div className="flex items-center gap-4">
        <div className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-2 border-secondary bg-white shadow-sm">
          <Image
            src="/HappyPetsIcon.jpeg"
            alt="Logo Happy Pets"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 
            className="text-3xl font-bold text-text tracking-wide" 
            style={{ fontFamily: "'Young Serif', serif" }}
          >
            Happy Pets
          </h1>
          <p className="text-sm font-medium text-accent italic">
            Para colitas felices y dueños tranquilos
          </p>
        </div>
      </div>

      {/* Sección de Usuario */}
      <div className="flex items-center gap-4 rounded-2xl bg-white/60 py-2 px-4 shadow-sm transition-all hover:bg-white hover:shadow-md border border-secondary/50">
        <div className="flex flex-col items-end">
          <p className="font-bold text-text">
            {user.name}
          </p>
          <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-semibold text-accent">
            {user.roles[0] ?? "Usuario"}
          </span>
        </div>
        
        {/* Avatar Placeholder */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-bold text-white shadow-inner">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
      
    </header>
  );
}