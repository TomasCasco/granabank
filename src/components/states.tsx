import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-[16px] bg-[#eceef3] ${className}`} />;
}

export function MovementListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando movimientos" className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[92px]" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-[16px] bg-white px-6 py-8 text-center shadow-soft">
      <span className="grid size-11 place-items-center rounded-[12px] bg-danger-soft text-xl text-danger" aria-hidden>
        !
      </span>
      <p className="text-base font-medium text-ink">No pudimos cargar la información</p>
      <p className="text-sm text-slate">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-[12px] bg-granate px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] bg-white px-6 py-8 text-center shadow-soft">
      <p className="text-base font-medium text-ink">{title}</p>
      {children && <div className="text-sm text-slate">{children}</div>}
    </div>
  );
}
