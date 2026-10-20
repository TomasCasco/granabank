"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MovementList } from "@/components/movement-list";
import { EmptyState } from "@/components/states";
import { useMovements } from "@/lib/queries";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/types";

const FILTERS: { label: string; type?: MovementType }[] = [
  { label: "Todos" },
  { label: "Debito Aut.", type: "SUBSCRIPTION" },
  { label: "Recibido", type: "CASH_IN" },
  { label: "Enviado", type: "CASH_OUT" },
];

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MAX_LENGTH = 50;

function parseType(value: string | null): MovementType | undefined {
  return MOVEMENT_TYPES.find((t) => t === value);
}

function buildHref(pathname: string, next: { type?: MovementType; q?: string }) {
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.q) params.set("q", next.q);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function MovementsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the source of truth, so filters survive reloads and can be shared.
  const type = parseType(searchParams.get("type"));
  const q = searchParams.get("q") ?? "";
  const [input, setInput] = useState(q);
  const filtersScroller = useDragScroll<HTMLDivElement>();

  function updateUrl(next: { type?: MovementType; q?: string }) {
    router.replace(buildHref(pathname, next), { scroll: false });
  }

  // Debounced search: re-running on URL changes cancels a pending timer that would carry a stale filter.
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === q) return;
    const timer = setTimeout(
      () => router.replace(buildHref(pathname, { type, q: trimmed }), { scroll: false }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [input, q, type, router, pathname]);

  const movements = useMovements({ type, q: q || undefined });

  function clearAll() {
    setInput("");
    updateUrl({});
  }

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6">
        <label htmlFor="movement-search" className="sr-only">
          Buscar por nombre o servicio
        </label>
        <Image
          src="/icons/search-input.svg"
          alt=""
          width={18.5}
          height={18.91}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <input
          id="movement-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={SEARCH_MAX_LENGTH}
          placeholder="Ingresa un nombre o servicio"
          autoComplete="off"
          className="h-[60px] w-full rounded-[16px] bg-white pr-12 pl-[52px] text-sm text-ink shadow-soft outline-none placeholder:text-xs placeholder:font-medium placeholder:text-muted focus-visible:ring-2 focus-visible:ring-granate/40 [&::-webkit-search-cancel-button]:hidden"
        />
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            aria-label="Borrar búsqueda"
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-lg text-muted hover:bg-base hover:text-ink"
          >
            ×
          </button>
        )}
      </form>

      <div
        {...filtersScroller}
        role="group"
        aria-label="Filtrar por tipo"
        className="no-scrollbar -mx-6 mt-4 flex cursor-grab gap-[10px] overflow-x-auto px-6 py-2 select-none"
      >
        {FILTERS.map((filter) => {
          const active = filter.type === type;
          return (
            <button
              key={filter.label}
              type="button"
              aria-pressed={active}
              onClick={() => updateUrl({ type: filter.type, q: input.trim() })}
              className={`h-[41px] shrink-0 rounded-[16px] px-5 text-sm leading-[22px] font-medium shadow-soft transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate ${active ? "bg-granate text-white" : "bg-white text-black hover:bg-base"}`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <MovementList
          query={movements}
          skeletonCount={6}
          empty={
            q || type ? (
              <EmptyState title="No encontramos movimientos">
                <p>{q ? `Nada coincide con “${q}”.` : "No hay movimientos de este tipo."}</p>
                <button type="button" onClick={clearAll} className="mt-3 font-medium text-granate underline-offset-2 hover:underline">
                  Limpiar búsqueda y filtros
                </button>
              </EmptyState>
            ) : (
              <EmptyState title="Todavía no tenés movimientos">Cuando pagues o recibas dinero, lo vas a ver acá.</EmptyState>
            )
          }
        />
      </div>
    </>
  );
}
