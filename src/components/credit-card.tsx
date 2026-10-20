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

type BalanceProps = {
  balanceCents: number;
  currency: string;
  balanceHidden: boolean;
  onToggleBalance: () => void;
};

/** Without `balance` the card shows only the payment method (v2, where the balance is the screen's headline). */
type Props = { card: CardDTO; balance?: BalanceProps };

export function CreditCard({ card, balance }: Props) {
  const brand = BRAND[card.brand];
  const statusLabel = STATUS_LABEL[card.status];
  const exp = `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`;

  return (
    <article
      aria-label={`${brand.label} terminada en ${card.last4}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ""}`}
      className={`relative flex h-[190px] w-full flex-col justify-between rounded-[24px] px-6 pt-4 pb-3 shadow-soft ${brand.bg} ${brand.text} ${statusLabel ? "opacity-60 grayscale" : ""}`}
    >
      <div className="flex items-start justify-between">
        {balance ? <CardBalance {...balance} /> : <p className="text-sm leading-[22px]">Tarjeta de débito</p>}
        <div className="flex flex-col items-end gap-1">
          <Image src={brand.logo} alt={brand.label} width={brand.w} height={brand.h} />
          {statusLabel && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink">{statusLabel}</span>
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

function CardBalance({ balanceCents, currency, balanceHidden, onToggleBalance }: BalanceProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm leading-[22px]">
        Balance
        <BalanceToggle hidden={balanceHidden} onToggle={onToggleBalance} />
      </p>
      <p className="flex items-center gap-[9px]">
        <span className="relative grid h-[30px] w-12 place-items-center">
          <Image src="/icons/currency-chip.svg" alt="" width={48} height={30} className="absolute inset-0" />
          <span className="relative text-sm leading-[22px] font-medium text-white">{currency}</span>
        </span>
        <BalanceAmount cents={balanceCents} hidden={balanceHidden} className="text-[22px] leading-7 font-medium" />
      </p>
    </div>
  );
}

export function BalanceAmount({ cents, hidden, className }: { cents: number; hidden: boolean; className: string }) {
  return hidden ? (
    <span className={`${className} tracking-widest`}>
      <span aria-hidden>••••••</span>
      <span className="sr-only">Saldo oculto</span>
    </span>
  ) : (
    <span className={className}>{formatBalance(cents)}</span>
  );
}

export function BalanceToggle({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={hidden}
      aria-label={hidden ? "Mostrar saldo" : "Ocultar saldo"}
      className="-m-1 grid size-7 place-items-center rounded-full opacity-80 transition hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {hidden && <path d="M3 3l18 18" />}
      </svg>
    </button>
  );
}
