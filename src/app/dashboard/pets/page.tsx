import { Suspense } from "react";
import PetTable from "@/components/pets/PetTable";

// PetTable lee los parámetros de la URL (useSearchParams), por eso Next exige un Suspense.
export default function PacientesPage() {
  return (
    <Suspense fallback={null}>
      <PetTable />
    </Suspense>
  );
}
