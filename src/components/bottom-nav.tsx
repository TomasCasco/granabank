"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { apiFetch } from "@/lib/fetcher";

const LINKS = [
  { href: "/", label: "Inicio", icon: "home", w: 26.97, h: 28.47, isActive: (p: string) => p === "/" },
  { href: "/movimientos", label: "Movimientos", icon: "document", w: 26.89, h: 30.05, isActive: (p: string) => p.startsWith("/movimientos") },
] as const;

const itemClass =
  "grid size-12 place-items-center rounded-[12px] transition hover:bg-base focus-visible:outline-2 focus-visible:outline-granate";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Drop cached user data so the next login never sees the previous user's info.
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-10 mx-auto grid h-[86px] w-full max-w-[430px] grid-cols-3 place-items-center rounded-t-[24px] bg-white shadow-soft-up"
      >
        {LINKS.map(({ href, label, icon, w, h, isActive }) => {
          const active = pathname !== null && isActive(pathname);
          return (
            <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={itemClass}>
              <Image src={`/icons/${icon}${active ? "-active" : ""}.svg`} alt="" width={w} height={h} />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={loggingOut}
          aria-label="Cerrar sesión"
          aria-haspopup="dialog"
          className={`${itemClass} disabled:opacity-50`}
        >
          <Image src="/icons/logout.svg" alt="" width={27.5} height={26.13} />
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
