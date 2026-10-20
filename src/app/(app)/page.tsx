"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard } from "@/components/credit-card";
import { MovementList } from "@/components/movement-list";
import { EmptyState, ErrorState, Skeleton } from "@/components/states";
import { useMovements, useProfile } from "@/lib/queries";
import { useDragScroll } from "@/lib/use-drag-scroll";

const LATEST_COUNT = 5;

export default function HomePage() {
  const profile = useProfile();
  const latest = useMovements({ limit: LATEST_COUNT });
  const cardsScroller = useDragScroll<HTMLUListElement>();

  return (
    <>
      <header className="mt-3 flex items-start justify-between">
        <div>
          <p className="text-base leading-[30px] font-medium text-ink-2">Hola</p>
          {profile.isPending ? (
            <Skeleton className="mt-1 h-6 w-28 rounded-md" />
          ) : (
            <h1 className="text-[22px] leading-[30px] font-semibold text-ink">{profile.data?.name ?? "👋"}</h1>
          )}
        </div>
        <HeaderActions />
      </header>

      <section aria-label="Tus tarjetas" className="mt-6">
        {profile.isPending && <Skeleton className="h-[190px] w-[348px] max-w-[92%] rounded-[24px]" />}
        {profile.isError && <ErrorState message={profile.error.message} onRetry={() => profile.refetch()} />}
        {profile.data && (
          // Full-bleed horizontal scroller so the next card peeks in from the edge, as in the design.
          <ul
            {...cardsScroller}
            className="no-scrollbar -mx-6 flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 pb-2 select-none"
          >
            {profile.data.cards.map((card) => (
              <li key={card.id} className="w-[348px] max-w-[92%] shrink-0 snap-start">
                <CreditCard card={card} balanceCents={profile.data.balanceCents} currency={profile.data.currency} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="latest-title" className="mt-6">
        <h2 id="latest-title" className="mb-6 text-xl leading-[26px] font-medium text-ink">
          Últimos movimientos
        </h2>
        <MovementList
          query={latest}
          skeletonCount={LATEST_COUNT}
          empty={<EmptyState title="Todavía no tenés movimientos">Cuando pagues o recibas dinero, lo vas a ver acá.</EmptyState>}
        />
      </section>
    </>
  );
}

function HeaderActions() {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const iconButton =
    "grid size-10 place-items-center rounded-full transition hover:bg-white focus-visible:outline-2 focus-visible:outline-granate";

  return (
    <div className="flex items-center gap-1 pt-2">
      <Link href="/movimientos" aria-label="Buscar movimientos" className={iconButton}>
        <Image src="/icons/search-header.svg" alt="" width={18.5} height={18.91} />
      </Link>
      <button type="button" aria-label="Notificaciones" onClick={() => setToast(true)} className={iconButton}>
        <Image src="/icons/bell.svg" alt="" width={17.65} height={20.5} />
      </button>
      <p
        role="status"
        className={`fixed inset-x-0 top-4 z-20 mx-auto w-fit rounded-[12px] bg-ink px-4 py-2 text-sm text-white shadow-soft transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
      >
        {toast && "No tenés notificaciones nuevas"}
      </p>
    </div>
  );
}
