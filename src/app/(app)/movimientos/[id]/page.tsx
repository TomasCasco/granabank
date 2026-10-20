import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailHeader, DetailSkeleton, MovementDetail } from "./movement-detail";

export const metadata: Metadata = { title: "Detalle" };

export default function MovementDetailPage({ params }: PageProps<"/movimientos/[id]">) {
  return (
    <>
      <DetailHeader />
      {/* params is request-time data, so it is read inside Suspense and the header renders immediately. */}
      <Suspense fallback={<DetailSkeleton />}>
        <MovementDetail params={params} />
      </Suspense>
    </>
  );
}
