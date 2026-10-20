import type { MovementStatus, MovementType } from "@/lib/types";

/** "$125" for whole amounts (as in the design), "$11.99" otherwise. */
export function formatAmount(cents: number): string {
  const whole = cents % 100 === 0;
  return (
    "$" +
    (cents / 100).toLocaleString("en-US", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Card balance, always with two decimals: "978.85". */
export function formatBalance(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "15 de oct de 2026, 21:05" */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  SUBSCRIPTION: "Pago de suscripción",
  CASH_IN: "Pago recibido",
  CASH_OUT: "Pago enviado",
};

export const MOVEMENT_STATUS_LABEL: Record<MovementStatus, string> = {
  COMPLETED: "Completado",
  PENDING: "Pendiente",
  FAILED: "Fallido",
};
