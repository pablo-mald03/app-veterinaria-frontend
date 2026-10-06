import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary pt-12 pb-6 text-text">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          
          {/* Columna 1: Marca y Descripción */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-mint bg-white">
                <Image
                  src="/HappyPetsIcon.jpeg"
                  alt="Logo Happy Pets"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h2 
                className="text-2xl font-bold tracking-wide"
                style={{ fontFamily: "'Young Serif', serif" }}
              >
                Happy Pets
              </h2>
            </div>
            <p className="text-sm font-medium italic text-text/90">
              Para colitas felices y dueños tranquilos
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text/80">
              Sistema integral para el control de clínicas veterinarias, gestión de 
              documentos y administración de personal.
            </p>
          </div>

          {/* Columna 2: Servicios (Extraídos del requerimiento) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b-2 border-accent pb-2 inline-block w-max">
              Nuestros Servicios
            </h3>
            <ul className="flex flex-col gap-2 text-sm font-medium text-text/80">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                 Medicina Preventiva
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                 Diagnóstico Especializado
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                 Tratamiento Médico
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                 Servicios Complementarios
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto y Ubicación */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b-2 border-accent pb-2 inline-block w-max">
              Contacto y Ubicación
            </h3>
            <div className="flex flex-col gap-3 text-sm text-text/80">
              <p className="flex items-center gap-2">
                <span className="font-bold text-accent"> Sede:</span> 
                Quetzaltenango, Guatemala
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-accent"> Horario:</span> 
                Lunes a Sábado - 8:00 AM a 6:00 PM
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-accent"> Soporte:</span> 
                soporte@happypets.com
              </p>
            </div>
          </div>

        </div>

        {/* Separador */}
        <hr className="my-8 border-secondary/60" />

        {/* Barra inferior: Créditos y Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs font-medium text-text/70 md:flex-row">
          <p>
            © {new Date().getFullYear()} Happy Pets. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-right">
            <p>
              Proyecto: Teoría de Sistemas 1 | CUNOC - USAC
            </p>
            <span className="hidden md:inline text-secondary">|</span>
            <p className="hidden md:block">
              Grupo 3
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}