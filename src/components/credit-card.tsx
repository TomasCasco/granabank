import Image from "next/image";
import { formatBalance } from "@/lib/format";
import type { CardDTO } from "@/lib/types";

const BRAND = {
  MASTERCARD: { bg: "bg-granate", text: "text-white", logo: "/icons/mastercard.svg", w: 34.01, h: 24.45, label: "Mastercard" },
  VISA: { bg: "bg-blush", text: "text-granate", logo: "/icons/visa.svg", w: 40, h: 40, label: "Visa" },
} as const;

const STATUS_LABEL: Record<CardDTO["status"], string | null> = {
  ACTIVE: null,
  BLOCKED: "Bloqueada",
  EXPIRED: "Vencida",
};

type Props = { card: CardDTO; balanceCents: number; currency: string };

export function CreditCard({ card, balanceCents, currency }: Props) {
  const brand = BRAND[card.brand];
  const statusLabel = STATUS_LABEL[card.status];
  const exp = `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`;

  return (
    <article
      aria-label={`${brand.label} terminada en ${card.last4}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ""}`}
      className={`relative flex h-[190px] w-full flex-col justify-between rounded-[24px] px-6 pt-4 pb-3 shadow-soft ${brand.bg} ${brand.text} ${statusLabel ? "opacity-60 grayscale" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-[22px]">Balance</p>
          <p className="flex items-center gap-[9px]">
            <span className="relative grid h-[30px] w-12 place-items-center">
              <Image src="/icons/currency-chip.svg" alt="" width={48} height={30} className="absolute inset-0" />
              <span className="relative text-sm leading-[22px] font-medium text-white">{currency}</span>
            </span>
            <span className="text-[22px] leading-7 font-medium">{formatBalance(balanceCents)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Image src={brand.logo} alt={brand.label} width={brand.w} height={brand.h} />
          {statusLabel && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink">
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      <p className="flex items-center gap-3 text-[22px] leading-7" aria-label={`Número terminado en ${card.last4}`}>
        <span className="font-medium tracking-wider" aria-hidden>
          ****&nbsp;&nbsp;****&nbsp;&nbsp;****
        </span>
        <span>{card.last4}</span>
      </p>

      <div className="flex items-end justify-between">
        <p className="text-base leading-[22px]">{card.holderName}</p>
        <p className="flex flex-col items-center font-medium">
          <span className="text-[10px]">Exp. Date</span>
          <span className="text-[13px]">{exp}</span>
        </p>
      </div>
    </article>
  );
}
