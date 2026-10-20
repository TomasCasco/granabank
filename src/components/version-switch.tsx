"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";

/** Same screen in the other version: "/movimientos?q=x" ⇄ "/v2/movimientos?q=x". */
export function counterpartPath(pathname: string): string {
  if (pathname === "/v2" || pathname.startsWith("/v2/")) return pathname.slice("/v2".length) || "/";
  return pathname === "/" ? "/v2" : `/v2${pathname}`;
}

// Reads the pathname, which is request-time data, so it streams in after the static shell.
export function VersionSwitch() {
  return (
    <Suspense fallback={null}>
      <Switch />
    </Suspense>
  );
}

function Switch() {
  const pathname = usePathname();
  const router = useRouter();
  const isV2 = pathname === "/v2" || pathname.startsWith("/v2/");

  function go(toV2: boolean) {
    if (toV2 === isV2) return;
    router.push(counterpartPath(pathname) + window.location.search);
  }

  const option = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-semibold transition ${active ? "bg-granate text-white" : "text-slate hover:text-ink"}`;

  return (
    // Phones: just above the nav bar. Wider screens: outside the phone column, where it covers nothing.
    <div className="fixed right-4 bottom-[98px] z-20 md:top-6 md:right-6 md:bottom-auto">
      <div role="group" aria-label="Versión del diseño" className="flex rounded-full bg-white/95 p-1 shadow-soft backdrop-blur">
        <button type="button" aria-pressed={!isV2} onClick={() => go(false)} className={option(!isV2)}>
          Figma
        </button>
        <button type="button" aria-pressed={isV2} onClick={() => go(true)} className={option(isV2)}>
          v2
        </button>
      </div>
    </div>
  );
}

