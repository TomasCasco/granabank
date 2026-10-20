"use client";

import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { MovementItem } from "@/components/movement-item";
import { ErrorState, MovementListSkeleton } from "@/components/states";
import { groupByDay } from "@/lib/dates";
import type { MovementDTO } from "@/lib/types";
import { useVersion } from "@/lib/version";

type Props = {
  query: UseQueryResult<MovementDTO[]>;
  skeletonCount?: number;
  empty: ReactNode;
};

/** Renders a movements query through its loading, error, empty and data states. */
export function MovementList({ query, skeletonCount, empty }: Props) {
  const { isV2 } = useVersion();

  if (query.isPending) return <MovementListSkeleton count={skeletonCount} />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  if (query.data.length === 0) return <>{empty}</>;

  const fading = `transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`;

  if (!isV2) return <Items movements={query.data} className={fading} busy={query.isFetching} />;

  // v2: grouped under "Hoy", "Ayer", "15 de octubre"… so every movement has a place in time.
  return (
    <div className={`flex flex-col gap-6 ${fading}`} aria-busy={query.isFetching}>
      {groupByDay(query.data).map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="mb-3 text-sm font-medium text-slate">{group.label}</h3>
          <Items movements={group.items} />
        </section>
      ))}
    </div>
  );
}

function Items({ movements, className = "", busy }: { movements: MovementDTO[]; className?: string; busy?: boolean }) {
  return (
    <ul className={`flex flex-col gap-4 ${className}`} aria-busy={busy}>
      {movements.map((movement) => (
        <li key={movement.id}>
          <MovementItem movement={movement} />
        </li>
      ))}
    </ul>
  );
}
