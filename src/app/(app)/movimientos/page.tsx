import { Suspense } from "react";
import { MovementListSkeleton } from "@/components/states";
import { MovementsView } from "./movements-view";

export default function MovementsPage() {
  return (
    <>
      <h1 className="text-xl leading-[26px] font-medium text-ink">Movimientos</h1>
      {/* useSearchParams needs a Suspense boundary above it. */}
      <Suspense fallback={<MovementListSkeleton count={6} />}>
        <MovementsView />
      </Suspense>
    </>
  );
}
