import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { MovementItem } from "@/components/movement-item";
import { ErrorState, MovementListSkeleton } from "@/components/states";
import type { MovementDTO } from "@/lib/types";

type Props = {
  query: UseQueryResult<MovementDTO[]>;
  skeletonCount?: number;
  empty: ReactNode;
};

/** Renders a movements query through its loading, error, empty and data states. */
export function MovementList({ query, skeletonCount, empty }: Props) {
  if (query.isPending) return <MovementListSkeleton count={skeletonCount} />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  if (query.data.length === 0) return <>{empty}</>;

  return (
    <ul
      className={`flex flex-col gap-4 transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}
      aria-busy={query.isFetching}
    >
      {query.data.map((movement) => (
        <li key={movement.id}>
          <MovementItem movement={movement} />
        </li>
      ))}
    </ul>
  );
}
