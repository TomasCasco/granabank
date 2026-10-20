"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, type ReactNode } from "react";
import { AMOUNT_COLOR, MovementIcon } from "@/components/movement-icon";
import { EmptyState, ErrorState, Skeleton } from "@/components/states";
import { ApiError } from "@/lib/fetcher";
import { formatAmount, formatDateTime, MOVEMENT_STATUS_LABEL, MOVEMENT_TYPE_LABEL } from "@/lib/format";
import { useMovement } from "@/lib/queries";
import type { MovementDTO, MovementStatus } from "@/lib/types";

const STATUS_STYLE: Record<MovementStatus, string> = {
  COMPLETED: "bg-success-soft text-success",
  PENDING: "bg-warning-soft text-warning",
  FAILED: "bg-danger-soft text-danger",
};

const BRAND_LABEL = { MASTERCARD: "Mastercard", VISA: "Visa" } as const;

export function DetailHeader() {
  const router = useRouter();

  // Prefer real history so "back" returns to the filtered list the user came from.
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/movimientos");
  }

  return (
    <header className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={goBack}
        aria-label="Volver"
        className="absolute left-0 grid size-10 place-items-center rounded-full text-2xl text-ink transition hover:bg-white focus-visible:outline-2 focus-visible:outline-granate"
      >
        ←
      </button>
      <h1 className="text-xl leading-[26px] font-medium text-ink">Detalle</h1>
    </header>
  );
}

export function MovementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const movement = useMovement(id);
  if (movement.isPending) return <DetailSkeleton />;

  return (
    <div className="mt-8">
      {movement.isError &&
          (movement.error instanceof ApiError && movement.error.status === 404 ? (
            <EmptyState title="Movimiento no encontrado">
              <p>Puede que el enlace sea incorrecto o que el movimiento ya no exista.</p>
              <Link href="/movimientos" className="mt-3 inline-block font-medium text-granate underline-offset-2 hover:underline">
                Ver todos los movimientos
              </Link>
            </EmptyState>
          ) : (
            <ErrorState message={movement.error.message} onRetry={() => movement.refetch()} />
          ))}
      {movement.data && <DetailContent movement={movement.data} />}
    </div>
  );
}

function DetailContent({ movement }: { movement: MovementDTO }) {
  const sign = movement.type === "CASH_IN" ? "+" : "−";

  return (
    <article className="flex flex-col items-center">
      <MovementIcon type={movement.type} size="lg" />
      <h2 className="mt-4 text-[22px] leading-[30px] font-semibold text-ink">{movement.counterparty}</h2>
      <p className={`mt-1 text-[32px] leading-10 font-semibold ${AMOUNT_COLOR[movement.type]}`}>
        <span className="sr-only">{movement.type === "CASH_IN" ? "Ingreso de" : "Egreso de"} </span>
        <span aria-hidden>{sign}</span>
        {formatAmount(movement.amountCents)}
        <span className="ml-1 text-sm font-medium text-muted">{movement.currency}</span>
      </p>
      <span className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[movement.status]}`}>
        {MOVEMENT_STATUS_LABEL[movement.status]}
      </span>

      <dl className="mt-8 w-full divide-y divide-base rounded-[16px] bg-white px-5 shadow-soft">
        <Row label="Tipo">{MOVEMENT_TYPE_LABEL[movement.type]}</Row>
        <Row label="Fecha">{formatDateTime(movement.date)}</Row>
        <Row label="Medio de pago">
          {movement.card ? `${BRAND_LABEL[movement.card.brand]} •••• ${movement.card.last4}` : "Saldo GranaBank"}
        </Row>
        {movement.description && <Row label="Descripción">{movement.description}</Row>}
        <Row label="N.º de operación">
          <span className="font-mono text-xs">{movement.id.slice(-10).toUpperCase()}</span>
        </Row>
      </dl>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink-2">{children}</dd>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Cargando movimiento" className="mt-8 flex flex-col items-center">
      <Skeleton className="size-[72px] rounded-[12px]" />
      <Skeleton className="mt-4 h-7 w-40 rounded-md" />
      <Skeleton className="mt-2 h-10 w-32 rounded-md" />
      <Skeleton className="mt-8 h-[230px] w-full" />
    </div>
  );
}
