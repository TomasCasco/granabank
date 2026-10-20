"use client";

import Link from "next/link";
import { AMOUNT_COLOR, MovementIcon } from "@/components/movement-icon";
import { formatTime } from "@/lib/dates";
import { formatAmount, MOVEMENT_TYPE_LABEL } from "@/lib/format";
import type { MovementDTO } from "@/lib/types";
import { useVersion } from "@/lib/version";

export function MovementItem({ movement }: { movement: MovementDTO }) {
  const { isV2, to } = useVersion();
  // v2: a sign so direction doesn't depend on color alone, and the time (the list is grouped by day).
  const sign = isV2 ? (movement.type === "CASH_IN" ? "+" : "−") : "";

  return (
    <Link
      href={to(`/movimientos/${movement.id}`)}
      className="flex h-[92px] items-center gap-4 rounded-[16px] bg-white px-4 shadow-soft transition active:scale-[0.99] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
    >
      <MovementIcon type={movement.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base leading-[22px] font-medium text-ink-2">{movement.counterparty}</p>
        <p className="text-xs leading-[18px] text-muted">
          {MOVEMENT_TYPE_LABEL[movement.type]}
          {isV2 && ` · ${formatTime(movement.date)}`}
        </p>
      </div>
      <p className={`text-sm leading-[18px] font-medium ${AMOUNT_COLOR[movement.type]}`}>
        {sign}
        {formatAmount(movement.amountCents)}
      </p>
    </Link>
  );
}
