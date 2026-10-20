import Image from "next/image";
import type { MovementType } from "@/lib/types";

const SIZES = { md: 44, lg: 72 } as const;

export function MovementIcon({ type, size = "md" }: { type: MovementType; size?: keyof typeof SIZES }) {
  const box = SIZES[size];
  const arrow = Math.round(box * (24 / 44));

  // The subscription asset already includes its rounded background.
  if (type === "SUBSCRIPTION") {
    return <Image src="/icons/subscription.svg" alt="" width={box} height={box} className="shrink-0" />;
  }

  const isIn = type === "CASH_IN";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[12px] ${isIn ? "bg-granate-soft" : "bg-cash-out-soft"}`}
      style={{ width: box, height: box }}
    >
      <Image
        src={isIn ? "/icons/cash-in.svg" : "/icons/cash-out.svg"}
        alt=""
        width={arrow}
        height={arrow}
        // The design reuses the down arrow rotated 180° for outgoing payments.
        className={isIn ? undefined : "rotate-180"}
      />
    </span>
  );
}

export const AMOUNT_COLOR: Record<MovementType, string> = {
  SUBSCRIPTION: "text-subscription",
  CASH_IN: "text-granate",
  CASH_OUT: "text-cash-out",
};
