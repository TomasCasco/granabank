"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { apiFetch } from "@/lib/fetcher";
import { useVersion } from "@/lib/version";

// Paths are relative to the app version ("/" or "/v2").
const LINKS = [
  { href: "/", label: "Inicio", icon: "home", w: 26.97, h: 28.47, isActive: (p: string) => p === "/" },
  { href: "/movimientos", label: "Movimientos", icon: "document", w: 26.89, h: 30.05, isActive: (p: string) => p.startsWith("/movimientos") },
] as const;

const itemBase = "rounded-[12px] transition hover:bg-base focus-visible:outline-2 focus-visible:outline-granate";
const itemV1 = `${itemBase} grid size-12 place-items-center`;
const itemV2 = `${itemBase} flex min-w-16 flex-col items-center gap-1 px-2 py-1.5`;

// The pathname is only known at request time, so the bar prerenders without an active tab and streams it in.
export function BottomNav() {
  return (
    <Suspense fallback={<NavBar pathname={null} />}>
      <ActiveNavBar />
    </Suspense>
  );
}

function ActiveNavBar() {
  return <NavBar pathname={usePathname()} />;
}

function NavBar({ pathname }: { pathname: string | null }) {
  const { isV2, to } = useVersion();
  // Match against the version-relative path so "/v2/movimientos" activates "Movimientos".
  const relativePath = pathname === null ? null : isV2 ? pathname.slice("/v2".length) || "/" : pathname;
  const itemClass = isV2 ? itemV2 : itemV1;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Full reload on purpose: Next keeps visited pages alive in memory (hidden with <Activity>), so a
      // client-side navigation would leave the user's balance and movements in the DOM after logout.
      window.location.replace(to("/login"));
    }
  }

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-10 mx-auto grid h-[86px] w-full max-w-[430px] grid-cols-3 place-items-center rounded-t-[24px] bg-white shadow-soft-up"
      >
        {LINKS.map(({ href, label, icon, w, h, isActive }) => {
          const active = relativePath !== null && isActive(relativePath);
          return (
            <Link
              key={href}
              href={to(href)}
              aria-label={isV2 ? undefined : label}
              aria-current={active ? "page" : undefined}
              className={itemClass}
            >
              <Image src={`/icons/${icon}${active ? "-active" : ""}.svg`} alt="" width={w} height={h} />
              {isV2 && <NavLabel active={active}>{label}</NavLabel>}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={loggingOut}
          aria-label={isV2 ? undefined : "Cerrar sesión"}
          aria-haspopup="dialog"
          className={`${itemClass} disabled:opacity-50`}
        >
          <Image src="/icons/logout.svg" alt="" width={27.5} height={26.13} />
          {isV2 && <NavLabel>Salir</NavLabel>}
        </button>
      </nav>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Cerrar sesión?"
        confirmLabel={loggingOut ? "Cerrando…" : "Cerrar sesión"}
        busy={loggingOut}
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      >
        Vas a tener que volver a ingresar con tu email y contraseña.
      </ConfirmDialog>
    </>
  );
}

/** v2: visible labels, so the icons don't have to explain themselves. */
function NavLabel({ active, children }: { active?: boolean; children: string }) {
  return <span className={`text-[11px] leading-none font-medium ${active ? "text-granate" : "text-slate"}`}>{children}</span>;
}
