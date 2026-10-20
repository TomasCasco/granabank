import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span aria-hidden className="size-[49px] rounded-[12px] bg-granate" />
      <p className="mt-2 text-[40px] leading-[60px] font-medium tracking-[-1.56px] text-granate">404</p>
      <h1 className="text-xl leading-[26px] font-medium text-ink">No encontramos esta página</h1>
      <p className="text-base text-slate">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <Link
        href="/"
        className="mt-6 grid h-[60px] w-full place-items-center rounded-[16px] bg-granate text-base font-semibold text-white shadow-soft transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
